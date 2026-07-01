const fs = require('fs');

// 1. Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');",
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Pacifico&display=swap');"
);
if (!css.includes('@keyframes float')) {
  css += `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
`;
}
fs.writeFileSync('src/index.css', css);

// 2. Update HomePage.tsx
let home = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Replace Header
const headerRegex = /<header className="relative z-50 px-5 md:px-\[50px\] py-5">([\s\S]*?)<\/header>/;

const newHeader = `<header className="relative z-50 px-5 md:px-[5%] py-[25px] border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-[15px]">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Diseño Elite"
                className="h-[50px] w-auto object-contain transition-transform duration-300 hover:scale-[1.08]"
              />
            </Link>
          </div>

          <nav>
            <ul className="hidden lg:flex list-none gap-[35px] items-center m-0 p-0">
              <li><Link to="/" className="text-white font-['Inter'] text-[0.95rem] no-underline transition-colors hover:text-[#10b981]">Inicio</Link></li>
              <li><Link to="/shop" className="text-white font-['Inter'] text-[0.95rem] no-underline transition-colors hover:text-[#10b981]">Productos</Link></li>
              <li><Link to="/servicios" className="text-white font-['Inter'] text-[0.95rem] no-underline transition-colors hover:text-[#10b981]">Servicios</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" target="_blank" rel="noreferrer" className="text-white font-['Inter'] text-[0.95rem] no-underline transition-colors hover:text-[#10b981]">Contacto</a></li>
              <li><span className="text-[1.2rem] cursor-default" title="República Dominicana">🇩🇴</span></li>
            </ul>
          </nav>

          <div className="flex items-center gap-[25px]">
            {isLogged ? (
              <UserMenu />
            ) : (
              <a
                href={\`\${API_URL}/auth/discord\`}
                className="bg-transparent border border-[rgba(255,255,255,0.2)] text-white py-2 px-[18px] rounded-[25px] cursor-pointer font-['Inter'] text-[0.9rem] flex items-center gap-2.5 transition-all duration-300 hover:border-white hover:bg-[rgba(255,255,255,0.05)] no-underline"
              >
                <DiscordIcon size={16} /> Autenticar con Discord
              </a>
            )}

            <Link
              to="/cart"
              className="relative text-white transition-colors duration-300 hover:text-[#10b981] cursor-pointer"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-[8px] -right-[12px] bg-[#10b981] text-[#030a06] text-[0.7rem] font-extrabold rounded-full w-[18px] h-[18px] flex justify-center items-center">
                {cartCount}
              </span>
            </Link>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden text-white text-xl bg-transparent border-none cursor-pointer"
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden absolute top-[100%] left-0 w-full bg-[#0b0c10] border-b border-[rgba(255,255,255,0.08)] p-4 animate-fadeInDown z-50">
            <ul className="list-none flex flex-col gap-3 m-0 p-0">
              <li><Link to="/" onClick={() => setMobileNavOpen(false)} className="text-white text-base no-underline">Inicio</Link></li>
              <li><Link to="/shop" onClick={() => setMobileNavOpen(false)} className="text-white text-base no-underline">Productos</Link></li>
              <li><Link to="/servicios" onClick={() => setMobileNavOpen(false)} className="text-white text-base no-underline">Servicios</Link></li>
              <li><a href="https://discord.gg/NQ79pWHJmP" onClick={() => setMobileNavOpen(false)} className="text-white text-base no-underline">Contacto</a></li>
            </ul>
          </div>
        )}
      </header>`;

home = home.replace(headerRegex, newHeader);

// Replace Hero
const heroStartStr = `<main className="relative z-10 text-center pt-[100px] pb-20 px-5">`;
const heroEndStr = `<div className="flex flex-col md:flex-row justify-center gap-10 animate-fadeInUp4">`;

if (home.includes(heroStartStr) && home.includes(heroEndStr)) {
  const parts = home.split(heroStartStr);
  const secondParts = parts[1].split(heroEndStr);
  
  const newHeroContent = `\n        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between mb-20 gap-10">
          <div className="md:w-1/2 text-left flex flex-col items-start">
            <div className="text-[#10b981] text-[0.85rem] tracking-[2px] flex items-center gap-[15px] mb-[15px] font-semibold uppercase animate-fadeInDown">
              <span className="w-10 h-px bg-[#10b981]"></span> BIENVENIDO(A) A
            </div>
            <h1 className="text-6xl md:text-[4.5rem] leading-none mb-[25px] flex items-center gap-[15px] flex-wrap animate-fadeInUp m-0">
              <span className="font-['Pacifico'] text-[#10b981] font-normal tracking-normal">Diseño</span>
              <span className="font-bold tracking-tight text-white font-['Inter']">Elite</span>
            </h1>
            <p className="text-[#999] text-[1.15rem] leading-[1.6] mb-[45px] max-w-[90%] text-left font-['Inter'] animate-fadeInUp2">
              Los mejores mods estilo FiveM para MTA, con calidad, seguridad e innovación para tu experiencia de juego.
            </p>
            <div className="flex gap-5 animate-fadeInUp3 flex-wrap">
              <Link
                to="/shop"
                className="bg-[#10b981] text-[#030a06] py-3.5 px-8 rounded-[30px] font-semibold text-[0.95rem] font-['Inter'] transition-all duration-300 hover:bg-[#00b300] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] no-underline inline-block"
              >
                Ver productos &rarr;
              </Link>
              <Link
                to="/servicios"
                className="bg-transparent border border-[rgba(255,255,255,0.15)] text-white py-3.5 px-8 rounded-[30px] font-semibold text-[0.95rem] font-['Inter'] transition-all duration-300 hover:border-[#10b981] hover:text-[#10b981] no-underline inline-block"
              >
                Ver Servicios &rarr;
              </Link>
            </div>
          </div>

          <div className="md:w-[450px] relative flex justify-center items-center h-[400px] animate-scale-in">
            <div className="absolute w-[350px] h-[350px] bg-[#10b981] blur-[150px] opacity-[0.15] rounded-full z-[1]"></div>
            <img src="/logo.png" alt="Logo Diseño Elite" className="relative z-[2] w-full max-w-[400px] animate-float drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
          </div>
        </div>\n\n        ` + heroEndStr;
        
  home = parts[0] + heroStartStr + newHeroContent + secondParts[1];
} else {
  console.log("Hero bounds not found");
}

fs.writeFileSync('src/pages/HomePage.tsx', home);
console.log('Update finished');
