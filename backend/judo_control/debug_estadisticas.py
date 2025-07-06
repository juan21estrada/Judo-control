from combates.models import AccionCombinada, AccionTashiWaza, AccionNeWaza
from competidores.models import Competidor
from estadisticas.models import EstadisticaCompetidor, Reporte
from django.db.models import Q

print("=== DEBUG DE ESTADÍSTICAS ===")
print()

# Verificar datos en la base de datos
competidor = Competidor.objects.first()
print(f"Competidor: {competidor.nombre}")
print()

# Verificar AccionCombinada
acciones_combinadas = AccionCombinada.objects.filter(competidor=competidor)
print(f"Total AccionCombinada para {competidor.nombre}: {acciones_combinadas.count()}")

if acciones_combinadas.exists():
    print("\nDetalles de AccionCombinada:")
    for i, accion in enumerate(acciones_combinadas[:5], 1):
        print(f"  {i}. Efectiva: {accion.efectiva}, Puntuación: {accion.puntuacion}")
        
        # Verificar técnicas relacionadas
        tashi_relacionadas = AccionTashiWaza.objects.filter(accion_combinada=accion).count()
        ne_relacionadas = AccionNeWaza.objects.filter(accion_combinada=accion).count()
        print(f"     Tashi: {tashi_relacionadas}, Ne: {ne_relacionadas}")

print()
print("=== VERIFICAR REPORTES EXISTENTES ===")

# Verificar reportes existentes
reportes = Reporte.objects.all().order_by('-fecha_generacion')
print(f"Total reportes: {reportes.count()}")

if reportes.exists():
    ultimo_reporte = reportes.first()
    print(f"\nÚltimo reporte generado: {ultimo_reporte.fecha_generacion}")
    
    # Verificar estadísticas del último reporte
    estadisticas = EstadisticaCompetidor.objects.filter(reporte=ultimo_reporte, competidor=competidor)
    
    if estadisticas.exists():
        est = estadisticas.first()
        print(f"\nEstadísticas del último reporte para {competidor.nombre}:")
        print(f"  Ataques combinados: {est.ataques_combinados}")
        print(f"  Técnicas positivas combinadas: {est.tecnicas_positivas_combinadas}")
        print(f"  Técnicas negativas combinadas: {est.tecnicas_negativas_combinadas}")
    else:
        print(f"\nNo hay estadísticas para {competidor.nombre} en el último reporte")

print()
print("=== SIMULACIÓN DE CÁLCULO MANUAL ===")

# Simular el cálculo que debería hacer el código
tecnicas_positivas_combinadas = 0
tecnicas_negativas_combinadas = 0

for accion_combinada in acciones_combinadas:
    tashi_en_combinacion = AccionTashiWaza.objects.filter(accion_combinada=accion_combinada)
    ne_en_combinacion = AccionNeWaza.objects.filter(accion_combinada=accion_combinada)
    
    tecnicas_positivas_combinadas += tashi_en_combinacion.exclude(puntuacion='sin_puntuacion').count()
    tecnicas_negativas_combinadas += tashi_en_combinacion.filter(puntuacion='sin_puntuacion').count()
    tecnicas_positivas_combinadas += ne_en_combinacion.filter(efectiva=True).count()
    tecnicas_negativas_combinadas += ne_en_combinacion.filter(efectiva=False).count()
    
    # CORRECCIÓN: Si no hay técnicas individuales, contar la AccionCombinada directamente
    if tashi_en_combinacion.count() == 0 and ne_en_combinacion.count() == 0:
        if accion_combinada.efectiva or accion_combinada.puntuacion != 'sin_puntuacion':
            tecnicas_positivas_combinadas += 1
        else:
            tecnicas_negativas_combinadas += 1

print(f"Cálculo manual:")
print(f"  Técnicas positivas combinadas: {tecnicas_positivas_combinadas}")
print(f"  Técnicas negativas combinadas: {tecnicas_negativas_combinadas}")
print(f"  Total ataques combinados: {acciones_combinadas.count()}")