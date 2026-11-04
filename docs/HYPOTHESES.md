# Hypothèses et décisions

Ce document recense les hypothèses prises pendant la conception et le
développement, les décisions d'architecture qui en découlent, et les points qui
restent à valider avec le commanditaire. Il permet de distinguer ce qui est
**spécifié**, ce qui est **supposé** et ce qui est **volontairement hors
périmètre**.

## 1. Contexte et périmètre

### 1.1 Hypothèses métier

| # | Hypothèse | Conséquence |
|---|---|---|
| H1 | Un cours est dispensé par **un seul enseignant**. | Champ `enseignant` unique ; l'administrateur choisit le responsable à la création. |
| H2 | Un étudiant peut suivre plusieurs cours, mais un cours correspond à **un niveau**. | Champ `niveau` sur le cours ; les étudiants restent rattachés par inscription explicite, sans filtrage automatique par niveau. |
| H3 | Une séance appartient à **un seul cours** et dure dans la même journée. | Pas de séance multi-jours ; `date_seance`, `heure_debut`, `heure_fin` sur la même date. |
| H4 | Une présence est **unique par couple séance/étudiant**. | Contrainte de base `unique_presence_par_seance` ; un second scan renvoie `deja_present`. |
| H5 | L'émargement se fait **pendant la séance**, pas avant ni après. | Scan accepté seulement si le statut calculé est `EN_COURS` ; le QR peut être projeté 10 minutes avant. |
| H6 | Un **QR code est temporaire et à usage collectif**. | Jeton aléatoire de 16 octets, TTL 60 secondes, renouvellement manuel ou automatique. |
| H7 | Les absences sont **calculées**, pas saisies. | Toute inscription sans ligne `Presence` est considérée absente dans la feuille et les statistiques. |
| H8 | La justification est saisie **par l'enseignant**, avec un motif libre. | Champ `motif_justification` (255 caractères), pas de workflow de validation. |
| H9 | Les étudiants s'inscrivent eux-mêmes, les enseignants sont créés par l'administration. | `/api/auth/register/` force `role=ETUDIANT` ; pas d'auto-promotion. |
| H10 | Un administrateur peut tout voir et tout gérer. | Périmètre global pour `role=ADMIN` et les superutilisateurs Django. |
| H11 | Les étudiants ne voient que **leurs** présences et statistiques. | Filtrage serveur, pas seulement masquage d'interface. |
| H12 | Le contrôle d'accès est **serveur d'abord**. | Les gardes React améliorent l'expérience mais ne remplacent pas les permissions DRF. |

### 1.2 Hypothèses techniques

| # | Hypothèse | Décision |
|---|---|---|
| T1 | Base de données **PostgreSQL** en développement et en production. | `psycopg2-binary`, configuration par `.env`, repli SQLite possible via `DB_ENGINE=sqlite`. |
| T2 | Le front et l'API sont servis sur des origines différentes en développement. | CORS configuré pour `localhost:5173` et `127.0.0.1:5173`, élargi en `DEBUG`. |
| T3 | Le navigateur cible supporte les modules ES, `fetch`, `localStorage` et les API caméra modernes. | React 19, Vite 8, `html5-qrcode` ; pas de polyfill navigateur ancien. |
| T4 | La caméra n'est accessible qu'en **HTTPS** ou sur `localhost`. | La saisie manuelle reste disponible ; la documentation de démo le précise. |
| T5 | Les utilisateurs acceptent le stockage des JWT dans `localStorage`. | Choix simple pour un projet pédagogique ; voir limite de sécurité ci-dessous. |
| T6 | Le fuseau de référence est `Africa/Dakar` (UTC). | Tous les calculs de statut et d'expiration passent par `timezone.localtime()`. |
| T7 | Les échanges sont en français et les formats `fr-FR`. | `LANGUAGE_CODE=fr-fr`, formatage explicite côté front. |
| T8 | Le volume reste celui d'un établissement : quelques milliers d'utilisateurs et de présences. | Pagination 20/100, pas de recherche full-text ni de cache distribué. |
| T9 | Aucun service de messagerie n'est requis. | Backend email console ; pas d'envoi réel. |
| T10 | Le déploiement n'est pas fourni clé en main. | `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`, HTTPS et serveur d'application restent à configurer. |

## 2. Décisions d'architecture

### 2.1 Backend

- **Django 6 + DRF** : structure existante conservée, applications séparées
  (`gestion_utilisateur`, `gestion_cours`, `gestion_seance`,
  `gestion_presence`, `core`).
- **JWT SimpleJWT** : access 30 min, refresh 7 jours, rotation activée. Le rôle
  est ajouté au jeton pour le débogage, mais le front recharge `/api/auth/me/`.
