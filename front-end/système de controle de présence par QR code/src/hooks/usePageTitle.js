import { useEffect } from 'react';

/** Titre de document unique par route (WCAG 2.4.2). */
export function usePageTitle(titre) {
  useEffect(() => {
    const ancien = document.title;
    document.title = titre ? `${titre} — Présence QR` : 'Présence QR';
    return () => {
      document.title = ancien;
    };
  }, [titre]);
}

export default usePageTitle;
