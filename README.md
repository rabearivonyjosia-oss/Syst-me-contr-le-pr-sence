# Présence QR

Application web de contrôle de présence par QR code pour un établissement
d'enseignement. Un enseignant projette un QR code temporaire pendant sa séance ;
les étudiants le scannent depuis leur téléphone pour émarger. L'enseignant
contrôle ensuite la feuille de présence, corrige les statuts, consulte les
statistiques et exporte un CSV.

Le dépôt contient une API Django REST complète et une interface React responsive,
avec authentification JWT, gestion des rôles, QR renouvelable, scan caméra ou
saisie manuelle, statistiques et export UTF-8.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack](#stack)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation du backend](#installation-du-backend)
- [Installation du frontend](#installation-du-frontend)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Commandes utiles](#commandes-utiles)
- [Rôles et routes](#rôles-et-routes)
- [Règles métier](#règles-métier)
- [Documentation](#documentation)
- [Sécurité](#sécurité)
- [Dépannage](#dépannage)
- [Limites connues](#limites-connues)

## Fonctionnalités

### Authentification et profil

- Connexion par email et mot de passe, JWT access + refresh.
- Renouvellement automatique du jeton sur `401`, avec rotation du refresh.
- Inscription autonome réservée aux étudiants.
- Profil réel (nom, email, téléphone, niveau, matricule) et changement de mot
  de passe.
- Trois rôles : `ETUDIANT`, `ENSEIGNANT`, `ADMIN`.
- Page 403 dédiée, page 404, redirection selon l'état de session.

### Cours

- Liste, recherche, tri et pagination.
- Création, modification et suppression par l'enseignant propriétaire ou un
  administrateur.
- Inscription et retrait d'étudiants, avec recherche des étudiants disponibles.
- Consultation des séances d'un cours.

### Séances

- Liste filtrable par cours, statut, période et recherche.
- Création et modification avec contrôle des chevauchements de cours, de salle
  et d'enseignant.
- Détail de séance adapté au rôle : l'étudiant voit sa propre présence.
- Statut calculé automatiquement : à venir, en cours, terminée.

### QR code et présence

- QR de séance projetable de 10 minutes avant le début jusqu'à la fin.
- Jeton aléatoire renouvelable, valable 60 secondes.
- Affichage grand format, minuteur, barre de progression et code texte.
- Scan caméra ou saisie manuelle pour l'étudiant.
- Feuille de présence : présents, absents, justifiés, taux.
- Correction manuelle du statut avec motif de justification.
- Double scan traité comme une information, sans doublon.

### Statistiques et export

- KPI globaux et par cours.
- Répartition par cours, par étudiant et par période.
- Graphiques accessibles avec tableau alternatif.
- Filtres par cours, étudiant et période.
- Export CSV UTF-8 (BOM), séparateur `;`, compatible Excel.

### Expérience et accessibilité

- Interface responsive 360 / 768 / 1280 px.
- Navigation adaptée au rôle, barre mobile à 5 destinations.
- États de chargement, vide, erreur, succès, hors-ligne et permission refusée.
- Lien d'évitement, focus visible, modales accessibles, cibles tactiles 44 px.
- Contrastes AA, statuts en couleur + icône + libellé, graphiques lisibles sans
  couleur.
- Page Aide intégrée avec parcours enseignant/étudiant et FAQ.

## Stack

| Couche | Technologies |
|---|---|
| Backend | Python, Django 6.1, Django REST Framework 3.18, SimpleJWT 5.5 |
| Base de données | PostgreSQL (SQLite possible en repli) |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4 |
| Caméra / QR | `html5-qrcode`, `qrcode.react` |
| Icônes | `lucide-react` |
| Tests front | Vitest 5, Testing Library, jsdom |
| Tests back | `manage.py test` (DRF APITestCase) |

## Architecture

```text
.
├── backend/
│   ├── core/                     # settings, URLs, pagination, permissions, exceptions
│   │   ├── management/commands/seed_demo.py
│   │   └── settings.py
│   ├── gestion_utilisateur/      # CustomUser, auth JWT, profil, annuaire
│   ├── gestion_cours/            # cours, inscriptions, séances d'un cours
│   ├── gestion_seance/           # séances, QR, feuille de présence
│   ├── gestion_presence/         # scan, statistiques, export CSV
│   ├── manage.py
│   ├── requirement.text
│   └── .env.example
├── front-end/
│   └── système de controle de présence par QR code/
│       ├── src/
│       │   ├── components/
│       │   │   ├── forms/        # formulaires cours et séance partagés
│       │   │   ├── layout/       # AppLayout, Page
│       │   │   ├── routing/      # ProtectedRoute
│       │   │   └── ui/           # kit de composants accessible
│       │   ├── context/          # AuthContext, ToastContext
│       │   ├── hooks/            # useRequete, usePageTitle
│       │   ├── pages/            # 14 écrans métier
│       │   ├── services/api.js   # unique client HTTP
│       │   ├── utils/            # constantes, formatage, validation
│       │   ├── test/             # configuration Vitest
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── .env.example
│       └── package.json
└── docs/
    ├── AUDIT.md
    ├── API.md
    ├── UX.md
    ├── HYPOTHESES.md
    ├── IHM-CHECKLIST.md
    └── DEMO.md
```

## Prérequis

- **Python 3.11+** (testé avec Django 6.1).
- **Node.js 20+** et npm.
- **PostgreSQL 14+** avec une base nommée `systeme_presence`.
- Un navigateur récent (Chrome, Edge, Firefox ou Safari).
- Pour le scan caméra : `localhost` ou HTTPS, et une autorisation caméra.

## Installation du backend

Depuis la racine du dépôt :

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirement.text
Copy-Item .env.example .env
```

Créer la base PostgreSQL si elle n'existe pas :

```powershell
createdb -U postgres systeme_presence
```

Renseigner `backend/.env` :

```dotenv
DJANGO_SECRET_KEY=remplacez-par-une-cle-aleatoire
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,[::1],*
DJANGO_TIME_ZONE=Africa/Dakar

DB_ENGINE=postgresql
DB_NAME=systeme_presence
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=127.0.0.1
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Appliquer les migrations, créer le jeu de démonstration et démarrer l'API :

```powershell
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

L'API répond sur `http://127.0.0.1:8000`. L'administration Django est disponible
sur `http://127.0.0.1:8000/admin/`.

> Le fichier `.env` est ignoré par Git. Ne versionnez jamais de clé ou de mot de
> passe réel.

## Installation du frontend

Dans un second terminal :

```powershell
cd "front-end\système de controle de présence par QR code"
npm install
Copy-Item .env.example .env
npm run dev
```

L'application est servie sur `http://localhost:5173`.

`front-end/.../.env` contient :

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Pour tester le scan depuis un téléphone sur le réseau local :

1. relever l'adresse LAN de l'ordinateur (`ipconfig`) ;
2. mettre `VITE_API_URL=http://<adresse-lan>:8000` dans le `.env` du front ;
3. autoriser l'hôte dans `DJANGO_ALLOWED_HOSTS` et l'origine dans
   `CORS_ALLOWED_ORIGINS` ;
4. servir le front en HTTPS ou utiliser un tunnel (ngrok) : la caméra n'est pas
   autorisée sur une origine HTTP distante.

## Comptes de démonstration

Le seed `seed_demo` est idempotent. Mot de passe commun : `Demo2026!`.

| Email | Rôle | Usage |
|---|---|---|
| `admin@presence.local` | Administrateur | Supervision globale |
| `enseignant@presence.local` | Enseignant | Cours et séances de démonstration |
| `enseignant2@presence.local` | Enseignant | Second périmètre |
| `etudiant@presence.local` | Étudiant (L2) | Scan et statistiques personnelles |
| `moussa@presence.local` | Étudiant (L2) | Autre étudiant |
| `fatou@presence.local` | Étudiant (L2) | Autre étudiant |

Le seed crée 3 cours, 5 séances relatives à la date d'exécution et des
présences sur les séances passées. Relancer `python manage.py seed_demo` avant
une démonstration pour recalculer les dates.

## Commandes utiles

### Backend

```powershell
cd backend
python manage.py check
python manage.py migrate
python manage.py seed_demo
python manage.py seed_demo --sans-presences
python manage.py test
python manage.py runserver
```

### Frontend

```powershell
cd "front-end\système de controle de présence par QR code"
npm run dev       # serveur de développement
npm run lint      # ESLint
npm test          # Vitest, exécution unique
npm run test:watch
npm run build     # build de production dans dist/
npm run preview   # prévisualisation du build
```

## Rôles et routes

| Route | Accès | Description |
|---|---|---|
| `/connexion` | public | Connexion |
| `/inscription` | public | Inscription étudiante |
| `/accueil` | connecté | Tableau de bord selon le rôle |
| `/cours` | connecté | Liste des cours du périmètre |
| `/cours/:id` | connecté | Détail, inscrits, séances |
| `/seances` | connecté | Liste et gestion des séances |
| `/seances/:id` | connecté | Détail et présence personnelle |
| `/seances/:id/qr` | enseignant/admin | Projection du QR |
| `/seances/:id/presences` | enseignant/admin | Feuille de présence |
| `/scan` | étudiant | Scan caméra ou saisie manuelle |
| `/statistiques` | connecté | KPI, graphiques, export |
| `/profil` | connecté | Profil et mot de passe |
| `/aide` | connecté | Aide et FAQ |
| `/acces-refuse` | connecté | Page 403 |
| `*` | public | Page 404 |

Un étudiant ne voit que ses cours, ses séances et ses présences. Un enseignant
ne voit que ses propres cours. Un administrateur voit tout. Ces règles sont
appliquées côté serveur, pas seulement dans l'interface.

## Règles métier

- **QR** : payload `PQR:<seance_id>:<token>`, jeton `secrets.token_urlsafe(16)`,
  durée de vie 60 secondes.
- **Fenêtre de projection** : de 10 minutes avant le début jusqu'à la fin de la
  séance.
- **Émargement** : accepté uniquement pendant la séance (`EN_COURS`).
- **Double scan** : `409 deja_present`, sans création de doublon ; traité comme
  une information dans l'interface.
- **Absence** : toute inscription sans ligne de présence est considérée absente.
- **Justification** : statut `JUSTIFIE` avec motif facultatif, saisi par
  l'enseignant.
- **Chevauchements** : refusés pour un même cours, une même salle ou un même
  enseignant.
- **Export** : CSV UTF-8 avec BOM, séparateur `;`, une ligne par couple
  séance/étudiant.
- **Statistiques** : `attendu = présents + absents + justifiés` ;
  `taux = présents / attendu × 100`.

## Documentation

| Document | Contenu |
|---|---|
| [`docs/AUDIT.md`](docs/AUDIT.md) | Audit initial, problèmes constatés, plan |
| [`docs/API.md`](docs/API.md) | Endpoints, payloads, permissions, erreurs |
| [`docs/UX.md`](docs/UX.md) | Parcours, écrans, états, accessibilité |
| [`docs/HYPOTHESES.md`](docs/HYPOTHESES.md) | Hypothèses, décisions, risques, limites |
| [`docs/IHM-CHECKLIST.md`](docs/IHM-CHECKLIST.md) | Checklist IHM, WCAG, Lighthouse/axe |
| [`docs/DEMO.md`](docs/DEMO.md) | Scénario de démonstration en moins de 5 minutes |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Palette, typographie, composants |

## Sécurité

- Aucun secret versionné : `.env` ignoré, `.env.example` fourni.
- Mots de passe hachés par Django et validateurs actifs.
- Contrôle d'accès serveur sur chaque action, y compris les actions
  personnalisées.
- CORS restreint hors `DEBUG`.
- Throttling : connexion 20/min, inscription 10/h, scan 60/min.
- Les jetons sont stockés dans `localStorage`, ce qui est adapté à une
  démonstration mais expose à une XSS. En production, préférer des cookies
  `HttpOnly` avec protection CSRF ou un stockage mémoire.
- La déconnexion efface les jetons côté client ; il n'y a pas de liste noire
  serveur des refresh tokens.
- Avant une mise en production : `DEBUG=False`, clé secrète forte, HTTPS,
  `ALLOWED_HOSTS` restreint, sauvegardes de la base et serveur d'application
  (Gunicorn/Uvicorn derrière Nginx).

## Dépannage

### `npm run lint` ou `npm test` échoue

Vérifier que `node_modules` est à jour (`npm install`) et se placer dans le
dossier du front (chemin avec espaces et accents) :

```powershell
cd "front-end\système de controle de présence par QR code"
```

### Le backend ne démarre pas

- Vérifier que PostgreSQL est démarré et que la base existe.
- Vérifier les identifiants dans `backend/.env`.
- Exécuter `python manage.py check` puis `python manage.py migrate`.

### `manage.py test` renvoie un code de sortie non nul sous PowerShell

Les logs Django sont écrits sur `stderr`, ce que PowerShell peut interpréter
comme une erreur. Vérifier la dernière ligne : si elle contient `OK`, les tests
sont passés.

### Le front ne contacte pas l'API

- Vérifier `VITE_API_URL` dans le `.env` du front.
- Vérifier que le backend écoute sur le port 8000.
- Vérifier `CORS_ALLOWED_ORIGINS` si le front n'est pas sur `localhost:5173`.
- Redémarrer `npm run dev` après modification du `.env`.

### La caméra ne démarre pas

- La caméra exige `localhost` ou HTTPS.
- Autoriser la caméra dans le navigateur et dans les réglages du système.
- Utiliser la saisie manuelle du code affiché sous le QR.

### Le QR est refusé

- Vérifier que la séance est bien **en cours** (pas avant, pas après).
- Vérifier que le QR n'a pas expiré (60 secondes) et n'a pas été renouvelé.
- Vérifier que l'étudiant est inscrit au cours.
- Un second scan renvoie « présence déjà enregistrée » : c'est normal.

### L'export CSV s'ouvre mal dans Excel

Le fichier contient un BOM UTF-8 et utilise `;`. Si Excel ne le détecte pas,
utiliser « Données → À partir d'un fichier texte » et choisir UTF-8 avec le
séparateur point-virgule.

## Limites connues

- Export **CSV uniquement**, pas de PDF.
- Pas de notifications ni de mise à jour temps réel de la feuille de présence.
- Pas de révocation serveur des refresh tokens.
- Pas de gestion des comptes enseignants dans le front : passer par
  l'administration Django.
- Pas de déploiement clé en main : la configuration production reste à faire.
- Les audits Lighthouse/axe doivent être exécutés et consignés ; voir
  `docs/IHM-CHECKLIST.md`.
