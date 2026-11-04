# Expérience utilisateur - Présence QR

Ce document décrit les parcours, les écrans, les règles d'interaction et les
choix d'accessibilité de l'application. Il sert de référence pour vérifier que
chaque fonctionnalité respecte les mêmes principes, du premier écran de
connexion jusqu'à l'export des présences.

## 1. Objectifs et contraintes

### 1.1 Objectif produit

Permettre à un enseignant de faire émarger une salle en moins d'une minute grâce
à un QR code temporaire, puis de contrôler, corriger et exporter les présences
sans ressaisie. Permettre à un étudiant de scanner ce code depuis son téléphone
et de vérifier immédiatement que sa présence est enregistrée.

### 1.2 Contraintes structurantes

- **Téléphone d'abord pour le scan** : l'étudiant utilise l'appareil photo dans
  une salle, parfois avec une connexion faible.
- **Projection en classe** : le QR enseignant doit rester lisible à plusieurs
  mètres, avec un minuteur explicite.
- **Données sensibles** : chaque rôle ne voit que son périmètre ; les messages
  ne doivent jamais révéler l'existence d'une ressource hors périmètre.
- **Français** : tous les libellés, messages d'erreur et exports sont en
  français, avec des formats de date et de nombre `fr-FR`.
- **Pas de dépendance à un composant propriétaire** : les graphiques et le QR
  sont rendus par des composants maison ou des bibliothèques open source.

### 1.3 Hors périmètre assumé

- Pas d'export PDF (le CSV UTF-8 est le seul format livré).
- Pas de notifications temps réel ni de messagerie.
- Pas d'application mobile native : l'interface web est responsive.
- Pas de mode hors-ligne complet : un bandeau prévient, les actions reprennent
  au retour du réseau.

## 2. Rôles et attentes

| Rôle | Attentes principales | Écrans de prédilection |
|---|---|---|
| **Étudiant** | Voir ses cours et séances, scanner, vérifier sa présence | Accueil, Cours, Séances, Scanner, Statistiques, Profil |
| **Enseignant** | Créer ses cours, planifier, projeter le QR, corriger, exporter | Accueil, Cours, Séances, QR, Feuille de présence, Statistiques |
| **Administrateur** | Superviser l'ensemble, gérer tous les cours et utilisateurs | Tous les écrans, avec périmètre global |

Le rôle est déterminé par le profil renvoyé par l'API. Il n'est jamais déduit du
contenu du JWT, qui peut être ancien. Un utilisateur qui tente d'ouvrir une page
interdite est redirigé vers une page 403 explicative, jamais vers une page
blanche.

## 3. Principes de conception

### 3.1 Heuristiques de Nielsen

| Heuristique | Application concrète |
|---|---|
| Visibilité de l'état du système | Spinner avec texte, `aria-busy`, compteur de résultats, minuteur QR, bannière hors-ligne |
| Correspondance avec le monde réel | Libellés métier français (« Séance », « Émargement », « Justifié »), dates `jj/mm/aaaa`, horaires `HH:MM` |
| Contrôle et liberté | Annulation dans les modales, retour à l'accueil sur les pages d'erreur, filtres réinitialisables |
| Cohérence et standards | Même bouton primaire, mêmes badges de statut, mêmes formulaires cours/séance partagés |
| Prévention des erreurs | Validation avant envoi, dates et horaires contrôlés, confirmations avant suppression, QR renouvelé explicitement |
| Reconnaissance plutôt que rappel | Sélecteurs d'étudiants et d'enseignants alimentés par l'API, filtres visibles, code QR doublé d'un texte |
| Flexibilité et efficacité | Recherche et tri dans les tableaux, raccourcis clavier, pagination, actions groupées d'inscription |
| Esthétique et minimalisme | Une action principale par écran, pas de décoration concurrente, hiérarchie typographique courte |
| Récupération après erreur | Message précis + cause + action (« Réessayer », « Scanner le nouveau code ») |
| Aide et documentation | Page Aide avec étapes par rôle, FAQ, rappel des règles QR |

### 3.2 Principes de Shneiderman

- **Cohérence** : la navigation et les composants sont identiques d'un écran à
  l'autre ; les statuts ont toujours le même code couleur, la même icône et le
  même libellé.
