import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import {
  Home,
  Layers,
  Package,
  Download,
  ShoppingCart,
  LogOut,
  Copy,
  Check,
  ShoppingBag,
  CalendarPlus,
  CalendarX,
  GitBranch,
  Fingerprint,
  Save,
  Loader2,
  X,
  Star,
  MessageSquare,
  Trash2,
  Send,
  LayoutDashboard,
  Zap,
  ChevronRight,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   INTERFACES
   ══════════════════════════════════════════════════ */
interface ProductDetail {
  id: number;
  name: string;
  image: string | null;
  download_link: string | null;
}
interface PlanProduct {
  id: number;
  name: string;
  image: string | null;
  download_link: string | null;
}
interface DashboardData {
  license: {
    key: string;
    status: string;
    authorized_ip: string | null;
    authorized_port: number | null;
    last_used: string | null;
  } | null;
  products: { individual: number[]; via_plans: number[]; details: ProductDetail[] };
  active_plans: {
    id: number;
    plan_id: number;
    plan_name: string;
    plan_image: string | null;
    expires_at: string;
    days_remaining: number;
    products: PlanProduct[];
  }[];
  purchases_count: number;
}
interface PlanItem {
  id: number;
  name: string;
  banner: string;
  purchaseDate: string;
  expiryDate: string;
  daysRemaining: number;
  products: PlanProduct[];
}
interface ProductItem {
  id: number;
  name: string;
  banner: string;
  purchaseDate: string;
  version: string;
  downloadUrl: string | null;
}
interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
  product_id: number | null;
  product?: { id: number; name: string } | null;
  is_visible: boolean;
  created_at: string;
}

