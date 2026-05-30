import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import UserMenu from '../components/UserMenu';
import { CartManager } from './ShopPage';
import { useLang, LANGUAGES } from '../i18n/useLang';
import {
  Package,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Play,
  Video,
  Images,
  ShoppingBag,
  ArrowLeft,
  Check,
  Menu,
  X,
  ZoomIn,
  ChevronDown,
} from 'lucide-react';

// Brand icons (Lucide doesn't have these)
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

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  image: string;
  gallery_images: string[];
  video_url: string;
  visible: boolean;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function extractYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const isLogged = !!token;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    setCartCount(CartManager.count());
    const handler = () => setCartCount(CartManager.count());
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`${API}/products/${id}`)
      .then((res) => {
        const productData = res.data.data || res.data;
        setProduct(productData);
        setSelectedImage(productData.image || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Producto no encontrado');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (Number(product.price) === 0) {
      if (!isLogged) {
        toast.error('Debes iniciar sesión para obtener este producto gratis');
        return;
      }
      axios
        .post(`${API}/checkout/claim-free`, { productId: product.id }, {
          headers: { Authorization: `Bearer ${token}` }
        })
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
      image: product.image,
    });
    setAddedToCart(true);
    toast.success(`${product.name} agregado al carrito`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const allImages = product
    ? [product.image, ...(product.gallery_images || [])].filter(Boolean)
    : [];

  // Media array includes images + video (if exists)
  const videoEmbedUrlForGallery = product ? extractYoutubeEmbedUrl(product.video_url) : null;
  const allMedia: Array<{ type: 'image' | 'video'; src: string }> = [
    ...allImages.map((img) => ({ type: 'image' as const, src: img })),
    ...(videoEmbedUrlForGallery ? [{ type: 'video' as const, src: videoEmbedUrlForGallery }] : []),
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevMedia = () => {
    setLightboxIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const goToNextMedia = () => {
    setLightboxIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevMedia();
      if (e.key === 'ArrowRight') goToNextMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allMedia.length]);

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      scripts: 'Script',
      plans: 'Plan',
      courses: 'Curso',
      combos: 'Combo',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00ea00]/30 border-t-[#00ea00] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <Package size={60} className="text-gray-600" />
        <p className="text-gray-400 text-lg">{error || 'Producto no encontrado'}</p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[#00ea00] hover:bg-[#00cc00] rounded-xl text-[#0b0c10] font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>
      </div>
    );
  }

  const videoEmbedUrl = extractYoutubeEmbedUrl(product.video_url);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center blur-[6px] scale-105 z-0" />
      <div className="fixed inset-0 bg-[rgba(5,5,10,0.75)] z-0" />

      {/* ═══ HEADER ═══ */}
      <header className="relative z-50 px-5 md:px-[5%] py-[28px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center w-full">

          {/* Logo */}
          <div className="flex items-center gap-[15px] lg:w-[260px]">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Diseño Elite"
                className="h-[50px] w-auto object-contain transition-all duration-300 hover:scale-[1.06] hover:drop-shadow-[0_0_18px_rgba(0,234,0,0.35)]"
              />
            </Link>
          </div>

          {/* Capsule Nav */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex list-none gap-[6px] items-center m-0 py-2 px-3 bg-[rgba(10,12,10,0.75)] border border-[rgba(255,255,255,0.08)] rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_home}</Link></li>
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-white relative after:content-[''] after:absolute after:bottom-[2px] after:left-5 after:right-5 after:h-[2px] after:bg-[#00ea00] after:rounded-[2px] px-5 py-2.5 rounded-full block">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
              <li className="ml-1"><a href={`${API}/auth/discord`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">{t.nav_discord}</a></li>
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
          <div className="lg:hidden absolute top-[100%] left-0 w-full bg-[#0b0c10] border-b border-[rgba(255,255,255,0.08)] p-5 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <ul className="list-none flex flex-col gap-4 m-0 p-0 text-center">
              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_home}</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[#00ea00] font-bold text-lg uppercase tracking-[1px] no-underline">{t.nav_products}</Link></li>
              <li><a href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"} onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* Main product layout */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 grid lg:grid-cols-[1fr_480px] gap-12 items-start">
        {/* LEFT: media */}
        <div className="flex flex-col gap-4">
          {/* Media frame */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#0d0d14] to-[#1a0a0a] border border-white/5 shadow-2xl group">
            {activeMedia === 'image' ? (
              <>
                <img
                  src={
                    selectedImage ||
                    product.image ||
                    'https://via.placeholder.com/800x450?text=Sin+Imagen'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Zoom overlay */}
                <button
                  onClick={() => openLightbox(allImages.indexOf(selectedImage || product.image) >= 0 ? allImages.indexOf(selectedImage || product.image) : 0)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 cursor-zoom-in opacity-0 group-hover:opacity-100"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <ZoomIn size={24} />
                  </div>
                </button>
                {/* Play button overlay - only show if video exists */}
                {videoEmbedUrl && (
                  <button
                    onClick={() => setActiveMedia('video')}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-600/90 hover:bg-red-500 border border-red-500/50 rounded-lg text-white text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Play size={16} className="ml-0.5" /> {t.prod_watch_video}
                  </button>
                )}
              </>
            ) : (
              <>
                <iframe
                  src={videoEmbedUrl + '?autoplay=1'}
                  title={product.name}
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                />
                {/* Back to images button */}
                <button
                  onClick={() => setActiveMedia('image')}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Images size={16} /> {t.prod_view_images}
                </button>
              </>
            )}
          </div>

          {/* Image gallery */}
          {allImages.length > 0 && (
            <div className="mt-1">
              <h4 className="text-sm font-semibold text-[#999] mb-3 flex items-center gap-2">
                <Images size={16} className="text-[#00ea00]" /> {t.prod_gallery}
                <span className="text-[#666] font-normal">({allImages.length} {allImages.length === 1 ? t.prod_image : t.prod_images})</span>
              </h4>
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 group/thumb cursor-zoom-in ${
                      selectedImage === img || (!selectedImage && idx === 0)
                        ? 'border-[#00ea00] ring-2 ring-[#00ea00]/30 scale-105'
                        : 'border-white/10 hover:border-white/30 hover:scale-105'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                    />
                    {/* Zoom hint on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <ZoomIn size={16} className="text-white" />
                    </div>
                  </button>
                ))}
                {/* Video thumbnail if exists */}
                {videoEmbedUrl && (
                  <button
                    onClick={() => openLightbox(allImages.length)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 group/thumb cursor-pointer ${
                      activeMedia === 'video'
                        ? 'border-[#00ea00] ring-2 ring-[#00ea00]/30 scale-105'
                        : 'border-white/10 hover:border-white/30 hover:scale-105'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-[#00ea00]/20 to-[#00ea00]/10 flex items-center justify-center transition-all duration-300 group-hover/thumb:from-[#00ea00]/30">
                      <div className="w-8 h-8 rounded-full bg-[#00ea00]/80 flex items-center justify-center group-hover/thumb:scale-110 transition-transform duration-300">
                        <Play size={14} className="ml-0.5 text-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-semibold text-center">Video</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t.prod_zoom_hint}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: info */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 text-[0.7rem] font-bold tracking-wider uppercase rounded-full bg-[rgba(0,234,0,0.1)] border border-[rgba(0,234,0,0.3)] text-[#00ea00]">
              {categoryLabel(product.category)}
            </span>
            <span className="px-3 py-1.5 text-[0.7rem] font-bold tracking-wider uppercase rounded-full bg-white/5 border border-white/20 text-gray-300">
              {t.prod_instant_delivery}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {product.name}
          </h1>

          {/* Price box */}
          <div className="bg-[rgba(0,234,0,0.04)] border border-[rgba(0,234,0,0.15)] rounded-2xl p-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className={`text-4xl sm:text-5xl font-black tracking-tighter leading-none ${Number(product.price || 0) === 0 ? 'text-[#00ea00]' : 'text-white'}`}>
                {Number(product.price || 0) === 0 ? t.prod_free_access : `$${Number(product.price || 0).toFixed(2)}`}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:text-right">
              <span className="text-sm font-semibold text-white/75">
                {Number(product.price || 0) === 0 ? t.prod_free_access : t.prod_lifetime}
              </span>
              {Number(product.price || 0) > 0 && (
                <span className="text-xs text-gray-400">
                  (+ ${(Number(product.price || 0) * 0.054 + 0.3).toFixed(2)}{' '}
                  {t.prod_paypal_fee})
                </span>
              )}
            </div>
          </div>

          {/* Buy button */}
          <button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-[#0b0c10] font-bold transition-all duration-300 overflow-hidden group ${
              addedToCart
                ? 'bg-[#00cc00] cursor-default'
                : 'bg-[#00ea00] hover:bg-[#00cc00] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,234,0,0.4)]'
            }`}
          >
            <span className="absolute inset-0 w-1/2 h-full bg-white/15 -skew-x-12 -left-full group-hover:left-[160%] transition-all duration-700" />
            {addedToCart ? (
              <>
                <Check size={18} />
                {t.prod_added_to_cart}
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                {t.prod_add_to_cart}
              </>
            )}
          </button>

          {/* View cart button */}
          <Link
            to="/cart"
            className="flex items-center justify-center gap-2 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-all backdrop-blur-sm"
          >
            <ShoppingCart size={16} />
            {t.prod_view_cart}
          </Link>

          {/* Back button */}
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[rgba(0,234,0,0.2)] rounded-xl text-sm font-semibold text-gray-400 hover:text-[#00ea00] transition-all backdrop-blur-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t.prod_back_to_shop}
          </button>
        </div>
      </div>

       {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-10 border-t border-[rgba(255,255,255,0.06)] bg-[#0b0c10]">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Left: Logo + tagline + copyright */}
          <div className="flex flex-col gap-1.5 text-left">
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:rotate-90"
          >
            <X size={24} />
          </button>

          {/* Media counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 flex items-center gap-2">
            {allMedia[lightboxIndex]?.type === 'video' ? <Video size={16} /> : <Images size={16} />}
            {lightboxIndex + 1} / {allMedia.length}
          </div>

          {/* Navigation arrows */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevMedia(); }}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:-translate-x-1"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNextMedia(); }}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:translate-x-1"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Main content (image or video) */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {allMedia[lightboxIndex]?.type === 'video' ? (
              <div className="w-[85vw] max-w-[1200px] aspect-video rounded-lg overflow-hidden shadow-2xl bg-black">
                <iframe
                  src={allMedia[lightboxIndex].src + '?autoplay=1'}
                  title={product.name}
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <img
                src={allMedia[lightboxIndex]?.src}
                alt={`${product.name} - Imagen ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Thumbnails at bottom */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              {allMedia.map((media, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    lightboxIndex === idx
                      ? 'border-[#00ea00] ring-2 ring-[#00ea00]/50 scale-110'
                      : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full bg-gradient-to-br from-red-900/80 to-red-600/60 flex items-center justify-center">
                      <Play size={18} className="text-white ml-0.5" />
                    </div>
                  ) : (
                    <img
                      src={media.src}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>

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
