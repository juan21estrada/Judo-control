from django.contrib import admin
from .models import Combate, AccionTashiWaza, AccionNeWaza, Amonestacion

class AccionTashiWazaInline(admin.TabularInline):
    model = AccionTashiWaza
    extra = 0

class AccionNeWazaInline(admin.TabularInline):
    model = AccionNeWaza
    extra = 0

class AmonestacionInline(admin.TabularInline):
    model = Amonestacion
    extra = 0

class CombateAdmin(admin.ModelAdmin):
    list_display = ('competicion', 'competidor1', 'competidor2', 'duracion', 'finalizado', 'ganador')
    list_filter = ('finalizado', 'competicion')
    search_fields = ('competidor1__nombre', 'competidor2__nombre', 'competicion__nombre')
    inlines = [AccionTashiWazaInline, AccionNeWazaInline, AmonestacionInline]

admin.site.register(Combate, CombateAdmin)
admin.site.register(AccionTashiWaza)
admin.site.register(AccionNeWaza)
admin.site.register(Amonestacion)