const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the broken orphan lines left over and the FOOTER comment, replace everything between the reviews end and the footer
const reviewsEnd = '      )}\n\n';
const footerStart = '      {/* ═══ FOOTER ═══ */}';

const splitOnFooter = content.split(footerStart);
if (splitOnFooter.length < 2) {
  console.log('FOOTER marker not found');
  process.exit(1);
}

// Find the last reviews )} before the footer
const beforeFooter = splitOnFooter[0];

// We want to cut off anything after '})\n' that is leftover junk (the orphan lines)
// Find the proper end of reviews section: '      )}\n\n' or '      )}\n'
// Strategy: find '})\n' or '        )}\n' that ends the feedbacks conditional
const reviewsEndPattern = /\}\)\n?\s*\n/g;
let lastMatch = null;
let match;
while ((match = reviewsEndPattern.exec(beforeFooter)) !== null) {
  lastMatch = match;
}

if (!lastMatch) {
  console.log('Could not find reviews end');
  process.exit(1);
}

const cleanBefore = beforeFooter.slice(0, lastMatch.index + lastMatch[0].length);

const newFaqSection = `      {/* ═══ FAQ ═══ */}
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
              Preguntas<br/>
              <span className="text-[#00ea00]">Frecuentes</span>
            </h2>
            <p className="text-[#777] text-[0.95rem] leading-relaxed">
              Resolvemos las dudas más comunes sobre nuestros productos y servicios. ¿No encuentras lo que buscas?
            </p>
            <a
              href="https://discord.gg/RhJU3va"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 bg-transparent border border-[rgba(0,234,0,0.3)] text-[#00ea00] py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 hover:bg-[rgba(0,234,0,0.08)] hover:border-[#00ea00] no-underline w-fit"
            >
              <HelpCircle size={15} />
              Pregunta en Discord
            </a>
          </div>

          {/* RIGHT PANEL - ACCORDION */}
          <div className="lg:w-[62%] flex flex-col gap-3">
            {faqItems.map((f, i) => (
              <div
                key={i}
                onClick={() => toggleFaq(i)}
                className={\`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 select-none
                  \${openFaq === i
                    ? 'border-[rgba(0,234,0,0.4)] bg-[rgba(0,234,0,0.04)] shadow-[0_0_30px_rgba(0,234,0,0.05)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,234,0,0.2)] hover:bg-[rgba(255,255,255,0.03)]'
                  }\`}
              >
                <div className="flex items-center gap-4 py-5 px-6">
                  <span className={\`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                    \${openFaq === i
                      ? 'bg-[#00ea00] text-[#0b0c10] shadow-[0_0_14px_rgba(0,234,0,0.4)]'
                      : 'bg-[rgba(255,255,255,0.06)] text-[#555] group-hover:bg-[rgba(0,234,0,0.1)] group-hover:text-[#00ea00]'
                    }\`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className={\`flex-1 text-sm font-semibold transition-colors duration-200 \${openFaq === i ? 'text-white' : 'text-[rgba(255,255,255,0.8)]'}\`}>
                    {f.q}
                  </span>

                  <ChevronDown
                    size={16}
                    className={\`shrink-0 transition-all duration-300 \${openFaq === i ? 'text-[#00ea00] rotate-180' : 'text-[#444] group-hover:text-[#00ea00]'}\`}
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

      `;

content = cleanBefore + newFaqSection + footerStart + splitOnFooter[1];
fs.writeFileSync(filePath, content);
console.log('FAQ section replaced successfully');
