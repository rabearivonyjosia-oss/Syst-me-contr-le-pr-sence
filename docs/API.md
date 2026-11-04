# API - Présence QR

Documentation de référence de l'API REST Django/DRF de l'application de contrôle
de présence par QR code. Elle décrit les routes réellement exposées, les charges
utiles attendues, les règles d'accès et les formats d'erreur.

- **Base URL de développement** : `http://127.0.0.1:8000`
- **Préfixe canonique** : `/api/`
- **Format** : JSON UTF-8 (`Content-Type: application/json`)
- **Authentification** : JWT Bearer (sauf connexion, inscription et rafraîchissement)
- **Fuseau horaire** : `Africa/Dakar` (configurable via `DJANGO_TIME_ZONE`)
- **Pagination** : `{ "count", "next", "previous", "results" }`

## 1. Authentification

### 1.1 Se connecter

`POST /api/auth/login/` - public, limité à 20 tentatives par minute et par IP.

```json
{
  "email": "enseignant@presence.local",
  "password": "Demo2026!"
}
```

Réponse `200` :

```json
{
  "access": "<jwt-access>",
  "refresh": "<jwt-refresh>",
  "user": {
    "id": 2,
    "username": "enseignant",
    "email": "enseignant@presence.local",
    "first_name": "Awa",
    "last_name": "Diop",
    "nom_complet": "Awa Diop",
    "role": "ENSEIGNANT",
    "role_libelle": "Enseignant",
    "niveau": null,
    "niveau_libelle": null,
    "num_matricule": null,
    "telephone": "",
    "date_joined": "2026-11-04T09:00:00+0000"
  },
  "detail": "Connexion réussie."
}
```

L'identifiant est l'adresse email (`USERNAME_FIELD = "email"`). Le jeton d'accès
contient aussi `role`, `username` et `email`, mais le rôle applicatif fait
toujours foi côté client après appel de `/api/auth/me/`.

### 1.2 Rafraîchir le jeton

`POST /api/auth/refresh/` - public.

```json
{ "refresh": "<jwt-refresh>" }
```

Réponse `200` : `{ "access": "<nouveau>", "refresh": "<nouveau>" }` lorsque la
rotation est active. L'access token vit 30 minutes, le refresh 7 jours
(paramétrables avec `JWT_ACCESS_MINUTES` et `JWT_REFRESH_DAYS`).

### 1.3 S'inscrire (étudiant uniquement)

`POST /api/auth/register/` - public, limité à 10 inscriptions par heure et par IP.

```json
{
  "username": "nouvel.etudiant",
  "email": "nouvel.etudiant@presence.local",
  "password": "Demo2026!",
  "password_confirm": "Demo2026!",
  "niveau": "L2",
  "num_matricule": "ETU-2026-010",
  "telephone": "+221770000000"
}
```

