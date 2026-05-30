import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Crown,
  Ban,
  CheckCircle,
  Clock,
  Package,
  ChevronDown,
  Plus,
  ShoppingBag,
  Server,
  Save,
  Layers,
  Calendar,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────
interface LicenseProduct {
  id: number;
  name: string;
  image?: string;
  expires_at?: string;
  added_at?: string;
}

interface License {
  id: number;
  key: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  server_ip?: string;
  server_port?: number;
  last_used?: string;
  status_reason?: string;
  products: LicenseProduct[];
}

interface UserPlan {
  id: number;
  plan_id: number;
  plan_name: string;
  plan_image?: string;
  starts_at: string;
  expires_at: string;
  days_remaining: number;
}

interface Purchase {
  id: number;
  type: string;
  item_id: number;
  item_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
  discord_id: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  license?: License;
  plans?: UserPlan[];
  purchases?: Purchase[];
}

interface Product {
  id: number;
  name: string;
  image?: string;
  price: number;
}

interface Plan {
  id: number;
  name: string;
  image?: string;
  price: number;
  duration_days: number;
}

// ── Helpers ────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// ── Debounce hook ──────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Badges ─────────────────────────────────────────
function RoleBadge({ role }: { role: User['role'] }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-400">
      <Crown className="w-2.5 h-2.5" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/[0.08] text-white/40">
      Usuario
    </span>
  );
}