type Section = 'dashboard' | 'planes' | 'productos' | 'resenas';

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function UserDashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userPlanes, setUserPlanes] = useState<PlanItem[]>([]);
  const [userProductos, setUserProductos] = useState<ProductItem[]>([]);

  const [mtaIP, setMtaIP] = useState('');
  const [mtaPort, setMtaPort] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

  const [userFeedbacks, setUserFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackProductId, setFeedbackProductId] = useState<number | ''>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        const apiData = res.data?.data || {};
        setDashboardData(apiData);
        if (apiData.license) {
          setMtaIP(apiData.license.authorized_ip || '');
          setMtaPort(apiData.license.authorized_port?.toString() || '');
        }
        const activePlans = apiData.active_plans || [];
        setUserPlanes(
          activePlans.map((p: any) => ({
            id: p.id,
            name: p.plan_name || 'Plan',
            banner: p.plan_image || '/logo.png',
            purchaseDate: new Date().toLocaleDateString('es-ES'),
            expiryDate: p.expires_at ? new Date(p.expires_at).toLocaleDateString('es-ES') : '-',
            daysRemaining: p.days_remaining || 0,
            products: p.products || [],
          })),
        );
        const details = (apiData.products?.details || []) as ProductDetail[];
        setUserProductos(
          details.map((p) => ({
            id: p.id,
            name: p.name || `Producto #${p.id}`,
            banner: p.image || '/logo.png',
            purchaseDate: new Date().toLocaleDateString('es-ES'),
            version: 'v1.0.0',
            downloadUrl: p.download_link || null,
          })),
        );
        try {
          const fbRes = await api.get('/feedback');
          const allFb = fbRes.data?.data || fbRes.data || [];
          const userId = Number(user?.id);
          setUserFeedbacks(
            Array.isArray(allFb)
              ? allFb.filter((f: any) => Number(f.user?.id) === userId || Number(f.user_id) === userId)
              : [],
          );
        } catch {}
      } catch {
        toast.error('Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = useCallback(async () => {
    if (!mtaIP || !mtaPort) { toast.error('Ingresa la IP y el puerto'); return; }
    try {
      setSaving(true);
      await api.patch('/dashboard/license/network', { authorized_ip: mtaIP, authorized_port: parseInt(mtaPort) });
      toast.success('Configuración guardada');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  }, [mtaIP, mtaPort]);

  const handleCopy = useCallback(() => {
    const key = dashboardData?.license?.key || '';
    navigator.clipboard.writeText(`ConfigLicense = {\n    license = '${key}'\n}`).then(() => {
      setCopied(true);
      toast.success('Configuración copiada');
      setTimeout(() => setCopied(false), 1800);
    });
  }, [dashboardData]);

  const handleLogout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  }, [logout, navigate]);

  const handleSubmitFeedback = useCallback(async () => {
    if (feedbackComment.trim().length < 10) { toast.error('El comentario debe tener al menos 10 caracteres'); return; }
    try {
      setSubmittingFeedback(true);
      const res = await api.post('/feedback', { rating: feedbackRating, comment: feedbackComment.trim(), product_id: feedbackProductId || undefined });
      setUserFeedbacks((prev) => [res.data?.data || res.data, ...prev]);
      setFeedbackComment(''); setFeedbackRating(5); setFeedbackProductId('');
      toast.success('¡Reseña enviada! Gracias por tu opinión');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar la reseña');
    } finally { setSubmittingFeedback(false); }
  }, [feedbackRating, feedbackComment, feedbackProductId]);

  const handleDeleteFeedback = useCallback(async (id: number) => {
    try {
      setDeletingFeedbackId(id);
      await api.delete(`/feedback/${id}`);
      setUserFeedbacks((prev) => prev.filter((f) => f.id !== id));
      toast.success('Reseña eliminada');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    } finally { setDeletingFeedbackId(null); }
  }, []);

  const username = user?.username || 'Usuario';
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=00ea00&color=0b0c10&size=80&bold=true`;
  const licenseKey = dashboardData?.license?.key || '— sin clave —';

  /* ─── Loading screen ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-[#00ea00] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-[rgba(0,234,0,0.1)] rounded-full" />
          </div>
          <p className="text-[#555] text-sm font-medium">Cargando tu panel…</p>
        </div>
      </div>
    );
  }

  const navItems: { id: Section; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'planes',    icon: Layers,          label: 'Mis Planes',   badge: userPlanes.length },
    { id: 'productos', icon: Package,          label: 'Mis Productos', badge: userProductos.length },
    { id: 'resenas',   icon: MessageSquare,   label: 'Mis Reseñas',  badge: userFeedbacks.length },
  ];

  return (
    <div className="flex min-h-screen bg-[#080810] font-['Inter'] overflow-hidden">

      {/* ══════════════════ BACKGROUND ══════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#080810] via-[#080810] to-[#0a0f0a]" />
        {/* Ambient green orbs */}
        <div className="absolute top-0 left-[240px] w-[600px] h-[600px] bg-[#00ea00] rounded-full blur-[250px] opacity-[0.03]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00ea00] rounded-full blur-[200px] opacity-[0.025]" />
      </div>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside className="fixed left-0 top-0 bottom-0 w-[230px] z-20 flex flex-col bg-[rgba(8,8,16,0.95)] border-r border-[rgba(255,255,255,0.04)] backdrop-blur-xl">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(255,255,255,0.04)]">
          <div className="relative">
            <img src="/logo.png" alt="Diseños Elite" className="w-9 h-9 object-contain rounded-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00ea00] rounded-full border-2 border-[#080810]" />
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight leading-none">Diseños Elite</p>
            <p className="text-[#00ea00] text-[0.65rem] font-semibold mt-0.5 tracking-widest uppercase">Área Cliente</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[0.6rem] font-bold text-[rgba(255,255,255,0.2)] uppercase tracking-[2px] px-2 pb-2 pt-1">Principal</p>
          {navItems.map(({ id, icon: Icon, label, badge }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm bg-transparent border cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? 'bg-[rgba(0,234,0,0.08)] border-[rgba(0,234,0,0.2)] text-white shadow-[inset_0_1px_0_rgba(0,234,0,0.1)]'
                    : 'border-transparent text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.06)]'
                }`}
              >
                <Icon size={15} className={`shrink-0 transition-colors ${isActive ? 'text-[#00ea00]' : 'group-hover:text-[rgba(255,255,255,0.7)]'}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[0.6rem] font-black py-0.5 px-2 rounded-full min-w-[20px] text-center shrink-0 ${
                    isActive ? 'bg-[#00ea00] text-[#0b0c10]' : 'bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.5)]'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-[rgba(255,255,255,0.04)] my-3" />
          <p className="text-[0.6rem] font-bold text-[rgba(255,255,255,0.2)] uppercase tracking-[2px] px-2 pb-2">Accesos rápidos</p>

          <Link
            to="/shop"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.06)] transition-all duration-200 no-underline font-semibold"
          >
            <ShoppingCart size={15} className="shrink-0" />
            <span>Tienda</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.06)] transition-all duration-200 no-underline font-semibold"
          >
            <Home size={15} className="shrink-0" />
            <span>Inicio</span>
          </Link>
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.04)] relative">
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0d0d18] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50">
              <button
                onClick={() => { navigate('/'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all bg-transparent border-none cursor-pointer text-left"
              >
                <Home size={14} /> <span>Ir al inicio</span>
              </button>
              <div className="h-px bg-[rgba(255,255,255,0.05)] mx-3" />
              <button
                onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,120,120,0.9)] hover:bg-[rgba(255,80,80,0.07)] transition-all bg-transparent border-none cursor-pointer text-left"
              >
                <LogOut size={14} /> <span>Cerrar sesión</span>
              </button>
            </div>
          )}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(0,234,0,0.04)] hover:bg-[rgba(0,234,0,0.07)] border border-[rgba(0,234,0,0.1)] hover:border-[rgba(0,234,0,0.2)] transition-all cursor-pointer group"
          >
            <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[rgba(0,234,0,0.3)]" />
            <div className="flex flex-col leading-none min-w-0 text-left">
              <span className="text-[rgba(255,255,255,0.85)] text-xs font-semibold truncate">{username}</span>
              <span className="text-[#00ea00] text-[0.62rem] mt-0.5 font-medium">Cliente ✓</span>
            </div>
            <ChevronRight size={12} className={`ml-auto text-[rgba(255,255,255,0.2)] transition-transform duration-200 ${userMenuOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <main className="ml-[230px] flex-1 min-h-screen flex flex-col relative z-10 overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[rgba(8,8,16,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">
              {activeSection === 'dashboard' ? (
                <>Bienvenido, <span className="text-[#00ea00]">{username}</span></>
              ) : activeSection === 'planes' ? 'Mis Planes' :
                activeSection === 'productos' ? 'Mis Productos' : 'Mis Reseñas'}
            </h1>
            <p className="text-[0.72rem] text-[rgba(255,255,255,0.3)] mt-0.5">
              {activeSection === 'dashboard' ? 'Gestiona tus productos y licencias' :
               activeSection === 'planes' ? 'Planes adquiridos y activos en tu cuenta' :
               activeSection === 'productos' ? 'Scripts y recursos descargables' :
               'Comparte tu experiencia con nuestros productos'}
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[rgba(0,234,0,0.07)] border border-[rgba(0,234,0,0.2)] text-[#00ea00] text-xs font-bold rounded-full no-underline hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] transition-all duration-300"
          >
            <ShoppingCart size={13} /> Catálogo
          </Link>
        </div>

        <div className="px-8 py-7 flex flex-col gap-7">

          {/* ──────────── SECTION: Dashboard ──────────── */}
          {activeSection === 'dashboard' && (
            <div className="flex flex-col gap-6">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Layers,   value: userPlanes.length,               label: 'Planes activos',   glow: true },
                  { icon: Package,  value: userProductos.length,             label: 'Productos activos', glow: true },
                  { icon: Zap,      value: dashboardData?.purchases_count || 0, label: 'Compras totales',  glow: false },
                ].map(({ icon: Icon, value, label, glow }) => (
                  <div key={label} className={`relative bg-[rgba(255,255,255,0.02)] border rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${glow ? 'border-[rgba(0,234,0,0.12)] hover:border-[rgba(0,234,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,234,0,0.06)]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]'}`}>
                    {glow && <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,234,0,0.03)] to-transparent pointer-events-none" />}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${glow ? 'bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] text-[#00ea00]' : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)]'}`}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[2rem] font-black text-white leading-none tracking-tight">{value}</p>
                      <p className="text-xs text-[rgba(255,255,255,0.35)] font-medium mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main panels */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

                {/* Products preview */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.04)]">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Package size={14} className="text-[#00ea00]" /> Mis Productos
                    </span>
                    <button
                      onClick={() => setActiveSection('productos')}
                      className="text-xs font-semibold text-[#00ea00] bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1"
                    >
                      Ver todos <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="px-5 py-4 min-h-[120px]">
                    {userProductos.length > 0 ? (
                      userProductos.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-b-0">
                          <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)]">
                            <img src={item.banner} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="flex-1 text-sm font-semibold text-white truncate">{item.name}</span>
                          <button
                            disabled={!item.downloadUrl}
                            onClick={() => item.downloadUrl && window.open(item.downloadUrl, '_blank')}
                            className="w-8 h-8 bg-[rgba(0,234,0,0.07)] border border-[rgba(0,234,0,0.2)] rounded-lg text-[#00ea00] flex items-center justify-center cursor-pointer shrink-0 transition-all hover:bg-[rgba(0,234,0,0.15)] hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                        <Package size={28} className="text-[rgba(255,255,255,0.07)]" />
                        <p className="text-sm text-[rgba(255,255,255,0.3)]">No tienes productos activos aún.</p>
                        <Link to="/shop" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] text-[#00ea00] rounded-full no-underline text-xs font-bold hover:bg-[#00ea00] hover:text-[#0b0c10] transition-all">
                          Ir a la tienda
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* MTA Config */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-[rgba(255,255,255,0.04)]">
                    <Fingerprint size={14} className="text-[#00ea00]" />
                    <span className="text-sm font-bold text-white">Configuración MTA</span>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.68rem] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-[1px]">IP del Servidor</label>
                        <input
                          type="text"
                          value={mtaIP}
                          onChange={(e) => setMtaIP(e.target.value)}
                          placeholder="0.0.0.0"
                          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[rgba(0,234,0,0.35)] focus:bg-[rgba(0,234,0,0.03)] transition-all placeholder:text-[rgba(255,255,255,0.2)] w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.68rem] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-[1px]">Puerto</label>
                        <input
                          type="text"
                          value={mtaPort}
                          onChange={(e) => setMtaPort(e.target.value)}
                          placeholder="22003"
                          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[rgba(0,234,0,0.35)] focus:bg-[rgba(0,234,0,0.03)] transition-all placeholder:text-[rgba(255,255,255,0.2)] w-full"
                        />
                      </div>
                    </div>

                    {/* Code block */}
                    <div className="relative rounded-xl overflow-hidden bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)]">
                        <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.1)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.1)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[rgba(0,234,0,0.3)]" />
                        <span className="ml-2 text-[0.6rem] font-bold tracking-[1.5px] text-[rgba(255,255,255,0.2)] uppercase">lua config</span>
                      </div>
                      <pre className="p-4 font-mono text-[0.8rem] leading-[1.8] text-[rgba(255,255,255,0.65)] whitespace-pre m-0">
                        <span className="text-[#79b8ff]">ConfigLicense</span>{' = {\n    '}
                        <span className="text-[#b392f0]">license</span>{' = '}
                        <span className="text-[#00ea00]">'{licenseKey}'</span>{'\n}'}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00ea00] text-[#0b0c10] font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,234,0,0.4)] shadow-[0_3px_12px_rgba(0,234,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed border-none"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all border ${
                          copied
                            ? 'bg-[rgba(0,234,0,0.1)] border-[rgba(0,234,0,0.3)] text-[#00ea00]'
                            : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────── SECTION: Planes ──────────── */}
          {activeSection === 'planes' && (
            <div className="flex flex-col gap-5">
              <SectionHeader icon={Layers} title="Mis Planes" count={userPlanes.length} unit="plan" />
              {userPlanes.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {userPlanes.map((p) => (
                    <ItemCard key={p.id} item={p} type="planes" onPlanClick={() => setSelectedPlan(p)} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Layers} title="No tienes planes activos" desc="Adquiere un plan para acceder a todos los beneficios." btnLabel="Ver planes" />
              )}
            </div>
          )}

          {/* ──────────── SECTION: Productos ──────────── */}
          {activeSection === 'productos' && (
            <div className="flex flex-col gap-5">
              <SectionHeader icon={Package} title="Mis Productos" count={userProductos.length} unit="producto" />
              {userProductos.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {userProductos.map((p) => (
                    <ItemCard key={p.id} item={p} type="productos" />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Package} title="No tienes productos activos" desc="Compra scripts y recursos para tu servidor MTA." btnLabel="Ir a la tienda" />
              )}
            </div>
          )}

          {/* ──────────── SECTION: Reseñas ──────────── */}
          {activeSection === 'resenas' && (
            <div className="flex flex-col gap-5">
              <SectionHeader icon={MessageSquare} title="Mis Reseñas" count={userFeedbacks.length} unit="reseña" />

              {/* New review form */}
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-[rgba(255,255,255,0.04)]">
                  <Star size={14} className="text-[#00ea00]" />
                  <span className="text-sm font-bold text-white">Nueva Reseña</span>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {userProductos.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.68rem] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-[1px]">Producto (opcional)</label>
                      <select
                        value={feedbackProductId}
                        onChange={(e) => setFeedbackProductId(e.target.value ? Number(e.target.value) : '')}
                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-[rgba(0,234,0,0.35)] transition-all appearance-none cursor-pointer w-full"
                      >
                        <option value="" className="bg-[#0d0d18]">Reseña general</option>
                        {userProductos.map((p) => (
                          <option key={p.id} value={p.id} className="bg-[#0d0d18]">{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.68rem] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-[1px]">Calificación</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 transition-transform hover:scale-110 bg-transparent border-none cursor-pointer"
                        >
                          <Star size={22} className={`transition-colors ${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-[rgba(255,255,255,0.12)]'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.68rem] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-[1px]">Comentario <span className="text-[rgba(255,255,255,0.2)] normal-case tracking-normal">(mín. 10 caracteres)</span></label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Comparte tu experiencia con nosotros…"
                      rows={3}
                      maxLength={1000}
                      className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-[rgba(0,234,0,0.35)] focus:bg-[rgba(0,234,0,0.02)] transition-all w-full placeholder:text-[rgba(255,255,255,0.2)] resize-none"
                    />
                    <span className="text-[0.65rem] text-[rgba(255,255,255,0.25)] text-right">{feedbackComment.length}/1000</span>
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || feedbackComment.trim().length < 10}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00ea00] text-[#0b0c10] font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,234,0,0.4)] shadow-[0_3px_12px_rgba(0,234,0,0.2)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none border-none"
                  >
                    {submittingFeedback ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Enviar Reseña
                  </button>
                </div>
              </div>

              {/* Reviews list */}
              {userFeedbacks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {userFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 hover:border-[rgba(0,234,0,0.12)] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={13} className={s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-[rgba(255,255,255,0.12)]'} />
                              ))}
                            </div>
                            {fb.product && (
                              <span className="text-xs text-[rgba(0,234,0,0.7)] bg-[rgba(0,234,0,0.07)] border border-[rgba(0,234,0,0.15)] px-2 py-0.5 rounded-full">{fb.product.name}</span>
                            )}
                            {!fb.is_visible && (
                              <span className="text-xs text-yellow-500/60 bg-yellow-500/08 border border-yellow-500/20 px-2 py-0.5 rounded-full">Pendiente revisión</span>
                            )}
                          </div>
                          <p className="text-sm text-[rgba(255,255,255,0.65)] leading-relaxed">{fb.comment}</p>
                          <span className="text-[0.65rem] text-[rgba(255,255,255,0.25)] mt-2 block">
                            {new Date(fb.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFeedback(fb.id)}
                          disabled={deletingFeedbackId === fb.id}
                          className="p-2 rounded-lg text-[rgba(255,255,255,0.2)] hover:text-[rgba(255,100,100,0.7)] hover:bg-[rgba(255,80,80,0.08)] transition-all disabled:opacity-50 cursor-pointer bg-transparent border-none"
                          title="Eliminar reseña"
                        >
                          {deletingFeedbackId === fb.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-[rgba(0,234,0,0.05)] border border-[rgba(0,234,0,0.1)] flex items-center justify-center">
                    <MessageSquare size={24} className="text-[rgba(0,234,0,0.3)]" />
                  </div>
                  <p className="text-sm font-bold text-[rgba(255,255,255,0.3)]">No tienes reseñas aún</p>
                  <p className="text-xs text-[rgba(255,255,255,0.2)] max-w-[240px]">¡Tu opinión nos ayuda a mejorar! Comparte tu experiencia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════ PLAN MODAL ══════════════════ */}
      {selectedPlan && <PlanProductsModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function SectionHeader({ icon: Icon, title, count, unit }: { icon: React.ElementType; title: string; count: number; unit: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] rounded-lg flex items-center justify-center">
        <Icon size={15} className="text-[#00ea00]" />
      </div>
      <h2 className="text-lg font-extrabold text-white">{title}</h2>
      <span className="text-xs font-bold text-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] rounded-full px-3 py-0.5">
        {count} {unit}{count !== 1 ? (unit === 'plan' ? 'es' : unit === 'reseña' ? 's' : 's') : ''}
      </span>
    </div>
  );
}

function ItemCard({ item, type, onPlanClick }: { item: PlanItem | ProductItem; type: 'planes' | 'productos'; onPlanClick?: () => void }) {
  const isPlan = type === 'planes';
  const planItem = item as PlanItem;
  const prodItem = item as ProductItem;
  const isActive = isPlan ? planItem.daysRemaining > 0 : true;
  const hasProducts = isPlan && planItem.products?.length > 0;

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(0,234,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,234,0,0.05)] group">
      {/* Thumbnail */}
      <div className="relative w-full h-36 overflow-hidden bg-gradient-to-br from-[#0a0a12] to-[#0d120d]">
        <img src={item.banner} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.8)] to-transparent" />
        <span className={`absolute top-2.5 right-2.5 text-[0.6rem] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full ${
          isActive ? 'bg-[rgba(0,234,0,0.15)] border border-[rgba(0,234,0,0.3)] text-[#00ea00]' : 'bg-[rgba(255,80,80,0.12)] border border-[rgba(255,80,80,0.3)] text-[rgba(255,100,100,0.8)]'
        }`}>
          {isActive ? 'Activo' : 'Expirado'}
        </span>
        {isPlan && (
          <span className="absolute top-2.5 left-2.5 text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.6)]">
            {planItem.products?.length || 0} productos
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
            <CalendarPlus size={10} /> {item.purchaseDate}
          </span>
          {isPlan ? (
            <span className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
              <CalendarX size={10} /> Vence: {planItem.expiryDate}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
              <GitBranch size={10} /> {prodItem.version || 'v1.0.0'}
            </span>
          )}
        </div>
        <button
          disabled={isPlan ? !hasProducts : !prodItem.downloadUrl}
          onClick={() => { if (isPlan && onPlanClick) onPlanClick(); else if (!isPlan && prodItem.downloadUrl) window.open(prodItem.downloadUrl, '_blank'); }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#00ea00] text-[#0b0c10] font-bold text-xs cursor-pointer transition-all shadow-[0_3px_12px_rgba(0,234,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,234,0,0.4)] hover:-translate-y-0.5 disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 border-none"
        >
          <Download size={13} /> {isPlan ? 'Ver Productos' : 'Descargar'}
        </button>
      </div>
    </div>
  );
}

function PlanProductsModal({ plan, onClose }: { plan: PlanItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d18] border border-[rgba(0,234,0,0.15)] rounded-2xl w-full max-w-md mx-4 shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,234,0,0.05)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.05)]">
          <div>
            <h3 className="text-white font-bold text-sm">{plan.name}</h3>
            <p className="text-[rgba(0,234,0,0.5)] text-xs mt-0.5">
              {plan.products.length} producto{plan.products.length !== 1 ? 's' : ''} incluido{plan.products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[rgba(255,255,255,0.25)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all bg-transparent border-none cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Products */}
        <div className="p-4 max-h-[400px] overflow-y-auto flex flex-col gap-2">
          {plan.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Package size={28} className="text-[rgba(255,255,255,0.1)]" />
              <p className="text-[rgba(255,255,255,0.25)] text-sm">Este plan no tiene productos</p>
            </div>
          ) : (
            plan.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,234,0,0.15)] transition-all"
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.04)] shrink-0 border border-[rgba(255,255,255,0.05)]">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-[rgba(255,255,255,0.15)]" /></div>
                  )}
                </div>
                <p className="flex-1 text-white/75 text-sm font-medium truncate">{product.name}</p>
                <button
                  disabled={!product.download_link}
                  onClick={() => product.download_link && window.open(product.download_link, '_blank')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00ea00] text-[#0b0c10] text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,234,0,0.4)] shadow-[0_2px_8px_rgba(0,234,0,0.2)] disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 border-none cursor-pointer"
                >
                  <Download size={12} /> Descargar
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] text-sm font-medium transition-all bg-transparent cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, btnLabel }: { icon: React.ElementType; title: string; desc: string; btnLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-5 text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-[#00ea00] blur-[30px] opacity-[0.08] rounded-full" />
        <div className="relative w-full h-full bg-[rgba(0,234,0,0.05)] border border-[rgba(0,234,0,0.12)] rounded-full flex items-center justify-center">
          <Icon size={28} className="text-[rgba(0,234,0,0.3)]" />
        </div>
      </div>
      <div>
        <h3 className="text-base font-bold text-[rgba(255,255,255,0.4)] mb-1">{title}</h3>
        <p className="text-sm text-[rgba(255,255,255,0.25)] max-w-[260px] leading-relaxed">{desc}</p>
      </div>
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.25)] text-[#00ea00] rounded-full no-underline text-sm font-bold hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] transition-all duration-300 mt-1"
      >
        <ShoppingBag size={14} /> {btnLabel}
      </Link>
    </div>
  );
}
