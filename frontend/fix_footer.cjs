const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const footerStart = '      {/* ═══ FOOTER ═══ */}';
const footerEnd = '      </footer>';

const startIdx = content.indexOf(footerStart);
const endIdx = content.indexOf(footerEnd, startIdx) + footerEnd.length;

if (startIdx === -1 || endIdx === -1) {
  console.log('Footer markers not found');
  process.exit(1);
}

const newFooter = `      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-10 border-t border-[rgba(255,255,255,0.06)] bg-[#0b0c10]">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Left: Logo + tagline + copyright */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Diseño Elite"
                className="h-8 w-auto object-contain"
              />
              <span className="text-white font-bold text-base tracking-tight font-['Inter']">Diseño Elite</span>
            </div>
            <p className="text-[#555] text-[0.8rem] leading-relaxed">
              Scripts premium para llevar tu servidor MTA al siguiente nivel.
            </p>
            <span className="text-[#3a3a3a] text-[0.75rem] mt-0.5">
              © 2025 <strong className="text-[#444]">Diseño Elite</strong> — Todos los derechos reservados.
            </span>
          </div>

          {/* Right: Discord + YouTube only */}
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/RhJU3va"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#888] transition-all duration-300 hover:bg-[rgba(0,234,0,0.1)] hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] hover:shadow-[0_0_12px_rgba(0,234,0,0.2)] no-underline"
            >
              <DiscordIcon size={16} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#888] transition-all duration-300 hover:bg-[rgba(0,234,0,0.1)] hover:border-[rgba(0,234,0,0.4)] hover:text-[#00ea00] hover:shadow-[0_0_12px_rgba(0,234,0,0.2)] no-underline"
            >
              <YoutubeIcon size={16} />
            </a>
          </div>

        </div>
      </footer>`;

content = content.slice(0, startIdx) + newFooter + content.slice(endIdx);
fs.writeFileSync(filePath, content);
console.log('Footer replaced successfully');
