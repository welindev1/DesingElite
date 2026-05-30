import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang, LANGUAGES } from '../i18n/useLang';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import UserMenu from '../components/UserMenu';
import api from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import {
  Home,
  Package,
  Mail,
  HelpCircle,
  BookOpen,
  ShoppingCart,
  User,
  Search,
  X,
  SlidersHorizontal,
  Eye,
  Heart,
  ChevronDown,
  Menu,
  ChevronRight,
  Headphones,
  FileText,
  Star,
  Monitor,
  Trophy,
  Wrench,
  Coins,
  Shield,
  Lock,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   BRAND ICONS
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

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TiktokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════ */
interface Product {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  category: string;
  image?: string;
  gallery_images?: string[];
  video_url?: string;
  visible: boolean;
}

const CATEGORIES = [
  { value: 'scripts', label: 'Scripts' },
  { value: 'plans', label: 'Planes' },
  { value: 'courses', label: 'Cursos' },
  { value: 'combos', label: 'Combos' },
];

const CATEGORY_LABELS: Record<string, string> = {
  scripts: 'Script',
  plans: 'Plan',
  courses: 'Curso',
  combos: 'Combo',
};

/* ══════════════════════════════════════════════════
   CART MANAGER
   ══════════════════════════════════════════════════ */
export const CartManager = {
  key: 'welin_cart',
  get(): { id: number; name: string; price: number; image?: string }[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  },
  save(items: { id: number; name: string; price: number; image?: string }[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  },
  add(product: { id: number; name: string; price: number; image?: string }) {
    const items = this.get();
    if (!items.find((i) => i.id === product.id)) {
      items.push(product);
      this.save(items);
    }
  },
  remove(id: number) {
    const items = this.get().filter((i) => i.id !== id);
    this.save(items);
  },
  clear() {
    localStorage.removeItem(this.key);
    window.dispatchEvent(new Event('cart-updated'));
  },
  count() {
    return this.get().length;
  },
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function ShopPage() {
  const { token } = useAuthStore();
  const isLogged = !!token;
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(CartManager.count());

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const data = res.data?.data || res.data || [];
        setProducts(data);
        // Set max price from products
        if (data.length > 0) {
          const maxPrice = Math.max(
            ...data.map((p: Product) => Number(p.price)),
          );
          setPriceRange([0, Math.ceil(maxPrice / 5) * 5 || 100]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const updateCartCount = () => setCartCount(CartManager.count());
    window.addEventListener('cart-updated', updateCartCount);
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, []);

  // Max price for slider
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100;
    return (
      Math.ceil(Math.max(...products.map((p) => Number(p.price))) / 5) * 5 ||
      100
    );
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.short_description || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const price = Number(p.price);
      const matchPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      return matchSearch && matchPrice && matchCategory;
    });
  }, [products, searchQuery, priceRange, selectedCategories]);

  // Toggle category
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
  }, [maxPrice]);

  // Add to cart
  const addToCart = useCallback(
    (product: Product) => {
      if (Number(product.price) === 0) {
        if (!isLogged) {
          toast.error('Debes iniciar sesión para obtener este producto gratis');
          return;
        }
        api
          .post('/checkout/claim-free', { productId: product.id })
          .then(() => {
            toast.success(`¡${product.name} ha sido agregado a tu cuenta!`);
          })
          .catch((err) => {
            toast.error(
              err.response?.data?.message || 'Error al obtener el producto',
            );
          });
        return;
      }

      const cart = CartManager.get();
      const alreadyInCart = cart.some((item) => item.id === product.id);

      if (alreadyInCart) {
        toast.error(`${product.name} ya está en el carrito`);
        return;
      }

      CartManager.add({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
      });
      setCartCount(CartManager.count());
      toast.success(`${product.name} agregado al carrito`);
    },
    [isLogged],
  );

  return (
    <div className="bg-[#0a0a0f] text-white min-h-screen relative overflow-x-hidden font-['Inter']">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center blur-[6px] scale-105 z-0" />
      <div className="fixed inset-0 bg-[rgba(5,5,10,0.75)] z-0" />

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
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-white relative after:content-[''] after:absolute after:bottom-[2px] after:left-5 after:right-5 after:h-[2px] after:bg-[#00ea00] after:rounded-[2px] px-5 py-2.5 rounded-full block">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
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
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[#00ea00] font-bold text-lg uppercase tracking-[1px] no-underline">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>
            </ul>
          </div>
        )}
      </header>



      {/* ═══ SHOP LAYOUT ═══ */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* ─── SIDEBAR ─── */}
        <aside className="h-fit lg:sticky lg:top-5 flex flex-col gap-4">

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.shop_search_placeholder}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl py-3.5 pl-11 pr-10 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[rgba(0,234,0,0.4)] focus:bg-[rgba(0,234,0,0.03)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter panel */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.05)]">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#00ea00]" />
                {t.shop_filters}
              </span>
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#666] hover:text-[#00ea00] transition-colors cursor-pointer bg-transparent border-none"
              >
                {t.shop_clear_filters}
              </button>
            </div>

            {/* Price */}
            <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold text-[#888] uppercase tracking-[1.5px] mb-4">{t.shop_prices}</p>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold text-white">${priceRange[0].toFixed(0)}</span>
                <span className="text-sm font-bold text-[#00ea00]">${priceRange[1].toFixed(0)}</span>
              </div>
              <div className="relative h-8 flex items-center">
                <div className="absolute w-full h-[3px] bg-[rgba(255,255,255,0.08)] rounded-full" />
                <div
                  className="absolute h-[3px] bg-gradient-to-r from-[#00ea00] to-[#55ff55] rounded-full"
                  style={{ left: `${(priceRange[0] / maxPrice) * 100}%`, width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%` }}
                />
                <input type="range" min={0} max={maxPrice} value={priceRange[0]}
                  onChange={(e) => { const val = Math.min(Number(e.target.value), priceRange[1] - 1); setPriceRange([val, priceRange[1]]); }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:bg-[#00ea00] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,234,0,0.5)]"
                />
                <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                  onChange={(e) => { const val = Math.max(Number(e.target.value), priceRange[0] + 1); setPriceRange([priceRange[0], val]); }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:bg-[#00ea00] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,234,0,0.5)]"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-5 py-5">
              <p className="text-xs font-semibold text-[#888] uppercase tracking-[1.5px] mb-4">{t.shop_categories}</p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                      selectedCategories.includes(cat.value)
                        ? 'bg-[rgba(0,234,0,0.1)] border-[rgba(0,234,0,0.3)] text-[#00ea00]'
                        : 'bg-transparent border-transparent text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategories.includes(cat.value) && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ─── MAIN GRID ─── */}
        <main>
          {/* Result count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[#888]">
              <strong className="text-white font-bold">{filteredProducts.length}</strong> {t.shop_products_count}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#00ea00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl backdrop-blur-sm">
              <div className="w-20 h-20 bg-[rgba(0,234,0,0.08)] border border-[rgba(0,234,0,0.2)] rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-[#00ea00] blur-[20px] opacity-[0.15] rounded-full" />
                <Package size={36} className="text-[#00ea00] relative z-10" />
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                {t.shop_empty_title}
              </p>
              <span className="text-[1rem] text-[#888]">
                {t.shop_empty_subtitle}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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

      {/* Floating Cart Button */}
      <button
        onClick={() => {
          if (!isLogged) {
            toast.error(t.cart_login_toast);
          } else {
            navigate('/cart');
          }
        }}
        className="fixed bottom-8 right-8 z-50 bg-[#00ea00] text-[#0b0c10] w-[60px] h-[60px] rounded-full shadow-[0_10px_30px_rgba(0,234,0,0.4)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_15px_40px_rgba(0,234,0,0.6)] border-none outline-none group"
      >
        <ShoppingCart size={24} className="relative z-10 transition-transform duration-300 group-hover:-rotate-12" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#0b0c10] text-[0.7rem] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-20 border-2 border-[#00ea00]">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB COMPONENTS
   ══════════════════════════════════════════════════ */

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  external,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  external?: boolean;
}) {
  const linkClass = `no-underline text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
    active
      ? 'text-white relative after:content-[""] after:absolute after:bottom-[2px] after:left-4 after:right-4 after:h-[2px] after:bg-[#c52828] after:rounded-[2px]'
      : 'text-[#999] hover:text-white hover:-translate-y-[2px]'
  }`;

  return (
    <li>
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
  const linkClass =
    'flex items-center gap-3 px-4 py-3 text-sm text-[#ccc] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all duration-200 no-underline';

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
          <Icon size={14} className="text-[#c52828]" /> {label}
        </a>
      ) : (
        <Link to={href} onClick={onClick} className={linkClass}>
          <Icon size={14} className="text-[#c52828]" /> {label}
        </Link>
      )}
    </li>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(0,234,0,0.4)] hover:shadow-2xl group">
      <div className="w-full aspect-square overflow-hidden relative bg-gradient-to-br from-[#0d0d12] to-[#1a0a0a]">
        <img
          src={
            product.image || 'https://via.placeholder.com/300x155?text=Product'
          }
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 to-transparent" />
        <span className="absolute top-2.5 left-2.5 bg-[#00ea00] text-[#0b0c10] text-[0.65rem] font-semibold px-2.5 py-1 rounded-full uppercase">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
      </div>
      <div className="p-4 pb-[18px] flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-white tracking-tight">
          {product.name}
        </h3>
        <p className="text-xs text-[#999] leading-relaxed line-clamp-2">
          {product.short_description || 'Script premium para MTA'}
        </p>
        <div className="flex items-center justify-between mt-3.5 gap-2">
          <span
            className={`text-lg font-black tracking-tight ${Number(product.price) === 0 ? 'text-green-400' : 'text-white'}`}
          >
            {Number(product.price) === 0
              ? 'Gratis'
              : `$${Number(product.price).toFixed(2)}`}
          </span>
          <div className="flex gap-[7px]">
            <Link
              to={`/shop/${product.id}`}
              className="bg-[rgba(255,255,255,0.05)] text-[#999] border border-[rgba(255,255,255,0.05)] py-[7px] px-2.5 rounded-lg text-[0.75rem] font-semibold cursor-pointer flex items-center gap-1 transition-all duration-300 hover:text-white hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.09)] no-underline"
            >
              <Eye size={12} /> Ver
            </Link>
            <button
              onClick={onAddToCart}
              className="bg-[#00ea00] text-[#0b0c10] border-none py-[7px] px-3 rounded-lg text-[0.75rem] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-300 relative overflow-hidden hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,234,0,0.35)]"
            >
              <ShoppingCart size={12} /> Agregar
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
      className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#999] text-sm no-underline transition-all duration-300 hover:bg-[#00ea00] hover:border-[#00ea00] hover:text-[#0b0c10] hover:-translate-y-1 hover:shadow-[0_6px_18px_rgba(0,234,0,0.35)]"
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
