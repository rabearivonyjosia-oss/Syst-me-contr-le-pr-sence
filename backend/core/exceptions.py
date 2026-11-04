"""Format d'erreur uniforme de l'API : {detail, errors, code}."""

from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler


class ErreurMetier(APIException):
    """Erreur fonctionnelle avec un code stable, traduisible par le front."""

    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail, code="erreur_metier", status_code=None):
        if status_code is not None:
            self.status_code = status_code
        self.code = code
        super().__init__(detail, code)


def _texte(valeur):
    if isinstance(valeur, dict):
        return " ".join(_texte(item) for item in valeur.values())
    if isinstance(valeur, (list, tuple)):
        return " ".join(_texte(item) for item in valeur)
    return str(valeur)


def _liste(valeur):
    if isinstance(valeur, (list, tuple)):
        resultat = []
        for item in valeur:
            resultat.extend(_liste(item))
        return resultat
    if isinstance(valeur, dict):
        return [_texte(valeur)]
    return [str(valeur)]


CODES_PAR_STATUT = {
    status.HTTP_400_BAD_REQUEST: "requete_invalide",
    status.HTTP_401_UNAUTHORIZED: "non_authentifie",
    status.HTTP_403_FORBIDDEN: "acces_refuse",
    status.HTTP_404_NOT_FOUND: "introuvable",
    status.HTTP_405_METHOD_NOT_ALLOWED: "methode_non_autorisee",
    status.HTTP_409_CONFLICT: "conflit",
    status.HTTP_410_GONE: "expire",
    status.HTTP_429_TOO_MANY_REQUESTS: "trop_de_requetes",
}

MESSAGES_PAR_STATUT = {
    status.HTTP_401_UNAUTHORIZED: "Vous devez \u00eatre connect\u00e9 pour acc\u00e9der \u00e0 cette ressource.",
    status.HTTP_403_FORBIDDEN: "Vous n'avez pas les droits n\u00e9cessaires pour effectuer cette action.",
    status.HTTP_404_NOT_FOUND: "La ressource demand\u00e9e est introuvable.",
    status.HTTP_429_TOO_MANY_REQUESTS: "Trop de tentatives. Patientez un instant avant de r\u00e9essayer.",
}


def gestionnaire_exceptions_api(exc, context):
    reponse = exception_handler(exc, context)
    if reponse is None:
        return None

    statut = reponse.status_code
    donnees = reponse.data
    code = getattr(exc, "code", None) or CODES_PAR_STATUT.get(statut, "erreur")
    detail = MESSAGES_PAR_STATUT.get(statut, "Une erreur est survenue.")
    erreurs = {}

    if isinstance(donnees, dict):
        if set(donnees.keys()) == {"detail"}:
            detail = str(donnees["detail"])
        else:
            erreurs = {
                str(champ): _liste(valeur)
                for champ, valeur in donnees.items()
                if champ != "detail"
            }
            if "detail" in donnees:
                detail = str(donnees["detail"])
            elif erreurs:
                detail = "Certains champs sont invalides. Corrigez-les puis r\u00e9essayez."
    elif isinstance(donnees, (list, tuple)):
        erreurs = {"non_field_errors": _liste(donnees)}
        detail = "Certains champs sont invalides. Corrigez-les puis r\u00e9essayez."
    else:
        detail = _texte(donnees)

    if isinstance(exc, ValidationError):
        code = "validation"

    reponse.data = {"detail": detail, "errors": erreurs, "code": code}
    return reponse
