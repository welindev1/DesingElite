import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang, LANGUAGES } from '../i18n/useLang';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import UserMenu from '../components/UserMenu';
import api from '../lib/axios';
import { CartManager } from './ShopPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import {
  Home,
  Package,
  Mail,
  HelpCircle,
  BookOpen,
  ShoppingCart,
  User,
  Flame,
  ShoppingBag,
  MessageCircle,
  Users,
  Crown,
  Star,
  Eye,
  Heart,
  ChevronDown,
  Quote,
  Menu,
  X,
  Headphones,
  Lightbulb,
  FileText,
  Trophy,
  Wrench,
  Coins,
  Monitor,
  Lock,
  Shield,
  Check,
  Plus,
  Tag,
  Sparkles,
  Copy,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   BRAND SVG ICONS  (Lucide doesn't have these)
   ══════════════════════════════════════════════════ */
function DiscordIcon({
  className = '',
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.053a19.953 19.953 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function YoutubeIcon({
  className = '',
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({
  className = '',
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TiktokIcon({
  className = '',
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════ */
interface TopBuyer {
  rank: number;
  username: string;
  avatar: string;
  products_count: number;
}

interface Feedback {
  id: number;
  user: { username: string; avatar?: string; role?: string };
  rating: number;
  comment: string;
}

interface Product {
  id: number;
  name: string;
  short_description?: string;
  price: number;
  image?: string;
}

interface AvailableCoupon {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  end_date: string;
}



/* ══════════════════════════════════════════════════
   HOOKS  — infinite slider, counter, FAQ
   ══════════════════════════════════════════════════ */

function useDraggableSlider(speed = 0.55, itemCount = 0) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const originalWidth = useRef(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const initialized = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const slider = sliderRef.current;
    if (!track || !slider || itemCount === 0) return;

    // Reset if reinitializing
    if (initialized.current) {
      // Remove cloned elements (keep only original items)
      while (track.children.length > itemCount) {
        track.removeChild(track.lastChild!);
      }
      offset.current = 0;
    }

    originalWidth.current = track.scrollWidth;
    const needed =
      Math.ceil((window.innerWidth * 3) / originalWidth.current) + 1;
    const originals = [...track.children];
    for (let i = 0; i < needed; i++) {
      originals.forEach((c) => track.appendChild(c.cloneNode(true)));
    }
    initialized.current = true;

    let id: number;
    function animate() {
      if (!dragging.current) {
        offset.current += speed;
        if (offset.current >= originalWidth.current)
          offset.current -= originalWidth.current;
      }
      track!.style.transform = `translateX(-${offset.current}px)`;
      id = requestAnimationFrame(animate);
    }
    id = requestAnimationFrame(animate);

    const onDown = (e: MouseEvent) => {
      dragging.current = true;
      dragStartX.current = e.clientX;
      dragStartOffset.current = offset.current;
      slider!.style.cursor = 'grabbing';
      e.preventDefault();
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const d = dragStartX.current - e.clientX;
      offset.current =
        (((dragStartOffset.current + d) % originalWidth.current) +
          originalWidth.current) %
        originalWidth.current;
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      slider!.style.cursor = 'grab';
    };

    slider.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true;
      dragStartX.current = e.touches[0].clientX;
      dragStartOffset.current = offset.current;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const d = dragStartX.current - e.touches[0].clientX;
      offset.current =
        (((dragStartOffset.current + d) % originalWidth.current) +
          originalWidth.current) %
        originalWidth.current;
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };

    slider.addEventListener('touchstart', onTouchStart, { passive: true });
    slider.addEventListener('touchmove', onTouchMove, { passive: true });
    slider.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(id);
      slider.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      slider.removeEventListener('touchstart', onTouchStart);
      slider.removeEventListener('touchmove', onTouchMove);
      slider.removeEventListener('touchend', onTouchEnd);
    };
  }, [speed, itemCount]);

  return { trackRef, sliderRef };
}

function useCounterAnimation(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === 0) return;

    // If already visible and target changes, animate immediately
    if (hasAnimated.current) {
      let current = 0;
      const increment = target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = '+' + Math.floor(current);
      }, 30);
      return () => clearInterval(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && target > 0) {
            hasAnimated.current = true;
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = '+' + Math.floor(current);
            }, 30);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return ref;
}

function StatCounter({
  target,
  label,
  icon: Icon,
}: {
  target: number;
  label: string;
  icon: React.ElementType;
}) {
  const ref = useCounterAnimation(target);
  return (
    <div className="flex flex-col items-center gap-2.5 py-6 px-10 rounded-[14px] bg-[rgba(255,255,255,0.00)] border border-[rgba(255,255,255,0.07)] backdrop-blur-sm transition-all duration-350 cursor-default hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[rgba(0, 234, 0,0.35)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
      <div className="text-[#00ea00]">
        <Icon size={22} />
      </div>
      <div
        ref={ref}
        className="text-4xl md:text-[2.5rem] font-black text-white tracking-[-1px] leading-none"
      >
        +0
      </div>
      <div className="text-[#999] text-xs font-medium uppercase tracking-[2px] text-center" >
        {label}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function HomePage() {
  const { token } = useAuthStore();
  const isLogged = !!token;
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const faqItems = t.faq_items;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = useCallback(
    (i: number) => setOpenFaq((prev) => (prev === i ? null : i)),
    [],
  );

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Real data states
  const [stats, setStats] = useState({ total_users: 0, total_products: 0 });
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [availableCoupon, setAvailableCoupon] = useState<AvailableCoupon | null>(null);
  const [couponBubbleVisible, setCouponBubbleVisible] = useState(true);

  // Cart count listener
  useEffect(() => {
    setCartCount(CartManager.count());
    const handler = () => setCartCount(CartManager.count());
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  // Draggable sliders - pass item count to reinitialize when data loads
  const { trackRef: reviewsTrackRef, sliderRef: reviewsSliderRef } =
    useDraggableSlider(0.6, feedbacks.length);
  const { trackRef: productsTrackRef, sliderRef: productsSliderRef } =
    useDraggableSlider(0.55, products.length);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topBuyersRes, feedbackRes, productsRes, couponsRes] =
          await Promise.all([
            api.get('/stats'),
            api.get('/stats/top-buyers'),
            api.get('/feedback'),
            api.get('/products'),
            api.get('/coupons/available'),
          ]);
        setStats(
          statsRes.data?.data ||
            statsRes.data || { total_users: 0, total_products: 0 },
        );
        setTopBuyers(topBuyersRes.data?.data || topBuyersRes.data || []);
        setFeedbacks(feedbackRes.data?.data || feedbackRes.data || []);
        setProducts(productsRes.data?.data || productsRes.data || []);
        const coupons = couponsRes.data?.data || couponsRes.data || [];
        if (coupons.length > 0) {
          setAvailableCoupon(coupons[0]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#030a06] text-white overflow-x-hidden min-h-screen relative">
      {/* Background Wrapper for Header & Hero */}
      <div className="absolute top-0 left-0 w-full h-[900px] overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center scale-105" />
        <div className="absolute inset-0 bg-[rgba(3,10,6,0.72)]" />
        <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-[#00ea00] rounded-full blur-[200px] opacity-[0.06]" />
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#030a06] to-transparent" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#00ea00] rounded-full blur-[180px] opacity-[0.04]" />
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="relative z-50 px-5 md:px-[5%] py-[28px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center w-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-[15px] lg:w-[260px]">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Diseño Elite"
                className="h-[50px] w-auto object-contain transition-all duration-300 hover:scale-[1.06] hover:drop-shadow-[0_0_18px_rgba(0,234,0,0.35)]"
              />
            </Link>
          </div>

          {/* Center: Capsule Nav */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex list-none gap-[6px] items-center m-0 py-2 px-3 bg-[rgba(10,12,10,0.75)] border border-[rgba(255,255,255,0.08)] rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_home}</Link></li>
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"} target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
              <li className="ml-1"><a href={`${API_URL}/auth/discord`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">{t.nav_discord}</a></li>
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-[22px] lg:w-[260px]">
            {/* Language Switcher */}
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
                  <div className="absolute right-0 mt-2 w-[120px] bg-[#0b0c10] border border-[rgba(255,255,255,0.08)] rounded-xl py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 animate-scale-in">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangOpen(false);
                        }}
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
                href={`${API_URL}/auth/discord`}
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
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"} onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* ═══ COUPON BUBBLE ═══ */}
      {availableCoupon && couponBubbleVisible && (
        <CouponBubble
          coupon={availableCoupon}
          onClose={() => setCouponBubbleVisible(false)}
        />
      )}

      {/* ═══ HERO ═══ */}
      <main className="relative z-10 pt-[90px] pb-24 px-5">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Text side */}
          <div className="md:w-1/2 text-left flex flex-col items-start gap-5">

            {/* Badge pill */}
            <div className="flex items-center gap-2 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] py-1.5 px-4 rounded-full animate-fadeInDown">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ea00] shadow-[0_0_6px_#00ea00] animate-pulse" />
              <span className="text-[#00ea00] text-[0.75rem] font-bold uppercase tracking-[2px]">{t.hero_welcome}</span>
            </div>

            <h1 className="text-[3.8rem] md:text-[5rem] leading-[1] font-black tracking-tight m-0 animate-fadeInUp">
              <span className="font-['Pacifico'] text-[#00ea00] font-normal drop-shadow-[0_0_30px_rgba(0,234,0,0.35)]">Diseños</span>{' '}
              <span className="text-white">Elite</span>
            </h1>

            <p className="text-[#777] text-[1.05rem] leading-[1.7] max-w-[88%] font-['Inter'] animate-fadeInUp2">
              {t.hero_desc}
            </p>

            <div className="flex gap-4 animate-fadeInUp3 flex-wrap pt-2">
              <Link
                to="/shop"
                className="group bg-[#00ea00] text-[#030a06] py-3.5 px-9 rounded-full font-black text-[0.9rem] font-['Inter'] transition-all duration-300 hover:bg-[#00ff00] hover:shadow-[0_0_30px_rgba(0,234,0,0.5)] no-underline inline-flex items-center gap-2"
              >
                {t.hero_btn_shop}
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>

            </div>

            {/* Stats row inline */}
            <div className="flex gap-8 pt-4 animate-fadeInUp4 border-t border-[rgba(255,255,255,0.06)] mt-2 w-full">
              <StatCounter target={stats.total_users} label={t.hero_stat_clients} icon={Users} />
              <StatCounter target={stats.total_products} label={t.hero_stat_products} icon={Package} />
            </div>

          </div>

          {/* Visual side */}
          <div className="md:w-[480px] relative flex justify-center items-center h-[420px] animate-scale-in">
            <div className="absolute w-[380px] h-[380px] rounded-full border border-[rgba(0,234,0,0.08)] z-[0]" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(0,234,0,0.06)] z-[0]" />
            <div className="absolute w-[350px] h-[350px] bg-[#00ea00] blur-[140px] opacity-[0.12] rounded-full z-[1]" />
            <img
              src="/logo.png"
              alt="Logo Diseño Elite"
              className="relative z-[2] w-full max-w-[320px] animate-float drop-shadow-[0_0_40px_rgba(0,234,0,0.25)]"
            />
          </div>
        </div>
      </main>

      <div className="bg-particles relative z-10 w-full">
      {/* ═══ TOP BUYERS ═══ */}
      <section className="relative z-10 py-24 px-5 max-w-[1200px] mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-px bg-linear-to-r from-transparent via-[rgba(0,234,0,0.7)] to-transparent" />

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* LEFT PANEL */}
          <div className="lg:w-[30%] lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#00ea00]" />
              <span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">Comunidad</span>
            </div>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {t.buyers_title_1}<br/>
              <span className="text-[#00ea00]">{t.buyers_title_2}</span>
            </h2>
            <p className="text-[#777] text-[0.95rem] leading-relaxed">
              {t.buyers_desc}
            </p>
            <a
              href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 bg-transparent border border-[rgba(0,234,0,0.3)] text-[#00ea00] py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 hover:bg-[rgba(0,234,0,0.08)] hover:border-[#00ea00] no-underline w-fit"
            >
              <Crown size={15} />
              {t.buyers_cta}
            </a>

            {/* Crown badge */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(0,234,0,0.04)] border border-[rgba(0,234,0,0.15)] mt-2">
              <div className="w-10 h-10 rounded-full bg-[rgba(0,234,0,0.12)] flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-[#00ea00]" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Sé el #1</p>
                <p className="text-[#555] text-xs">Compra y sube en el ranking</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - BUYER CARDS */}
          <div className="lg:w-[70%] flex flex-wrap justify-center items-end gap-5">
            {topBuyers.map((b) => (
              <BuyerCard
                key={b.rank}
                rank={b.rank}
                name={b.username}
                purchases={b.products_count}
                purchasesLabel={t.buyers_purchases}
                avatar={b.avatar}
                tier={
                  b.rank === 1
                    ? 'gold'
                    : b.rank === 2
                      ? 'silver'
                      : b.rank === 3
                        ? 'bronze'
                        : 'normal'
                }
              />
            ))}
          </div>

        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      {feedbacks.length > 0 && (
        <section className="relative z-10 py-24 px-5 max-w-[1200px] mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-px bg-linear-to-r from-transparent via-[rgba(0,234,0,0.7)] to-transparent" />

          <div className="flex flex-col lg:flex-row gap-16 items-start">

            {/* LEFT PANEL */}
            <div className="lg:w-[30%] lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#00ea00]" />
                <span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">Reseñas</span>
              </div>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
                {t.reviews_title_1}<br/>
                <span className="text-[#00ea00]">{t.reviews_title_2}</span>
              </h2>
              <p className="text-[#777] text-[0.95rem] leading-relaxed">
                {t.reviews_desc}
              </p>
              <a
                href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 bg-transparent border border-[rgba(0,234,0,0.3)] text-[#00ea00] py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 hover:bg-[rgba(0,234,0,0.08)] hover:border-[#00ea00] no-underline w-fit"
              >
                <MessageCircle size={15} />
                {t.reviews_cta}
              </a>

              {/* Stars summary */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="text-[#00ea00]" />
                  ))}
                </div>
                <span className="text-white font-bold text-sm">5.0</span>
                <span className="text-[#555] text-xs">({feedbacks.length} reseñas)</span>
              </div>
            </div>

            {/* RIGHT PANEL - GRID */}
            <div className="lg:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <FeedbackCard
                  key={f.id}
                  name={f.user?.username || 'Usuario'}
                  avatar={
                    f.user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(f.user?.username?.charAt(0) || 'U')}&background=0b0c10&color=00ea00&size=50&bold=true`
                  }
                  text={f.comment}
                  rating={f.rating}
                />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ═══ FAQ ═══ */}
      <section className="relative z-10 py-24 px-5 max-w-[1200px] mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-px bg-linear-to-r from-transparent via-[rgba(0,234,0,0.7)] to-transparent" />

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* LEFT PANEL */}
          <div className="lg:w-[38%] lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#00ea00]" />
              <span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">Soporte</span>
            </div>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {t.faq_title_1}<br/>
              <span className="text-[#00ea00]">{t.faq_title_2}</span>
            </h2>
            <p className="text-[#777] text-[0.95rem] leading-relaxed">
              {t.faq_desc}
            </p>
            <a
              href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 bg-transparent border border-[rgba(0,234,0,0.3)] text-[#00ea00] py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 hover:bg-[rgba(0,234,0,0.08)] hover:border-[#00ea00] no-underline w-fit"
            >
              <HelpCircle size={15} />
              {t.faq_cta}
            </a>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-[62%] flex flex-col gap-3">
            {faqItems.map((f, i) => (
              <div
                key={i}
                onClick={() => toggleFaq(i)}
                className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 select-none ${
                  openFaq === i
                    ? 'border-[rgba(0,234,0,0.4)] bg-[rgba(0,234,0,0.04)] shadow-[0_0_30px_rgba(0,234,0,0.05)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,234,0,0.2)] hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                <div className="flex items-center gap-4 py-5 px-6">
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    openFaq === i
                      ? 'bg-[#00ea00] text-[#0b0c10] shadow-[0_0_14px_rgba(0,234,0,0.4)]'
                      : 'bg-[rgba(255,255,255,0.06)] text-[#555] group-hover:bg-[rgba(0,234,0,0.1)] group-hover:text-[#00ea00]'
                  }`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`flex-1 text-sm font-semibold transition-colors duration-200 ${openFaq === i ? 'text-white' : 'text-[rgba(255,255,255,0.8)]'}`}>
                    {f.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-all duration-300 ${openFaq === i ? 'text-[#00ea00] rotate-180' : 'text-[#444] group-hover:text-[#00ea00]'}`}
                  />
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-5 pl-[72px]">
                    <p className="text-sm text-[#888] leading-[1.75]">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-10 border-t border-[rgba(255,255,255,0.06)] bg-[#0b0c10]">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Left: Logo + tagline + copyright */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Diseños Elite"
                className="h-8 w-auto object-contain"
              />
              <span className="text-white font-bold text-base tracking-tight font-['Inter']">Diseños Elite</span>
            </div>
            <p className="text-[#555] text-[0.8rem] leading-relaxed">
              Scripts premium para llevar tu servidor MTA al siguiente nivel.
            </p>
            <span className="text-[#3a3a3a] text-[0.75rem] mt-0.5">
              © 2025 <strong className="text-[#444]">Diseños Elite</strong> — {t.footer_rights}
            </span>
          </div>

          {/* Right: Discord + YouTube only */}
          <div className="flex items-center gap-3">
            <a
              href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/RhJU3va"}
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
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  tooltip,
  tooltipIcon: TooltipIcon,
  external,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  tooltip?: string;
  tooltipIcon?: React.ElementType;
  external?: boolean;
}) {
  const linkClass = `no-underline text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${active ? 'text-white relative after:content-[""] after:absolute after:bottom-[2px] after:left-4 after:right-4 after:h-[2px] after:bg-[#00ea00] after:rounded-[2px]' : 'text-[#999] hover:text-white hover:-translate-y-[2px]'}`;

  return (
    <li className="relative group">
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <Icon size={14} /> {label}
        </a>
      ) : (
        <Link to={href} className={linkClass}>
          <Icon size={14} /> {label}
        </Link>
      )}
      {tooltip && TooltipIcon && (
        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 translate-y-2.5 bg-[rgba(20,20,30,0.95)] border border-[rgba(0, 234, 0,0.4)] py-2.5 px-[18px] rounded-[10px] whitespace-nowrap flex items-center gap-2 text-xs text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-100 shadow-[0_10px_30px_rgba(0,0,0,0.4)] pointer-events-none before:content-[''] before:absolute before:top-[-6px] before:left-1/2 before:-translate-x-1/2 before:rotate-45 before:w-3 before:h-3 before:bg-[rgba(20,20,30,0.95)] before:border-l before:border-t before:border-[rgba(0, 234, 0,0.4)]">
          <TooltipIcon size={12} className="text-[#00ff00]" />
          <span>{tooltip}</span>
        </div>
      )}
    </li>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  onClick,
  external,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  external?: boolean;
}) {
  const linkClass = "flex items-center gap-3 px-4 py-3 text-sm text-[#ccc] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all duration-200 no-underline";

  return (
    <li>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={linkClass}
        >
          <Icon size={14} className="text-[#00ea00]" /> {label}
        </a>
      ) : (
        <Link to={href} onClick={onClick} className={linkClass}>
          <Icon size={14} className="text-[#00ea00]" /> {label}
        </Link>
      )}
    </li>
  );
}

function BuyerCard({
  rank,
  name,
  purchases,
  purchasesLabel,
  avatar,
  tier,
}: {
  rank: number;
  name: string;
  purchases: number;
  purchasesLabel?: string;
  avatar: string;
  tier: 'gold' | 'silver' | 'bronze' | 'normal';
}) {
  const tierStyles = {
    gold: 'bg-[rgba(255,193,7,0.04)] border-[rgba(255,193,7,0.4)] py-[35px] px-[30px] min-w-[180px] order-2 mb-5 shadow-[0_0_30px_rgba(255,193,7,0.08)] hover:shadow-[0_20px_50px_rgba(255,193,7,0.15)] hover:border-[rgba(255,193,7,0.6)]',
    silver:
      'bg-[rgba(255,255,255,0.03)] border-[rgba(192,192,192,0.3)] py-7 px-6 min-w-[160px] order-1 hover:border-[rgba(192,192,192,0.5)]',
    bronze:
      'bg-[rgba(205,127,50,0.03)] border-[rgba(205,127,50,0.3)] py-7 px-6 min-w-[160px] order-3 hover:border-[rgba(205,127,50,0.5)]',
    normal:
      'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] py-7 px-6 min-w-[160px] order-4',
  };
  const rankStyles = {
    gold: 'text-[#ffc107] bg-[rgba(255,193,7,0.1)]',
    silver: 'text-[#c0c0c0] bg-[rgba(192,192,192,0.1)]',
    bronze: 'text-[#cd7f32] bg-[rgba(205,127,50,0.1)]',
    normal: 'text-[#999] bg-[rgba(255,255,255,0.06)]',
  };
  const avatarSize =
    tier === 'gold' ? 'w-[85px] h-[85px]' : 'w-[70px] h-[70px]';
  const avatarBorder =
    tier === 'gold'
      ? 'border-[rgba(255,193,7,0.5)]'
      : tier === 'silver'
        ? 'border-[rgba(192,192,192,0.4)]'
        : tier === 'bronze'
          ? 'border-[rgba(205,127,50,0.4)]'
          : 'border-[rgba(255,255,255,0.1)]';

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border backdrop-blur-sm transition-all duration-350 cursor-default relative hover:-translate-y-2 hover:bg-[rgba(255,255,255,0.06)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] ${tierStyles[tier]}`}
    >
      {tier === 'gold' && (
        <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 text-2xl text-[#ffc107] animate-crown">
          <Crown size={24} />
        </div>
      )}
      <div
        className={`text-xs font-bold py-1 px-3 rounded-full tracking-[1px] ${rankStyles[tier]}`}
      >
        #{rank}
      </div>
      <div
        className={`${avatarSize} rounded-full overflow-hidden border-2 ${avatarBorder} transition-all duration-300 hover:scale-[1.08] hover:border-[#00ea00]`}
      >
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="text-sm font-semibold text-white max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {name}
      </div>
      <div className="text-xs text-[#999] flex items-center gap-1.5">
        <ShoppingBag size={11} className="text-[#00ea00]" /> {purchases} {purchasesLabel || 'compras'}
      </div>
    </div>
  );
}

function FeedbackCard({
  name,
  avatar,
  text,
  rating,
  role
}: {
  name: string;
  avatar: string;
  text: string;
  rating: number;
  role?: string;
}) {
  return (
    <div className="review-card">
        <div className="review-user-info">
            <div className="review-avatar">
                <img src={avatar} alt={name} />
            </div>
            <div className="review-meta">
                <span className="review-username">{name}</span>
                {role && <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">{role}</span>}
                <div className="review-stars">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "text-[#00ea00]" : "text-[#333]"} />
                   ))}
                </div>
            </div>
        </div>
        <p className="review-text">"{text}"</p>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const { token } = useAuthStore();
  const isLogged = !!token;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (Number(product.price) === 0) {
      if (!isLogged) {
        toast.error('Debes iniciar sesión para obtener este producto gratis');
        return;
      }
      api.post('/checkout/claim-free', { productId: product.id })
        .then(() => {
          toast.success(`¡${product.name} ha sido agregado a tu cuenta!`);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Error al obtener el producto');
        });
      return;
    }

    CartManager.add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || '',
    });
    setAdded(true);
    toast.success(`${product.name} agregado al carrito`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="w-[270px] shrink-0 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] backdrop-blur-sm overflow-hidden transition-all duration-350 hover:-translate-y-2 hover:border-[rgba(0, 234, 0,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="w-full h-[155px] overflow-hidden relative bg-linear-to-br from-[#0d0d12] to-[#1a0a0a]">
        <img
          src={product.image || 'https://via.placeholder.com/270x155?text=Script'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-400 hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(2,8,5,0.7)] to-transparent" />
      </div>
      <div className="p-[18px] pt-4 flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-white tracking-[-0.2px] leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-[#999] leading-relaxed line-clamp-2">
          {product.short_description || 'Script premium para MTA'}
        </p>
        <div className="flex items-center justify-between mt-3.5 gap-2">
          <span className={`text-lg font-black tracking-[-0.5px] ${Number(product.price || 0) === 0 ? 'text-green-400' : 'text-white'}`}>
            {Number(product.price || 0) === 0 ? 'Gratis' : `$${Number(product.price || 0).toFixed(2)}`}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handleView}
              className="bg-[rgba(255,255,255,0.05)] text-[#999] border border-[rgba(255,255,255,0.1)] py-[7px] px-2.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-300 hover:text-white hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.09)] whitespace-nowrap"
            >
              <Eye size={12} /> Ver
            </button>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`py-[7px] px-3 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-300 relative overflow-hidden whitespace-nowrap ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-[#00ea00] text-white hover:scale-105 hover:shadow-[0_4px_16px_rgba(0, 234, 0,0.35)]'
              }`}
            >
              {added ? (
                <>
                  <Check size={12} /> Agregado
                </>
              ) : (
                <>
                  <Plus size={12} /> Agregar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#999] text-sm no-underline transition-all duration-300 hover:bg-[#00ea00] hover:border-[#00ea00] hover:text-white hover:-translate-y-1 hover:shadow-[0_6px_18px_rgba(0, 234, 0,0.35)]"
    >
      {icon}
    </a>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-bold text-white uppercase tracking-[2px] relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-7 after:h-[2px] after:bg-[#00ea00] after:rounded-[2px]">
        {title}
      </h4>
      <ul className="list-none flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li>
      <a
        href="#"
        className="no-underline text-[#999] text-sm flex items-center gap-2 transition-all duration-300 hover:text-white hover:gap-3"
      >
        <span className="text-[#00ea00] w-[14px] flex items-center justify-center">
          {icon}
        </span>{' '}
        {label}
      </a>
    </li>
  );
}

function CouponBubble({ coupon, onClose }: { coupon: AvailableCoupon; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const discountText = coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}% OFF`
    : `$${coupon.discount_value} OFF`;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      {/* Collapsed bubble */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-[#00ea00] to-[#00ff00] text-white py-3 px-5 rounded-full shadow-[0_8px_30px_rgba(0, 234, 0,0.4)] hover:shadow-[0_12px_40px_rgba(0, 234, 0,0.5)] transition-all duration-300 hover:scale-105 cursor-pointer border-none"
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="font-bold text-sm">Cupón disponible</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
            {discountText}
          </span>
          {/* Ping animation */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
          </span>
        </button>
      )}

      {/* Expanded card */}
      {isExpanded && (
        <div className="bg-[rgba(8,15,10,0.95)] border border-[rgba(0, 234, 0,0.4)] backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[300px] animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ea00] to-[#00ff00] flex items-center justify-center">
                <Tag size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Cupón Activo</h4>
                <p className="text-[#999] text-xs">Tiempo limitado</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Discount badge */}
          <div className="bg-gradient-to-r from-[rgba(0, 234, 0,0.2)] to-[rgba(230,53,53,0.1)] border border-[rgba(0, 234, 0,0.3)] rounded-xl p-4 mb-4 text-center">
            <span className="text-3xl font-black bg-gradient-to-r from-[#00ff00] to-[#ff7b7b] bg-clip-text text-transparent">
              {discountText}
            </span>
            {coupon.min_purchase > 0 && (
              <p className="text-[#999] text-xs mt-1">
                Compra mínima: ${coupon.min_purchase}
              </p>
            )}
          </div>

          {/* Code */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 font-mono text-white font-bold text-center tracking-wider">
              {coupon.code}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#00ea00] text-white hover:bg-[#00ff00]'
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* Description */}
          {coupon.description && (
            <p className="text-[#999] text-xs text-center leading-relaxed">
              {coupon.description}
            </p>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full mt-3 text-[#666] hover:text-white text-xs transition-colors"
          >
            Minimizar
          </button>
        </div>
      )}
    </div>
  );
}