- **Format d'erreur uniforme** : `{detail, errors, code}` via un gestionnaire
  d'exceptions global. Les codes sont stables et documentés dans `API.md`.
- **Permissions réutilisables** : `EstEtudiant`, `EstGestionnaire`, `EstAdmin`,
  `ProprietaireCours`, `ProprietaireSeance`. Les querysets filtrent aussi le
  périmètre pour éviter les fuites par identifiant.
- **Pagination standard** : `PageNumberPagination`, 20 par défaut, 100 maximum.
- **Throttling ciblé** : connexion 20/min, inscription 10/h, scan 60/min.
- **Pas de liste noire de refresh tokens** : la déconnexion est locale ; choix
  assumé pour un projet sans infrastructure de révocation.
- **QR** : jeton `secrets.token_urlsafe(16)`, payload `PQR:<seance>:<token>`,
  TTL 60 s, fenêtre de projection de −10 min à la fin. Le jeton est stocké sur
  la séance et remplacé à chaque renouvellement.
- **Statistiques** : calcul à la volée à partir des inscriptions et des
  présences. `attendu` inclut les inscrits de chaque séance ; `absents` est le
  reste. Pas de table d'agrégats.
- **Export CSV** : BOM UTF-8, séparateur `;`, en-tête `X-Nombre-Lignes`, 404
  `export_vide` si aucune ligne. Pas de PDF.

### 2.2 Frontend

- **React 19 + Vite + Tailwind 4 + React Router 7**.
- **Un seul client API** (`src/services/api.js`) : intercepteur d'ajout du
  jeton, renouvellement automatique sur 401, file d'attente d'un seul
  rafraîchissement, événement `presenceqr:session-expiree`.
- **Contexte d'authentification** : état `chargement` / `connecte` /
  `deconnecte` / `erreur`, profil réel, mise à jour après édition.
- **Garde de route** : rôle vérifié après chargement du profil ; 403 dédiée ;
  redirection vers la connexion avec mémorisation de la page demandée.
- **Composants UI maison** : `Button`, `Card`, `Input`, `Select`, `Modal`,
  `DataTable`, `BarChart`, `StatCard`, `StatutBadge`, `Skeleton`, `ErrorState`,
  `EmptyState`, `Toast`, `ConfirmDialog`.
- **Formulaires partagés** : `CoursForm` et `SeanceForm` utilisés par les pages
  de liste et de détail, pour éviter les divergences de validation.
- **Lazy loading** : `Scan` et `QrSeance` sont chargés à la demande, car
  `html5-qrcode` et `qrcode.react` alourdissent le bundle.
- **Graphiques sans bibliothèque** : barres HTML/CSS + tableau alternatif
  accessible, conformément à l'objectif d'accessibilité et de sobriété.
- **Tests** : Vitest + Testing Library (56 tests) sur les utilitaires, le client
  API, les composants critiques et les gardes de route.

### 2.3 Sécurité

- Aucun secret versionné : `.env` ignoré, `.env.example` fourni.
- Mots de passe hachés par Django, validateurs actifs.
- Contrôle d'accès serveur sur chaque action, y compris les actions
  personnalisées (`qr`, `presences`, `etudiants`).
- Les erreurs ne distinguent pas une ressource inexistante d'une ressource hors
  périmètre lorsque cela pourrait fuiter de l'information.
- CORS restreint hors `DEBUG`.
- **Limite assumée** : les JWT sont dans `localStorage`, donc exposés en cas de
  XSS. Une version de production devrait envisager des cookies `HttpOnly` +
  protection CSRF, ou un stockage mémoire avec refresh en cookie.

## 3. Hypothèses de données et de démonstration

- Le seed `seed_demo` crée un jeu reproductible : 3 comptes de gestion
  (admin + 2 enseignants), 7 étudiants, 3 cours, 5 séances relatives à
  maintenant, dont une séance en cours avec QR actif.
- Mot de passe commun de démonstration : `Demo2026!`.
- Comptes principaux :
  - `admin@presence.local` (administrateur) ;
  - `enseignant@presence.local` (enseignant) ;
  - `enseignant2@presence.local` (enseignant) ;
  - `etudiant@presence.local` (étudiant, L2).
- Le seed est **idempotent** : il peut être relancé avant une démonstration.
- Les dates des séances sont recalculées par rapport à la date d'exécution ;
  relancer le seed après un changement de jour évite les séances « passées ».
- Les présences de démonstration sont créées sur les séances passées, sauf
  option `--sans-presences`.

## 4. Choix d'expérience utilisateur

- **Mobile-first pour le scan**, desktop-first pour la gestion : les tableaux
  deviennent des cartes sous 768 px.
- **Une action principale par écran** : bouton primaire unique, actions
  secondaires en style secondaire ou fantôme.
- **Messages métier en français** : les codes d'erreur restent techniques mais
  ne sont jamais affichés.