`password_confirm` est facultatif côté API : s'il est fourni, il doit être
identique à `password`. Le rôle est toujours forcé à `ETUDIANT`. Le mot de passe
est validé par les validateurs Django (8 caractères minimum, pas de mot de passe
courant, pas entièrement numérique, pas trop proche de l'email ou du nom).

Réponse `201` :

```json
{
  "detail": "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
  "user": { "id": 12, "username": "nouvel.etudiant", "role": "ETUDIANT" }
}
```

### 1.4 Profil courant

`GET /api/auth/me/` - authentifié.

Réponse `200` : objet utilisateur complet (mêmes champs que `user` ci-dessus,
sans mot de passe).

`PATCH /api/auth/me/` - authentifié. Champs modifiables :

| Champ | Type | Remarque |
|---|---|---|
| `username` | chaîne | unique |
| `email` | chaîne | unique, insensible à la casse |
| `first_name` | chaîne | |
| `last_name` | chaîne | |
| `telephone` | chaîne | facultatif |
| `niveau` | `L1`/`L2`/`L3`/`M1`/`M2` | obligatoire pour un étudiant |
| `num_matricule` | chaîne | obligatoire pour un étudiant, unique |

Le rôle n'est pas modifiable depuis cet endpoint. Réponse :

```json
{ "detail": "Profil mis à jour.", "user": { "...": "..." } }
```

### 1.5 Changer le mot de passe

`POST /api/auth/change-password/` - authentifié.

```json
{
  "current_password": "Demo2026!",
  "new_password": "Nouveau2026!",
  "confirm_password": "Nouveau2026!"
}
```

Réponse `200` : `{ "detail": "Mot de passe modifié avec succès." }`. Le nouveau
mot de passe doit être différent de l'actuel et respecter les validateurs Django.

### 1.6 Se déconnecter

`POST /api/auth/logout/` - authentifié. Le serveur ne tient pas de liste noire :
le client efface ses deux jetons. Réponse `200` :
`{ "detail": "Vous êtes déconnecté." }`.

### 1.7 Annuaire pour les sélecteurs

`GET /api/auth/utilisateurs/<role>/?search=<terme>` - enseignant ou administrateur.

- `<role>` : `ENSEIGNANT` ou `ETUDIANT` (insensible à la casse) ;
- réponse : tableau **non paginé** (200 éléments maximum), trié par `username` ;
- champs : `id`, `username`, `nom_complet`, `email`, `niveau`, `niveau_libelle`,
  `num_matricule`.

Utilisé par les formulaires de cours (choix de l'enseignant) et d'inscription
(recherche d'étudiants). Un étudiant reçoit `403`.

## 2. Format d'erreur

Toutes les erreurs applicatives renvoient la même structure :

```json
{
  "detail": "Ce QR code a expiré. Scannez le nouveau QR code affiché par l'enseignant.",
  "errors": {},
  "code": "qr_expire"
}
```

`errors` contient les erreurs par champ, toujours sous forme de tableaux :

```json
{
  "detail": "Certains champs sont invalides. Corrigez-les puis réessayez.",
  "errors": {
    "email": ["Un compte existe déjà avec cette adresse email."],
    "salle": ["Indiquez la salle de la séance."]
  },
  "code": "validation"
}
```

### 2.1 Codes stables

| Code | Statut HTTP | Signification |
|---|---|---|
| `validation` | 400 | Un ou plusieurs champs sont invalides |
| `requete_invalide` | 400 | Requête mal formée |
| `non_authentifie` | 401 | Jeton absent, invalide ou expiré |
| `acces_refuse` | 403 | Rôle ou périmètre insuffisant |
| `introuvable` | 404 | Ressource inexistante |
| `methode_non_autorisee` | 405 | Verbe HTTP non supporté |
| `conflit` | 409 | Conflit générique |
| `expire` | 410 | Ressource expirée |
| `trop_de_requetes` | 429 | Limite de débit atteinte |
| `qr_invalide` | 400/404 | Code inconnu, mal formé ou remplacé |
| `qr_expire` | 410 | Jeton QR arrivé à expiration |
| `seance_non_ouverte` | 409 | QR/émargement hors de la fenêtre de la séance |
| `seance_terminee` | 409 | Émargement fermé |
| `non_inscrit` | 403 | Étudiant non inscrit au cours |
| `deja_present` | 409 | Présence déjà enregistrée (information, pas doublon) |
| `etudiant_non_inscrit` | 400 | Correction pour un non-inscrit |
| `role_invalide` | 404 | Rôle d'annuaire inconnu |
| `filtre_invalide` | 400 | Filtre de statistiques/export invalide |
| `export_vide` | 404 | Aucune ligne à exporter |
| `erreur_metier` | 400 | Erreur fonctionnelle générique |

Le client ne doit jamais afficher `code` : il sert à choisir le traitement
(information, erreur bloquante, redirection), tandis que `detail` est le message
lisible en français.

## 3. Pagination, filtres et tri

Les listes de cours et de séances sont paginées :

| Paramètre | Défaut | Remarque |
|---|---|---|
| `page` | 1 | `last`, `derniere`, `dernière` acceptés |
| `page_size` | 20 | 100 maximum |

Réponse :

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/seances/?page=3",
  "previous": "http://127.0.0.1:8000/api/seances/?page=1",
  "results": []
}
```

Les actions personnalisées (`/etudiants/`, `/seances/`, `/presences/`,
`/utilisateurs/<role>/`) renvoient des tableaux simples non paginés.

## 4. Permissions par rôle

| Ressource | Étudiant | Enseignant | Administrateur |
|---|---|---|---|
| Cours visibles | ceux où il est inscrit | ceux qu'il dispense | tous |
| Créer/modifier/supprimer un cours | non | ses cours | tous |
| Inscrire des étudiants | non | ses cours | tous |
| Séances visibles | celles de ses cours | celles de ses cours | toutes |
| Créer/modifier/supprimer une séance | non | ses cours | toutes |
| QR (lire/renouveler) | non | ses séances | toutes |
| Feuille de présence (lire/corriger) | non | ses séances | toutes |
| Scanner un QR | oui (inscrit, pendant la séance) | non | non |
| Statistiques | ses présences uniquement | son périmètre | tout |
| Export CSV | ses présences uniquement | son périmètre | tout |
| Annuaire | non | oui | oui |

Le rôle est vérifié côté serveur à chaque requête ; l'interface ne fait que
refléter ces règles. Un administrateur est un utilisateur `role=ADMIN` ou un
superutilisateur Django.

## 5. Cours

### 5.1 Objet cours

```json
{
  "id": 1,
  "nom_cours": "Algorithmique avancée",
  "niveau": "L2",
  "niveau_libelle": "Licence 2",
  "enseignant": 2,
  "enseignant_nom": "Awa Diop",
  "nb_etudiants": 7,
  "nb_seances": 5,
  "date_creation": "2026-11-04T09:00:00+0000"
}
```

`enseignant_id` est accepté en écriture (identifiant d'un utilisateur
`ENSEIGNANT`) mais n'apparaît pas en lecture ; `enseignant` (lecture seule) donne
le même identifiant. Un enseignant ne peut pas choisir un autre responsable :
le serveur force `enseignant = utilisateur connecté`.

### 5.2 Lister et filtrer

`GET /api/cours/`

| Paramètre | Effet |
|---|---|
| `search` | recherche sur `nom_cours` |
| `niveau` | `L1`, `L2`, `L3`, `M1`, `M2` |
| `ordering` | `nom_cours`, `niveau`, `date_creation` (préfixe `-` pour décroissant) |
| `page`, `page_size` | pagination |

### 5.3 Créer

`POST /api/cours/` - enseignant ou administrateur.

```json
{
  "nom_cours": "Algorithmique avancée",
  "niveau": "L2",
  "enseignant_id": 2
}
```

`enseignant_id` est obligatoire pour un administrateur, ignoré pour un
enseignant. Le nom est normalisé (espaces multiples réduits) et doit contenir au
moins 2 caractères. Réponse `201` avec l'objet cours.

### 5.4 Consulter, modifier, supprimer

- `GET /api/cours/{id}/`
- `PATCH /api/cours/{id}/` ou `PUT` (mêmes champs, tous facultatifs en PATCH)
- `DELETE /api/cours/{id}/` → `204 No Content`

La suppression d'un cours supprime en cascade ses séances et leurs présences.

### 5.5 Inscriptions

`GET /api/cours/{id}/etudiants/` → tableau d'étudiants :

```json
[
  {
    "id": 4,
    "username": "etudiant",
    "nom_complet": "Aminata Diallo",
    "email": "etudiant@presence.local",
    "niveau": "L2",
    "niveau_libelle": "Licence 2",
    "num_matricule": "ETU-2026-001"
  }
]
```

`POST /api/cours/{id}/etudiants/` :

```json
{ "etudiant_ids": [4, 5, 6] }
```

`DELETE /api/cours/{id}/etudiants/` :

```json
{ "etudiant_ids": [5] }
```

Les deux réponses contiennent `detail` et la liste `etudiants` à jour. Les
identifiants inconnus ou non étudiants provoquent une erreur `validation`.

`GET /api/cours/{id}/etudiants/disponibles/?search=<terme>` → étudiants non
encore inscrits (100 maximum), pour le sélecteur d'ajout.

### 5.6 Séances d'un cours

`GET /api/cours/{id}/seances/` → tableau non paginé, trié par date et heure.
Pour un étudiant, la réponse utilise la vue allégée (avec `ma_presence`).

## 6. Séances

### 6.1 Objet séance (enseignant/administrateur)

```json
{
  "id": 3,
  "cours": 1,
  "cours_nom": "Algorithmique avancée",
  "cours_niveau": "Licence 2",
  "enseignant_nom": "Awa Diop",
  "date_seance": "2026-11-04",
  "heure_debut": "09:00:00",
  "heure_fin": "11:00:00",
  "salle": "A101",
  "type_seance": "CM",
  "type_seance_libelle": "Cours magistral",
  "statut": "EN_COURS",
  "statut_libelle": "En cours",
  "qr_valide": true,
  "expiration_qr": "2026-11-04T09:15:00+0000",
  "nb_presents": 3,
  "nb_etudiants": 7
}
```

Vue étudiant (`SeanceDetailEtudiantSerializer`) : `id`, `cours`, `cours_nom`,
`date_seance`, `heure_debut`, `heure_fin`, `salle`, `type_seance`, `statut`,
`statut_libelle`, et :

```json
"ma_presence": {
  "statut": "PRESENT",
  "statut_libelle": "Présent",
  "timestamp": "2026-11-04T09:05:00+0000",
  "motif_justification": ""
}
```

`ma_presence` vaut `null` si aucune présence n'a été enregistrée.

### 6.2 Lister et filtrer

`GET /api/seances/`

| Paramètre | Effet |
|---|---|
| `cours` | identifiant du cours |
| `statut` | `A_VENIR`, `EN_COURS`, `TERMINEE` |
| `a_venir` / `upcoming` | `1`, `true` ou `oui` : séances non terminées |
| `date_debut`, `date_fin` | bornes incluses `aaaa-mm-jj` |
| `search` | nom du cours ou salle |
| `ordering` | `date_seance`, `heure_debut`, `cours__nom_cours` (préfixe `-`) |
| `page`, `page_size` | pagination |

Les statuts sont calculés à la volée à partir de la date, de l'heure et du
fuseau courant : une séance est `A_VENIR` avant l'heure de début, `EN_COURS`
pendant le créneau, `TERMINEE` après l'heure de fin.

### 6.3 Créer

`POST /api/seances/` - enseignant propriétaire ou administrateur.

```json
{
  "cours": 1,
  "date_seance": "2026-11-05",
  "heure_debut": "09:00",
  "heure_fin": "11:00",
  "salle": "A101",
  "type_seance": "CM"
}
```

Règles de validation :

- date non passée à la création, format `aaaa-mm-jj` ;
- heure de fin strictement postérieure à l'heure de début ;
- salle obligatoire (normalisée) ;
- un même cours ne peut pas avoir deux séances qui se chevauchent ;
- une salle ne peut pas être occupée par deux séances qui se chevauchent ;
- un enseignant ne peut pas avoir deux séances qui se chevauchent ;
- un enseignant ne peut planifier que dans ses propres cours.

Les erreurs sont renvoyées par champ (`heure_debut`, `salle`, etc.) avec le code
`validation`.

### 6.4 Consulter, modifier, supprimer

- `GET /api/seances/{id}/`
- `PATCH /api/seances/{id}/` ou `PUT`
- `DELETE /api/seances/{id}/` → `204`

Seul le propriétaire du cours (ou un administrateur) peut modifier ou supprimer.

## 7. QR code d'une séance

### 7.1 Lire l'état du QR

`GET /api/seances/{id}/qr/` - enseignant propriétaire ou administrateur.

```json
{
  "actif": true,
  "seance": 3,
  "seance_statut": "EN_COURS",
  "emargement_ouvert": true,
  "expiration": "2026-11-04T09:15:00+0000",
  "expires_in": 42,
  "token": "<jeton>",
  "qr_payload": "PQR:3:<jeton>"
}
```

`token` et `qr_payload` ne sont présents que si `actif` vaut `true`. Le QR est
projetable de **10 minutes avant le début jusqu'à la fin** de la séance, mais
l'émargement (scan accepté) n'est ouvert que pendant la séance.

### 7.2 Renouveler le QR

`POST /api/seances/{id}/qr/` - même périmètre.

Réponse `201` :

```json
{
  "detail": "Nouveau QR code généré.",
  "actif": true,
  "seance": 3,
  "seance_statut": "EN_COURS",
  "emargement_ouvert": true,
  "token": "<nouveau-jeton>",
  "qr_payload": "PQR:3:<nouveau-jeton>",
  "expiration": "2026-11-04T09:16:00+0000",
  "expires_in": 60
}
```

Le jeton est généré avec `secrets.token_urlsafe(16)` et vit **60 secondes**
(`QR_TTL_SECONDS`). Chaque renouvellement invalide immédiatement l'ancien jeton.
Si la séance est hors de la fenêtre de projection : `409 seance_non_ouverte`.

Le contenu du QR est `PQR:<seance_id>:<token>`. Le client peut aussi afficher le
jeton seul sous le QR pour la saisie manuelle.

## 8. Feuille de présence d'une séance

### 8.1 Lire la feuille

`GET /api/seances/{id}/presences/` - enseignant propriétaire ou administrateur.

```json
{
  "seance": { "id": 3, "cours_nom": "Algorithmique avancée", "...": "..." },
  "resume": {
    "total": 7,
    "presents": 3,
    "absents": 4,
    "justifies": 0,
    "taux_presence": 42.9
  },
  "etudiants": [
    {
      "etudiant": 4,
      "username": "etudiant",
      "nom_complet": "Aminata Diallo",
      "email": "etudiant@presence.local",
      "num_matricule": "ETU-2026-001",
      "niveau": "L2",
      "niveau_libelle": "Licence 2",
      "statut": "PRESENT",
      "statut_libelle": "Présent",
      "motif_justification": "",
      "source": "SCAN",
      "presence_id": 12,
      "timestamp": "2026-11-04T09:05:00+0000",
      "modifie_le": "2026-11-04T09:05:00+0000"
    }
  ],
  "genere_le": "2026-11-04T09:10:00+0000"
}
```

Tous les étudiants inscrits au cours apparaissent. Sans ligne `Presence`, le
statut calculé est `ABSENT` et `presence_id` vaut `null`. `source` vaut `SCAN`,
`MANUEL` ou une chaîne vide.

### 8.2 Corriger un statut

`POST /api/seances/{id}/presences/` - enseignant propriétaire ou administrateur.

```json
{
  "etudiant": 4,
  "statut": "JUSTIFIE",
  "motif_justification": "Certificat médical"
}
```

- `statut` : `PRESENT`, `ABSENT` ou `JUSTIFIE` ;
- `motif_justification` : facultatif, 255 caractères maximum ; effacé
  automatiquement si le statut n'est pas `JUSTIFIE` ;
- création : `201` avec `{ "detail": "Présence enregistrée.", "presence": {...} }` ;
- mise à jour : `200` avec `{ "detail": "Statut de présence mis à jour.", "presence": {...} }`.

Un étudiant non inscrit au cours provoque `400 etudiant_non_inscrit`.

## 9. Scanner un QR (étudiant)

`POST /api/presences/scan/` - étudiant authentifié, limité à 60 scans par minute.

```json
{ "token": "PQR:3:<jeton>" }
```

Le champ accepte le contenu complet du QR (`PQR:<id>:<token>`) ou le jeton seul.
Réponse `201` :

```json
{
  "detail": "Présence enregistrée. Vous êtes marqué présent.",
  "presence": {
    "id": 12,
    "seance": 3,
    "etudiant": 4,
    "statut": "PRESENT",
    "statut_libelle": "Présent",
    "motif_justification": "",
    "source": "SCAN",
    "timestamp": "2026-11-04T09:05:00+0000",
    "modifie_le": "2026-11-04T09:05:00+0000"
  },
  "seance": {
    "id": 3,
    "cours_nom": "Algorithmique avancée",
    "date_seance": "2026-11-04",
    "heure_debut": "09:00:00",
    "heure_fin": "11:00:00",
    "salle": "A101"
  }
}
```

### 9.1 Réponses d'échec

| Situation | Statut | Code |
|---|---|---|
| Code vide ou mal formé | 400 | `validation` / `qr_invalide` |
| Séance inexistante (payload avec id) | 404 | `qr_invalide` |
| Jeton remplacé par un renouvellement | 400 | `qr_invalide` |
| Jeton inconnu (saisie seule) | 400 | `qr_invalide` |
| Étudiant non inscrit au cours | 403 | `non_inscrit` |
| Séance pas encore commencée | 409 | `seance_non_ouverte` |
| Séance terminée | 409 | `seance_terminee` |
| QR expiré (> 60 s) | 410 | `qr_expire` |
| Présence déjà existante | 409 | `deja_present` |
| Rôle non étudiant | 403 | `acces_refuse` |

`deja_present` est une **information** : aucune ligne n'est créée, l'interface
doit afficher un message neutre ou positif, pas une erreur bloquante.

## 10. Statistiques

`GET /api/stats/` - authentifié. Le périmètre est appliqué automatiquement :

- étudiant : uniquement ses propres présences ;
- enseignant : ses cours et leurs étudiants ;
- administrateur : l'ensemble.

| Paramètre | Format | Effet |
|---|---|---|
| `cours` | entier | restreint à un cours du périmètre |
| `etudiant` | entier | restreint à un étudiant du périmètre (ignoré pour un étudiant) |
| `date_debut` | `aaaa-mm-jj` | borne incluse |
| `date_fin` | `aaaa-mm-jj` | borne incluse |

Un filtre invalide renvoie `400 filtre_invalide`. Un étudiant hors périmètre
renvoie `403 acces_refuse`.

Réponse `200` :

```json
{
  "filtres": {
    "cours": null,
    "etudiant": null,
    "date_debut": null,
    "date_fin": null
  },
  "resume": {
    "nb_cours": 3,
    "nb_seances": 5,
    "nb_seances_aujourdhui": 2,
    "nb_etudiants": 7,
    "attendu": 35,
    "presents": 24,
    "absents": 10,
    "justifies": 1,
    "taux_presence": 68.6
  },
  "par_cours": [
    {
      "cours": 1,
      "cours_nom": "Algorithmique avancée",
      "niveau": "L2",
      "niveau_libelle": "Licence 2",
      "nb_seances": 2,
      "nb_etudiants": 7,
      "attendu": 14,
      "presents": 11,
      "absents": 3,
      "justifies": 0,
      "taux_presence": 78.6
    }
  ],
  "par_etudiant": [
    {
      "etudiant": 4,
      "username": "etudiant",
      "nom_complet": "Aminata Diallo",
      "email": "etudiant@presence.local",
      "num_matricule": "ETU-2026-001",
      "niveau": "L2",
      "niveau_libelle": "Licence 2",
      "attendu": 5,
      "presents": 4,
      "absents": 1,
      "justifies": 0,
      "taux_presence": 80.0
    }
  ],
  "par_periode": [
    {
      "date": "2026-11-04",
      "attendu": 7,
      "presents": 5,
      "absents": 2,
      "justifies": 0,
      "taux_presence": 71.4
    }
  ],
  "genere_le": "2026-11-04T09:10:00+0000"
}
```

Notes de calcul :

- `attendu` = nombre d'inscriptions attendues sur les séances du périmètre ;
- `presents` et `justifies` comptent les lignes `Presence` correspondantes ;
- `absents` = `max(0, attendu - presents - justifies)` ;
- `taux_presence` = `presents / attendu × 100`, arrondi à une décimale, `0` si
  `attendu` vaut zéro ;
- `par_etudiant` est trié par taux décroissant puis par nom ;
- `par_periode` est trié par date croissante.

## 11. Export CSV

`GET /api/exports/presences/` - authentifié, mêmes filtres que les statistiques.

Réponse `200` :

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="presences.csv"`
- `X-Nombre-Lignes: <entier>`
- BOM UTF-8 en tête, séparateur `;`, en-têtes français.

Colonnes : `Date`, `Heure de début`, `Heure de fin`, `Cours`, `Niveau`, `Salle`,
`Type de séance`, `Étudiant`, `Email`, `Matricule`, `Statut`, `Justification`,
`Pointé le`.

Une ligne est produite pour chaque couple séance/étudiant inscrit. En l'absence
de ligne `Presence`, le statut exporté est `Absent`. Si aucune ligne ne peut être
produite, l'API renvoie `404 export_vide`.

## 12. Alias de compatibilité

Les anciens chemins restent exposés pour ne pas casser les clients existants :

| Ancien chemin | Équivalent |
|---|---|
| `POST /login/` | `POST /api/auth/login/` |
| `POST /register/` | `POST /api/auth/register/` |
| `POST /token/refresh/` | `POST /api/auth/refresh/` |
| `GET/POST /cours/` | `GET/POST /api/cours/` |

Le front actuel n'utilise que les chemins `/api/`.

## 13. Limites de débit

| Portée | Limite | Routes |
|---|---|---|
| `connexion` | 20/minute | `POST /api/auth/login/` |
| `inscription` | 10/heure | `POST /api/auth/register/` |
| `scan` | 60/minute | `POST /api/presences/scan/` |

Le dépassement renvoie `429` avec le code `trop_de_requetes`.

## 14. Exemple de parcours complet

```bash
# 1. Connexion enseignant
curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"enseignant@presence.local","password":"Demo2026!"}'

# 2. Création d'un cours (remplacer <ACCESS>)
curl -s -X POST http://127.0.0.1:8000/api/cours/ \
  -H "Authorization: Bearer <ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"nom_cours":"Réseaux","niveau":"L3"}'

# 3. Planification d'une séance
curl -s -X POST http://127.0.0.1:8000/api/seances/ \
  -H "Authorization: Bearer <ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"cours":1,"date_seance":"2026-11-05","heure_debut":"09:00","heure_fin":"11:00","salle":"B201","type_seance":"TD"}'

# 4. Génération du QR
curl -s -X POST http://127.0.0.1:8000/api/seances/1/qr/ \
  -H "Authorization: Bearer <ACCESS>"

# 5. Scan étudiant (remplacer <ACCESS_ETU> et <TOKEN>)
curl -s -X POST http://127.0.0.1:8000/api/presences/scan/ \
  -H "Authorization: Bearer <ACCESS_ETU>" \
  -H "Content-Type: application/json" \
  -d '{"token":"PQR:1:<TOKEN>"}'

# 6. Export CSV
curl -s -o presences.csv \
  "http://127.0.0.1:8000/api/exports/presences/?cours=1" \
  -H "Authorization: Bearer <ACCESS>"
```
