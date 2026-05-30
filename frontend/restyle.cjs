const fs = require('fs');

const cssPath = 'src/index.css';
const homePath = 'src/pages/HomePage.tsx';

// 1. Update index.css
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/#c52828/g, '#10b981'); // Emerald 500
css = css.replace(/#e63535/g, '#34d399'); // Emerald 400
css = css.replace(/#ff7b7b/g, '#6ee7b7'); // Emerald 300
css = css.replace(/197,40,40/g, '16,185,129'); // rgba emerald
css = css.replace(/0a0a0f/g, '030a06'); // background color dark green/black

if (!css.includes('.bg-particles')) {
  css += `\n
/* ═══════════════════════════════════════════════
   Green Particles Background
   ═══════════════════════════════════════════════ */
.bg-particles {
  background-color: #030a06;
  background-image: 
    radial-gradient(rgba(16, 185, 129, 0.25) 2px, transparent 2px),
    radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
    radial-gradient(rgba(52, 211, 153, 0.1) 1px, transparent 1px);
  background-size: 80px 80px, 40px 40px, 60px 60px;
  background-position: 0 0, 20px 20px, 30px 30px;
  animation: particlesMove 25s linear infinite;
  position: relative;
}

.bg-particles::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

@keyframes particlesMove {
  0% { background-position: 0 0, 20px 20px, 30px 30px; }
  100% { background-position: 800px 800px, 420px 420px, 630px 630px; }
}
`;
}
fs.writeFileSync(cssPath, css);

// 2. Update HomePage.tsx
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/#c52828/g, '#10b981');
home = home.replace(/#e63535/g, '#34d399');
home = home.replace(/197,40,40/g, '16,185,129');
home = home.replace(/#0a0a0f/g, '#030a06');
home = home.replace(/0,0,0/g, '0,0,0'); // keep shadow black
home = home.replace(/5,5,10/g, '2,8,5'); // dark greenish overlays
home = home.replace(/15,15,20/g, '8,15,10'); // slightly lighter dark green

// Fix Background image
const bgRegex = /\{\/\*\s*Background\s*\*\/\}\s*<div className="fixed inset-0[^>]+>\s*<div className="fixed inset-0[^>]+>/;
home = home.replace(bgRegex, `{/* Background Wrapper for Header & Hero */}
      <div className="absolute top-0 left-0 w-full h-[850px] overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/z4iuzOO.png')] bg-cover bg-center blur-[4px] scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(2,8,5,0.6)] via-[rgba(2,8,5,0.85)] to-[#030a06]" />
      </div>`);

// Wrap top buyers and below in bg-particles
if (!home.includes('<div className="bg-particles')) {
  home = home.replace(
    /\{\/\*\s*═══ TOP BUYERS ═══\s*\*\/\}/,
    `<div className="bg-particles relative z-10 w-full">\n      {/* ═══ TOP BUYERS ═══ */}`
  );
  
  home = home.replace(
    /      <\/footer>\n    <\/div>\n  \);\n}/,
    `      </footer>\n      </div>\n    </div>\n  );\n}`
  );
}

fs.writeFileSync(homePath, home);

console.log("Replaced colors and added particles successfully.");
