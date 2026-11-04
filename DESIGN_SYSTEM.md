# Design system — Présence QR

Charte graphique de l'application de contrôle de présence par QR code.
Code : `front-end/système de controle de présence par QR code/`

- **Design tokens** : `tailwind.config.js` (couleurs, polices, tailles, arrondis, largeurs)
- **Styles de base + focus clavier + lien d'évitement** : `src/index.css` (chargé via `@config "../tailwind.config.js"` — Tailwind CSS v4, CSS-first)
- **Composants réutilisables** : `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Select`, `Table`, `Alert`, `Modal`, `EmptyState`, `Spinner`)
- **Gabarits** : `src/components/layout/` (`AppLayout` — espace connecté, `AuthLayout` — connexion / inscription)

Principe directeur : **sobre, professionnel, flat design**. L'interface ne distrait pas, elle guide et se fait oublier.

---

## 1. Palette et code couleur

Une seule couleur principale (bleu), une secondaire (neutres slate) et les couleurs sémantiques imposées. **Même type d'information = même couleur**, toujours doublée d'un texte (et d'une icône quand c'est un statut) — jamais la couleur seule (daltonisme, ≈ 8 % des hommes).

| Rôle | Couleur | Utilisation | Contraste |
|---|---|---|---|
| **Principal / information / liens** | `brand-700` `#1d4ed8` (survol `brand-800` `#1e40af`) | Bouton primaire, liens, éléments actifs, focus | 7:1 sur blanc (AAA) |
| Fond de page | `slate-100` `#f1f5f9` | Fond applicatif | — |
| Surfaces | `white` | Cartes, tableaux, champs | — |
| Texte courant | `slate-800` `#1e293b` / titres `slate-900` `#0f172a` | Corps de texte | > 12:1 |
| Texte secondaire | `slate-600` `#475569` | Métadonnées, légendes (jamais `slate-400` pour du texte) | ≈ 7,5:1 |
| **Succès / présent / validé (vert)** | `success-700` `#15803d`, fond `success-50` | Badge « Présent », alerte succès | ≈ 5,1:1 (AA) |
| **Erreur / absent / suppression (rouge)** | `danger-700` `#b91c1c`, fond `danger-50` | Bouton Supprimer, badge « Absent », erreurs | ≈ 7:1 |
| **Avertissement / retard / QR bientôt expiré (orange)** | `warning-700` `#b45309`, fond `warning-50` | Badge « Retard », QR < 2 min | ≈ 4,6:1 (AA) |
| **Neutre / désactivé (gris)** | `slate-*` | Badge « — », boutons désactivés (`slate-200`/`slate-400`) | ≥ 4,5:1 sur blanc |

Badges : texte `*-800` sur fond `*-50` avec bordure `*-200` (ratio > 7:1) + icône + libellé.
Arrondi unique : `rounded-app` (`0.75rem`). Ombre discrète : `shadow-card`. Pas de dégradés hors panneau de marque, pas d'ombres portées lourdes.

**Distance sémantique** : types proches (présent/retard) = vert/orange, mêmes formes de badge ; types éloignés (présent/absent) = vert/rouge contrastés ; information neutre toujours en gris/bleu.

Règles d'usage :
- Le bleu est réservé aux **actions et à l'information** — pas aux statuts de présence.
- Le rouge n'est **jamais décoratif** : il signale une action destructive ou une erreur.
- Le vert/orange/rouge ne servent **qu'aux statuts et aux retours d'état**.

## 2. Polices et tailles

**Une seule famille** : `Inter` (repli `ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif`). Chargée via Google Fonts (`display=swap`) ; fonctionne hors-ligne grâce au repli système. Aucun serif, aucune italique, aucune police manuscrite.

Échelle courte et bien distinguable (`rem`, jamais de pixels fixes) :

| Classe | Taille | Rôle |
|---|---|---|
| `text-xs` | 0,75 rem (12 px) | Légendes, horodatages — **jamais le corps de texte** |
| `text-sm` | 0,875 rem (14 px) | Métadonnées, libellés secondaires |
| `text-base` | 1 rem (16 px) | **Texte courant / corps — minimum absolu** |
| `text-lg` | 1,125 rem (18 px) | Sous-titre, lead |
| `text-xl` | 1,25 rem (20 px) | Titre de section |
| `text-2xl` | 1,5 rem (24 px) | Titre de page |
| `text-3xl` | 1,875 rem (30 px) | Titre écran d'authentification |

