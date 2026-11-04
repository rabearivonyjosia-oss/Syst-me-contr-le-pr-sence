# Frontend - Présence QR

Interface React de l'application de contrôle de présence par QR code.

## Démarrage

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

L'application est servie sur `http://localhost:5173`. Le backend Django doit
tourner sur l'URL définie par `VITE_API_URL` (par défaut
`http://127.0.0.1:8000`).

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run lint` | Analyse ESLint |
| `npm test` | Tests Vitest (exécution unique) |
| `npm run test:watch` | Tests en mode surveillance |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |

## Organisation

- `src/services/api.js` : unique client HTTP, jetons et renouvellement.
- `src/context/` : authentification et notifications.
- `src/components/ui/` : kit de composants accessible.
- `src/components/forms/` : formulaires cours et séance partagés.
- `src/components/routing/` : garde de route et redirections.
- `src/pages/` : écrans métier.
- `src/utils/` : constantes, formats `fr-FR`, validation.
- `src/hooks/` : chargement de données et titre de page.

## Documentation

La documentation complète (installation, API, UX, hypothèses, checklist
d'accessibilité, démonstration) se trouve à la racine du dépôt :

```text
README.md
docs/API.md
docs/UX.md
docs/HYPOTHESES.md
docs/IHM-CHECKLIST.md
docs/DEMO.md
```
