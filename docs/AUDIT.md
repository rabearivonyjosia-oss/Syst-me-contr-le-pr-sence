# Audit initial — Système de contrôle de présence par QR code

> Date : 04/11/2026 — Audit réalisé sans modification du code existant.
> Périmètre : `backend/` (Django) et `front-end/système de controle de présence par QR code/` (React + Vite).

## 1. Résumé exécutif

| Élément | État |
|---|---|
| Front-end React/Vite | Démarre, build OK, **lint en échec** (14 erreurs) |
| Backend Django | `manage.py check` OK, migrations appliquées, **API métier non fonctionnelle** |
| Base de données | PostgreSQL locale `systeme_presence` opérationnelle |
| Données existantes | 5 utilisateurs, **0 cours, 0 séance, 0 présence** |
| Authentification | Login JWT fonctionnel, **pas de profil, pas de rôle dans le jeton, pas de déconnexion serveur** |
| Parcours métier complet | **Impossible** : la majorité des endpoints est absente, cassée ou sans contrôle d'accès |

**Verdict :** le dépôt est un squelette avancé côté IHM (design system solide, composants accessibles, écrans d'auth soignés) mais le backend est un brouillon non testé. Le travail restant est majoritairement backend + câblage front, pas une réécriture de l'IHM.

---

## 2. Stack et exécution constatées

### Front-end
- **Chemin** : `front-end/système de controle de présence par QR code/`
- React 19.2, Vite 8.3, Tailwind CSS 4, React Router 7, Axios, `html5-qrcode`, `lucide-react`.
- `npm install` : dépendances présentes (`node_modules/`).
- `npm run build` : **OK** (bundle 749 kB, avertissement de taille > 500 kB).
- `npm run lint` : **ÉCHEC** — 14 erreurs, 1 avertissement (détail § 6).
- Aucun outil de test installé (pas de Vitest/Jest, pas de Testing Library), aucun script `test`.

### Backend
- **Chemin** : `backend/`, Django 6.1.1, DRF 3.18, SimpleJWT 5.5, django-cors-headers, psycopg2, Pillow, `qrcode` (installés mais non utilisés).
- `python manage.py check` : **OK**.
- `python manage.py showmigrations` : **toutes appliquées** ; PostgreSQL `postgresql-x64-18` est démarré.
- Le projet utilise PostgreSQL, pas le `db.sqlite3` présent (vestige).
- **Aucun test** : les 4 fichiers `tests.py` sont vides.
- **Aucune configuration DRF** (`REST_FRAMEWORK` absent) : authentification des vues non JWT par défaut, pas de pagination, pas de format d'erreur uniforme.

### Comptes présents en base
| Email | Rôle | Remarque |
|---|---|---|
| `andrianindriana@gmail.com` | ENSEIGNANT | — |
| `bella@gmail.com` | ENSEIGNANT | — |
| `rabearivonyjosia@gmail.com` | ENSEIGNANT | — |
| `bea_alisoa@gmail.com` | ETUDIANT (L2) | matricule `1500L2` |
| `mampiononarakotovao06@gmail.com` | *(vide)* | superutilisateur, rôle non renseigné |

Les mots de passe ne sont pas connus → un jeu de démonstration reproductible est indispensable.

---

## 3. Cartographie fonctionnelle du front

### Routes déclarées (`src/App.jsx`)
| Route | Garde | Écran réel |
|---|---|---|
| `/connexion` | publique | `login.jsx` (fonctionnel) |
| `/inscription` | publique | `register.jsx` (fonctionnel, appelle `/register/`) |
| `/accès-refusé` | publique | `Placeholder` détourné |
| `/accueil` | `ENSEIGNANT` | `Dashboard.jsx` (données en dur) |
| `/cours` | `ENSEIGNANT` | `cours.jsx` (liste cassée) |
| `/seances` | `ENSEIGNANT` | `Dashboard page="seances"` → état vide |
| `/profil` | connecté | `profile.jsx` (cassé) |
| `/scan` | `ETUDIANT` | `pages/Scan.jsx` (UI OK, API absente) |
| `/statistiques` | `ENSEIGNANT` | `Placeholder` |
| `/` | — | redirection selon rôle |
| `*` | — | 404 |

### Fichiers morts ou inutilisés
- `src/pages/Profil.jsx` : écran profil moderne **jamais importé** (le profil réel utilise `src/profile.jsx`, obsolète).
- `src/statistique.jsx` : **jamais importé** (placeholder utilisé à la place), données en dur, `fetch` direct vers un endpoint inexistant.
- `src/Seance.jsx` : **jamais importé**, bug d'exécution (`checkAvaiLability` mal orthographié), QR factice.
- `src/profile.jsx` : importé mais cassé (appelle `GET /register/` → 405, affiche un `??` littéral dans le JSX).
- `src/components/ui/Alert.jsx` etc. : utilisés et de bonne qualité.

### Problèmes front précis
1. **Aucun appel API ne passe entièrement par `api.js`** : `login.jsx`, `register.jsx`, `cours.jsx`, `profile.jsx`, `statistique.jsx` utilisent `fetch` direct.
2. **`cours.jsx`** lit `course.title || course.nom` alors que le backend renvoie `nom_cours` → liste vide en pratique. Le bouton « Créer un cours » ne fait rien.
3. **`Dashboard.jsx`** contient deux blocs `TODO` avec statistiques et séances en dur.
4. **`AppLayout.jsx`** :
   - affiche « Étudiants » alors qu'aucune route `/etudiants` n'existe → 404 ;
   - affiche Accueil/Cours/Séances/Étudiants à un étudiant → 403 ;
   - cloche de notifications factice (`aria-label="Notifications, 1 non lue"` sans action).
5. **`AuthContext.jsx`** :
   - suppose un endpoint `/api/profile/` inexistant, échoue silencieusement ;
   - si le JWT ne contient pas de rôle, **attribue `ENSEIGNANT` par défaut** : faille d'autorisation ;
   - ne recharge pas le profil après connexion (le rôle vient d'un décodage local).
6. **`ProtectedRoute`** affiche un 403 inline au lieu de la page 403 dédiée ; la page `/accès-refusé` existe mais n'est jamais utilisée par la garde.
7. **`api.js`** : intercepteur de refresh correct dans l'idée, mais redirige brutalement (`window.location.assign`) sans message explicite ; ne gère pas le format d'erreur `{detail, errors}`.
8. **Aucun titre de document par route** (`document.title`).
9. **Aucun composant** `Toast`, `Skeleton`, `ErrorState`, `DataTable`, `ConfirmDialog` exigé par le prompt ; `Modal` ne piège pas le focus et ne le restaure pas.
10. **Graphiques** : aucun composant ; la barre de progression de `statistique.jsx` n'est pas accessible (pas d'alternative tableau).
11. **Responsive** : les tableaux n'existent pas encore ; le gabarit mobile est bon (barre basse, cibles 44 px, lien d'évitement, focus visible).
12. **Encodage** : tous les fichiers sont bien en UTF-8 ; l'affichage `�` observé en console Windows est un artefact d'affichage, pas un défaut du dépôt.

