const fs = require('fs');

const cssPath = 'src/index.css';
const homePath = 'src/pages/HomePage.tsx';

// 1. Update index.css colors
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/#10b981/g, '#00ea00');
css = css.replace(/rgba\(16,\s*185,\s*129/g, 'rgba(0, 234, 0');
css = css.replace(/rgba\(16,185,129/g, 'rgba(0,234,0');
css = css.replace(/#34d399/g, '#00ff00');
css = css.replace(/#6ee7b7/g, '#33ff33');
css = css.replace(/16,185,129/g, '0,234,0');
fs.writeFileSync(cssPath, css);

// 2. Update HomePage.tsx colors
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/#10b981/g, '#00ea00');
home = home.replace(/rgba\(16,\s*185,\s*129/g, 'rgba(0, 234, 0');
home = home.replace(/rgba\(16,185,129/g, 'rgba(0,234,0');
home = home.replace(/#34d399/g, '#00ff00');
home = home.replace(/#6ee7b7/g, '#33ff33');
home = home.replace(/16,185,129/g, '0,234,0');

// 3. Update Header layout
const headerRegex = /<header[^>]*>([\s\S]*?)<\/header>/;

const newHeader = `<header className="relative z-50 px-5 md:px-[5%] py-[30px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center w-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-[15px] lg:w-[250px]">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Diseño Elite"
                className="h-[50px] w-auto object-contain transition-transform duration-300 hover:scale-[1.08] hover:drop-shadow-[0_0_15px_rgba(0,234,0,0.3)]"
              />
            </Link>
          </div>

          {/* Center: Capsule Nav */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex list-none gap-[40px] items-center m-0 py-3.5 px-10 bg-[#0b0c10] border border-[rgba(255,255,255,0.06)] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <li><Link to="/" className="text-[rgba(255,255,255,0.85)] font-['Inter'] font-bold text-[0.85rem] uppercase tracking-[1.5px] no-underline transition-colors hover:text-[#00ea00]">Inicio</Link></li>
              <li><Link to="/shop" className="text-[rgba(255,255,255,0.85)] font-['Inter'] font-bold text-[0.85rem] uppercase tracking-[1.5px] no-underline transition-colors hover:text-[#00ea00]">Productos</Link></li>
              <li><Link to="/servicios" className="text-[rgba(255,255,255,0.85)] font-['Inter'] font-bold text-[0.85rem] uppercase tracking-[1.5px] no-underline transition-colors hover:text-[#00ea00]">Servicios</Link></li>
              <li><a href="https://discord.gg/Ea5eSa37PT" target="_blank" rel="noreferrer" className="text-[rgba(255,255,255,0.85)] font-['Inter'] font-bold text-[0.85rem] uppercase tracking-[1.5px] no-underline transition-colors hover:text-[#00ea00]">Contacto</a></li>
              <li className="pl-4 border-l border-[rgba(255,255,255,0.1)]"><span className="text-[1.2rem] cursor-default" title="República Dominicana">🇩🇴</span></li>
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-[25px] lg:w-[250px]">
            {isLogged ? (
              <UserMenu />
            ) : (
              <a
                href={\`\${API_URL}/auth/discord\`}
                className="hidden md:flex bg-[rgba(0,234,0,0.08)] border border-[#00ea00] text-[#00ea00] py-2.5 px-[20px] rounded-full cursor-pointer font-['Inter'] font-bold text-[0.85rem] items-center gap-2 transition-all duration-300 hover:bg-[#00ea00] hover:text-[#0b0c10] hover:shadow-[0_0_20px_rgba(0,234,0,0.4)] no-underline"
              >
                <DiscordIcon size={16} /> Autenticar
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
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden absolute top-[100%] left-0 w-full bg-[#0b0c10] border-b border-[rgba(255,255,255,0.08)] p-5 animate-fadeInDown z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <ul className="list-none flex flex-col gap-4 m-0 p-0 text-center">
              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Inicio</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Productos</Link></li>
              <li><Link to="/servicios" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Servicios</Link></li>
              <li><a href="https://discord.gg/Ea5eSa37PT" onClick={() => setMobileNavOpen(false)} className="text-[rgba(255,255,255,0.9)] font-bold text-lg uppercase tracking-[1px] no-underline hover:text-[#00ea00]">Contacto</a></li>
            </ul>
          </div>
        )}
      </header>`;

home = home.replace(headerRegex, newHeader);

// 4. Update StatCounter
const statCounterRegex = /function StatCounter\(\{[\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?  \);\n\}/;

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
    <div className="flex flex-col items-start justify-center gap-1 py-5 px-8 border-l-[3px] border-[#00ea00] bg-gradient-to-r from-[rgba(0,234,0,0.08)] to-transparent relative group transition-all duration-300 hover:from-[rgba(0,234,0,0.12)]">
      <div className="flex items-center gap-4">
        <Icon size={32} className="text-[#00ea00] drop-shadow-[0_0_8px_rgba(0,234,0,0.5)] transition-transform group-hover:scale-110 duration-300" />
        <div
          ref={ref}
          className="text-[3.2rem] md:text-[3.8rem] font-black text-white tracking-[-2px] leading-none drop-shadow-[0_0_15px_rgba(0,234,0,0.2)] group-hover:drop-shadow-[0_0_25px_rgba(0,234,0,0.6)] transition-all duration-300"
        >
          +0
        </div>
      </div>
      <div className="text-[rgba(255,255,255,0.6)] text-xs font-bold uppercase tracking-[4px] mt-1 ml-[48px] group-hover:text-white transition-colors duration-300">
        {label}
      </div>
    </div>
  );
}`;

home = home.replace(statCounterRegex, newStatCounter);

fs.writeFileSync(homePath, home);
console.log('Update finished successfully');