- **Raccourcis** : recherche instantanée dans les tableaux, tri par en-tête,
  filtres conservés dans l'URL pour les séances, lien direct vers une séance.
- **Retour d'information** : chaque action produit un retour immédiat (toast,
  badge, compteur, redirection), y compris les actions asynchrones.
- **Clôture des dialogues** : les modales indiquent clairement l'action qui se
  termine et l'état résultant ; une suppression réussie retire la ligne sans
  rechargement brutal.
- **Prévention des erreurs** : les formulaires désactivent l'envoi pendant la
  requête et conservent les valeurs saisies en cas d'échec.
- **Réversibilité** : les corrections de présence sont modifiables à tout
  moment ; les suppressions passent par une confirmation.
- **Contrôle du locus** : l'utilisateur garde la main sur les filtres, le
  renouvellement du QR et la fermeture des modales.

### 3.3 ISO 9241

- **Adéquation à la tâche** : les écrans sont organisés autour des tâches
  réelles (planifier, projeter, émarger, corriger, exporter), pas autour des
  tables de la base.
- **Autodescription** : chaque page a un titre, une description et un fil
  d'Ariane implicite via la navigation active.
- **Contrôlabilité** : les actions longues sont annulables par navigation ; les
  requêtes ont un délai maximal de 20 secondes puis un message d'erreur.
- **Conformité aux attentes** : les liens et boutons font ce qu'annonce leur
  libellé ; « Afficher le QR code » n'ouvre jamais un formulaire.
- **Tolérance à l'erreur** : les erreurs de champ sont affichées sous le champ,
  les erreurs globales en tête de formulaire, sans perte de saisie.
- **Individualisation** : la navigation s'adapte au rôle ; l'étudiant ne voit
  jamais les actions de gestion.
- **Apprentissage** : la page Aide et les textes d'état vides expliquent quoi
  faire ensuite.

## 4. Navigation et cartographie des écrans

### 4.1 Navigation

- **Bureau (≥ 768 px)** : barre latérale fixe avec Accueil, Cours, Séances,
  Statistiques, Aide, Profil, puis identité et déconnexion.
- **Mobile (< 768 px)** : barre inférieure à 5 destinations maximum, cibles de
  44 px minimum, icône + libellé. Le profil et la déconnexion restent
  accessibles dans l'en-tête.
- **Étudiant** : « Scanner » remplace « Aide » dans la barre mobile ; l'aide
  reste accessible depuis l'en-tête.
- **Page active** : `aria-current="page"` + fond bleu (bureau) ou texte bleu
  (mobile), jamais la couleur seule.
- **Lien d'évitement** : « Aller au contenu » est le premier élément focusable.
- **Titre de document** : chaque page met à jour `document.title` avec son nom.

### 4.2 Routes

| Route | Rôle | Écran |
|---|---|---|
| `/connexion` | public | Connexion |
| `/inscription` | public | Inscription étudiante |
| `/` | public | Redirection selon l'état de session |
| `/accueil` | connecté | Tableau de bord adapté au rôle |
| `/cours` | connecté | Liste et création des cours |
| `/cours/:id` | connecté | Détail d'un cours, inscriptions, séances |
| `/seances` | connecté | Liste, filtres, création et édition des séances |
| `/seances/:id` | connecté | Détail d'une séance et présence de l'étudiant |
| `/seances/:id/qr` | enseignant/admin | Projection et renouvellement du QR |
| `/seances/:id/presences` | enseignant/admin | Feuille de présence et corrections |
| `/scan` | étudiant | Caméra + saisie manuelle |
| `/statistiques` | connecté | KPI, graphiques, tableau et export CSV |
| `/profil` | connecté | Profil et mot de passe |
| `/aide` | connecté | Aide, FAQ, bonnes pratiques |
| `/acces-refuse` | connecté | Page 403 |
| `*` | public | Page 404 |

### 4.3 Contenu des écrans

#### Connexion

- Un seul formulaire, deux champs, une action principale.
- Erreur inline sous le champ ou en tête, jamais une alerte navigateur.
- Lien vers l'inscription et rappel que l'inscription est réservée aux étudiants.
- Après connexion, redirection vers `/accueil` ; un étudiant peut être redirigé
  vers `/scan` s'il vient d'un lien direct.

