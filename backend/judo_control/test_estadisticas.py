#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'judo_control.settings')
django.setup()

from combates.models import AccionCombinada, AccionTashiWaza, AccionNeWaza
from competidores.models import Competidor
from estadisticas.views import ReporteViewSet
from django.http import HttpRequest
from datetime import datetime

print("=== PRUEBA DE ESTADÍSTICAS CORREGIDAS ===")
print()

# Obtener un competidor que tenga AccionCombinada
competidor = Competidor.objects.first()
if not competidor:
    print("No hay competidores en la base de datos")
    sys.exit(1)

print(f"Probando estadísticas para: {competidor.nombre} {competidor.apellido}")
print()

# Verificar AccionCombinada para este competidor
acciones_combinadas = AccionCombinada.objects.filter(competidor=competidor)
print(f"AccionCombinada encontradas: {acciones_combinadas.count()}")

for i, accion in enumerate(acciones_combinadas[:3], 1):
    print(f"  {i}. Efectiva: {accion.efectiva}, Puntuación: {accion.puntuacion}")
    
    # Verificar técnicas relacionadas
    tashi_relacionadas = AccionTashiWaza.objects.filter(accion_combinada=accion).count()
    ne_relacionadas = AccionNeWaza.objects.filter(accion_combinada=accion).count()
    print(f"     Tashi relacionadas: {tashi_relacionadas}, Ne relacionadas: {ne_relacionadas}")

print()
print("=== SIMULANDO CÁLCULO DE ESTADÍSTICAS ===")

# Simular el cálculo manual
tecnicas_positivas_combinadas = 0
tecnicas_negativas_combinadas = 0

for accion_combinada in acciones_combinadas:
    # Contar técnicas Tashi Waza en esta combinación (si existen)
    tashi_en_combinacion = AccionTashiWaza.objects.filter(accion_combinada=accion_combinada)
    tecnicas_positivas_combinadas += tashi_en_combinacion.exclude(puntuacion='sin_puntuacion').count()
    tecnicas_negativas_combinadas += tashi_en_combinacion.filter(puntuacion='sin_puntuacion').count()
    
    # Contar técnicas Ne Waza en esta combinación (si existen)
    ne_en_combinacion = AccionNeWaza.objects.filter(accion_combinada=accion_combinada)
    tecnicas_positivas_combinadas += ne_en_combinacion.filter(efectiva=True).count()
    tecnicas_negativas_combinadas += ne_en_combinacion.filter(efectiva=False).count()
    
    # NUEVO: Si no hay técnicas individuales relacionadas, contar la AccionCombinada directamente
    if tashi_en_combinacion.count() == 0 and ne_en_combinacion.count() == 0:
        if accion_combinada.efectiva or accion_combinada.puntuacion != 'sin_puntuacion':
            tecnicas_positivas_combinadas += 1
        else:
            tecnicas_negativas_combinadas += 1

print(f"Técnicas positivas combinadas: {tecnicas_positivas_combinadas}")
print(f"Técnicas negativas combinadas: {tecnicas_negativas_combinadas}")
print(f"Total ataques combinados: {acciones_combinadas.count()}")

print()
print("¡La corrección debería mostrar valores mayores a 0 si hay AccionCombinada!")