# Checklist IHM et accessibilité

Grille de contrôle de l'interface de Présence QR. Chaque ligne indique le
critère, où il est mis en œuvre et son état de vérification.

Légende :

- **OK** : vérifié par test automatisé, revue de code ciblée ou contrôle manuel.
- **Partiel** : mis en œuvre, mais la vérification finale dépend d'un outil ou
  d'un appareil non disponible dans l'environnement de développement.
- **À faire** : non couvert à ce jour.

> Les audits Lighthouse et axe ne sont pas exécutés automatiquement par le dépôt.
> La procédure pour les lancer et consigner les résultats se trouve en section 8.

## 1. Structure et navigation

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 1.1 | Un seul `<h1>` par page | `PageHeader` sur chaque écran, titres de section en `h2`/`h3` | OK |
| 1.2 | Hiérarchie de titres continue | Audit des pages `Cours`, `CoursDetail`, `Seances`, `SeanceDetail`, `Statistiques`, `Profil`, `Aide` | OK |
| 1.3 | Points de repère sémantiques | `aside`, `header`, `nav`, `main#contenu` dans `AppLayout` | OK |
| 1.4 | Lien d'évitement | « Aller au contenu », premier focusable | OK |
| 1.5 | Navigation principale étiquetée | `aria-label="Navigation principale"` sur les deux navigations | OK |
| 1.6 | Page active annoncée | `NavLink` + `aria-current="page"` | OK |
| 1.7 | Titre de document unique | Hook `usePageTitle` sur chaque page | OK |
| 1.8 | Fil d'ariane implicite | Navigation active + en-têtes de page | OK |
| 1.9 | Retour arrière possible | Boutons retour, liens vers l'accueil, pages 403/404 | OK |
| 1.10 | Navigation mobile ≤ 5 destinations | `AppLayout` : `slice(0, 5)` | OK |
| 1.11 | Profil et déconnexion accessibles sur mobile | En-tête (avatar, bouton déconnexion) | OK |
| 1.12 | Page 404 accessible hors connexion | `NonTrouvee` autonome | OK |
| 1.13 | Page 403 dédiée | `AccesRefuse` + `ProtectedRoute` | OK |

## 2. Couleurs, typographie et lisibilité

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 2.1 | Contraste texte courant ≥ 4,5:1 | `slate-800` sur blanc (> 12:1) | OK |
| 2.2 | Contraste liens/actions ≥ 4,5:1 | `brand-700` sur blanc (~ 7:1) | OK |
| 2.3 | Contraste badges ≥ 4,5:1 | Texte `*-800` sur fond `*-50` | OK |
| 2.4 | Information jamais par la couleur seule | Badges = couleur + icône + libellé | OK |
| 2.5 | Corps de texte ≥ 16 px | `text-base` par défaut | OK |
| 2.6 | Légendes ≥ 12 px | `text-xs` réservé aux métadonnées | OK |
| 2.7 | Longueur de ligne ≤ 65 caractères | `max-w-prose65` sur les textes longs | OK |
| 2.8 | Pas de texte tout en majuscules | Libellés en casse de phrase | OK |
| 2.9 | Chiffres alignés | `tabular-nums` sur les tableaux et KPI | OK |
| 2.10 | Zoom 200 % sans perte de contenu | Unités `rem`, grilles fluides, tableaux scrollables | Partiel (contrôle navigateur à faire) |
| 2.11 | Mode contraste élevé | Non testé | À faire |

## 3. Clavier et focus

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 3.1 | Tous les contrôles atteignables | Boutons natifs, liens, champs | OK |
| 3.2 | Focus visible | `:focus-visible` 3 px `brand-700` dans `index.css` | OK |
| 3.3 | Ordre de focus logique | Ordre DOM naturel, pas de `tabindex` positif | OK |
| 3.4 | Modales : focus piégé | `Modal` capture `Tab`/`Shift+Tab` | OK |
| 3.5 | Modales : fermeture par `Échap` | `Modal` | OK |
| 3.6 | Modales : retour du focus | `Modal` restaure l'élément déclencheur | OK |
| 3.7 | Tableaux triables au clavier | Boutons dans les en-têtes, `aria-sort` | OK (test `DataTable`) |
| 3.8 | Pagination au clavier | Boutons natifs avec `aria-label` | OK |
| 3.9 | Aucun piège de focus | Revue des composants interactifs | OK |
| 3.10 | Parcours complet sans souris | Connexion → cours → séance → QR → présence → export | Partiel (à refaire manuellement) |

