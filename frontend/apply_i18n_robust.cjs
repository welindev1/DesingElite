const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

function applyReplacement(name, search, replacement) {
  const newContent = content.replace(search, replacement);
  if (newContent === content) {
    console.error(`[FAIL] Replacement failed: ${name}`);
    return false;
  }
  content = newContent;
  console.log(`[OK] Replacement succeeded: ${name}`);
  return true;
}

// 1. Add useLang import
applyReplacement(
  'Imports',
  `import { useEffect, useRef, useState, useCallback } from 'react';`,
  `import { useEffect, useRef, useState, useCallback } from 'react';\nimport { useLang, LANGUAGES } from '../i18n/useLang';`
);

// 2. Remove static faqItems
applyReplacement(
  'Remove static FAQ items',
  /\/\* ═+\n   STATIC DATA[\s\S]*?const faqItems = \[[\s\S]*?\];\r?\n/,
  `/* ══════════════════════════════════════════════════\r\n   STATIC DATA\r\n   ══════════════════════════════════════════════════ */\r\n`
);

// 3. Add useLang hooks inside component
applyReplacement(
  'useLang hook call',
  /const \{\s*token\s*\} = useAuthStore\(\);\r?\n\s*const isLogged = !\!token;/,
  `const { token } = useAuthStore();\r\n  const isLogged = !!token;\r\n  const { lang, setLang, t } = useLang();\r\n  const [langOpen, setLangOpen] = useState(false);\r\n  const faqItems = t.faq_items;`
);

// 4. Remove cartCount state
applyReplacement(
  'Remove cartCount state',
  /const\s*\[\s*cartCount\s*,\s*setCartCount\s*\]\s*=\s*useState\(\s*0\s*\);\r?\n/,
  ''
);

// 5. Remove cartCount listener effect
applyReplacement(
  'Remove cart count listener effect',
  /\/\/ Cart count listener[\s\S]*?window\.addEventListener\('cart-updated', handler\);[\s\S]*?\}, \[\]\);/m,
  ''
);

// 6. Replace navbar links with translations
applyReplacement(
  'Navbar translated links',
  /<li><Link to="\/".*Inicio<\/Link><\/li>[\s\S]*?<li><a href=\{\`\${API_URL\}\/auth\/discord\`\}.*Discord<\/a><\/li>/,
  `<li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_home}</Link></li>
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_products}</Link></li>
              <li><Link to="/servicios" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_services}</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
              <li className="ml-1"><a href={\`\${API_URL}/auth/discord\`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">{t.nav_discord}</a></li>`
);

// 7. Replace header actions block (removing cart, adding language switcher)
const newRightActions = `          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 lg:w-[300px]">

            {/* Language switcher */}
            <div className="relative z-50">
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] text-[0.78rem] font-bold uppercase tracking-[1px] transition-all duration-200 hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] cursor-pointer select-none"
              >
                <span className="text-base leading-none">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
                <span>{lang}</span>
                <ChevronDown size={11} className={\`transition-transform duration-200 \${langOpen ? 'rotate-180' : ''}\`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute top-[calc(100%+8px)] right-0 bg-[#0d1210] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 min-w-[150px]">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={\`w-full flex items-center gap-3 px-4 py-2.5 text-[0.82rem] font-semibold transition-all duration-150 cursor-pointer border-none text-left bg-transparent \${
                          lang === l.code
                            ? 'bg-[rgba(0,234,0,0.12)] text-[#00ea00]'
                            : 'text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                        }\`}
                      >
                        <span className="text-base leading-none">{l.flag}</span>
                        <span>{l.code}</span>
                        <span className="text-[0.75rem] text-[#555] ml-auto">{l.label}</span>
                        {lang === l.code && <span className="text-[#00ea00] text-xs">✓</span>}
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
                className="hidden md:flex bg-[rgba(0,234,0,0.08)] border border-[#00ea00] text-[#00ea00] py-2.5 px-[18px] rounded-full cursor-pointer font-['Inter'] font-bold text-[0.82rem] items-center gap-2 transition-all duration-300 hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] no-underline"
              >
                <DiscordIcon size={15} /> {t.nav_login}
              </a>
            )}

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden text-white text-xl bg-transparent border-none cursor-pointer hover:text-[#00ea00]"
            >
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>`;

applyReplacement(
  'Header actions block',
  /\{\/\* Right: Actions \*\/\}[\s\S]*?<div className="flex items-center justify-end gap-\[22px\] lg:w-\[260px\]">[\s\S]*?<\/div>/,
  newRightActions
);

