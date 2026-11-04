from django.contrib import admin
from .models import Presence

# Register your models here.
@admin.register(Presence)
class PresenceAdmin(admin.ModelAdmin):
    list_display = ('étudiant', 'seance', 'timestamp')
    list_filter = ('seance', 'timestamp')
    search_fields = (
        'etudiant__username',
        'etudiant__first_name',
        'etudiant__last_name',
    )
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    list_select_related = ('étudiant', 'seance')