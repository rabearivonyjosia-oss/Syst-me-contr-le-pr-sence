import Button from './Button.jsx';
import Modal from './Modal.jsx';

/** Confirmation avant action irréversible (suppression, désinscription...). */
function ConfirmDialog({
  open,
  titre = 'Confirmer l’action',
  description,
  libelleConfirmer = 'Confirmer',
  libelleAnnuler = 'Annuler',
  onConfirmer,
  onAnnuler,
  chargement = false,
  danger = true,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={chargement ? () => {} : onAnnuler}
      title={titre}
      description={description}
      variant={danger ? 'danger' : 'default'}
      footer={
        <>
          <Button variant="secondary" onClick={onAnnuler} disabled={chargement}>
            {libelleAnnuler}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirmer}
            loading={chargement}
          >
            {libelleConfirmer}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export default ConfirmDialog;