---

## 4. Cartographie de l'API existante

Routes réellement exposées par `backend/core/urls.py` :

| Méthode | URL | Vue | État |
|---|---|---|---|
| POST | `/register/` | `RegisterViews` | Fonctionne, mais **rôles autres qu'ETUDIANT refusés** |
| POST | `/login/` | `TokenObtainPairView` | Fonctionne (email + mot de passe), **jeton sans rôle** |
| POST | `/token/refresh/` | `TokenRefreshView` | Fonctionne |
| GET/POST | `/cours/` | `coursViews` | **Cassé** |
| GET/POST | `/seance/` | `Seanceviews` | **Cassé / incomplet** |
| GET/POST | `/Presence/` | `PresenceViews` | **Cassé** |

### Défauts backend détaillés

#### `gestion_cours`
- `cours` : FK `enseignant`, M2M `etudiants` **existe en base** (migration 0006) mais **absente du modèle** → inscription impossible à exploiter.
- `coursSerializer` déclare `nom_enseignant` comme `PrimaryKeyRelatedField` alors que le modèle n'a plus ce champ ; `enseignant` réel n'est pas exposé ; `read_only_fields` contradictoire.
- `perform_create(serializer.save(nom_enseignant=...))` → argument inexistant.
- `coursDetailViews` existe mais **n'est pas routée**.
- **Aucune permission** : tout utilisateur authentifié peut lire/écrire/supprimer tous les cours.
- `gestion_cours/urls.py` importe `from .Views import` (casse incorrecte) → fichier inutilisable.

