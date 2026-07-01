const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useLang import after the existing imports
content = content.replace(
  `import { useEffect, useRef, useState, useCallback } from 'react';`,
  `import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang, LANGUAGES } from '../i18n/useLang';`
);

// 2. Remove the static faqItems (it will come from translations now)
content = content.replace(
  /\/\* ═+\n   STATIC DATA[\s\S]*?const faqItems = \[[\s\S]*?\];\r?\n/,
  `/* ══════════════════════════════════════════════════\r\n   STATIC DATA\r\n   ══════════════════════════════════════════════════ */\r\n`
);

// 3. Add useLang hook call inside the component (after isLogged line)
content = content.replace(
  `  const { token } = useAuthStore();\r\n  const isLogged = !!token;`,
  `  const { token } = useAuthStore();
  const isLogged = !!token;
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const faqItems = t.faq_items;`
);

// 4. Remove old cartCount logic (no cart icon on homepage)
content = content.replace(
  `  const [cartCount, setCartCount] = useState(0);\r\n`,
  ``
);
content = content.replace(
  `  // Cart count listener\r\n  useEffect(() => {\r\n    setCartCount(CartManager.count());\r\n    const handler = () => setCartCount(CartManager.count());\r\n    window.addEventListener('cart-updated', handler);\r\n    return () => window.removeEventListener('cart-updated', handler);\r\n  }, []);\r\n\r\n`,
  ``
);

// 5. Replace the nav links with translated ones
content = content.replace(
  `              <li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">Inicio</Link></li>\r\n              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">Productos</Link></li>\r\n              <li><Link to="/servicios" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">Servicios</Link></li>\r\n              <li><a href="https://discord.gg/NQ79pWHJmP" target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">Contacto</a></li>\r\n              <li className="ml-1"><a href={\`\${API_URL}/auth/discord\`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">Discord</a></li>`,
  `              <li><Link to="/" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_home}</Link></li>
              <li><Link to="/shop" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_products}</Link></li>
              <li><Link to="/servicios" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_services}</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" target="_blank" rel="noreferrer" className="font-['Inter'] font-semibold text-[0.82rem] uppercase tracking-[1.5px] no-underline transition-all duration-200 text-[rgba(255,255,255,0.65)] hover:text-white px-5 py-2.5 rounded-full hover:bg-[rgba(255,255,255,0.07)] block">{t.nav_contact}</a></li>
              <li className="ml-1"><a href={\`\${API_URL}/auth/discord\`} className="font-['Inter'] font-bold text-[0.8rem] uppercase tracking-[1px] no-underline transition-all duration-200 text-[#00ea00] border border-[rgba(0,234,0,0.3)] px-5 py-2.5 rounded-full hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_16px_rgba(0,234,0,0.35)] hover:border-[#00ea00] block">{t.nav_discord}</a></li>`
);

// 6. Replace right actions section (remove cart, add lang switcher)
const oldRightActions = `          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-[22px] lg:w-[260px]">
            {isLogged ? (
              <UserMenu />
            ) : (
              <a
                href={\`\${API_URL}/auth/discord\`}
                className="hidden md:flex bg-[rgba(0,234,0,0.08)] border border-[#00ea00] text-[#00ea00] py-2.5 px-[20px] rounded-full cursor-pointer font-['Inter'] font-bold text-[0.85rem] items-center gap-2 transition-all duration-300 hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] no-underline"
              >
                <DiscordIcon size={16} /> Loguear con Discord
              </a>
            )}

            <Link
              to="/cart"
              className="relative text-white transition-colors duration-300 hover:text-[#00ea00] cursor-pointer"
            >
              <ShoppingCart size={22} />
              <span className="absolute -top-[8px] -right-[12px] bg-[#00ea00] text-[#030a06] text-[0.7rem] font-extrabold rounded-full w-[18px] h-[18px] flex justify-center items-center shadow-[0_0_10px_rgba(0,234,0,0.5)]">
                {cartCount}
              </span>
            </Link>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden text-white text-xl bg-transparent border-none cursor-pointer hover:text-[#00ea00]"
            >
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>`;

