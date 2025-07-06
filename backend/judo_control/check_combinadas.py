#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'judo_backend.settings')
django.setup()

from combates.models import AccionCombinada, AccionTashiWaza, AccionNeWaza
from competidores.models import Competidor

print("=== PROBLEMA IDENTIFICADO ===")
print("Las AccionCombinada existen pero las técnicas individuales no están relacionadas correctamente")
print()

print("=== VERIFICACIÓN DETALLADA ===")
for accion in AccionCombinada.objects.all()[:10]:  # Primeras 10
    print(f"AccionCombinada ID: {accion.id}")
    print(f"  Competidor: {accion.competidor.nombre}")
    print(f"  Descripción: {accion.descripcion}")
    print(f"  Puntuación: {accion.puntuacion}")
    print(f"  Efectiva: {accion.efectiva}")
    
    # Buscar acciones relacionadas
    tashi_relacionadas = AccionTashiWaza.objects.filter(accion_combinada=accion)
    ne_relacionadas = AccionNeWaza.objects.filter(accion_combinada=accion)
    
    print(f"  Tashi Waza relacionadas: {tashi_relacionadas.count()}")
    for tashi in tashi_relacionadas:
        print(f"    - Tashi ID {tashi.id}: {tashi.tecnica} ({tashi.puntuacion})")
    
    print(f"  Ne Waza relacionadas: {ne_relacionadas.count()}")
    for ne in ne_relacionadas:
        print(f"    - Ne ID {ne.id}: {ne.tecnica} (efectiva: {ne.efectiva})")
    
    print("---")

print("\n=== ANÁLISIS DEL PROBLEMA ===")
print("Si las AccionCombinada tienen puntuación/efectividad pero las técnicas individuales")
print("relacionadas están en 0, significa que:")
print("1. Las técnicas individuales no se están creando al registrar la combinación")
print("2. O no se están relacionando correctamente con la AccionCombinada")
print()
print("SOLUCIÓN: Las estadísticas deben contar también las AccionCombinada directamente,")
print("no solo las técnicas individuales relacionadas.")