## 4. Formulaires

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 4.1 | Étiquette visible et liée | `Input`/`Select` avec `useId` + `htmlFor` | OK |
| 4.2 | Champs obligatoires signalés | `required` + astérisque | OK |
| 4.3 | Erreur rattachée au champ | `aria-invalid`, `aria-describedby`, `role="alert"` | OK |
| 4.4 | Message d'erreur explicite | Validation métier + messages serveur | OK (tests `validation`) |
| 4.5 | Valeurs conservées en cas d'erreur | État local non réinitialisé | OK |
| 4.6 | `autocomplete` pertinent | `email`, `current-password`, `new-password`, `name`, `tel` | OK |
| 4.7 | Envoi désactivé pendant la requête | `Button loading` + `aria-busy` | OK (test `Button`) |
| 4.8 | Double soumission empêchée | Bouton désactivé + garde d'état | OK |
| 4.9 | Confirmation avant suppression | `ConfirmDialog` | OK |
| 4.10 | Focus sur le premier champ invalide | Gestion dans les formulaires | OK |

## 5. Images, icônes et médias

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 5.1 | Icônes décoratives masquées | `aria-hidden="true"` | OK |
| 5.2 | Icônes seules avec nom accessible | `aria-label` + `title` | OK |
| 5.3 | Pas d'image porteuse de texte | Aucune image de contenu | OK |
| 5.4 | QR lisible et contrasté | Fond blanc, marge de silence, taille minimale | OK |
| 5.5 | Code QR doublé d'un texte | Jeton affiché sous le QR | OK |
| 5.6 | Vidéo caméra sans information sonore | Aucun son | OK |

## 6. Couleur et daltonisme

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 6.1 | Statuts différenciés sans couleur | Icône + libellé | OK |
| 6.2 | Graphiques lisibles sans couleur | Libellés + valeurs + tableau alternatif | OK (test `BarChart`) |
| 6.3 | Alertes différenciées | Icône + titre + texte | OK |
| 6.4 | Liens distinguables du texte | Couleur + soulignement au survol/focus | OK |
| 6.5 | Focus distinct du survol | Contour franc | OK |

## 7. Responsive et tactile

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 7.1 | 360 px sans défilement horizontal | Une colonne, cartes, boutons pleine largeur | Partiel (contrôle navigateur à faire) |
| 7.2 | 768 px : barre latérale + grilles | `md:` breakpoints | Partiel |
| 7.3 | 1280 px : contenu centré | `max-w-6xl` | Partiel |
| 7.4 | Cibles tactiles ≥ 44 px | `min-h-[44px]`, boutons `md`/`lg` | OK |
| 7.5 | Tableaux → cartes sur mobile | `DataTable` rend des cartes sous `md` | OK (test `DataTable`) |
| 7.6 | Barre mobile protégée des encoches | `env(safe-area-inset-bottom)` | OK |
| 7.7 | QR lisible sur petit écran | Taille adaptative, minimum 220 px | OK |
| 7.8 | Pas de zoom forcé sur iOS | Champs à 16 px minimum | OK |

## 8. Audits automatisés à exécuter

### 8.1 Lighthouse

```bash
cd "front-end/système de controle de présence par QR code"
npm run build
npm run preview
# Dans un autre terminal, avec Chrome installé :
npx lighthouse http://127.0.0.1:4173 --only-categories=accessibility,best-practices,performance \
  --output=html --output-path=./lighthouse.html
```

Cibles : accessibilité ≥ 90, bonnes pratiques ≥ 90, performance ≥ 80 sur un
poste de développement. Consigner la date, la version de Lighthouse et les
scores obtenus.

### 8.2 axe

