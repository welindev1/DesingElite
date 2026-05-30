import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Loader2,
  Power,
  Eye,
  X,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Package,
  BookOpen,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'products' | 'plans' | 'all';
  product_ids?: number[];
  plan_ids?: number[];
  start_date: string;
  end_date: string;
  max_uses?: number;
  current_uses: number;
  min_purchase: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface CouponUsage {
  id: number;
  discount_applied: number;
  used_at: string;
  user: {
    id: number;
    username: string;
    discord_avatar?: string;
  };
}

function ConfirmPopup({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#13131f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/25 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">
          Eliminar cupón
        </h3>
        <p className="text-white/40 text-xs mb-5">
          ¿Estás seguro que quieres eliminar{' '}
          <span className="text-white/70 font-medium">"{name}"</span>? Esta
          acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function UsagesDrawer({
  coupon,
  onClose,
}: {
  coupon: Coupon;
  onClose: () => void;
}) {
  const { data: usages, isLoading } = useQuery<CouponUsage[]>({
    queryKey: ['coupon-usages', coupon.id],
    queryFn: () =>
      api.get(`/admin/coupons/${coupon.id}/usages`).then((r) => r.data.data),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0d0d14] border-l border-white/[0.06] h-full overflow-y-auto">
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-semibold text-sm">
              Usos del cupón
            </h2>
            <p className="text-white/40 text-xs mt-0.5">{coupon.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">Usos actuales</p>
              <p className="text-white font-semibold text-lg">
                {coupon.current_uses}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">Límite</p>
              <p className="text-white font-semibold text-lg">
                {coupon.max_uses ?? '∞'}
              </p>
            </div>
          </div>

          {/* Usage list */}
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
            Historial de usos
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
          ) : !usages?.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Users className="w-8 h-8 text-white/10" />
              <p className="text-white/25 text-sm">
                Este cupón no ha sido usado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {usages.map((usage) => (
                <div
                  key={usage.id}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {usage.user.discord_avatar ? (
                      <img
                        src={usage.user.discord_avatar}
                        alt={usage.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/40 text-xs font-medium">
                        {usage.user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-medium truncate">
                      {usage.user.username}
                    </p>
                    <p className="text-white/30 text-xs">
                      {new Date(usage.used_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-medium">
                      -{fmt(usage.discount_applied)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-white/[0.04] text-white/40 border border-white/[0.08]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-400' : 'bg-white/30'
        }`}
      />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function AppliesToBadge({
  appliesTo,
}: {
  appliesTo: 'products' | 'plans' | 'all';
}) {
  const config = {
    products: { label: 'Productos', icon: Package, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    plans: { label: 'Planes', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    all: { label: 'Todo', icon: Tag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  };
  const { label, icon: Icon, color } = config[appliesTo];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function AdminCoupons() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [usagesTarget, setUsagesTarget] = useState<Coupon | null>(null);

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/admin/coupons').then((r) => r.data.data),
  });

  const toggleStatus = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/coupons/${id}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Cupón eliminado');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // Filter coupons
  const filteredCoupons = coupons?.filter((c) => {
    const matchesSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  const fmtDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return fmt(coupon.discount_value);
  };

  const isExpired = (coupon: Coupon) => new Date(coupon.end_date) < new Date();
  const isNotStarted = (coupon: Coupon) =>
    new Date(coupon.start_date) > new Date();

  // Stats
  const stats = {
    total: coupons?.length ?? 0,
    active: coupons?.filter((c) => c.status === 'active').length ?? 0,
    totalUses: coupons?.reduce((acc, c) => acc + c.current_uses, 0) ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Cupones
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {stats.total} cupones en total · {stats.active} activos · {stats.totalUses} usos
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/coupons/new')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cupón
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar cupón..."
              className="w-full bg-[#0d0d14] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] rounded-xl text-white/50 text-sm transition-all"
          >
            Buscar
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0d0d14] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/50 focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Cupón
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Descuento
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Aplica a
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Usos
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Estado
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Acciones
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : !filteredCoupons?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">No hay cupones</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Código y descripción */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white/80 text-sm font-medium font-mono">
                      {coupon.code}
                    </p>
                    {isExpired(coupon) && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                        Expirado
                      </span>
                    )}
                    {isNotStarted(coupon) && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pendiente
                      </span>
                    )}
                  </div>
                  {coupon.description && (
                    <p className="text-white/25 text-xs truncate mt-0.5">
                      {coupon.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-white/20" />
                    <span className="text-white/30 text-[11px]">
                      {new Date(coupon.start_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })}{' '}
                      -{' '}
                      {new Date(coupon.end_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Descuento */}
                <div className="flex items-center gap-1 justify-center">
                  {coupon.discount_type === 'percentage' ? (
                    <Percent className="w-3.5 h-3.5 text-white/30" />
                  ) : (
                    <DollarSign className="w-3.5 h-3.5 text-white/30" />
                  )}
                  <span className="text-white/70 text-sm font-medium">
                    {fmtDiscount(coupon)}
                  </span>
                </div>

                {/* Aplica a */}
                <div className="flex justify-center">
                  <AppliesToBadge appliesTo={coupon.applies_to} />
                </div>

                {/* Usos */}
                <button
                  onClick={() => setUsagesTarget(coupon)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group"
                >
                  <Users className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50" />
                  <span className="text-white/60 text-sm font-medium">
                    {coupon.current_uses}
                    {coupon.max_uses && (
                      <span className="text-white/30">/{coupon.max_uses}</span>
                    )}
                  </span>
                  <Eye className="w-3 h-3 text-white/20 group-hover:text-white/40" />
                </button>

                {/* Estado */}
                <div className="flex justify-center">
                  <StatusBadge status={coupon.status} />
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 justify-center">
                  <button
                    onClick={() => toggleStatus.mutate(coupon.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      coupon.status === 'active'
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-white/25 bg-white/[0.03] hover:bg-white/[0.07]'
                    }`}
                    title={
                      coupon.status === 'active' ? 'Desactivar' : 'Activar'
                    }
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(coupon)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmPopup
          name={deleteTarget.code}
          onConfirm={() => deleteCoupon.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteCoupon.isPending}
        />
      )}

      {/* Usages drawer */}
      {usagesTarget && (
        <UsagesDrawer
          coupon={usagesTarget}
          onClose={() => setUsagesTarget(null)}
        />
      )}
    </div>
  );
}