#### Inscription

- Champs : nom d'utilisateur, email, niveau, matricule, mot de passe,
  confirmation, téléphone facultatif.
- Validation immédiate des champs obligatoires et du format email.
- Les erreurs serveur (email ou matricule déjà utilisé) sont rattachées au bon
  champ.
- Succès : message explicite puis retour à la connexion.

#### Accueil

- Salutation nominative et rappel du rôle.
- Cartes KPI (cours, séances, étudiants, taux) selon le rôle.
- Prochaines séances avec action directe vers le détail, le QR ou le scan.
- État vide guidé si aucune donnée : créer un cours ou planifier une séance.
- Pour l'étudiant : présence du jour et accès rapide au scanner.

#### Cours

- Liste en tableau (bureau) ou cartes (mobile), recherche instantanée, tri.
- Création/édition dans une modale avec formulaire partagé.
- Suppression avec confirmation explicite et rappel des conséquences.
- Détail : informations du cours, inscrits, ajout/retrait d'étudiants, séances.

#### Séances

- Filtres par cours, statut et période, conservés dans l'URL (`?cours=`,
  `?nouvelle=1`).
- Création/édition avec formulaire partagé ; les chevauchements sont expliqués
  champ par champ.
- Actions par ligne : détail, QR, feuille de présence, édition, suppression.
- Les actions de gestion sont masquées pour un étudiant.

#### QR de séance

- QR affiché en grand sur fond blanc, avec marge de silence.
- Minuteur en texte (`expires_in`) + barre de progression ; jamais la couleur
  seule.
- Renouvellement manuel + renouvellement automatique avant expiration.
- Code texte sous le QR pour la saisie manuelle.
- Message clair si la séance n'est pas encore ouverte ou est terminée.
- Avertissement si l'onglet passe en arrière-plan : le renouvellement peut être
  suspendu, un bouton permet de reprendre.

#### Scan étudiant

- Autorisation caméra demandée au clic, pas au chargement.
- Si la caméra est refusée ou indisponible : message + saisie manuelle toujours
  visible.
- Un seul bouton d'action principal.
- Résultat : succès vert avec icône + texte ; `deja_present` affiché comme
  information ; échec avec cause précise et action suivante.
- Après succès, rappel du cours, de la salle et de l'heure.

#### Feuille de présence

- En-tête de séance + compteurs (présents, absents, justifiés, taux).
- Liste des inscrits avec badge de statut et heure de pointage.
- Correction par sélection de statut ; motif demandé uniquement pour « Justifié ».
- Recherche et tri ; sur mobile, cartes étiquetées.
- Les modifications sont confirmées par un toast et le compteur est recalculé.

#### Statistiques

- Filtres cours, période, puis bouton « Appliquer » et « Réinitialiser ».
- KPI : séances, étudiants, attendus, présents, absents, justifiés, taux.
- Graphiques maison : barres horizontales avec libellé et valeur directe,
  tableau alternatif accessible.
- Tableaux par cours, par étudiant et par période.
- Export CSV avec retour sur le nombre de lignes ; `export_vide` traité comme
  une information, pas une erreur.

#### Profil

- Informations personnelles modifiables, rôle en lecture seule.
- Changement de mot de passe séparé, avec validation de l'ancien mot de passe.
- Les erreurs de champ sont rattachées au champ concerné.
- Le nom affiché dans la navigation se met à jour après enregistrement.

#### Aide

- Deux parcours guidés (enseignant, étudiant) en étapes numérotées.
- Règles du QR, signification des messages, FAQ.
- Rappel accessibilité : clavier, mobile, contrastes, hors-ligne.
- Liens directs vers les écrans concernés.

#### Pages 403 / 404

- Explication de la cause, sans détail technique.
- Sortie principale (« Retour à l'accueil ») + sortie secondaire (aide ou
  connexion).
- Accessibles au clavier, titre de page dédié.

## 5. Parcours clés

### 5.1 Enseignant : préparer et faire émarger une séance

