import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import UserMenu from '../components/UserMenu';
import { CartManager } from './ShopPage';
import { useLang, LANGUAGES } from '../i18n/useLang';
import {
  ShoppingCart,
  Trash2,
  Tag,
  Receipt,
  Lock,
  Shield,
  Zap,
  ArrowLeft,
  Check,
  XCircle,
  ChevronDown,
  Menu,
  X,
  Package,
  User,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   BRAND ICONS
   ══════════════════════════════════════════════════ */
function DiscordIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.053a19.953 19.953 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════ */
interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface CouponResponse {
  valid: boolean;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  final_price: number;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function CartPage() {
  const { token } = useAuthStore();
  const isLogged = !!token;
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess] = useState<{ transactionId: string; message: string } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  /* Fetch cart items */
  const refreshCartItems = async () => {
    const cartItems = CartManager.get();
    if (cartItems.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/products`);
      const products = res.data.data || res.data || [];
      const updatedItems: CartItem[] = cartItems
        .map((cartItem) => {
          const product = products.find((p: any) => p.id === cartItem.id);
          if (product) return { id: product.id, name: product.name, price: Number(product.price), image: product.image };
          return null;
        })
        .filter(Boolean) as CartItem[];
      if (updatedItems.length > 0) localStorage.setItem('welin_cart', JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch {
      setItems(cartItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCartItems();
    const handler = () => refreshCartItems();
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  /* Calculations */
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + Number(i.price), 0), [items]);
  const discount = useMemo(() => {
    if (discountType === 'percentage') return subtotal * appliedDiscount;
    return Math.min(appliedDiscount, subtotal);
  }, [subtotal, appliedDiscount, discountType]);
  const subtotalAfterDiscount = subtotal - discount;
  const paypalFee = useMemo(() => {
    if (paymentMethod !== 'paypal' || subtotalAfterDiscount <= 0) return 0;
    return subtotalAfterDiscount * 0.054 + 0.3;
  }, [paymentMethod, subtotalAfterDiscount]);
  const total = subtotalAfterDiscount + paypalFee;

  /* Handlers */
  const handleRemoveItem = (id: number) => {
    const item = items.find((i) => i.id === id);
    setRemovingId(id);
    setTimeout(() => {
      CartManager.remove(id);
      setItems(CartManager.get());
      setRemovingId(null);
      resetCoupon();
      if (item) toast.success(`${item.name} eliminado del carrito`);
    }, 300);
  };

  const handleClearCart = () => {
    if (!confirm('¿Vaciar el carrito?')) return;
    CartManager.clear();
    setItems([]);
    resetCoupon();
    toast.success('Carrito vaciado');
  };

  const resetCoupon = () => {
    setCouponCode('');
    setCouponStatus('idle');
    setCouponMessage('');
    setAppliedDiscount(0);
    setDiscountType('percentage');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus('loading');
    try {
      const res = await axios.get(`${API}/coupons/validate`, {
        params: { code: couponCode.trim().toUpperCase(), subtotal },
      });
      const couponData: CouponResponse = res.data.data || res.data;
      if (couponData.valid) {
        setCouponStatus('valid');
        setDiscountType(couponData.discount_type);
        if (couponData.discount_type === 'percentage') {
          setAppliedDiscount(couponData.discount_value / 100);
          setCouponMessage(`Cupón aplicado: ${couponData.discount_value}% de descuento`);
          toast.success(`¡Cupón aplicado! ${couponData.discount_value}% de descuento`);
        } else {
          setAppliedDiscount(couponData.discount_value);
          setCouponMessage(`Cupón aplicado: -$${couponData.discount_value.toFixed(2)}`);
          toast.success(`¡Cupón aplicado! -$${couponData.discount_value.toFixed(2)}`);
        }
      }
    } catch (err: any) {
      setCouponStatus('invalid');
      const msg = err.response?.data?.message || err.response?.data?.data?.message || 'Código inválido o expirado';
      setCouponMessage(msg);
      setAppliedDiscount(0);
      toast.error(msg);
    }
  };

  const handleCouponInputChange = (value: string) => {
    setCouponCode(value);
    if (couponStatus !== 'idle') { resetCoupon(); setCouponCode(value); }
  };

  const canCheckout = items.length > 0 && paymentMethod !== '' && termsAccepted && isLogged;

  const handleCheckout = async () => {
    if (!canCheckout) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await axios.post(
        `${API}/payments/create-order`,
        {
          items: items.map((item) => ({ product_id: item.id, name: item.name, price: item.price, quantity: 1 })),
          coupon_code: couponStatus === 'valid' ? couponCode : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data || res.data;
      if (data.approval_url) {
        localStorage.setItem('welin_cart_backup', JSON.stringify(items));
        toast.success('Redirigiendo a PayPal...');
        window.location.href = data.approval_url;
      } else {
        setCheckoutError('No se pudo crear la orden de PayPal');
        toast.error('No se pudo crear la orden de PayPal');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.data?.message || 'Error al procesar la orden';
      setCheckoutError(msg);
      toast.error(msg);
      setCheckoutLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════ */
  return (
    <div className="bg-[#0a0a0f] text-white min-h-screen relative overflow-x-hidden font-['Inter']">

      {/* ─── Background ─── */}
      <div className="fixed inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center blur-[6px] scale-105 z-0" />
      <div className="fixed inset-0 bg-[rgba(5,5,10,0.75)] z-0" />

      {/* ─── Ambient glow ─── */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#00ea00] rounded-full blur-[200px] opacity-[0.04] pointer-events-none z-0" />

      {/* ════════════════════ HEADER ════════════════════ */}
      <header className="relative z-50 px-5 md:px-[5%] py-[28px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center w-full">

          {/* Logo */}
          <div className="flex items-center gap-[15px] lg:w-[260px]">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Diseños Elite"
                className="h-[50px] w-auto object-contain transition-all duration-300 hover:scale-[1.06] hover:drop-shadow-[0_0_18px_rgba(0,234,0,0.35)]"
              />
            </Link>
          </div>

          {/* Capsule Nav */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex list-none gap-[6px] items-center m-0 py-2 px-3 bg-[rgba(10,12,10,0.75)] border border-[rgba(255,255,255,0.08)] rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_home}</Link></li>
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
              <li className="ml-1"><a href={`${API}/auth/discord`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">{t.nav_discord}</a></li>
            </ul>
          </nav>

          {/* Right: Lang + Auth + Mobile toggle */}
          <div className="flex items-center justify-end gap-[22px] lg:w-[260px]">

            {/* Language switcher */}
            <div className="relative z-50">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,234,0,0.3)] hover:bg-[rgba(0,234,0,0.04)] text-white py-2 px-3 rounded-full cursor-pointer font-['Inter'] font-semibold text-xs transition-all duration-300"
              >
                <img src={LANGUAGES.find((l) => l.code === lang)?.flagUrl} alt="flag" className="w-4 h-3 object-cover rounded-[2px]" />
                <span>{lang}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[120px] bg-[#0b0c10] border border-[rgba(255,255,255,0.08)] rounded-xl py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent ${lang === l.code ? 'text-[#00ea00] bg-[rgba(0,234,0,0.05)]' : 'text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                      >
                        <img src={l.flagUrl} alt="flag" className="w-4 h-3 object-cover rounded-[2px]" />
                        <span>{l.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isLogged ? (
              <UserMenu />
            ) : (
              <a
                href={`${API}/auth/discord`}
                className="hidden md:flex bg-[rgba(0,234,0,0.08)] border border-[#00ea00] text-[#00ea00] py-2.5 px-[20px] rounded-full cursor-pointer font-['Inter'] font-bold text-[0.85rem] items-center gap-2 transition-all duration-300 hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] no-underline"
              >
                <DiscordIcon size={16} /> {t.nav_login}
              </a>
            )}

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden text-white text-xl bg-transparent border-none cursor-pointer hover:text-[#00ea00]"
            >
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden absolute top-[100%] left-0 w-full bg-[#0b0c10] border-b border-[rgba(255,255,255,0.08)] p-5 animate-fadeInDown z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <ul className="list-none flex flex-col gap-4 m-0 p-0 text-center">
              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_home}</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* ════════════════════ PAGE TITLE ════════════════════ */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-[rgba(0,234,0,0.1)] border border-[rgba(0,234,0,0.25)] rounded-xl flex items-center justify-center">
            <ShoppingCart size={18} className="text-[#00ea00]" />
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[3px] text-[#00ea00] mb-0.5">Checkout</p>
            <h1 className="text-2xl font-black text-white leading-none tracking-tight">Tu Carrito</h1>
          </div>
          {items.length > 0 && (
            <span className="ml-1 bg-[rgba(0,234,0,0.12)] border border-[rgba(0,234,0,0.25)] text-[#00ea00] text-xs font-bold px-3 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </span>
          )}
        </div>
        {/* Thin green divider */}
        <div className="mt-5 h-px bg-gradient-to-r from-[rgba(0,234,0,0.25)] via-[rgba(0,234,0,0.08)] to-transparent" />
      </div>

      {/* ════════════════════ MAIN CONTENT ════════════════════ */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">

        {/* ─── LEFT: Product list ─── */}
        <div className="flex flex-col gap-5">

          {/* List header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[1.5px]">
              Productos seleccionados
            </span>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#666] hover:text-[rgba(255,255,255,0.7)] transition-colors bg-transparent border-none cursor-pointer"
              >
                <Trash2 size={13} /> Vaciar carrito
              </button>
            )}
          </div>

          {/* Items */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#00ea00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative flex items-center gap-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 backdrop-blur-sm
                    hover:border-[rgba(0,234,0,0.2)] hover:bg-[rgba(0,234,0,0.02)] transition-all duration-300 group overflow-hidden
                    ${removingId === item.id ? 'translate-x-8 opacity-0' : ''}`}
                  style={{ transition: 'transform 0.3s ease, opacity 0.3s ease, border-color 0.25s, background 0.25s' }}
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#00ea00] to-[rgba(0,234,0,0.2)] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Thumbnail */}
                  <div className="w-[80px] h-[64px] flex-shrink-0 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x64?text=—'}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-[0.68rem] font-bold uppercase tracking-[2px] text-[#555]">
                      {Number(item.price) === 0 ? 'Gratis' : 'Producto'}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                    <span
                      className={`text-xl font-black tracking-tight leading-none ${Number(item.price) === 0 ? 'text-[#00ea00]' : 'text-white'}`}
                    >
                      {Number(item.price) === 0 ? 'Gratis' : `$${Number(item.price).toFixed(2)}`}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    title="Eliminar"
                    className="w-9 h-9 flex-shrink-0 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#555] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,80,80,0.1)] hover:border-[rgba(255,80,80,0.25)] hover:text-[rgba(255,100,100,0.8)] transition-all duration-200"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-5 py-20 text-center bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.05)] rounded-2xl backdrop-blur-sm">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-[#00ea00] blur-[30px] opacity-[0.1] rounded-full" />
                <div className="relative w-full h-full bg-[rgba(0,234,0,0.06)] border border-[rgba(0,234,0,0.15)] rounded-full flex items-center justify-center">
                  <ShoppingCart size={30} className="text-[rgba(0,234,0,0.4)]" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-1">Tu carrito está vacío</p>
                <p className="text-sm text-[#666]">Aún no has agregado ningún producto.</p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[rgba(0,234,0,0.1)] border border-[rgba(0,234,0,0.3)] text-[#00ea00] text-sm font-bold rounded-full no-underline hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.35)] transition-all duration-300"
              >
                <Package size={15} /> Explorar productos
              </Link>
            </div>
          )}

          {/* Back link */}
          {items.length > 0 && (
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-sm text-[#666] hover:text-[rgba(255,255,255,0.7)] transition-colors bg-transparent border-none cursor-pointer w-fit mt-1"
            >
              <ArrowLeft size={14} /> Seguir comprando
            </button>
          )}
        </div>

        {/* ─── RIGHT: Order summary ─── */}
        <aside className="lg:sticky lg:top-6">
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 backdrop-blur-md flex flex-col gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

            {/* Summary header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.05)]">
              <div className="w-8 h-8 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] rounded-lg flex items-center justify-center">
                <Receipt size={15} className="text-[#00ea00]" />
              </div>
              <h2 className="text-sm font-bold text-white">Resumen del pedido</h2>
            </div>

            {/* Coupon input */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.72rem] font-bold text-[#666] uppercase tracking-[1.5px]">
                ¿Tienes un cupón?
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <Tag size={13} className="absolute left-3 text-[#555] pointer-events-none" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => handleCouponInputChange(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="CÓDIGO"
                    autoComplete="off"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl py-2.5 pl-9 pr-3 text-white text-xs outline-none focus:border-[rgba(0,234,0,0.4)] focus:bg-[rgba(0,234,0,0.03)] transition-all placeholder:text-[#444] font-mono tracking-widest"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponStatus === 'loading'}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    couponStatus === 'valid'
                      ? 'bg-[rgba(0,234,0,0.1)] border-[rgba(0,234,0,0.3)] text-[#00ea00]'
                      : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  {couponStatus === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : couponStatus === 'valid' ? (
                    <span className="flex items-center gap-1"><Check size={13} /> Aplicado</span>
                  ) : 'Aplicar'}
                </button>
              </div>
              {couponMessage && (
                <div className={`text-[0.72rem] font-semibold flex items-center gap-1.5 ${couponStatus === 'valid' ? 'text-[#00ea00]' : 'text-[rgba(255,100,100,0.8)]'}`}>
                  {couponStatus === 'valid' ? <Check size={12} /> : <XCircle size={12} />}
                  {couponMessage}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-3 py-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#888]">Subtotal</span>
                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#888]">Descuento aplicado</span>
                  <span className="font-bold text-[#00ea00]">-${discount.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'paypal' && subtotalAfterDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#888] flex items-center gap-1">
                    Comisión PayPal
                    <span className="text-[0.68rem] text-[#555]">(5.4% + $0.30)</span>
                  </span>
                  <span className="font-bold text-[rgba(255,200,50,0.9)]">+${paypalFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.72rem] font-bold text-[#666] uppercase tracking-[1.5px]">
                Método de Pago
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl py-3 px-4 text-sm text-white appearance-none outline-none cursor-pointer focus:border-[rgba(0,234,0,0.4)] transition-all"
                >
                  <option value="" className="bg-[#0b0c10]">Seleccionar método</option>
                  <option value="paypal" className="bg-[#0b0c10]">PayPal</option>
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(255,255,255,0.05)]" />

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="hidden"
              />
              <span
                className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center mt-[1px] transition-all duration-200 ${
                  termsAccepted
                    ? 'bg-[#00ea00] border-[#00ea00] shadow-[0_0_12px_rgba(0,234,0,0.4)]'
                    : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                {termsAccepted && <Check size={12} className="text-[#0b0c10]" />}
              </span>
              <span className="text-xs text-[#777] leading-relaxed">
                Acepto los{' '}
                <a href="#" className="text-[rgba(0,234,0,0.7)] no-underline hover:text-[#00ea00] transition-colors">Términos de Uso</a>
                {' '}y la{' '}
                <a href="#" className="text-[rgba(0,234,0,0.7)] no-underline hover:text-[#00ea00] transition-colors">Política de Privacidad</a>
              </span>
            </label>

            {/* Total */}
            <div className="flex justify-between items-center pt-1 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-sm font-bold text-[#aaa]">Total</span>
              <div className="text-right">
                <span className="text-3xl font-black text-white tracking-tight">
                  ${total.toFixed(2)}
                </span>
                {paypalFee > 0 && (
                  <p className="text-[0.65rem] text-[#555] mt-0.5">incl. comisión PayPal</p>
                )}
              </div>
            </div>

            {/* Login warning */}
            {!isLogged && items.length > 0 && (
              <div className="bg-[rgba(255,200,50,0.05)] border border-[rgba(255,200,50,0.2)] rounded-xl p-3 flex items-start gap-2.5">
                <User size={15} className="text-[rgba(255,200,50,0.8)] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-[rgba(255,200,50,0.9)] font-bold mb-0.5">Sesión requerida</p>
                  <p className="text-[rgba(255,200,50,0.55)]">Inicia sesión para completar tu compra.</p>
                </div>
              </div>
            )}

            {/* Checkout error */}
            {checkoutError && (
              <div className="bg-[rgba(255,80,80,0.06)] border border-[rgba(255,80,80,0.2)] rounded-xl p-3 flex items-start gap-2">
                <XCircle size={15} className="text-[rgba(255,100,100,0.8)] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[rgba(255,100,100,0.8)]">{checkoutError}</span>
              </div>
            )}

            {/* Checkout success */}
            {checkoutSuccess && (
              <div className="bg-[rgba(0,234,0,0.06)] border border-[rgba(0,234,0,0.2)] rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-[#00ea00]" />
                  <span className="text-[#00ea00] font-bold text-sm">¡Orden creada!</span>
                </div>
                <p className="text-[rgba(0,234,0,0.65)] text-xs">{checkoutSuccess.message}</p>
                <div className="bg-[rgba(255,255,255,0.04)] rounded-lg px-3 py-2 mt-1">
                  <span className="text-[0.68rem] text-[#666]">ID de transacción</span>
                  <p className="text-white font-mono text-xs mt-0.5">{checkoutSuccess.transactionId}</p>
                </div>
                <Link to="/dashboard" className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00ea00] text-[#0b0c10] text-xs font-bold no-underline hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] transition-all">
                  Ver mis compras
                </Link>
              </div>
            )}

            {/* CTA button */}
            {!checkoutSuccess && (
              <button
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutLoading}
                className="relative w-full py-4 rounded-xl bg-[#00ea00] text-[#0b0c10] font-extrabold text-sm cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(0,234,0,0.45)] shadow-[0_4px_20px_rgba(0,234,0,0.25)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 group flex items-center justify-center gap-2.5"
              >
                {/* Shine sweep */}
                <span className="absolute top-0 -left-full w-[60%] h-full bg-white/20 skew-x-[-20deg] transition-all duration-500 group-hover:left-[160%]" />
                {checkoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0b0c10]/30 border-t-[#0b0c10] rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Proceder al Checkout
                  </>
                )}
              </button>
            )}

            {/* Trust badges */}
            <div className="flex justify-between pt-1">
              {[
                { icon: <Shield size={16} />, label: 'Pago seguro' },
                { icon: <Zap size={16} />, label: 'Instantáneo' },
                { icon: <DiscordIcon size={16} />, label: 'Soporte 24/7' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1.5 text-[0.66rem] font-semibold text-[#555] text-center">
                  <span className="text-[rgba(0,234,0,0.25)]">{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="relative z-10 mt-10 border-t border-[rgba(255,255,255,0.06)] bg-[#0b0c10]">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Left: Logo + tagline + copyright */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Diseños Elite" className="h-8 w-auto object-contain" />
              <span className="text-white font-bold text-base tracking-tight font-['Inter']">Diseños Elite</span>
            </div>
            <p className="text-[#555] text-[0.8rem] leading-relaxed">
              Scripts premium para llevar tu servidor MTA al siguiente nivel.
            </p>
            <span className="text-[#3a3a3a] text-[0.75rem] mt-0.5">
              © 2025 <strong className="text-[#444]">Diseños Elite</strong> — {t.footer_rights}
            </span>
          </div>

          {/* Right: Discord + YouTube */}
          <div className="flex items-center gap-3">
            <a
              href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#888] transition-all duration-300 hover:bg-[rgba(0,234,0,0.1)] hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] hover:shadow-[0_0_12px_rgba(0,234,0,0.2)] no-underline"
            >
              <DiscordIcon size={16} />
            </a>
            <a
              href={import.meta.env.VITE_YOUTUBE_LINK || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#888] transition-all duration-300 hover:bg-[rgba(0,234,0,0.1)] hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] hover:shadow-[0_0_12px_rgba(0,234,0,0.2)] no-underline"
            >
              <YoutubeIcon size={16} />
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}
