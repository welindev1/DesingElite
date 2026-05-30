import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Package,
  Plus,
  Trash2,
  History,
  Wifi,
  WifiOff,
  ArrowRight,
  Server,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────
interface License {
  id: number;
  key: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  server_ip?: string;
  server_port?: string;
  user?: {
    id: number;
    username: string;
    avatar?: string;
    discord_id: string;
  };
  products?: { id: number; name: string; image?: string }[];
}

interface HistoryEntry {
  id: number;
  from_status: string;
  to_status: string;
  reason?: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const truncateKey = (key?: string) => {
  if (!key) return '—';
  return key.length > 24 ? key.slice(0, 24) + '...' : key;
};

// ── Status Badge ───────────────────────────────────
function StatusBadge({ status }: { status: License['status'] }) {
  const map = {
    active: {
      label: 'Activa',
      cls: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    },
    inactive: {
      label: 'Inactiva',
      cls: 'bg-white/[0.05] border-white/[0.08] text-white/35',
    },
    suspended: {
      label: 'Suspendida',
      cls: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    },
    banned: {
      label: 'Baneada',
      cls: 'bg-red-500/15 border-red-500/25 text-red-400',
    },
  };
  const { label, cls } = map[status] ?? map.inactive;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}

// ── Copy Button ────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.05] transition-all flex-shrink-0"
      title="Copiar"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ── User Avatar ────────────────────────────────────
function UserAvatar({
  user,
  size = 'sm',
}: {
  user: License['user'];
  size?: 'sm' | 'md';
}) {
  if (!user) return null;
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';
  return user.avatar ? (
    <img
      src={user.avatar}
      alt={user.username}
      className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white/[0.06]`}
    />
  ) : (
    <div
      className={`${sz} rounded-full bg-red-600/20 border border-red-500/20 flex items-center justify-center flex-shrink-0 font-bold text-red-400`}
    >
      {user.username?.[0]?.toUpperCase()}
    </div>
  );
}

// ── Drawer ─────────────────────────────────────────
function LicenseDrawer({
  license,
  onClose,
  onUpdate,
}: {
  license: License;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [networkIp, setNetworkIp] = useState(license.server_ip ?? '');
  const [networkPort, setNetworkPort] = useState(license.server_port ?? '');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');

  // Historial
  const { data: history, isLoading: loadingHistory } = useQuery<HistoryEntry[]>(
    {
      queryKey: ['license-history', license.user?.id],
      queryFn: () =>
        api
          .get(`/admin/licenses/${license.user?.id}/history`)
          .then((r) => r.data.data ?? r.data),
      enabled: showHistory && !!license.user?.id,
    },
  );

  // Productos disponibles para agregar
  const { data: productsRes } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () =>
      api
        .get('/admin/products', { params: { limit: 100 } })
        .then((r) => r.data.data),
    enabled: showAddProduct,
  });
  const allProducts: { id: number; name: string }[] = productsRes?.data ?? [];
  const availableProducts = allProducts.filter(
    (p) => !license.products?.find((lp) => lp.id === p.id),
  );

  const changeStatus = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/admin/licenses/${license.user?.id}/status`, { status }),
    onSuccess: () => {
      toast.success('Estado actualizado');
      onUpdate();
    },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const updateNetwork = useMutation({
    mutationFn: () =>
      api.patch(`/admin/licenses/${license.user?.id}/network`, {
        server_ip: networkIp || undefined,
        server_port: networkPort || undefined,
      }),
    onSuccess: () => {
      toast.success('Red actualizada');
      onUpdate();
    },
    onError: () => toast.error('Error al actualizar red'),
  });

  const addProduct = useMutation({
    mutationFn: (productId: number) =>
      api.post(`/admin/licenses/${license.user?.id}/add-product`, {
        product_id: productId,
      }),
    onSuccess: () => {
      toast.success('Producto agregado');
      setShowAddProduct(false);
      setSelectedProductId('');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
    },
    onError: () => toast.error('Error al agregar producto'),
  });

  const removeProduct = useMutation({
    mutationFn: (productId: number) =>
      api.delete(
        `/admin/licenses/${license.user?.id}/remove-product/${productId}`,
      ),
    onSuccess: () => {
      toast.success('Producto removido');
      onUpdate();
    },
    onError: () => toast.error('Error al remover producto'),
  });

  const inputClass =
    'w-full bg-[#0d0d14] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all font-mono';

  const statusColors: Record<string, string> = {
    active: 'text-emerald-400',
    inactive: 'text-white/35',
    suspended: 'text-amber-400',
    banned: 'text-red-400',
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0d0d14] border-l border-white/[0.07] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d14] z-10">
          <h2 className="text-white font-semibold text-sm">
            Detalle de licencia
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Key */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              License Key
            </p>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
              <Shield className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" />
              <p className="text-white/60 text-xs font-mono flex-1 truncate">
                {license.key}
              </p>
              <CopyButton text={license.key ?? ''} />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-white/25 text-xs">Estado actual</span>
              <StatusBadge status={license.status} />
            </div>
          </div>

