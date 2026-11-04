"""Attribue le rôle ADMIN aux superutilisateurs existants."""

from django.db import migrations


def superusers_vers_admin(apps, schema_editor):
    Utilisateur = apps.get_model("gestion_utilisateur", "CustomUser")
    Utilisateur.objects.filter(is_superuser=True).exclude(role="ADMIN").update(role="ADMIN")


def admin_vers_superusers(apps, schema_editor):
    Utilisateur = apps.get_model("gestion_utilisateur", "CustomUser")
    Utilisateur.objects.filter(role="ADMIN").update(is_superuser=True)


class Migration(migrations.Migration):

    dependencies = [
        ("gestion_utilisateur", "0004_alter_customuser_options_customuser_telephone_and_more"),
    ]

    operations = [
        migrations.RunPython(superusers_vers_admin, admin_vers_superusers),
    ]