function StatusBadge({ status }: { status: User['status'] }) {
  const map = {
    active: { label: 'Activo', cls: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400', icon: CheckCircle },
    inactive: { label: 'Inactivo', cls: 'bg-white/[0.05] border-white/[0.08] text-white/35', icon: Clock },
    banned: { label: 'Baneado', cls: 'bg-red-500/15 border-red-500/25 text-red-400', icon: Ban },
  };
  const { label, cls, icon: Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      <Icon className="w-2.5 h-2.5" /> {label}
    </span>
  );
}

function LicenseStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    inactive: 'bg-white/[0.05] border-white/[0.08] text-white/35',
    suspended: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    banned: 'bg-red-500/15 border-red-500/25 text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] ?? map.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────
function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' }[size];
  return user.avatar ? (
    <img src={user.avatar} alt={user.username} className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white/[0.06]`} />
  ) : (
    <div className={`${sz} rounded-full bg-red-600/20 border border-red-500/20 flex items-center justify-center flex-shrink-0 font-bold text-red-400`}>
      {user.username?.[0]?.toUpperCase()}
    </div>
  );
}

// ── Confirm Popup ──────────────────────────────────
function ConfirmPopup({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#13131f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/25 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">Eliminar usuario</h3>
        <p className="text-white/40 text-xs mb-5">
          ¿Eliminar a <span className="text-white/70 font-medium">"{name}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 text-sm transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Product Modal ──────────────────────────────
function AddProductModal({ userId, currentProductIds, onClose, onSuccess }: { userId: number; currentProductIds: number[]; onClose: () => void; onSuccess: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [days, setDays] = useState<string>('');

  const { data: products } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products-for-license'],
    queryFn: () => api.get('/admin/products', { params: { limit: 100 } }).then((r) => r.data.data),
  });

  const addProduct = useMutation({
    mutationFn: () => api.post(`/admin/licenses/${userId}/add-product`, { product_id: selectedProduct, days: days ? parseInt(days) : undefined }),
    onSuccess: () => {
      toast.success('Producto agregado');
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Error al agregar producto'),
  });

  const availableProducts = products?.data?.filter((p) => !currentProductIds.includes(p.id)) ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13131f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-white font-semibold text-sm mb-4">Agregar producto a licencia</h3>

        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-2 block">Producto</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableProducts.length === 0 ? (
                <p className="text-white/30 text-xs py-4 text-center">No hay productos disponibles</p>
              ) : (
                availableProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      selectedProduct === p.id ? 'bg-red-600/20 border-red-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-white/20 m-2" />}
                    </div>
                    <span className="text-white/70 text-sm truncate">{p.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs mb-2 block">Duración (días, vacío = permanente)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Permanente"
              className="w-full bg-[#0a0a0f] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 text-sm transition-all">
            Cancelar
          </button>
          <button
            onClick={() => addProduct.mutate()}
            disabled={!selectedProduct || addProduct.isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {addProduct.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Plan Modal ─────────────────────────────────
function AddPlanModal({ userId, currentPlanIds, onClose, onSuccess }: { userId: number; currentPlanIds: number[]; onClose: () => void; onSuccess: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['admin-plans-for-user'],
    queryFn: () => api.get('/admin/plans').then((r) => r.data.data || r.data),
  });

  const addPlan = useMutation({
    mutationFn: () => api.post('/admin/plans/assign', { user_id: userId, plan_id: selectedPlan }),
    onSuccess: () => {
      toast.success('Plan asignado');
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Error al asignar plan'),
  });

  const availablePlans = plans?.filter((p) => !currentPlanIds.includes(p.id)) ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13131f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-white font-semibold text-sm mb-4">Asignar plan a usuario</h3>

        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-2 block">Plan</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availablePlans.length === 0 ? (
                <p className="text-white/30 text-xs py-4 text-center">No hay planes disponibles</p>
              ) : (
                availablePlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      selectedPlan === p.id ? 'bg-red-600/20 border-red-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Layers className="w-4 h-4 text-white/20 m-2" />}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-white/70 text-sm truncate block">{p.name}</span>
                      <span className="text-white/30 text-xs">{p.duration_days} días</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 text-sm transition-all">
            Cancelar
          </button>
          <button
            onClick={() => addPlan.mutate()}
            disabled={!selectedPlan || addPlan.isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {addPlan.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Drawer ────────────────────────────────────
function UserDrawer({ userId, onClose, onUpdate }: { userId: number; onClose: () => void; onUpdate: () => void }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'license' | 'purchases'>('info');
  const [editingNetwork, setEditingNetwork] = useState(false);
  const [networkIp, setNetworkIp] = useState('');
  const [networkPort, setNetworkPort] = useState('');

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => api.get(`/admin/users/${userId}`).then((r) => r.data.data),
  });

  useEffect(() => {
    if (user?.license) {
      setNetworkIp(user.license.server_ip || '');
      setNetworkPort(user.license.server_port?.toString() || '');
    }
  }, [user?.license]);

  const refreshUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onUpdate();
  }, [queryClient, userId, onUpdate]);

  const changeStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => { toast.success('Estado actualizado'); refreshUser(); },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const changeRole = useMutation({
    mutationFn: (role: string) => api.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => { toast.success('Rol actualizado'); refreshUser(); },
    onError: () => toast.error('Error al cambiar rol'),
  });

  const deleteUser = useMutation({
    mutationFn: () => api.delete(`/admin/users/${userId}`),
    onSuccess: () => { toast.success('Usuario eliminado'); onUpdate(); onClose(); },
    onError: () => toast.error('Error al eliminar'),
  });

  const changeLicenseStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/admin/licenses/${userId}/status`, { status }),
    onSuccess: () => { toast.success('Estado de licencia actualizado'); refreshUser(); },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const updateNetwork = useMutation({
    mutationFn: () => api.patch(`/admin/licenses/${userId}/network`, { authorized_ip: networkIp, authorized_port: parseInt(networkPort) }),
    onSuccess: () => { toast.success('Red actualizada'); setEditingNetwork(false); refreshUser(); },
    onError: () => toast.error('Error al actualizar red'),
  });

  const removeProduct = useMutation({
    mutationFn: (productId: number) => api.delete(`/admin/licenses/${userId}/remove-product/${productId}`),
    onSuccess: () => { toast.success('Producto removido'); refreshUser(); },
    onError: () => toast.error('Error al remover producto'),
  });

  const removePlan = useMutation({
    mutationFn: (planId: number) => api.delete(`/admin/plans/${userId}/remove/${planId}`),
    onSuccess: () => { toast.success('Plan removido'); refreshUser(); },
    onError: () => toast.error('Error al remover plan'),
  });

  if (isLoading || !user) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex items-center justify-center bg-[#0d0d14] border-l border-white/[0.07]">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0d0d14] border-l border-white/[0.07] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d14] z-10">
          <h2 className="text-white font-semibold text-sm">Detalle de usuario</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-6">
          {[
            { key: 'info', label: 'Info', icon: Users },
            { key: 'license', label: 'Licencia', icon: Server },
            { key: 'purchases', label: 'Compras', icon: ShoppingBag },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                activeTab === key ? 'border-red-500 text-white' : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* User header (always visible) */}
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="text-white font-semibold text-base">{user.username}</p>
              <p className="text-white/30 text-xs mt-0.5 font-mono">{user.discord_id}</p>
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Tab content */}
          {activeTab === 'info' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">Registrado</span>
                <span className="text-white/50 text-xs">{fmtDate(user.created_at)}</span>
              </div>

              {/* Cambiar estado */}
              <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <p className="text-white/40 text-xs uppercase tracking-wider">Cambiar estado</p>
                <div className="flex gap-2">
                  {(['active', 'inactive', 'banned'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus.mutate(s)}
                      disabled={user.status === s || changeStatus.isPending}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                        user.status === s
                          ? s === 'active' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : s === 'banned' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : 'bg-white/[0.07] border-white/[0.12] text-white/50'
                          : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:border-white/[0.15] hover:text-white/60'
                      }`}
                    >
                      {s === 'active' ? 'Activo' : s === 'inactive' ? 'Inactivo' : 'Banear'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cambiar rol */}
              <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <p className="text-white/40 text-xs uppercase tracking-wider">Cambiar rol</p>
                <div className="flex gap-2">
                  {(['user', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => changeRole.mutate(r)}
                      disabled={user.role === r || changeRole.isPending}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                        user.role === r
                          ? r === 'admin' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/[0.07] border-white/[0.12] text-white/50'
                          : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:border-white/[0.15] hover:text-white/60'
                      }`}
                    >
                      {r === 'admin' ? 'Admin' : 'Usuario'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zona peligrosa */}
              <div className="bg-red-950/20 border border-red-500/15 rounded-xl p-4 space-y-3">
                <p className="text-red-400/70 text-xs uppercase tracking-wider">Zona peligrosa</p>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar usuario permanentemente
                </button>
              </div>
            </>
          )}

          {activeTab === 'license' && (
            <>
              {user.license ? (
                <>
                  {/* License info */}
                  <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Licencia</p>
                      <LicenseStatusBadge status={user.license.status} />
                    </div>
                    <p className="text-white/50 text-xs font-mono bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2 truncate">
                      {user.license.key}
                    </p>
                    {user.license.last_used && (
                      <p className="text-white/30 text-[11px]">Último uso: {fmtDateTime(user.license.last_used)}</p>
                    )}
                  </div>

                  {/* License status */}
                  <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <p className="text-white/40 text-xs uppercase tracking-wider">Estado de licencia</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['active', 'inactive', 'suspended', 'banned'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => changeLicenseStatus.mutate(s)}
                          disabled={user.license?.status === s || changeLicenseStatus.isPending}
                          className={`py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                            user.license?.status === s
                              ? s === 'active' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                : s === 'banned' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                : s === 'suspended' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                : 'bg-white/[0.07] border-white/[0.12] text-white/50'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:border-white/[0.15] hover:text-white/60'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Network config */}
                  <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Configuración de red</p>
                      {!editingNetwork && (
                        <button onClick={() => setEditingNetwork(true)} className="text-white/40 hover:text-white/70 text-xs">
                          Editar
                        </button>
                      )}
                    </div>
                    {editingNetwork ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={networkIp}
                            onChange={(e) => setNetworkIp(e.target.value)}
                            placeholder="IP autorizada"
                            className="bg-[#0a0a0f] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
                          />
                          <input
                            type="number"
                            value={networkPort}
                            onChange={(e) => setNetworkPort(e.target.value)}
                            placeholder="Puerto"
                            min="1"
                            max="65535"
                            className="bg-[#0a0a0f] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingNetwork(false)} className="flex-1 py-2 rounded-lg border border-white/[0.08] text-white/40 text-xs">
                            Cancelar
                          </button>
                          <button
                            onClick={() => updateNetwork.mutate()}
                            disabled={!networkIp || !networkPort || updateNetwork.isPending}
                            className="flex-1 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {updateNetwork.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white/25 text-[10px] mb-0.5">IP</p>
                          <p className="text-white/50 text-xs font-mono">{user.license.server_ip || '-'}</p>
                        </div>
                        <div>
                          <p className="text-white/25 text-[10px] mb-0.5">Puerto</p>
                          <p className="text-white/50 text-xs font-mono">{user.license.server_port || '-'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Productos ({user.license.products.length})</p>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>
                    {user.license.products.length === 0 ? (
                      <p className="text-white/25 text-xs text-center py-4">Sin productos asignados</p>
                    ) : (
                      <div className="space-y-2">
                        {user.license.products.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-3.5 h-3.5 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/60 text-xs truncate">{p.name}</p>
                              {p.expires_at && (
                                <p className="text-white/30 text-[10px]">Expira: {fmtDate(p.expires_at)}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeProduct.mutate(p.id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plans */}
                  <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs uppercase tracking-wider">Planes ({user.plans?.length || 0})</p>
                      <button
                        onClick={() => setShowAddPlan(true)}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>
                    {!user.plans || user.plans.length === 0 ? (
                      <p className="text-white/25 text-xs text-center py-4">Sin planes asignados</p>
                    ) : (
                      <div className="space-y-2">
                        {user.plans.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                              {p.plan_image ? (
                                <img src={p.plan_image} alt={p.plan_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Layers className="w-3.5 h-3.5 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/60 text-xs truncate">{p.plan_name}</p>
                              <p className="text-white/30 text-[10px] flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {p.days_remaining} días restantes
                              </p>
                            </div>
                            <button
                              onClick={() => removePlan.mutate(p.plan_id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Server className="w-10 h-10 text-white/10" />
                  <p className="text-white/30 text-sm">Este usuario no tiene licencia</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'purchases' && (
            <>
              {user.purchases && user.purchases.length > 0 ? (
                <div className="space-y-2">
                  {user.purchases.map((p) => (
                    <div key={p.id} className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm font-medium">{p.item_name}</span>
                        <span className="text-emerald-400 text-sm font-medium">{fmt(p.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/30 text-xs">{p.type}</span>
                        <span className="text-white/30 text-xs">{fmtDateTime(p.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <ShoppingBag className="w-10 h-10 text-white/10" />
                  <p className="text-white/30 text-sm">Sin compras registradas</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmPopup name={user.username} onConfirm={() => deleteUser.mutate()} onCancel={() => setConfirmDelete(false)} loading={deleteUser.isPending} />
      )}

      {showAddProduct && user.license && (
        <AddProductModal
          userId={user.id}
          currentProductIds={user.license.products.map((p) => p.id)}
          onClose={() => setShowAddProduct(false)}
          onSuccess={refreshUser}
        />
      )}

      {showAddPlan && (
        <AddPlanModal
          userId={user.id}
          currentPlanIds={user.plans?.map((p) => p.plan_id) || []}
          onClose={() => setShowAddPlan(false)}
          onSuccess={refreshUser}
        />
      )}
    </>
  );
}

// ── Main Page ──────────────────────────────────────
export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 300);

  const limit = 10;

  const { data, isLoading } = useQuery<{
    data: User[];
    meta: { total: number; totalPages: number };
  }>({
    queryKey: ['admin-users', page, debouncedSearch, statusFilter],
    queryFn: () =>
      api.get('/admin/users', {
        params: {
          page,
          limit,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(statusFilter && { status: statusFilter }),
        },
      }).then((r) => r.data.data),
  });

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const users = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Usuarios</h1>
          <p className="text-white/30 text-sm mt-0.5">{data?.meta?.total ?? 0} usuarios registrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full bg-[#0d0d14] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0d0d14] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/50 focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="banned">Baneados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          <span className="text-white/25 text-xs uppercase tracking-wider">Avatar</span>
          <span className="text-white/25 text-xs uppercase tracking-wider">Usuario</span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">Rol</span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">Estado</span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">Acción</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : !users.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">No hay usuarios</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <UserAvatar user={user} size="sm" />
                <div className="min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{user.username}</p>
                  <p className="text-white/25 text-[11px] font-mono truncate mt-0.5">{user.discord_id}</p>
                </div>
                <div className="flex justify-center">
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex justify-center">
                  <StatusBadge status={user.status} />
                </div>
                <button
                  onClick={() => setSelectedUserId(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 text-xs transition-all"
                >
                  Ver <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/25 text-xs">Página {page} de {totalPages}</p>
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
      {selectedUserId && (
        <UserDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