#### `gestion_seance`
- Modèle : `token_qr`, `expiration_qr` présents ; `cours` **nullable** (une séance peut ne pas avoir de cours).
- `cree_qr_temporaire()` référence `VALIDITE_QR_SECONDES` alors que la constante s'appelle `VALIDITI_QR_SECONDS` → **NameError**.
- La vue appelle `creer_qr_temporaire()` (nom différent) et `perform_Creat` (faute de casse) → jamais exécuté.
- Aucune validation : fin > début, chevauchement, date passée, cours obligatoire.
- Pas de routes détail / édition / suppression / QR.
- `gestion_seance/urls.py` importe `.Views` → inutilisable.
- Aucune permission ni filtrage par enseignant/étudiant.

#### `gestion_presence`
- Modèle : champ `étudiant` (accentué, valide mais fragile) + contrainte d'unicité `(seance, étudiant)` — bon point.
- Modèle **sans statut** (présent/absent/justifié), sans trace de modification.
- `PresenceSerializers` : `models = Presence` au lieu de `model`, `field` au lieu de `fields`, `Seance` au lieu de `seance`, méthode `validate_presence` jamais appelée → **ne peut pas fonctionner**.
- `PresenceViews` n'a **aucun `queryset`** → erreur 500.
- `gestion_presence/urls.py` importe des classes inexistantes.
- Aucun endpoint `presences/scan/`, aucune vérification d'inscription, de fenêtre horaire ou d'expiration de jeton.

#### `gestion_utilisateur`
- `RegisterSerializer` limite l'inscription à `ETUDIANT` (bon pour la sécurité), mais le front propose ENSEIGNANT/ADMIN → **incohérence**.
- Pas de `GET/PATCH /me`, pas de changement de mot de passe.
- `gestion_utilisateur/urls.py` importe `ResgisterView` / utilise `RegisterView` → inutilisable.
- Le superutilisateur existant n'a pas de rôle.

