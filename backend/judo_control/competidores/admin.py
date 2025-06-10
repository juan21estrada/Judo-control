from django.contrib import admin
from .models import Competidor

class CompetidorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'genero', 'division_peso', 'categoria', 'anos_experiencia')
    list_filter = ('genero', 'categoria')
    search_fields = ('nombre',)
    ordering = ('nombre',)

admin.site.register(Competidor, CompetidorAdmin)