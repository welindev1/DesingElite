import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Search,
  X,
  Eye,
  RotateCcw,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  BookOpen,
  User,
  CreditCard,
  FileText,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Purchase {
  id: number;
  user: { id: number; username: string; email: string; avatar?: string };
  product?: { id: number; name: string; image?: string };
  plan?: { id: number; name: string };
  purchase_type: 'product' | 'plan' | 'renewal';
  quantity: number;
  original_price: number;
  price_paid: number;
  discount_amount: number;
  coupon_code?: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  ip_address?: string;
  created_at: string;
  completed_at?: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  refunded: number;
  monthlyRevenue: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

const typeLabels: Record<string, string> = {
  product: 'Producto',
  plan: 'Plan',
  renewal: 'Renovación',
};

export default function AdminPurchases() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: stats } = useQuery<Stats>({
    queryKey: ['purchases-stats'],
    queryFn: () => api.get('/admin/purchases/stats').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page, debouncedSearch, statusFilter, typeFilter, dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      return api.get(`/admin/purchases?${params}`).then(r => r.data.data);
    },
  });

  const refundMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/purchases/${id}/refund`),
    onSuccess: () => {
      toast.success('Compra reembolsada');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchases-stats'] });
      setShowDetail(false);
    },
    onError: () => toast.error('Error al reembolsar'),
  });

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await api.get(`/admin/purchases/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compras_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exportado');
    } catch {
      toast.error('Error al exportar');
    }
  };

  const purchases: Purchase[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const openDetail = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetail(true);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-400" />
            Compras
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Gestiona todas las compras de la tienda
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Total
          </div>
          <p className="text-xl font-bold text-white">{stats?.total || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400/60 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5" /> Completadas
          </div>
          <p className="text-xl font-bold text-emerald-400">{stats?.completed || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400/60 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" /> Pendientes
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats?.pending || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400/60 text-xs mb-1">
            <RotateCcw className="w-3.5 h-3.5" /> Reembolsos
          </div>
          <p className="text-xl font-bold text-purple-400">{stats?.refunded || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400/60 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" /> Ingresos (mes)
          </div>
          <p className="text-xl font-bold text-green-400">${stats?.monthlyRevenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por usuario, email o transacción..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="">Todos los tipos</option>
            <option value="product">Producto</option>
            <option value="plan">Plan</option>
            <option value="renewal">Renovación</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
            />
            <span className="text-white/30">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
            />
          </div>
          {(search || statusFilter || typeFilter || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">ID</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Usuario</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Item</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Tipo</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Monto</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Estado</th>
                <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Fecha</th>
                <th className="text-right text-white/40 text-xs font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/40">Cargando...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/40">No hay compras</td>
                </tr>
              ) : (
                purchases.map(purchase => (
                  <tr key={purchase.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/60 text-sm">#{purchase.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {purchase.user?.avatar ? (
                          <img src={purchase.user.avatar} className="w-6 h-6 rounded-full" alt="" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center">
                            <span className="text-red-400 text-[10px] font-bold">
                              {purchase.user?.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-white text-sm">{purchase.user?.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {purchase.purchase_type === 'product' || purchase.purchase_type === 'renewal' ? (
                          <Package className="w-4 h-4 text-white/30" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-white/30" />
                        )}
                        <span className="text-white text-sm">
                          {purchase.product?.name || purchase.plan?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white/60 text-sm">{typeLabels[purchase.purchase_type]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">${purchase.price_paid}</span>
                        {purchase.discount_amount > 0 && (
                          <span className="text-emerald-400 text-xs">-${purchase.discount_amount}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[purchase.payment_status]}`}>
                        {statusLabels[purchase.payment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm">
                      {new Date(purchase.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(purchase)}
                        className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-white/40 text-sm">
              Mostrando {purchases.length} de {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white/60 text-sm px-3">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {showDetail && selectedPurchase && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowDetail(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0d0d14] border-l border-white/[0.06] z-50 overflow-y-auto">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Detalle de Compra #{selectedPurchase.id}</h2>
              <button onClick={() => setShowDetail(false)} className="text-white/40 hover:text-white/80">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg text-sm border ${statusColors[selectedPurchase.payment_status]}`}>
                  {statusLabels[selectedPurchase.payment_status]}
                </span>
                {selectedPurchase.payment_status === 'completed' && (
                  <button
                    onClick={() => refundMutation.mutate(selectedPurchase.id)}
                    disabled={refundMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reembolsar
                  </button>
                )}
              </div>

              {/* User */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                  <User className="w-3.5 h-3.5" /> Usuario
                </div>
                <div className="flex items-center gap-3">
                  {selectedPurchase.user?.avatar ? (
                    <img src={selectedPurchase.user.avatar} className="w-10 h-10 rounded-full" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                      <span className="text-red-400 text-sm font-bold">
                        {selectedPurchase.user?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedPurchase.user?.username}</p>
                    <p className="text-white/40 text-sm">{selectedPurchase.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Item */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                  {selectedPurchase.purchase_type === 'product' ? (
                    <><Package className="w-3.5 h-3.5" /> Producto</>
                  ) : (
                    <><BookOpen className="w-3.5 h-3.5" /> Plan</>
                  )}
                </div>
                <p className="text-white font-medium">
                  {selectedPurchase.product?.name || selectedPurchase.plan?.name || 'N/A'}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  Tipo: {typeLabels[selectedPurchase.purchase_type]} | Cantidad: {selectedPurchase.quantity}
                </p>
              </div>

              {/* Payment */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                  <CreditCard className="w-3.5 h-3.5" /> Pago
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">Precio original</span>
                    <span className="text-white">${selectedPurchase.original_price}</span>
                  </div>
                  {selectedPurchase.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/40 text-sm">Descuento</span>
                      <span className="text-emerald-400">-${selectedPurchase.discount_amount}</span>
                    </div>
                  )}
                  {selectedPurchase.coupon_code && (
                    <div className="flex justify-between">
                      <span className="text-white/40 text-sm">Cupón</span>
                      <span className="text-blue-400">{selectedPurchase.coupon_code}</span>
                    </div>
                  )}
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                    <span className="text-white font-medium">Total pagado</span>
                    <span className="text-white font-bold">${selectedPurchase.price_paid}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                  <FileText className="w-3.5 h-3.5" /> Detalles
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Método de pago</span>
                    <span className="text-white capitalize">{selectedPurchase.payment_method}</span>
                  </div>
                  {selectedPurchase.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-white/40">ID Transacción</span>
                      <span className="text-white/60 font-mono text-xs">{selectedPurchase.transaction_id}</span>
                    </div>
                  )}
                  {selectedPurchase.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-white/40">IP</span>
                      <span className="text-white/60 font-mono">{selectedPurchase.ip_address}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/40">Fecha creación</span>
                    <span className="text-white/60">
                      {new Date(selectedPurchase.created_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                  {selectedPurchase.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-white/40">Fecha completado</span>
                      <span className="text-white/60">
                        {new Date(selectedPurchase.completed_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
