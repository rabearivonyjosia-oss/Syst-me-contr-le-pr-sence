/**
 * Design tokens centralisés — Contrôle de présence par QR code
 *
 * Tailwind CSS v4 (via @tailwindcss/vite) : ce fichier est chargé depuis
 * src/index.css grâce à la directive `@config "../tailwind.config.js"`.
 * Les utilitaires (bg-brand-700, text-danger-700, font-sans…) sont générés
 * à partir des extensions ci-dessous.
 *
 * Code couleur (voir DESIGN_SYSTEM.md) :
 *   brand   → bleu   : action principale, information, liens
 *   success → vert   : présent, succès, action validée
 *   danger  → rouge  : absent, erreur, suppression
 *   warning → orange : retard, avertissement, QR bientôt expiré
 *   neutral → gris   : éléments désactivés / neutres (échelle slate)
 */
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8', // bleu principal — ratio 7:1 sur blanc (WCAG AAA)
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          700: '#15803d', // texte succès sur blanc — ratio ≈ 5,1:1 (AA)
          800: '#166534', // texte succès sur fond success-50 — ratio > 7:1
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          700: '#b91c1c', // texte erreur / suppression sur blanc — ratio ≈ 7:1
          800: '#991b1b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          700: '#b45309', // texte avertissement sur blanc — ratio ≈ 4,6:1 (AA)
          800: '#92400e',
        },
      },
      fontFamily: {
        // Une seule famille sans-serif, lisible à l'écran (repli système).
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Échelle courte et bien distinguable (rem = relatif)
        xs: ['0.75rem', { lineHeight: '1.45' }], // 12 px — légendes uniquement
        sm: ['0.875rem', { lineHeight: '1.45' }], // 14 px — métadonnées / libellés secondaires
        base: ['1rem', { lineHeight: '1.45' }], // 16 px — texte courant (minimum)
        lg: ['1.125rem', { lineHeight: '1.4' }], // 18 px — sous-titre
        xl: ['1.25rem', { lineHeight: '1.3' }], // 20 px — titre de section
        '2xl': ['1.5rem', { lineHeight: '1.25' }], // 24 px — titre de page
        '3xl': ['1.875rem', { lineHeight: '1.2' }], // 30 px — titre d'authentification
      },
      borderRadius: {
        // Arrondi unique de l'application (boutons, cartes, champs)
        app: '0.75rem',
      },
      maxWidth: {
        prose65: '65ch', // longueur de ligne idéale (règle typographique)
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      },
    },
  },
  plugins: [],
};