#### `core/settings.py`
- `SECRET_KEY` **en dur** dans le dépôt.
- Mot de passe PostgreSQL **en dur**.
- `DEBUG = True`, `ALLOWED_HOSTS = []`.
- `CORS_ALLOWED_ORIGINS` limité à `http://localhost:5173` (pas `127.0.0.1`, pas l'adresse LAN du téléphone).
- `LANGUAGE_CODE = 'en-us'`, `TIME_ZONE = 'UTC'` → incohérent avec une application française (Sénégal, UTC±0, mais les messages doivent être en français).
- Aucun réglage `REST_FRAMEWORK` (auth par défaut = Session/Basic, pas JWT) ; les vues qui n'imposent pas `IsAuthenticated` sont donc accessibles autrement.
- Pas de limite de débit sur le login/scan (anti-fraude minimale à prévoir).

#### Routes et contrat
- **Aucun préfixe `/api/`**, alors que le front appelle déjà `/api/profile/`, `/api/statistiques/`, `/presences/scan/` (sans préfixe) → incohérence totale.
- Aucun format d'erreur uniforme `{ "detail": "...", "errors": { ... } }`.
- Pas de pagination, pas de filtres, pas de tri, pas d'export, pas de statistiques.

---

## 5. Sécurité — constats

| Risque | Détail |
|---|---|
| Élévation de privilèges | Rôle `ENSEIGNANT` attribué par défaut côté front sans preuve serveur |
| Accès horizontal | Aucun contrôle de propriété : un enseignant peut modifier les cours d'un autre |
| Accès vertical | Les routes cours/séance/présence n'imposent aucun rôle côté backend |
| Secrets | `SECRET_KEY` et mot de passe DB versionnés |
| Anti-fraude QR | Jeton sans expiration fonctionnelle, pas de vérification d'inscription/fenêtre, pas de contrainte de présence explicite côté API |
| Token | Stockage `localStorage` (risque XSS), aucune rotation de refresh, pas de déconnexion serveur |
| Scan | Le front devine la cause d'erreur par mots-clés du message ; aucun code d'erreur stable |
| Injection | Pas de `dangerouslySetInnerHTML` constaté — bon point |
| CORS | Origine téléphone/LAN non autorisée |

---

## 6. Qualité, build et tests

| Commande | Résultat |
|---|---|
| `npm run build` | ✅ OK (avertissement bundle > 500 kB) |
| `npm run lint` | ❌ 14 erreurs, 1 warning |
| `manage.py check` | ✅ OK |
| `manage.py test` | ⚠️ aucun test réel |
| Tests front | ❌ aucun outillage |

Erreurs ESLint principales :
- `cours.jsx` : variables `utilisateur`, `role` inutilisées.
- `pages/Profil.jsx` : `setState` synchrone dans un effet ; directive `eslint-disable` inutile.
- `pages/Scan.jsx` : `AlertCircle` importé et inutilisé.
- `statistique.jsx` : `fetchStats` inutilisé.
- `AuthContext.jsx` : `setState` dans un effet + export non composant (fast refresh).
- `ProtectedRoute.jsx` : export multiple non composant.

Aucun `console.log` ne doit rester : il en existe dans `login.jsx`, `register.jsx`, `profile.jsx`, `statistique.jsx`.

---

## 7. Accessibilité et IHM — ce qui est bon / ce qui manque

### Acquis (à conserver)
- Design system cohérent (tokens Tailwind, `Button`, `Input`, `Select`, `Card`, `Badge`, `Alert`, `Table`, `Modal`, `EmptyState`, `Spinner`).
- Lien d'évitement, `:focus-visible` global, `lang="fr"`, cibles 44 px, navigation mobile inférieure.
- Statuts avec icône + texte (pas la couleur seule), contrastes documentés.
- Labels visibles, `aria-invalid`/`aria-describedby`, `role="alert"` sur les erreurs.
- `prefers-reduced-motion` **non** géré (à ajouter pour le spinner/animations).

### Manques par rapport au cahier des charges
- Pas de `Toast` global `aria-live`, pas de `Skeleton`, pas de `ErrorState` réutilisable, pas de `DataTable` (tri/recherche/pagination/cartes mobiles).
- Modale : pas de piège de focus ni restitution du focus ; `id="modal-titre"` fixe (risque de doublon).
- Pas de titre de page (`<title>`) par route.
- Pas de page « Aide » (scan).
- Fil d'Ariane absent.
- Aucun graphique ni alternative tableau.
- Aucun écran ne couvre réellement les états ☐ chargement ☐ vide ☐ erreur ☐ succès ☐ hors-ligne ☐ permission refusée (le scan gère bien la permission caméra, c'est le seul).
- Pas de `prefers-reduced-motion`.
- Tableaux longs : rien à paginer aujourd'hui, mais le composant n'est pas prêt.

---

## 8. Plan proposé (à valider)

### Phase 0 — Fondations et documentation
- `docs/API.md`, `docs/UX.md`, `docs/HYPOTHESES.md`, `docs/IHM-CHECKLIST.md`.
- `backend/.env.example`, réglages par variables d'environnement, `REST_FRAMEWORK` JWT + pagination + gestion d'erreurs uniforme, `fr-fr`, `Africa/Dakar`, CORS LAN.
- Commande `seed_demo` (comptes par rôle, cours, inscriptions, séances autour de maintenant, présences).
- Correction des imports/casse des `urls.py`, renommage du champ `étudiant` → `etudiant`, ajout de `etudiants` au modèle `cours`, champs de statut/trace sur `Presence`, migrations.

### Phase 1 — Authentification et rôles
- Backend : login avec claim `role`, `GET /api/auth/me/`, `PATCH /api/auth/me/`, `POST /api/auth/change-password/`, inscription étudiant, alias legacy.
- Front : `AuthContext` fiable (profil serveur, plus de rôle par défaut), `api.js` (refresh unique, message d'expiration), `ProtectedRoute` + page 403 dédiée, titres de page.
- Tests : login, refresh, accès refusé, profil.

### Phase 2 — Kit UI transverse
- `Toast` + `ToastProvider` (`aria-live`), `Skeleton`, `ErrorState`, `DataTable` (tri, recherche, pagination, cartes mobile), `ConfirmDialog` basé sur `Modal`, `PageTitle`, `BarChart` accessible + tableau.
- `Modal` : piège de focus, restitution, `aria-describedby`, IDs uniques.
- `AppLayout` : navigation par rôle (max 7 entrées), état actif, suppression de la cloche factice, fil d'Ariane.

### Phase 3 — Cours et inscriptions
- Backend : CRUD `/api/cours/`, permissions propriétaire/admin, recherche, pagination, endpoint d'inscription des étudiants.
- Front : `CoursPage` (liste, création, édition, suppression confirmée, erreurs champ par champ), `CoursDetail` (séances + étudiants).

### Phase 4 — Séances
- Backend : CRUD `/api/seances/`, validations fin > début, chevauchement, date, cours obligatoire ; détail avec statut calculé.
- Front : `SeancesPage`, formulaire création/édition, détail, filtres.

### Phase 5 — QR, scan et présences
- Backend : `POST /api/seances/{id}/qr/` (jeton aléatoire, TTL 60 s, renouvelable), `POST /api/presences/scan/` (codes d'erreur stables), `GET /api/seances/{id}/presences/`, correction manuelle avec trace.
- Front : `QrSeancePage` plein écran + compte à rebours + code de secours, `Scan.jsx` branché sur les codes d'erreur, anti-double scan, liste présents/absents/justifiés + polling 10 s + correction confirmée.

### Phase 6 — Statistiques et exports
- Backend : `/api/stats/...` (cours, étudiant, période), `/api/exports/presences.csv` (BOM UTF-8).
- Front : page statistiques (filtres, graphiques + tableau), export CSV.

### Phase 7 — Profil, aide, finitions
- Profil réel (lecture/édition/mot de passe), page Aide, 404/403 soignées, suppression totale des placeholders et du code mort.

### Phase 8 — Vérification
- Tests unitaires front (validations, Login, Scan, formulaire séance), test d'intégration backend « enseignant crée une séance → étudiant scanne → présence visible ».
- `npm run lint`, `npm run build`, `manage.py check`, `manage.py test`, parcours manuel 360/768/1280 px, axe/Lighthouse, README + démo scriptée.

---

## 9. Décisions d'architecture à valider

| # | Question | Recommandation |
|---|---|---|
| A | Base de données | **Garder PostgreSQL** (déjà migrée et démarrée), credentials via `.env` + valeurs par défaut de dev. Fournir un fallback SQLite documenté. |
| B | Préfixe API | **`/api/...`** comme contrat canonique, avec alias de compatibilité pour `/login/`, `/token/refresh/`, `/register/`, `/cours/`. |
| C | Stockage du jeton | Conserver `localStorage` (existant, simple) + rotation du refresh et message d'expiration ; documenter la limite XSS. Alternative cookie `httpOnly` plus sûre mais plus lourde. |
| D | Inscription | **Étudiants uniquement en autonomie** ; enseignants/admin créés par l'admin ou le seed. Le front d'inscription sera aligné. |
| E | Export PDF | **Non livré** (l'énoncé officiel n'est pas fourni) ; CSV UTF-8 uniquement, mentionné dans les hypothèses. |
| F | Graphiques | Composants maison accessibles (barres + tableau), **sans dépendance de charting** ; seule nouvelle dépendance front : `qrcode.react` + outillage de test. |

---

## 10. Limites connues à ce stade
- Les mots de passe des comptes existants sont inconnus → le seed créera des comptes de démo dédiés.
- Le dossier front contient des espaces et des accents : les commandes seront documentées avec guillemets.
- Aucun énoncé officiel n'a été fourni : les règles métier non explicites seront consignées dans `docs/HYPOTHESES.md`.