const newRightActions = `          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 lg:w-[300px]">

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] text-[0.78rem] font-bold uppercase tracking-[1px] transition-all duration-200 hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] cursor-pointer select-none"
              >
                <span className="text-base leading-none">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
                <span>{lang}</span>
                <ChevronDown size={11} className={\`transition-transform duration-200 \${langOpen ? 'rotate-180' : ''}\`} />
              </button>

              {langOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 bg-[#0d1210] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 min-w-[150px]">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={\`w-full flex items-center gap-3 px-4 py-2.5 text-[0.82rem] font-semibold transition-all duration-150 cursor-pointer border-none text-left \${
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

content = content.replace(oldRightActions, newRightActions);

// 7. Replace hero translated texts
content = content.replace(
  `              <span className="text-[#00ea00] text-[0.75rem] font-bold uppercase tracking-[2px]">Bienvenido a</span>`,
  `              <span className="text-[#00ea00] text-[0.75rem] font-bold uppercase tracking-[2px]">{t.hero_welcome}</span>`
);

content = content.replace(
  `              Los mejores mods estilo FiveM para MTA, con calidad, seguridad e innovación para tu experiencia de juego.`,
  `              {t.hero_desc}`
);

content = content.replace(
  `                Ver productos
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>`,
  `                {t.hero_btn_shop}
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>`
);

content = content.replace(
  `                Ver Servicios`,
  `                {t.hero_btn_services}`
);

content = content.replace(
  `              <StatCounter target={stats.total_users} label="Clientes" icon={Users} />
              <StatCounter target={stats.total_products} label="Productos" icon={Package} />`,
  `              <StatCounter target={stats.total_users} label={t.hero_stat_clients} icon={Users} />
              <StatCounter target={stats.total_products} label={t.hero_stat_products} icon={Package} />`
);

// 8. Replace Top Buyers section translated texts
content = content.replace(`>Comunidad</span>`, `>{t.buyers_label}</span>`);
content = content.replace(`              Top<br/>`, `              {t.buyers_title_1}<br/>`);
content = content.replace(`              <span className="text-[#00ea00]">Compradores</span>`, `              <span className="text-[#00ea00]">{t.buyers_title_2}</span>`);
content = content.replace(
  `              Nuestros clientes más activos y fieles de la comunidad Diseño Elite. ¡Gracias por su apoyo!`,
  `              {t.buyers_desc}`
);
content = content.replace(`              Ver nuestra tienda`, `              {t.buyers_cta}`);
content = content.replace(`                <p className="text-white text-sm font-bold">Sé el #1</p>`, `                <p className="text-white text-sm font-bold">{t.buyers_badge_title}</p>`);
content = content.replace(`                <p className="text-[#555] text-xs">Compra y sube en el ranking</p>`, `                <p className="text-[#555] text-xs">{t.buyers_badge_desc}</p>`);

// Fix purchases text in BuyerCard
content = content.replace(
  ` {purchases} compras</p>`,
  ` {purchases} {t.buyers_purchases}</p>`
);

// 9. Reviews section translated texts
content = content.replace(`>Reseñas</span>`, `>{t.reviews_label}</span>`);
content = content.replace(
  `                Lo que dice<br/>
                <span className="text-[#00ea00]">la comunidad</span>`,
  `                {t.reviews_title_1}<br/>
                <span className="text-[#00ea00]">{t.reviews_title_2}</span>`
);
content = content.replace(
  `                Feedback real de quienes ya usan nuestros sistemas. Sin filtros, sin ediciones.`,
  `                {t.reviews_desc}`
);
content = content.replace(`                Únete al Discord`, `                {t.reviews_cta}`);
content = content.replace(`                <span className="text-[#555] text-xs">({feedbacks.length} reseñas)</span>`, `                <span className="text-[#555] text-xs">({feedbacks.length} {t.reviews_count})</span>`);

// 10. FAQ section translated texts
content = content.replace(`>Soporte</span>`, `>{t.faq_label}</span>`);
content = content.replace(
  `            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              Preguntas<br/>
              <span className="text-[#00ea00]">Frecuentes</span>`,
  `            <h2 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {t.faq_title_1}<br/>
              <span className="text-[#00ea00]">{t.faq_title_2}</span>`
);
content = content.replace(
  `              Resolvemos las dudas más comunes sobre nuestros productos y servicios. ¿No encuentras lo que buscas?`,
  `              {t.faq_desc}`
);
content = content.replace(`              Pregunta en Discord`, `              {t.faq_cta}`);

// 11. Footer translated texts
content = content.replace(
  `            Scripts premium para llevar tu servidor MTA al siguiente nivel.`,
  `            {t.footer_tagline}`
);
content = content.replace(
  `              © 2025 <strong className="text-[#444]">Diseño Elite</strong> — Todos los derechos reservados.`,
  `              © 2025 <strong className="text-[#444]">Diseño Elite</strong> — {t.footer_rights}`
);

// 12. Mobile nav translated links
content = content.replace(
  `              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Inicio</Link></li>\r\n              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Productos</Link></li>\r\n              <li><Link to="/servicios" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Servicios</Link></li>\r\n              <li><a href="https://discord.gg/NQ79pWHJmP" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Contacto</a></li>`,
  `              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_home}</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_products}</Link></li>
              <li><Link to="/servicios" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_services}</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">{t.nav_contact}</a></li>`
);

fs.writeFileSync(filePath, content);
console.log('All i18n changes applied successfully');
