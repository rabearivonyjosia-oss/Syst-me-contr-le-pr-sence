"""Renomme le champ étudiant, ajoute le statut, la source et la trace de correction."""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gestion_presence", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="presence",
            name="unique_presence_par_seance",
        ),
        migrations.RenameField(
            model_name="presence",
            old_name="étudiant",
            new_name="etudiant",
        ),
        migrations.AddField(
            model_name="presence",
            name="statut",
            field=models.CharField(
                choices=[
                    ("PRESENT", "Présent"),
                    ("ABSENT", "Absent"),
                    ("JUSTIFIE", "Justifié"),
                ],
                default="PRESENT",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="presence",
            name="motif_justification",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="presence",
            name="source",
            field=models.CharField(
                choices=[("SCAN", "Scan du QR code"), ("MANUEL", "Correction manuelle")],
                default="SCAN",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="presence",
            name="modifie_par",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="presences_modifiees",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="presence",
            name="modifie_le",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterModelOptions(
            name="presence",
            options={
                "ordering": ["etudiant__username"],
                "verbose_name": "Présence",
                "verbose_name_plural": "Présences",
            },
        ),
        migrations.AddConstraint(
            model_name="presence",
            constraint=models.UniqueConstraint(
                fields=("seance", "etudiant"), name="unique_presence_par_seance"
            ),
        ),
    ]
