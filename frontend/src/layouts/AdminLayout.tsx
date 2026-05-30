import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  MessageSquare,
  Users,
  Tag,
  ShoppingBag,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Home,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/axios';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Productos', icon: Package, path: '/admin/products' },
  { label: 'Planes', icon: BookOpen, path: '/admin/plans' },
  { label: 'Usuarios', icon: Users, path: '/admin/users' },
  { label: 'Compras', icon: ShoppingBag, path: '/admin/purchases' },
  { label: 'Cupones', icon: Tag, path: '/admin/coupons' },
  { label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
  { label: 'Estadísticas', icon: BarChart2, path: '/admin/stats' },
  { label: 'Configuracion', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
        fixed top-0 left-0 h-screen z-30 w-64 flex flex-col
        bg-[#0d0d14] border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm tracking-tight">
              WelinStore
            </span>
            <span className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">
              Admin Panel
            </span>
          </div>
          {/* Close btn mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/30 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 pb-2">
            Menú
          </p>
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition-all duration-150 group relative
                ${
                  isActive
                    ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-500 rounded-full" />
                  )}
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-red-400' : 'text-white/30 group-hover:text-white/60'}`}
                  />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto text-red-400/60" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-white/[0.06] relative">
          {/* UserMenu popup */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#13131f] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl shadow-black/50">
              <button
                onClick={() => {
                  navigate('/');
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-white/90 hover:bg-white/[0.04] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Ir al inicio</span>
              </button>
              <div className="h-px bg-white/[0.06] mx-3" />
              <button
                onClick={() => {
                  handleLogout();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-red-400 hover:bg-red-600/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}

          {/* User card */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.10] transition-all duration-150 group"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col leading-none min-w-0 text-left">
              <span className="text-white/80 text-xs font-medium truncate">
                {user?.username}
              </span>
              <span className="text-red-400/60 text-[10px] mt-0.5">
                Administrador
              </span>
            </div>
            <ChevronRight
              className={`w-3 h-3 ml-auto text-white/20 transition-transform duration-200 ${userMenuOpen ? '-rotate-90' : 'rotate-90'}`}
            />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.06] bg-[#0d0d14]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-white font-bold text-sm">WelinStore</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
