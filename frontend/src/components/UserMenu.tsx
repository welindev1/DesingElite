import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Shield, LogOut } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarUrl = user.avatar;
  const isAdmin = user.role === 'admin';

  return (
    <div ref={menuRef} className="relative z-50">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-[42px] h-[42px] rounded-full overflow-hidden border-[2px] border-[rgba(0,234,0,0.2)] hover:border-[#00ea00] transition-all duration-300 cursor-pointer hover:scale-105 focus:outline-none hover:shadow-[0_0_15px_rgba(0,234,0,0.4)]"
      >
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] w-[240px] bg-[#0b0c10] border border-[rgba(0,234,0,0.15)] rounded-2xl backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(0,234,0,0.05)] overflow-hidden animate-fadeInDown">
          
          {/* Decorative glow inside header */}
          <div className="absolute top-0 left-0 w-full h-[60px] bg-gradient-to-b from-[rgba(0,234,0,0.08)] to-transparent pointer-events-none" />

          {/* User info header */}
          <div className="relative px-5 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[rgba(0,234,0,0.3)] overflow-hidden shrink-0">
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.95rem] font-bold text-white truncate leading-tight">
                {user.username}
              </p>
              <p className="text-[0.7rem] text-[#00ea00] uppercase tracking-[1px] font-semibold mt-0.5">
                {user.role}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            {/* Dashboard del cliente */}
            <button
              onClick={() => {
                setOpen(false);
                navigate('/dashboard');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer border-none bg-transparent text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] group-hover:bg-[rgba(0,234,0,0.1)] flex items-center justify-center transition-colors">
                <LayoutDashboard size={15} className="text-[#00ea00]" />
              </div>
              Mi Dashboard
            </button>

            {/* Panel Admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer border-none bg-transparent text-left group mt-1"
              >
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] group-hover:bg-[rgba(0,234,0,0.1)] flex items-center justify-center transition-colors">
                  <Shield size={15} className="text-[#00ea00]" />
                </div>
                Panel Admin
              </button>
            )}

            <div className="h-px bg-[rgba(255,255,255,0.04)] mx-2 my-2" />

            {/* Logout */}
            <button
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[rgba(255,255,255,0.7)] hover:text-[#ff4b4b] hover:bg-[rgba(255,75,75,0.08)] transition-all duration-200 cursor-pointer border-none bg-transparent text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] group-hover:bg-transparent flex items-center justify-center transition-colors">
                <LogOut size={15} className="text-[#ff4b4b] opacity-80 group-hover:opacity-100" />
              </div>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
