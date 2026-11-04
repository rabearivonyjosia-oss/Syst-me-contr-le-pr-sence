"""Permissions r\u00e9utilisables, v\u00e9rifi\u00e9es c\u00f4t\u00e9 serveur."""

from rest_framework.permissions import BasePermission


class EstEtudiant(BasePermission):
    message = "Cette action est r\u00e9serv\u00e9e aux \u00e9tudiants."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "ETUDIANT"
        )


class EstGestionnaire(BasePermission):
    """Enseignant ou administrateur."""

    message = "Cette action est r\u00e9serv\u00e9e aux enseignants et aux administrateurs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role in {"ENSEIGNANT", "ADMIN"}
                or request.user.is_superuser
            )
        )


class EstAdmin(BasePermission):
    message = "Cette action est r\u00e9serv\u00e9e aux administrateurs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ADMIN" or request.user.is_superuser)
        )


class ProprietaireCours(BasePermission):
    """L'enseignant propri\u00e9taire du cours (ou un administrateur)."""

    message = "Vous ne pouvez modifier que les cours dont vous \u00eates responsable."

    def has_object_permission(self, request, view, obj):
        if request.user.est_admin:
            return True
        return obj.enseignant_id == request.user.id


class ProprietaireSeance(BasePermission):
    message = "Vous ne pouvez modifier que les s\u00e9ances de vos propres cours."

    def has_object_permission(self, request, view, obj):
        if request.user.est_admin:
            return True
        return obj.cours.enseignant_id == request.user.id
