# Démonstration en moins de 5 minutes

Scénario minuté pour présenter l'application de bout en bout. Prévoir deux
navigateurs (ou un navigateur + un téléphone) : un pour l'enseignant, un pour
l'étudiant.

## Préparation (avant la démonstration)

```powershell
# Terminal 1 - API
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py seed_demo
python manage.py runserver

# Terminal 2 - Front
cd "front-end\système de controle de présence par QR code"
npm run dev
```

Ouvrir :

- enseignant : `http://localhost:5173/connexion` →
  `enseignant@presence.local` / `Demo2026!`
- étudiant : `http://localhost:5173/connexion` →
  `etudiant@presence.local` / `Demo2026!`
- administrateur (optionnel) : `admin@presence.local` / `Demo2026!`

Le seed crée une séance **en cours** pour le cours « Développement web »
(Salle B12), avec un QR déjà actif. Si la démonstration a lieu plus de 40 minutes
après le seed, le relancer.

## Déroulé (4 min 30)

### 0:00 - 0:20 · Contexte et connexion enseignant

- Présenter en une phrase : « Un QR temporaire projeté en cours, les étudiants
  scannent, l'enseignant contrôle et exporte. »
- Se connecter avec le compte enseignant.
- Montrer l'accueil : KPI, prochaines séances, identité et rôle dans l'en-tête.

### 0:20 - 0:50 · Cours et séances

- Ouvrir **Cours** : rechercher « Développement web », montrer les inscrits et
  les séances du cours.
- Ouvrir **Séances** : montrer le filtre par cours, le statut « En cours » et la
  séance du jour.
- Ouvrir le détail de la séance en cours.

### 0:50 - 1:30 · Projeter le QR

- Cliquer sur **Afficher le QR code**.
- Montrer :
  - le QR grand format et son code texte ;
  - le minuteur et la barre de progression ;
  - le renouvellement automatique toutes les 60 secondes ;
  - le bouton de renouvellement manuel.
- Laisser le QR affiché à l'écran.

### 1:30 - 2:10 · Scanner côté étudiant

- Sur le téléphone (ou le second navigateur), ouvrir **Scanner**.
- Autoriser la caméra et scanner le QR.
- Montrer le retour vert « Présence enregistrée » avec le cours, la salle et
  l'heure.
- **Repli caméra** : si la caméra est refusée, saisir le code affiché sous le QR
  dans le champ de saisie manuelle. Le résultat est identique.
- Scanner une seconde fois : le message « présence déjà enregistrée » s'affiche
  comme une information, sans doublon.

### 2:10 - 2:40 · Feuille de présence et correction

- Revenir côté enseignant, ouvrir **Feuille de présence**.
- Montrer les compteurs : présents, absents, justifiés, taux.
- L'étudiant scanné apparaît en « Présent » avec l'heure de pointage.
- Passer un autre étudiant en **Justifié** et saisir un motif
  (« Certificat médical »).
- Montrer la mise à jour immédiate des compteurs et le toast de confirmation.

### 2:40 - 3:20 · Statistiques et export

- Ouvrir **Statistiques**.
- Filtrer sur le cours « Développement web » et appliquer.
- Montrer les KPI, le graphique par cours et le tableau par étudiant.
- Cliquer sur **Afficher les valeurs sous forme de tableau** pour illustrer
  l'alternative accessible.
- Cliquer sur **Exporter en CSV** : le navigateur télécharge
  `presences.csv`.
- Ouvrir le fichier dans Excel/LibreOffice : accents corrects, séparateur `;`,
  colonnes lisibles.

### 3:20 - 4:00 · Rôles, aide et états

- Se connecter avec le compte administrateur : montrer le périmètre global.
- Tenter d'ouvrir `/seances/1/qr` avec le compte étudiant : page **403**
  explicative.
- Ouvrir **Aide** : parcours enseignant et étudiant, règles du QR, FAQ.
- Ouvrir **Profil** : informations réelles, changement de mot de passe.
- (Optionnel) Passer en mode hors-ligne dans DevTools : bandeau d'avertissement.

### 4:00 - 4:30 · Conclusion

Rappeler les points clés :

- QR temporaire de 60 secondes, renouvelable, projection 10 minutes avant.
- Émargement uniquement pendant la séance, un seul enregistrement par étudiant.
- Contrôle d'accès serveur pour les trois rôles.
- Statistiques et export CSV UTF-8.
- Interface accessible et responsive, états de chargement/erreur/vide gérés.
- Tests : 22 backend, 56 frontend, lint et build verts.

## Messages à anticiper

| Question | Réponse courte |
|---|---|
| « Et si un étudiant partage le QR ? » | Le jeton expire en 60 secondes, il est renouvelé, et le scan n'est accepté que pendant la séance. |
| « Et si le réseau coupe ? » | Un bandeau prévient ; la saisie manuelle et le réessai sont disponibles. |
| « Peut-on justifier une absence ? » | Oui, l'enseignant passe le statut en « Justifié » avec un motif. |
| « Où sont les exports PDF ? » | Le CSV UTF-8 est le format livré ; le PDF est hors périmètre. |
| « Les étudiants voient-ils les autres ? » | Non, le serveur filtre leur périmètre à leurs propres présences. |
| « Comment sont créés les enseignants ? » | Via l'administration Django ; l'inscription autonome est réservée aux étudiants. |

## En cas de problème pendant la démo

- **Pas de séance en cours** : relancer `python manage.py seed_demo`.
- **QR expiré** : cliquer sur **Renouveler** dans la page QR.
- **Caméra indisponible** : utiliser la saisie manuelle du code.
- **API injoignable** : vérifier `python manage.py runserver` et `VITE_API_URL`.
- **Front injoignable** : vérifier `npm run dev` sur le port 5173.
