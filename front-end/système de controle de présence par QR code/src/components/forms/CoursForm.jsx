import { useState } from 'react';
import { Button, Input, Select } from '../ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  champsDepuisErreur,
  coursApi,
  messageDepuisErreur,
} from '../../services/api.js';
import { NIVEAUX } from '../../utils/constants.js';
import { validerCours } from '../../utils/validation.js';

const VALEURS_INITIALES = { nom_cours: '', niveau: '', enseignant_id: '' };

/** Formulaire partagé de création / modification d'un cours. */
function CoursForm({ cours, enseignants = [], estAdmin, onFermer, onReussi }) {
  const { succes } = useToast();
  const [valeurs, setValeurs] = useState(() => ({
    nom_cours: cours?.nom_cours ?? VALEURS_INITIALES.nom_cours,
    niveau: cours?.niveau ?? VALEURS_INITIALES.niveau,
    enseignant_id:
      cours?.enseignant != null ? String(cours.enseignant) : VALEURS_INITIALES.enseignant_id,
  }));
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const modifier = (champ) => (event) => {
    setValeurs((actuelles) => ({ ...actuelles, [champ]: event.target.value }));
  };

  const soumettre = async (event) => {
    event.preventDefault();
    setErreur('');
    const validation = validerCours(valeurs);
    if (estAdmin && !valeurs.enseignant_id) {
      validation.enseignant_id = 'Choisissez l’enseignant responsable du cours.';
    }
    setErreurs(validation);
    if (Object.keys(validation).length > 0) return;

    const charge = {
      nom_cours: valeurs.nom_cours.trim(),
      niveau: valeurs.niveau,
    };
    if (estAdmin) charge.enseignant_id = Number(valeurs.enseignant_id);

    setEnvoi(true);
    try {
      if (cours) {
        await coursApi.update(cours.id, charge);
        succes('Le cours a été modifié.');
      } else {
        await coursApi.create(charge);
        succes('Le cours a été créé.');
      }
      onReussi();
      onFermer();
    } catch (probleme) {
      setErreurs(champsDepuisErreur(probleme));
      setErreur(
        messageDepuisErreur(
          probleme,
          'Impossible d’enregistrer le cours. Vérifiez les informations saisies.',
        ),
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} className="space-y-4" noValidate>
      {erreur && (
        <p
          role="alert"
          className="rounded-app bg-danger-50 px-3 py-2 text-sm font-medium text-danger-800"
        >
          {erreur}
        </p>
      )}

      <Input
        id="cours-nom"
        label="Nom du cours"
        required
        value={valeurs.nom_cours}
        onChange={modifier('nom_cours')}
        error={erreurs.nom_cours}
        hint="Par exemple : Mathématiques appliquées."
        disabled={envoi}
        autoFocus
      />

      <Select
        id="cours-niveau"
        label="Niveau"
        required
        value={valeurs.niveau}
        onChange={modifier('niveau')}
        error={erreurs.niveau}
        disabled={envoi}
      >
        <option value="">Choisir un niveau</option>
        {NIVEAUX.map((niveau) => (
          <option key={niveau.value} value={niveau.value}>
            {niveau.label}
          </option>
        ))}
      </Select>

      {estAdmin && (
        <Select
          id="cours-enseignant"
          label="Enseignant responsable"
          required
          value={valeurs.enseignant_id}
          onChange={modifier('enseignant_id')}
          error={erreurs.enseignant_id}
          disabled={envoi}
        >
          <option value="">Choisir un enseignant</option>
          {enseignants.map((enseignant) => (
            <option key={enseignant.id} value={enseignant.id}>
              {enseignant.nom_complet || enseignant.username}
            </option>
          ))}
        </Select>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <Button variant="secondary" onClick={onFermer} disabled={envoi}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={envoi}>
          {cours ? 'Enregistrer les modifications' : 'Créer le cours'}
        </Button>
      </div>
    </form>
  );
}

export default CoursForm;
