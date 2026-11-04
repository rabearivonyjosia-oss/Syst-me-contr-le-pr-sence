import { useState } from 'react';
import { Button, Input, Select } from '../ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  champsDepuisErreur,
  messageDepuisErreur,
  seancesApi,
} from '../../services/api.js';
import { TYPES_SEANCE } from '../../utils/constants.js';
import { aujourdHuiIso } from '../../utils/format.js';
import { validerSeance } from '../../utils/validation.js';

/** Formulaire partagé de création / modification d'une séance. */
function SeanceForm({ seance, coursDisponibles = [], coursInitial = '', onFermer, onReussi }) {
  const { succes } = useToast();
  const [valeurs, setValeurs] = useState(() => ({
    cours: seance?.cours != null ? String(seance.cours) : String(coursInitial || ''),
    date_seance: seance?.date_seance ?? aujourdHuiIso(),
    heure_debut: seance?.heure_debut ? String(seance.heure_debut).slice(0, 5) : '',
    heure_fin: seance?.heure_fin ? String(seance.heure_fin).slice(0, 5) : '',
    salle: seance?.salle ?? '',
    type_seance: seance?.type_seance ?? 'CM',
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
    const validation = validerSeance(valeurs);
    setErreurs(validation);
    if (Object.keys(validation).length > 0) return;

    const charge = {
      cours: Number(valeurs.cours),
      date_seance: valeurs.date_seance,
      heure_debut: valeurs.heure_debut,
      heure_fin: valeurs.heure_fin,
      salle: valeurs.salle.trim(),
      type_seance: valeurs.type_seance,
    };

    setEnvoi(true);
    try {
      if (seance) {
        await seancesApi.update(seance.id, charge);
        succes('La séance a été modifiée.');
      } else {
        await seancesApi.create(charge);
        succes('La séance a été créée.');
      }
      onReussi();
      onFermer();
    } catch (probleme) {
      setErreurs(champsDepuisErreur(probleme));
      setErreur(
        messageDepuisErreur(
          probleme,
          'Impossible d’enregistrer la séance. Vérifiez le créneau et la salle.',
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

      <Select
        id="seance-cours"
        label="Cours"
        required
        value={valeurs.cours}
        onChange={modifier('cours')}
        error={erreurs.cours}
        disabled={envoi}
      >
        <option value="">Choisir un cours</option>
        {coursDisponibles.map((cours) => (
          <option key={cours.id} value={cours.id}>
            {cours.nom_cours} · {cours.niveau_libelle || cours.niveau}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="seance-date"
          label="Date"
          type="date"
          required
          value={valeurs.date_seance}
          onChange={modifier('date_seance')}
          error={erreurs.date_seance}
          min={seance ? undefined : aujourdHuiIso()}
          disabled={envoi}
        />
        <Select
          id="seance-type"
          label="Type de séance"
          required
          value={valeurs.type_seance}
          onChange={modifier('type_seance')}
          error={erreurs.type_seance}
          disabled={envoi}
        >
          {TYPES_SEANCE.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="seance-heure-debut"
          label="Heure de début"
          type="time"
          required
          value={valeurs.heure_debut}
          onChange={modifier('heure_debut')}
          error={erreurs.heure_debut}
          disabled={envoi}
        />
        <Input
          id="seance-heure-fin"
          label="Heure de fin"
          type="time"
          required
          value={valeurs.heure_fin}
          onChange={modifier('heure_fin')}
          error={erreurs.heure_fin}
          disabled={envoi}
        />
      </div>

      <Input
        id="seance-salle"
        label="Salle"
        required
        value={valeurs.salle}
        onChange={modifier('salle')}
        error={erreurs.salle}
        hint="La salle ne peut pas être occupée par une autre séance sur le même créneau."
        disabled={envoi}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <Button variant="secondary" onClick={onFermer} disabled={envoi}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={envoi}>
          {seance ? 'Enregistrer les modifications' : 'Créer la séance'}
        </Button>
      </div>
    </form>
  );
}

export default SeanceForm;