- **Double scan = information** : l'étudiant ne doit pas croire à une erreur
  alors que sa présence est bien enregistrée.
- **QR renouvelé automatiquement** : l'enseignant n'a pas à surveiller le
  minuteur, mais peut forcer un renouvellement.
- **Filtres de séances dans l'URL** : un lien depuis un cours ouvre la liste
  déjà filtrée.
- **Export CSV traité comme une action aboutie** : toast avec nombre de lignes
  et nom du fichier.
- **Page Aide intégrée** : réduit la dépendance à une documentation externe
  pendant la démonstration.

## 5. Points à valider avec le commanditaire

| # | Question | Hypothèse actuelle | Impact si différente |
|---|---|---|---|
| V1 | Un cours peut-il avoir plusieurs enseignants ? | Non | Modèle many-to-many, permissions et formulaires à revoir |
| V2 | Les séances peuvent-elles durer plusieurs jours ou être récurrentes ? | Non | Modèle et validation des chevauchements à adapter |
| V3 | Un étudiant peut-il justifier lui-même une absence ? | Non | Nouvel écran et workflow de validation |
| V4 | Faut-il un export PDF ou Excel natif ? | Non, CSV seul | Ajout d'une dépendance et d'un format |
| V5 | Le QR doit-il être nominatif (un par étudiant) ? | Non, collectif | Changement du modèle de jeton et du scan |
| V6 | Faut-il une révocation serveur des refresh tokens ? | Non | Liste noire SimpleJWT + table dédiée |
| V7 | Les enseignants peuvent-ils créer des comptes étudiants ? | Non, inscription autonome | Endpoint d'administration et interface |
| V8 | Faut-il des notifications (email, push) ? | Non | Service d'envoi et préférences |
| V9 | Le fuseau doit-il être configurable par établissement ? | Oui, via `.env` | Interface d'administration supplémentaire |
| V10 | Faut-il conserver un historique des corrections de présence ? | Non, seule la dernière modification est tracée (`modifie_par`, `modifie_le`) | Table d'audit dédiée |

## 6. Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Caméra indisponible ou refusée | Moyenne | Étudiant bloqué | Saisie manuelle toujours visible + message d'aide |
| Réseau faible en salle | Moyenne | Scan échoué | Timeout 20 s, message clair, réessai, saisie manuelle |
| QR photographié et partagé | Faible | Présence frauduleuse | TTL 60 s, renouvellement, contrôle d'inscription, scan pendant la séance |
| Double scan | Élevée | Confusion | Réponse `deja_present` traitée comme information |
| Chevauchement de séances | Moyenne | Conflit de salle/enseignant | Validation serveur + messages par champ |
| JWT volé (XSS) | Faible | Usurpation | CSP et échappement React, durée de vie courte ; cookies HttpOnly en production |
| Fuite de données entre rôles | Faible | Gravité élevée | Filtrage des querysets + permissions + tests |
| Bundle initial trop lourd | Moyenne | Premier chargement lent | Lazy loading QR/scan, build Splitchunks |
| Décalage de fuseau | Faible | Statut de séance erroné | `USE_TZ`, `timezone.localtime()`, fuseau configurable |
| Perte de données à la suppression d'un cours | Faible | Irréversible | Confirmation explicite, cascade documentée |

## 7. Limites connues

- **Pas de PDF** : uniquement CSV UTF-8.
- **Pas de notifications** : les changements ne sont visibles qu'au rechargement.
- **Pas de temps réel** : la feuille de présence ne se met pas à jour seule.
- **Pas de révocation de refresh token** : la déconnexion efface les jetons
  locaux, un refresh volé reste valide jusqu'à expiration.
- **Pas d'audit complet** : seule la dernière modification de présence est
  conservée.
- **Pas de gestion avancée des comptes dans le front** : l'administration Django
  reste la voie pour créer des enseignants ou réinitialiser un compte.
- **Pas de déploiement fourni** : le projet est prêt pour le développement et la
  démonstration, pas pour une mise en production sans configuration.
- **Audits Lighthouse/axe non automatisés dans ce dépôt** : la méthode et les
  points de contrôle sont décrits dans `IHM-CHECKLIST.md`.

## 8. Critères d'acceptation transverses

Une fonctionnalité est considérée comme livrée lorsque :

1. elle est couverte par l'API et le front, sans donnée en dur ni `TODO` ;
2. les rôles et périmètres sont vérifiés côté serveur ;
3. les états chargement, vide, erreur, succès et hors-ligne sont prévus ;
4. les messages sont en français et les formats `fr-FR` ;
5. elle est utilisable au clavier et sur 360 px ;
6. `npm run lint`, `npm test`, `npm run build` et les tests Django passent ;
7. la documentation (`API.md`, `UX.md`, ce document) est à jour.