          {/* Usuario */}
          {license.user && (
            <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Usuario
              </p>
              <div className="flex items-center gap-3">
                <UserAvatar user={license.user} size="md" />
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {license.user.username}
                  </p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">
                    {license.user.discord_id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cambiar estado */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              Cambiar estado
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['active', 'inactive', 'suspended', 'banned'] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus.mutate(s)}
                    disabled={license.status === s || changeStatus.isPending}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                      license.status === s
                        ? s === 'active'
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : s === 'suspended'
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                            : s === 'banned'
                              ? 'bg-red-500/20 border-red-500/30 text-red-400'
                              : 'bg-white/[0.07] border-white/[0.12] text-white/50'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:border-white/[0.15] hover:text-white/60'
                    }`}
                  >
                    {s === 'active'
                      ? 'Activa'
                      : s === 'inactive'
                        ? 'Inactiva'
                        : s === 'suspended'
                          ? 'Suspender'
                          : 'Banear'}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Red */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              Configuración de red
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-white/25 text-[10px] mb-1 block">
                  IP Servidor
                </label>
                <div className="relative">
                  <Server className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                  <input
                    value={networkIp}
                    onChange={(e) => setNetworkIp(e.target.value)}
                    placeholder="192.168.1.1"
                    className={inputClass + ' pl-7'}
                  />
                </div>
              </div>
              <div>
                <label className="text-white/25 text-[10px] mb-1 block">
                  Puerto
                </label>
                <div className="relative">
                  <Wifi className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                  <input
                    value={networkPort}
                    onChange={(e) => setNetworkPort(e.target.value)}
                    placeholder="22003"
                    className={inputClass + ' pl-7'}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => updateNetwork.mutate()}
              disabled={updateNetwork.isPending}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/50 hover:text-white/80 text-xs font-medium transition-all disabled:opacity-50"
            >
              {updateNetwork.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              Guardar red
            </button>
          </div>

          {/* Productos */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Productos ({license.products?.length ?? 0})
              </p>
              <button
                onClick={() => setShowAddProduct((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>

            {/* Add product select */}
            {showAddProduct && (
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="flex-1 bg-[#0d0d14] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-white/20 transition-all"
                >
                  <option value="">Seleccionar producto...</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    selectedProductId !== '' &&
                    addProduct.mutate(Number(selectedProductId))
                  }
                  disabled={!selectedProductId || addProduct.isPending}
                  className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  {addProduct.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Products list */}
            {!license.products?.length ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <Package className="w-7 h-7 text-white/10" />
                <p className="text-white/20 text-xs">Sin productos asignados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {license.products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-3 h-3 text-white/20" />
                        </div>
                      )}
                    </div>
                    <span className="text-white/50 text-xs flex-1 truncate">
                      {p.name}
                    </span>
                    <button
                      onClick={() => removeProduct.mutate(p.id)}
                      disabled={removeProduct.isPending}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-white/25" />
                <span className="text-white/40 text-xs uppercase tracking-wider">
                  Historial de estados
                </span>
              </div>
              <ArrowRight
                className={`w-3.5 h-3.5 text-white/20 transition-transform ${showHistory ? 'rotate-90' : ''}`}
              />
            </button>

            {showHistory && (
              <div className="px-4 pb-4 space-y-2 border-t border-white/[0.05]">
                {loadingHistory ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                  </div>
                ) : !history?.length ? (
                  <p className="text-white/20 text-xs text-center py-4">
                    Sin historial
                  </p>
                ) : (
                  <div className="space-y-2 pt-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium ${statusColors[h.from_status] ?? 'text-white/40'}`}
                            >
                              {h.from_status}
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/20" />
                            <span
                              className={`text-xs font-medium ${statusColors[h.to_status] ?? 'text-white/40'}`}
                            >
                              {h.to_status}
                            </span>
                          </div>
                          {h.reason && (
                            <p className="text-white/25 text-[11px] mt-0.5 truncate">
                              {h.reason}
                            </p>
                          )}
                          <p className="text-white/20 text-[10px] mt-0.5">
                            {fmtDate(h.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────
export default function AdminLicenses() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  const limit = 10;

  const { data, isLoading } = useQuery<{
    data: License[];
    meta: { total: number; totalPages: number };
  }>({
    queryKey: ['admin-licenses', page, statusFilter],
    queryFn: () =>
      api
        .get('/admin/licenses', {
          params: {
            page,
            limit,
            ...(statusFilter && { status: statusFilter }),
          },
        })
        .then((r) => r.data.data),
  });

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
    if (selectedLicense) {
      api
        .get(`/admin/licenses/${selectedLicense.id}`)
        .then((r) => setSelectedLicense(r.data.data))
        .catch(() => {});
    }
  };

  const licenses = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Licencias
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {data?.meta?.total ?? 0} licencias en total
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#0d0d14] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/50 focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="suspended">Suspendidas</option>
          <option value="banned">Baneadas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Licencia
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Usuario
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Estado
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Red
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Acción
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : !licenses.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Shield className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">No hay licencias</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {licenses.map((license) => (
              <div
                key={license.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Key */}
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-3.5 h-3.5 text-red-400/40 flex-shrink-0" />
                  <span className="text-white/50 text-xs font-mono truncate">
                    {truncateKey(license.key)}
                  </span>
                  <CopyButton text={license.key ?? ''} />
                </div>

                {/* Usuario */}
                <div className="flex items-center gap-2">
                  {license.user && (
                    <>
                      <UserAvatar user={license.user} size="sm" />
                      <span className="text-white/50 text-xs hidden sm:block">
                        {license.user.username}
                      </span>
                    </>
                  )}
                </div>

                {/* Estado */}
                <div className="flex justify-center">
                  <StatusBadge status={license.status} />
                </div>

                {/* Red */}
                <div className="flex items-center justify-center">
                  {license.server_ip ? (
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="text-white/30 text-[11px] font-mono hidden md:block">
                        {license.server_ip}:{license.server_port}
                      </span>
                    </div>
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-white/15" />
                  )}
                </div>

                {/* Acción */}
                <button
                  onClick={() => setSelectedLicense(license)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 text-xs transition-all whitespace-nowrap"
                >
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/25 text-xs">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-[#0d0d14] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-[#0d0d14] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedLicense && (
        <LicenseDrawer
          license={selectedLicense}
          onClose={() => setSelectedLicense(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
