const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the entire import block up to the topBuyer interface
const newImports = `import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang, LANGUAGES } from '../i18n/useLang';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import UserMenu from '../components/UserMenu';
import api from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import {
  Package,
  HelpCircle,
  ShoppingBag,
  MessageCircle,
  Users,
  Crown,
  Star,
  ChevronDown,
  Menu,
  X,
  Trophy,
  Check,
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

interface TopBuyer {`;

content = content.replace(/import \{ useEffect[\s\S]*?interface TopBuyer \{/, newImports);

// 2. Remove static faqItems definition
content = content.replace(/const faqItems = \[\s*?\{\s*?q: '¿Cómo puedo comprar[\s\S]*?\}\s*?\];\s*/, '');

// 3. Update StatCounter to render the icon and type properly
const newStatCounter = `function StatCounter({
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
    <div className="flex flex-col items-center gap-2.5 py-6 px-10 rounded-[14px] bg-[rgba(255,255,255,0.00)] border border-[rgba(255,255,255,0.07)] backdrop-blur-sm transition-all duration-350 cursor-default hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[rgba(0,234,0,0.35)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
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
}`;

content = content.replace(/function StatCounter[\s\S]*?\}\s*?\n\s*?\n\/\* ══════════════════════════════════════════════════\s*?MAIN COMPONENT/, newStatCounter + '\n\n/* ══════════════════════════════════════════════════\n   MAIN COMPONENT');

// 4. Update states & useEffect inside HomePage
const newHomePageStatesAndEffect = `export default function HomePage() {
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
  const [availableCoupon, setAvailableCoupon] = useState<AvailableCoupon | null>(null);
  const [couponBubbleVisible, setCouponBubbleVisible] = useState(true);

  // Draggable sliders - pass item count to reinitialize when data loads
  const { trackRef: reviewsTrackRef, sliderRef: reviewsSliderRef } =
    useDraggableSlider(0.6, feedbacks.length);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topBuyersRes, feedbackRes, couponsRes] =
          await Promise.all([
            api.get('/stats'),
            api.get('/stats/top-buyers'),
            api.get('/feedback'),
            api.get('/coupons/available'),
          ]);
        setStats(
          statsRes.data?.data ||
            statsRes.data || { total_users: 0, total_products: 0 },
        );
        setTopBuyers(topBuyersRes.data?.data || topBuyersRes.data || []);
        setFeedbacks(feedbackRes.data?.data || feedbackRes.data || []);
        const coupons = couponsRes.data?.data || couponsRes.data || [];
        if (coupons.length > 0) {
          setAvailableCoupon(coupons[0]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchData();
  }, []);`;

content = content.replace(/export default function HomePage\(\) \{[\s\S]*?\/\/ Fetch real data on mount[\s\S]*?\}\s*?, \[\]\);\s*?\};[\s\S]*?fetchData\(\);\s*?\}, \[\]\);/, newHomePageStatesAndEffect);

// 5. Replace header actions block (removing cart, adding interactive language selector before login button)
const newHeaderActions = `          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-[22px] lg:w-[260px]">
            {/* Language Switcher */}
            <div className="relative z-50">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,234,0,0.3)] hover:bg-[rgba(0,234,0,0.04)] text-white py-2 px-3 rounded-full cursor-pointer font-['Inter'] font-semibold text-xs transition-all duration-300"
              >
                <span>{LANGUAGES.find((l) => l.code === lang)?.flag}</span>
                <span>{lang}</span>
                <ChevronDown size={12} className={\`transition-transform duration-300 \${langOpen ? 'rotate-180' : ''}\`} />
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
                        className={\`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent \${
                          lang === l.code
                            ? 'text-[#00ea00] bg-[rgba(0,234,0,0.05)]'
                            : 'text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                        }\`}
                      >
                        <span>{l.flag}</span>
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
                href={\`\${API_URL}/auth/discord\`}
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
        </div>`;

content = content.replace(/\{\/\* Right: Actions \*\/\}[\s\S]*?<\/header>/, newHeaderActions + '\n      </header>');

// 6. Update Hero section items for translations
content = content.replace(/Ver productos\s*?<span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;<\/span>/, `{t.hero_btn_shop} <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>`);
content = content.replace(/label="Clientes"\s*?icon=\{Users\}/, `label={t.hero_stat_clients} icon={Users}`);
content = content.replace(/label="Productos"\s*?icon=\{Package\}/, `label={t.hero_stat_products} icon={Package}`);