// 8. Replace translated hero badge
applyReplacement(
  'Hero welcome badge',
  /<span className="text-\[#00ea00\] text-\[0.75rem\] font-bold uppercase tracking-\[2px\]">Bienvenido a<\/span>/,
  `<span className="text-[#00ea00] text-[0.75rem] font-bold uppercase tracking-[2px]">{t.hero_welcome}</span>`
);

// 9. Replace hero description
applyReplacement(
  'Hero description',
  /<p className="text-\[#777\] text-\[1.05rem\] leading-\[1.7\] max-w-\[88%\] font-\['Inter'\] animate-fadeInUp2">\s*Los mejores mods estilo FiveM para MTA, con calidad, seguridad e innovación para tu experiencia de juego\.\s*<\/p>/,
  `<p className="text-[#777] text-[1.05rem] leading-[1.7] max-w-[88%] font-['Inter'] animate-fadeInUp2">
              {t.hero_desc}
            </p>`
);

// 10. Replace hero browse button
applyReplacement(
  'Hero browse button',
  /Ver productos\s*<span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;<\/span>/,
  `{t.hero_btn_shop} <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>`
);

// 11. Replace hero services button
applyReplacement(
  'Hero services button',
  /Ver Servicios/,
  `{t.hero_btn_services}`
);

// 12. Replace stats counters
applyReplacement(
  'Hero stats counters labels',
  /<StatCounter target=\{stats\.total_users\} label="Clientes" icon=\{Users\} \/>\s*<StatCounter target=\{stats\.total_products\} label="Productos" icon=\{Package\} \/>/,
  `<StatCounter target={stats.total_users} label={t.hero_stat_clients} icon={Users} />
              <StatCounter target={stats.total_products} label={t.hero_stat_products} icon={Package} />`
);

// 13. Top buyers translated title & elements
applyReplacement(
  'Top buyers header labels',
  /<span className="text-\[#00ea00\] text-xs font-bold uppercase tracking-\[3px\]">Comunidad<\/span>[\s\S]*?Top<br\/>\s*<span className="text-\[#00ea00\]">Compradores<\/span>/,
  `<span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">{t.buyers_label}</span>
            </div>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {t.buyers_title_1}<br/>
              <span className="text-[#00ea00]">{t.buyers_title_2}</span>`
);

applyReplacement(
  'Top buyers description',
  /Nuestros clientes más activos y fieles de la comunidad Diseño Elite. ¡Gracias por su apoyo!/,
  `{t.buyers_desc}`
);

applyReplacement(
  'Top buyers CTA button',
  /<Crown size=\{15\} \/>\s*Ver nuestra tienda/,
  `<Crown size={15} />\n              {t.buyers_cta}`
);

applyReplacement(
  'Top buyers badge info',
  /<p className="text-white text-sm font-bold">Sé el #1<\/p>\s*<p className="text-\[#555\] text-xs">Compra y sube en el ranking<\/p>/,
  `<p className="text-white text-sm font-bold">{t.buyers_badge_title}</p>
                <p className="text-[#555] text-xs">{t.buyers_badge_desc}</p>`
);

// 14. Pass purchasesLabel to BuyerCard
applyReplacement(
  'BuyerCard map purchasesLabel',
  /purchases=\{b\.products_count\}/,
  `purchases={b.products_count}\n                purchasesLabel={t.buyers_purchases}`
);

// 15. Reviews section translation
applyReplacement(
  'Reviews section header',
  /<span className="text-\[#00ea00\] text-xs font-bold uppercase tracking-\[3px\]">Reseñas<\/span>[\s\S]*?Lo que dice<br\/>\s*<span className="text-\[#00ea00\]">la comunidad<\/span>/,
  `<span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">{t.reviews_label}</span>
              </div>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
                {t.reviews_title_1}<br/>
                <span className="text-[#00ea00]">{t.reviews_title_2}</span>`
);

applyReplacement(
  'Reviews section description',
  /Feedback real de quienes ya usan nuestros sistemas. Sin filtros, sin ediciones./,
  `{t.reviews_desc}`
);

applyReplacement(
  'Reviews section CTA',
  /<MessageCircle size=\{15\} \/>\s*Únete al Discord/,
  `<MessageCircle size={15} />\n                {t.reviews_cta}`
);

applyReplacement(
  'Reviews section count label',
  /\(\{feedbacks\.length\} reseñas\)/,
  `({feedbacks.length} {t.reviews_count})`
);

