import { useState } from 'react';
import { translations, type Lang, LANGUAGES } from './translations';

export { LANGUAGES };
export type { Lang };

const STORAGE_KEY = 'desing_elite_lang';

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      return saved && ['ES', 'EN', 'PT'].includes(saved) ? saved : 'ES';
    } catch {
      return 'ES';
    }
  });

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = translations[lang];

  return { lang, setLang, t };
}