// 7. Update Top Buyers mapping to pass purchasesLabel
content = content.replace(/purchases=\{b\.products_count\}/, 'purchases={b.products_count}\n                purchasesLabel={t.buyers_purchases}');

// 8. Update Reviews and FAQ titles to use translation keys
content = content.replace(/Lo que dice<br\/>\s*?<span className="text-\[#00ea00\]">la comunidad<\/span>/, `{t.reviews_title_1}<br/>\n                <span className="text-[#00ea00]">{t.reviews_title_2}</span>`);
content = content.replace(/Preguntas<br\/>\s*?<span className="text-\[#00ea00\]">Frecuentes<\/span>/, `{t.faq_title_1}<br/>\n              <span className="text-[#00ea00]">{t.faq_title_2}</span>`);

// 9. Update Footer rights to use translation key
content = content.replace(/© 2025 <strong className="text-\[#444\]">Diseños Elite<\/strong> — Todos los derechos reservados\./, `© 2025 <strong className="text-[#444]">Diseños Elite</strong> — {t.footer_rights}`);

// 10. Update BuyerCard component parameters and implementation
const newBuyerCard = `function BuyerCard({
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
  purchasesLabel: string;
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
      className={\`flex flex-col items-center gap-3 rounded-2xl border backdrop-blur-sm transition-all duration-350 cursor-default relative hover:-translate-y-2 hover:bg-[rgba(255,255,255,0.06)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] \${tierStyles[tier]}\`}
    >
      {tier === 'gold' && (
        <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 text-2xl text-[#ffc107] animate-crown">
          <Crown size={24} />
        </div>
      )}
      <div
        className={\`text-xs font-bold py-1 px-3 rounded-full tracking-[1px] \${rankStyles[tier]}\`}
      >
        #{rank}
      </div>
      <div
        className={\`\${avatarSize} rounded-full overflow-hidden border-2 \${avatarBorder} transition-all duration-300 hover:scale-[1.08] hover:border-[#00ea00]\`}
      >
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="text-sm font-semibold text-white max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {name}
      </div>
      <div className="text-xs text-[#999] flex items-center gap-1.5">
        <ShoppingBag size={11} className="text-[#00ea00]" /> {purchases} {purchasesLabel}
      </div>
    </div>
  );
}`;

content = content.replace(/function BuyerCard\(\{[\s\S]*?\}\s*?\n\s*?\nfunction FeedbackCard/, newBuyerCard + '\n\nfunction FeedbackCard');

// 11. Update FeedbackCard component
const newFeedbackCard = `function FeedbackCard({
  name,
  avatar,
  text,
  rating,
}: {
  name: string;
  avatar: string;
  text: string;
  rating: number;
}) {
  return (
    <div className="review-card">
        <div className="review-user-info">
            <div className="review-avatar">
                <img src={avatar} alt={name} />
            </div>
            <div className="review-meta">
                <span className="review-username">{name}</span>
                <div className="review-stars">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "text-[#00ea00]" : "text-[#333]"} />
                   ))}
                </div>
            </div>
        </div>
        <p className="review-text">"\${text}"</p>
    </div>
  );
}`;

content = content.replace(/function FeedbackCard\(\{[\s\S]*?\}\s*?\n\s*?\nfunction ProductCard/, newFeedbackCard + '\n\nfunction ProductCard');

// 12. Delete only the specific unused helper components
// Remove NavLink, MobileNavLink, ProductCard, SocialBtn, FooterColumn, FooterLink
content = content.replace(/function NavLink\(\{[\s\S]*?\}\s*?\n\s*?\nfunction MobileNavLink/, 'function MobileNavLink');
content = content.replace(/function MobileNavLink\(\{[\s\S]*?\}\s*?\n\s*?\nfunction BuyerCard/, 'function BuyerCard');
content = content.replace(/function ProductCard\(\{[\s\S]*?\}\s*?\n\s*?\nfunction SocialBtn/, 'function SocialBtn');
content = content.replace(/function SocialBtn\(\{[\s\S]*?\}\s*?\n\s*?\nfunction FooterColumn/, 'function FooterColumn');
content = content.replace(/function FooterColumn\(\{[\s\S]*?\}\s*?\n\s*?\nfunction FooterLink/, 'function FooterLink');
content = content.replace(/function FooterLink\(\{[\s\S]*?\}\s*?\n\s*?\nfunction CouponBubble/, 'function CouponBubble');

fs.writeFileSync(filePath, content, 'utf8');
console.log('HomePage.tsx clean-up applied successfully!');