// 16. FAQ section translation
applyReplacement(
  'FAQ section header',
  /<span className="text-\[#00ea00\] text-xs font-bold uppercase tracking-\[3px\]">Soporte<\/span>[\s\S]*?Preguntas<br\/>\s*<span className="text-\[#00ea00\]">Frecuentes<\/span>/,
  `<span className="text-[#00ea00] text-xs font-bold uppercase tracking-[3px]">{t.faq_label}</span>
            </div>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {t.faq_title_1}<br/>
              <span className="text-[#00ea00]">{t.faq_title_2}</span>`
);

applyReplacement(
  'FAQ section description',
  /Resolvemos las dudas más comunes sobre nuestros productos y servicios. ¿No encuentras lo que buscas\?/,
  `{t.faq_desc}`
);

applyReplacement(
  'FAQ section CTA',
  /<HelpCircle size=\{15\} \/>\s*Pregunta en Discord/,
  `<HelpCircle size={15} />\n              {t.faq_cta}`
);

// 17. Footer section translation
applyReplacement(
  'Footer tagline',
  /Scripts premium para llevar tu servidor MTA al siguiente nivel\./,
  `{t.footer_tagline}`
);

applyReplacement(
  'Footer copyright rights',
  /© 2025 <strong className="text-\[#444\]">Diseños Elite<\/strong> — Todos los derechos reservados\./,
  `© 2025 <strong className="text-[#444]">Diseños Elite</strong> — {t.footer_rights}`
);

// 18. Mobile nav translated links
applyReplacement(
  'Mobile nav links',
  /<li><Link to="\/".*Inicio<\/Link><\/li>[\s\S]*?<li><Link to="\/servicios".*Servicios<\/Link><\/li>[\s\S]*?<li><a href="https:\/\/discord\.gg\/Ea5eSa37PT".*Contacto<\/a><\/li>/,
  `<li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_home}</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_products}</Link></li>
              <li><Link to="/servicios" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_services}</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>`
);

// 19. Update BuyerCard interface & implementation to receive purchasesLabel
applyReplacement(
  'BuyerCard function signature',
  /function BuyerCard\(\{\s*rank,\s*name,\s*purchases,\s*avatar,\s*tier,\s*\}\:\s*\{\s*rank\:\s*number;[\s\S]*?\}\)\s*\{/,
  `function BuyerCard({\n  rank,\n  name,\n  purchases,\n  purchasesLabel,\n  avatar,\n  tier,\n}: {\n  rank: number;\n  name: string;\n  purchases: number;\n  purchasesLabel: string;\n  avatar: string;\n  tier: 'gold' | 'silver' | 'bronze' | 'normal';\n}) {`
);

applyReplacement(
  'BuyerCard layout label',
  /<ShoppingBag size=\{11\} className="text-\[#00ea00\]" \/> \{purchases\} compras/,
  `<ShoppingBag size={11} className="text-[#00ea00]" /> {purchases} {purchasesLabel}`
);

// 20. Update StatCounter layout to display the icon
applyReplacement(
  'StatCounter icon render',
  /return \(\s*<div className="flex flex-col items-center gap-2\.5 py-6 px-10 rounded-\[14px\] bg-\[rgba\(255,255,255,0\.00\)\] border border-\[rgba\(255,255,255,0\.07\)\] backdrop-blur-sm transition-all duration-350 cursor-default hover:-translate-y-1\.5 hover:scale-\[1\.03\] hover:border-\[rgba\(0, 234, 0,0\.35\)\] hover:shadow-\[0_15px_40px_rgba\(0,0,0,0\.3\)\]">\r?\n\s*\r?\n\s*<div\s*ref=\{ref\}/,
  `return (\n    <div className="flex flex-col items-center gap-2.5 py-6 px-10 rounded-[14px] bg-[rgba(255,255,255,0.00)] border border-[rgba(255,255,255,0.07)] backdrop-blur-sm transition-all duration-350 cursor-default hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[rgba(0,234,0,0.35)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]">\n      <div className="text-[#00ea00]">\n        <Icon size={22} />\n      </div>\n      <div\n        ref={ref}`
);

// 21. Delete unused lucide icons from import block
// Unused: ShoppingCart, Flame, Heart, Quote, Headphones, Lightbulb, FileText, Wrench, Coins, Monitor, Lock, Shield
// Let's replace the main lucide-react import
applyReplacement(
  'Lucide icon import block',
  /import \{\s*Home,\s*Package,[\s\S]*?\} from 'lucide-react';/,
  `import {\n  Package,\n  HelpCircle,\n  ShoppingBag,\n  MessageCircle,\n  Users,\n  Crown,\n  Star,\n  ChevronDown,\n  Menu,\n  X,\n  Trophy,\n  Check,\n  Tag,\n  Sparkles,\n  Copy\n} from 'lucide-react';`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
