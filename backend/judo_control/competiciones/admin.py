
from django.contrib import admin
from .models import Competicion

class CompeticionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha', 'evento', 'tipo', 'cantidad_atletas', 'cantidad_combates_planificados', 'cantidad_combates_realizados')
    list_filter = ('evento', 'tipo', 'fecha')
    search_fields = ('nombre',)
    ordering = ('-fecha',)

admin.site.register(Competicion, CompeticionAdmin)