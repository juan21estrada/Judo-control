from django.contrib import admin
from .models import Reporte, EstadisticaCompetidor

class EstadisticaCompetidorInline(admin.TabularInline):
    model = EstadisticaCompetidor
    extra = 0

class ReporteAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'fecha_creacion', 'fecha_inicio', 'fecha_fin')
    list_filter = ('tipo', 'fecha_creacion')
    search_fields = ('titulo',)
    filter_horizontal = ('competidores', 'competiciones')
    inlines = [EstadisticaCompetidorInline]

admin.site.register(Reporte, ReporteAdmin)
admin.site.register(EstadisticaCompetidor)