Typographie : interlignage **1,45** (120–145 %), titres ≥ 1,2 ; graisse 600–800 uniquement pour la hiérarchie ; **aucun texte tout en majuscules** (minuscules + majuscule initiale) ; chiffres en `tabular-nums` (statistiques, horaires) ; longueur de ligne plafonnée à **65 ch** (`max-w-prose65`) ; pas de soulignement hors liens (liens = `brand-700` + soulignement au survol ou permanent).

## 3. Icônes

Bibliothèque unique : **`lucide-react`** (SVG, 16–28 px selon contexte, jamais d'images haute résolution redimensionnées).

Icônes utilisées (sémantique objet + action) :

| Icône | Signification |
|---|---|
| `GraduationCap` | Marque / logo Présence QR |
| `Home`, `BookOpen`, `CalendarDays`, `Users`, `UserRound` | Navigation : Accueil, Cours, Séances, Étudiants, Profil |
| `LogOut` | Déconnexion (icône + texte, action importante) |
| `Bell` | Notifications (`aria-label` + `title` ; pastille bleue non signifiante seule) |
| `Mail`, `Lock`, `User`, `Hash`, `Eye` / `EyeOff` | Champs de formulaire ; œil = afficher/masquer le mot de passe (icône + `aria-label` + `aria-pressed`) |
| `ChevronDown` | Liste déroulante (décoratif, `aria-hidden`) |
| `Search` | Recherche |
| `Plus` | Créer (avec texte « Créer un cours ») |
| `MoreVertical` | Options d'une ligne (icône seule **avec** `aria-label` + `title` incluant le nom) |
| `CheckCircle2`, `XCircle`, `Clock`, `Info`, `MinusCircle` | Badges/alertes : succès, erreur, retard, information, neutre |
| `TriangleAlert` | Confirmation destructive (modale), avertissement |
| `Loader2` | Chargement (`animate-spin`, accompagné d'un texte) |
| `ArrowRight`, `CalendarX2`, `BookOpenCheck`, `QrCode`, `CalendarCheck2`, `ChartColumn` | Navigation « voir tout », états vides, argumentaire produit |
| `Code`, `Database`, `Calculator`, `Network` | Icône décorative de matière (couleur uniforme brand) |

**Règles** : icônes réservées aux commandes fréquentes ; toute icône non triviale porte un libellé (`aria-label`/`title`) ou est accompagnée d'un texte ; actions importantes/destructives = **icône + texte** ; icônes décoratives en `aria-hidden="true"` ; taille standard 20 px (`h-5 w-5`), 24 px en navigation mobile.

## 4. Composants

Import unique : `import { Button, Card, Badge, … } from './components/ui/index.js'`

### Button — `variant` × `size`
- `primary` (bleu plein — **une seule action principale par écran**), `secondary` (blanc + bordure), `danger` (rouge — destructif), `ghost` (transparent).
- `sm` 36 px, `md` 44 px, `lg` 48 px (**cible tactile ≥ 44 px**).
- `loading` : affiche un spinner + désactive + `aria-busy`. Focus visible systématique (`outline brand-700`, 3 px, offset 2 px).

### Card / CardHeader / CardBody / CardFooter
Conteneur unique : blanc, bordure `slate-200`, `rounded-app`, `shadow-card`. `CardHeader` gère titre + description + action alignée à droite.

### Badge — `success | danger | warning | info | neutral`
Toujours **couleur + icône + texte** (daltonisme). Ex. présences : `<Badge variant="success">Présent</Badge>`, `danger` = Absent, `warning` = Retard.

### Input / Select — étiquette toujours visible
`label` liée par `htmlFor`/`id` (`useId`), `*` si requis, icône de champ facultative (`leadingIcon`), action à droite (`trailing`, ex. œil mot de passe), `hint` ou **message d'erreur précis** sous le champ (`role="alert"`, icône + texte, `aria-invalid`/`aria-describedby`), hauteur 48 px, `autocomplete` renseigné.

### Table — `Table, Thead, Th, Tbody, Tr, Td`
En-têtes `slate-50` + texte `slate-700`, **lignes alternées** (blanc / `slate-50`) + survol, chiffres `tabular-nums`, défilement horizontal propre sur petit écran, `caption` accessible. Statuts via `Badge`.

### Alert — `info | success | warning | danger`
Retour d'état explicite : icône + titre + message ; `role="status"` (info/succès) ou `role="alert"` (erreur/avertissement). Remplace les `alert()`.

### Modal — `default | danger`
`role="dialog"` + `aria-modal` + `aria-labelledby`, fermeture par **Échap** et clic sur le fond, focus déplacé dans la boîte, `variant="danger"` pour toute confirmation de suppression (icône + texte). **Toute suppression passe par là.**

### EmptyState / Spinner
État vide explicite (icône + titre + explication + action) ; `Spinner` annoncé via `role="status"` + texte.

## 5. Gabarits

- **`AppLayout`** (espace connecté) : même navigation partout — barre latérale bureau (Accueil, Cours, Séances, Étudiants, Profil) + barre inférieure téléphone (icônes + libellés, cibles ≥ 44 px, `aria-current="page"` + fond bleu sur l'entrée active), en-tête avec cloche (notifications nommées) et avatar. Lien « Aller au contenu » (skip link). Bouton de déconnexion en bas de la barre latérale (icône + texte rouge).
- **`AuthLayout`** (connexion / inscription) : split-screen — panneau de marque bleu foncé (texte blanc, contraste élevé) + formulaire sur blanc ; mobile = formulaire seul avec en-tête de marque compact.

## 6. États prévus

Chargement (Spinner/Button `loading`), vide (EmptyState), erreur (Alert + bouton « Réessayer »), succès (Alert vert + redirection automatique après inscription), désactivé (gris + `cursor-not-allowed` + contraste ≥ 4,5:1), focus clavier (outline 3 px brand-700).

## 7. Lisibilité & responsive

Texte sombre sur fond clair partout (le thème sombre a été supprimé) ; corps ≥ 16 px ; légendes ≥ 12 px ; interlignage 1,45 ; lignes ≤ 65 ch ; contenu limité à `max-w-6xl` ; grilles fluides (`grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4`) ; tableau scrollable horizontalement plutôt que compressé ; `viewport-fit=cover` + `env(safe-area-inset-bottom)` pour la barre mobile.

## 8. Écrans spécifiques (état d'avancement)

| Écran | État |
|---|---|
| Connexion / Inscription | ✅ Refondus (thème clair, composants ui, erreurs inline) |
| Tableau de bord | ✅ Refondu (stats uniformes, séances à venir, gabarit commun) |
| Mes cours | ✅ Refondu (layout commun, recherche fonctionnelle, états) |
| Séances / Étudiants / Profil | ✅ Placeholders explicites (état vide guidé) dans le gabarit commun |
| **QR code enseignant** (grand QR centré, marge blanche, minuteur + barre de progression, bouton « Régénérer ») | ❌ **Non implémenté dans le frontend** — à créer avec les mêmes composants (`Card`, `Button`, `Alert`) ; le temps restant doit être affiché en texte + barre, jamais en couleur seule |
| **Scan étudiant (téléphone)** | ❌ Non implémenté — modèle à suivre : 1 seul CTA ≥ 44 px, retour immédiat « Présence enregistrée ✓ » (vert + icône + texte) ou cause d'échec précise (QR expiré / déjà scanné / hors séance) |
| **Statistiques + exports CSV/PDF/Excel** | ❌ Non implémenté — graphiques avec étiquettes directes ou motifs (pas la couleur seule), légendes + unités, boutons d'export avec libellé texte |
| **Tableaux présences + filtres/recherche** | ❌ Non implémenté — utiliser `Table` + `Badge` (Présent/Absent/Retard = vert/rouge/orange + icône + texte) |

## 9. Accessibilité — points de contrôle

Étiquettes liées aux champs, `aria-current="page"`, `aria-invalid`/`aria-describedby`, `role="alert"`/`status"`, `aria-label` sur toutes les icônes significatives, skip link, contraste AA partout vérifié, navigation clavier complète (focus visible), cibles tactiles ≥ 44 px.