1. **Créer un cours** depuis `/cours` : nom, niveau, enseignant (admin).
2. **Inscrire les étudiants** depuis le détail du cours.
3. **Planifier une séance** depuis `/seances` : date, horaires, salle, type.
4. **Ouvrir le QR** depuis la séance, 10 minutes avant le début au plus tôt.
5. **Projeter** le QR ; le code se renouvelle toutes les 60 secondes.
6. **Suivre la feuille de présence** en temps réel (rechargement manuel ou
   navigation depuis la séance).
7. **Corriger** un statut ou justifier une absence.
8. **Exporter** le CSV depuis les statistiques.

Points de friction traités : séance non ouverte (message + horaire), QR expiré
(bouton de renouvellement), chevauchement (message par champ), doublon de scan
(information).

### 5.2 Étudiant : scanner et vérifier

1. Se connecter ou s'inscrire.
2. Ouvrir `/scan` depuis l'accueil ou la barre mobile.
3. Autoriser la caméra ; sinon saisir le code affiché.
4. Scanner pendant la séance.
5. Lire le retour : présence enregistrée, déjà présente, QR expiré, séance
   terminée, non inscrit.
6. Vérifier le statut sur `/seances/:id` ou `/statistiques`.

Points de friction traités : permission caméra refusée (saisie manuelle),
connexion faible (timeout + réessai), double scan (information), absence de
justificatif côté étudiant (contacter l'enseignant).

### 5.3 Administrateur : superviser

1. Accueil global avec KPI tous cours.
2. Création de cours avec choix de l'enseignant.
3. Consultation de toutes les séances et feuilles de présence.
4. Statistiques et export globaux.
5. Gestion des comptes via l'administration Django (`/admin/`) pour les cas
   avancés.

## 6. États d'interface obligatoires

| État | Composant | Règle |
|---|---|---|
| Chargement initial | `Skeleton` ou `Spinner` | Toujours un texte, `role="status"` |
| Chargement d'action | `Button loading` | Bouton désactivé + `aria-busy` |
| Vide | `EmptyState` | Icône + titre + explication + action |
| Erreur | `ErrorState` / `Alert` | Cause + « Réessayer », `role="alert"` |
| Succès | `Toast` / `Alert` | Message court, annoncé poliment |
| Information | `Toast` neutre / `Alert info` | Pas de rouge pour une information |
| Hors-ligne | Bandeau global | `role="status"`, texte explicite |
| Permission refusée | Page 403 | Explication + sorties |
| Session expirée | Redirection connexion | Message conservé jusqu'à la reconnexion |
| Ressource absente | Page 404 / état vide | Ne jamais afficher une page blanche |

Aucun écran ne doit rester silencieux plus de quelques centaines de
millisecondes : les chargements affichent un squelette ou un spinner.

## 7. Retours d'erreur métier

| Code | Traitement UX |
|---|---|
| `validation` | Erreurs sous les champs + focus sur le premier champ invalide |
| `qr_invalide` | Erreur avec action « Scanner le code affiché » |
| `qr_expire` | Erreur avec action « Demander le renouvellement » |
| `seance_non_ouverte` | Information : l'émargement ouvre à l'heure de début |
| `seance_terminee` | Information : demander une correction à l'enseignant |
| `non_inscrit` | Erreur : contacter l'enseignant pour l'inscription |
| `deja_present` | Information neutre/positive : aucun doublon créé |
| `etudiant_non_inscrit` | Erreur de la feuille de présence |
| `export_vide` | Information : élargir les filtres |
| `trop_de_requetes` | Erreur : patienter avant de réessayer |
| `non_authentifie` | Redirection connexion avec message de session expirée |
| `acces_refuse` | Page 403 |

## 8. Accessibilité (WCAG 2.1 AA / RGAA)

### 8.1 Structure et sémantique

- Un seul `<h1>` par page, hiérarchie de titres continue.
- Points de repère (`header`, `nav`, `main`, `aside`) et lien d'évitement.
- `aria-label` sur les navigations, les icônes significatives et les boutons
  icône seule.
- `aria-current="page"` sur l'entrée active.
- Titre de document unique par route.

### 8.2 Clavier

- Tous les contrôles sont atteignables et activables au clavier.
- Focus visible : contour `brand-700` de 3 px, offset 2 px.
- Modales : focus piégé, `Échap` ferme, retour du focus à l'élément déclencheur.
- Tableaux : en-têtes triables activables au clavier avec `aria-sort`.
- Aucun piège de focus, aucun `tabindex` positif.

### 8.3 Formulaires

- Étiquette visible liée au champ (`htmlFor`/`id`).
- `aria-invalid` et `aria-describedby` en cas d'erreur.
- Message d'erreur avec icône + texte, `role="alert"`.
- `autocomplete` renseigné quand pertinent.
- Champs obligatoires signalés par `*` et `required`.

### 8.4 Contrastes et couleur

- Texte courant `slate-800` sur blanc : > 12:1.
- Liens et actions `brand-700` : ~ 7:1.
- Statuts : combinaison couleur + icône + libellé, jamais la couleur seule.
- Badges : texte `*-800` sur fond `*-50`, ratio > 7:1.
- Focus : ratio > 3:1 par rapport aux couleurs adjacentes.

### 8.5 Cibles tactiles et mouvement

- Cibles principales : 44 px minimum (`min-h-[44px]`, boutons `md`).
- Barre mobile : 5 destinations maximum, libellé sous l'icône.
- Animations limitées aux transitions de couleur et au spinner ; pas de
  mouvement automatique perturbateur.

### 8.6 Graphiques

- Chaque barre a un libellé et une valeur texte.
- Un tableau alternatif est accessible via un bouton « Afficher les valeurs
  sous forme de tableau ».
- La couleur n'est jamais le seul canal d'information.

### 8.7 Vérifications réalisées et restant à faire

Les tests automatisés couvrent les composants critiques, les formulaires de
validation, la garde de route et les pages d'erreur. Les vérifications
manuelles clavier et lecteur d'écran sont décrites dans
[`IHM-CHECKLIST.md`](./IHM-CHECKLIST.md). Les audits Lighthouse/axe doivent être
lancés sur un build de production et consignés dans ce même document.

## 9. Responsive

| Largeur | Adaptation |
|---|---|
| **360 px** | Une colonne, barre inférieure, tableaux transformés en cartes étiquetées, boutons pleine largeur, textes 16 px |
| **768 px** | Barre latérale, grilles à 2 colonnes, tableaux classiques, filtres sur une ligne |
| **1280 px** | Contenu centré `max-w-6xl`, grilles à 4 colonnes pour les KPI, marges généreuses |

Règles :

- Pas de défilement horizontal de page ; seuls les tableaux peuvent défiler.
- Les libellés ne sont jamais tronqués au point de perdre le sens.
- Les actions principales restent visibles sans zoom.
- `viewport-fit=cover` et `env(safe-area-inset-bottom)` protègent la barre
  mobile des encoches.
- Le QR reste carré et lisible, avec une taille minimale de 220 px.

## 10. Performance et perception

- `Scan` et `QrSeance` sont chargés en `React.lazy` + `Suspense` : les
  bibliothèques QR/caméra ne pèsent pas sur le bundle initial.
- Les listes utilisent la pagination serveur (20 par défaut) et la recherche
  côté client sur les jeux déjà chargés.
- Les squelettes conservent la mise en page pour éviter les sauts visuels.
- Les actions asynchrones désactivent le bouton concerné et affichent un texte
  d'attente.
- Le timeout réseau est de 20 secondes ; au-delà, un message propose de
  réessayer.

## 11. Rédaction et ton

- Phrases courtes, voix active, vocabulaire métier constant.
- Pas de jargon technique dans les messages utilisateur (`500`, `token`,
  `endpoint` sont proscrits).
- Les erreurs disent **ce qui s'est passé**, **pourquoi** et **quoi faire**.
- Les succès sont factuels : « Présence enregistrée », « Export terminé :
  128 lignes dans presences.csv ».
- Les états vides proposent toujours une action utile.
- Aucune double négation, aucun point d'exclamation excessif.

## 12. Références

- [`AUDIT.md`](./AUDIT.md) - état initial et décisions.
- [`API.md`](./API.md) - contrat serveur et codes d'erreur.
- [`HYPOTHESES.md`](./HYPOTHESES.md) - hypothèses et limites.
- [`IHM-CHECKLIST.md`](./IHM-CHECKLIST.md) - checklist de conformité.
- [`DEMO.md`](./DEMO.md) - scénario de démonstration.