```bash
cd "front-end/système de controle de présence par QR code"
npx @axe-core/cli http://127.0.0.1:4173 --exit
```

À exécuter sur : `/connexion`, `/accueil`, `/cours`, `/seances`,
`/statistiques`, `/profil`, `/aide`, `/acces-refuse`, une page 404.

### 8.3 Tests automatisés du dépôt

```bash
cd "front-end/système de controle de présence par QR code"
npm run lint
npm test
npm run build

cd ../../backend
python manage.py test
```

### 8.4 Résultats connus à ce jour

| Contrôle | Résultat |
|---|---|
| `npm run lint` | Vert |
| `npm test` | 56 tests, 8 fichiers, verts |
| `npm run build` | Vert |
| `python manage.py test` | 22 tests, verts |
| Lighthouse | À exécuter |
| axe | À exécuter |
| Lecteur d'écran (NVDA/VoiceOver) | À exécuter |
| Navigation clavier complète | À refaire sur le build final |
| Responsive 360/768/1280 | À vérifier sur le build final |

## 9. Contenus et messages

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 9.1 | Langue déclarée | `<html lang="fr">` | OK |
| 9.2 | Messages en français | Tous les libellés et erreurs | OK |
| 9.3 | Formats `fr-FR` | `formatDate`, `formatHeure`, `Intl.NumberFormat` | OK (tests `format`) |
| 9.4 | Erreurs sans jargon | Messages métier, codes non affichés | OK |
| 9.5 | États vides avec action | `EmptyState` | OK |
| 9.6 | Succès factuels | Toasts avec nombre de lignes, statut | OK |
| 9.7 | Aucune alerte navigateur | `Alert`, `Toast`, `ConfirmDialog` | OK |
| 9.8 | Aucun `console.log` résiduel | Recherche dans `src/` | OK |

## 10. Sécurité perçue et confiance

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 10.1 | Rôle affiché clairement | En-tête + barre latérale | OK |
| 10.2 | Actions destructives explicites | Rouge + texte + confirmation | OK |
| 10.3 | Session expirée expliquée | Événement + redirection connexion | OK |
| 10.4 | Erreur réseau distinguée d'une erreur métier | `estErreurReseau` + `ErrorState` | OK (test `api`) |
| 10.5 | Hors-ligne signalé | Bandeau global | OK |
| 10.6 | Données personnelles limitées | Profil réel, pas de données en dur | OK |
| 10.7 | Pas de fuite de ressource hors périmètre | Filtrage serveur + 403 | OK |

## 11. Performance perçue

| # | Critère | Mise en œuvre | État |
|---|---|---|---|
| 11.1 | Bundle initial allégé | `React.lazy` sur `Scan` et `QrSeance` | OK |
| 11.2 | Squelettes de chargement | `Skeleton`, `SkeletonCarte` | OK |
| 11.3 | Pas de saut de mise en page | Squelettes de même gabarit | OK |
| 11.4 | Actions asynchrones visibles | Bouton `loading` | OK |
| 11.5 | Timeout réseau | 20 s dans `api.js` | OK |
| 11.6 | Pas de re-render inutile sur les listes | `useMemo` sur les tableaux dérivés | OK |

## 12. Validation finale avant livraison

- [ ] Relancer `seed_demo` et vérifier les 4 comptes de démonstration.
- [ ] Parcours enseignant complet : cours → séance → QR → présence → correction → export.
- [ ] Parcours étudiant complet : connexion → scan caméra → scan manuel → doublon → statistiques.
- [ ] Vérifier les pages 403 et 404.
- [ ] Vérifier le rafraîchissement JWT (attendre l'expiration ou forcer un 401).
- [ ] Vérifier le bandeau hors-ligne (mode avion ou DevTools).
- [ ] Vérifier 360, 768 et 1280 px.
- [ ] Vérifier le parcours clavier complet.
- [ ] Lancer Lighthouse et axe, consigner les scores.
- [ ] Vérifier le CSV dans Excel/LibreOffice (accents et séparateur).
- [ ] Vérifier qu'aucun `TODO`, `FIXME`, `console.log` ou donnée en dur ne subsiste.
