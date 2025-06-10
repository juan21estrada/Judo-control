from rest_framework import serializers
from .models import Reporte, EstadisticaCompetidor
from competidores.serializers import CompetidorSerializer

class EstadisticaCompetidorSerializer(serializers.ModelSerializer):
    competidor_detalle = CompetidorSerializer(source='competidor', read_only=True)
    
    class Meta:
        model = EstadisticaCompetidor
        fields = ['id', 'competidor', 'competidor_detalle', 'reporte', 'total_combates', 
                  'combates_ganados', 'combates_perdidos', 'total_ataques_tashi_waza', 
                  'ataques_positivos', 'ataques_negativos', 'wazari', 'yuko', 'ippon', 
                  'ashi_waza', 'koshi_waza', 'kata_te_waza', 'sutemi_waza', 'combinaciones', 
                  'total_acciones_ne_waza', 'inmovilizaciones', 'luxaciones', 
                  'estrangulaciones', 'shido', 'hansokumake']

class ReporteSerializer(serializers.ModelSerializer):
    estadisticas = EstadisticaCompetidorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Reporte
        fields = ['id', 'titulo', 'tipo', 'fecha_creacion', 'fecha_inicio', 'fecha_fin', 
                  'competidores', 'competiciones', 'estadisticas']
        read_only_fields = ['fecha_creacion']