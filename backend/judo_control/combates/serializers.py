from rest_framework import serializers
from .models import Combate, AccionTashiWaza, AccionNeWaza, Amonestacion, AccionCombinada
from competidores.models import Competidor
from competidores.serializers import CompetidorSerializer
import re
from datetime import timedelta

class AccionTashiWazaSerializer(serializers.ModelSerializer):
    es_parte_combinacion = serializers.SerializerMethodField()
    
    class Meta:
        model = AccionTashiWaza
        exclude = ['combate', 'registrado_por']
    
    def get_es_parte_combinacion(self, obj):
        return obj.accion_combinada is not None
    
    def validate_competidor(self, value):
        """Validar que el competidor pertenece al combate"""
        combate = self.context.get('combate')
        if combate:
            # Manejar tanto objetos Competidor como IDs
            if hasattr(value, 'id'):
                competidor_id = value.id
            else:
                competidor_id = value
            
            if competidor_id not in [combate.competidor1.id, combate.competidor2.id]:
                raise serializers.ValidationError("El competidor no pertenece a este combate")
        return value
    
    def validate_puntuacion(self, value):
        """Validar puntuación según reglas IJF"""
        if value not in ['sin_puntuacion', 'yuko', 'waza_ari', 'ippon']:
            raise serializers.ValidationError("Puntuación inválida")
        return value
    
    def validate_tiempo(self, value):
        """Validar formato de tiempo"""
        if not value:
            raise serializers.ValidationError("El tiempo es requerido")
        return value

class AccionNeWazaSerializer(serializers.ModelSerializer):
    es_parte_combinacion = serializers.SerializerMethodField()
    
    class Meta:
        model = AccionNeWaza
        exclude = ['combate', 'registrado_por']
        extra_kwargs = {
            'accion_combinada': {'required': False, 'allow_null': True}
        }
    
    def get_es_parte_combinacion(self, obj):
        return obj.accion_combinada is not None
    
    def validate_competidor(self, value):
        """Validar que el competidor pertenece al combate"""
        combate = self.context.get('combate')
        if combate:
            # Manejar tanto objetos Competidor como IDs
            if hasattr(value, 'id'):
                competidor_id = value.id
            else:
                competidor_id = value
            
            if competidor_id not in [combate.competidor1.id, combate.competidor2.id]:
                raise serializers.ValidationError("El competidor no pertenece a este combate")
        return value
    
    def validate_tiempo_osaekomi(self, value):
        """Validar tiempo de osaekomi y asignar puntuación automática"""
        if self.initial_data.get('tipo') == 'osaekomi_waza':
            if not value or value < 1:
                raise serializers.ValidationError("Tiempo de osaekomi requerido para técnicas de control")
            if value > 30:
                raise serializers.ValidationError("Tiempo de osaekomi no puede exceder 30 segundos")
        return value
    
    def validate(self, data):
        """Validación cruzada para asignar puntuación automática en osaekomi"""
        if data.get('tipo') == 'osaekomi_waza' and 'tiempo_osaekomi' in data:
            tiempo = data['tiempo_osaekomi']
            if tiempo >= 20:
                data['puntuacion'] = 'waza_ari'
            elif tiempo >= 10:
                data['puntuacion'] = 'yuko'
            else:
                data['puntuacion'] = 'sin_puntuacion'
        return data

class AmonestacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amonestacion
        fields = ['id', 'combate', 'competidor', 'tipo', 'tiempo']
        read_only_fields = ['combate']
    
    def validate_competidor(self, value):
        """Validar que el competidor pertenece al combate"""
        combate = self.context.get('combate')
        if combate:
            # Manejar tanto objetos Competidor como IDs
            if hasattr(value, 'id'):
                competidor_id = value.id
            else:
                competidor_id = value
            
            if competidor_id not in [combate.competidor1.id, combate.competidor2.id]:
                raise serializers.ValidationError("El competidor no pertenece a este combate")
        return value
    
    def validate_tiempo(self, value):
        """Convertir tiempo de formato MM:SS a timedelta"""
        if isinstance(value, str):
            time_pattern = r'^(\d{1,2}):(\d{2})(?::(\d{2}))?$'
            match = re.match(time_pattern, value)
            if match:
                minutes = int(match.group(1))
                seconds = int(match.group(2))
                hours = int(match.group(3)) if match.group(3) else 0
                return timedelta(hours=hours, minutes=minutes, seconds=seconds)
            else:
                raise serializers.ValidationError("Formato de tiempo inválido. Use MM:SS o HH:MM:SS")
        return value
    
    def create(self, validated_data):
        return super().create(validated_data)

# MOVER AccionCombinadaSerializer ANTES de CombateSerializer
class AccionCombinadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccionCombinada
        exclude = ['combate', 'registrado_por']
    
    def validate_competidor(self, value):
        """Validar que el competidor pertenece al combate"""
        combate = self.context.get('combate')
        if combate:
            # Manejar tanto objetos Competidor como IDs
            if hasattr(value, 'id'):
                competidor_id = value.id
            else:
                competidor_id = value
            
            if competidor_id not in [combate.competidor1.id, combate.competidor2.id]:
                raise serializers.ValidationError("El competidor no pertenece a este combate")
        return value
    
    def validate_tiempo(self, value):
        """Validar formato de tiempo"""
        if not value:
            raise serializers.ValidationError("El tiempo es requerido")
        return value
    
    def validate_tecnicas(self, value):
        """Validar que hay al menos 2 técnicas en la combinación"""
        if not value or len(value) < 2:
            raise serializers.ValidationError("Una combinación debe tener al menos 2 técnicas")
        return value

class CombateSerializer(serializers.ModelSerializer):
    competidor1_nombre = serializers.CharField(source='competidor1.nombre', read_only=True)
    competidor2_nombre = serializers.CharField(source='competidor2.nombre', read_only=True)
    competicion_nombre = serializers.CharField(source='competicion.nombre', read_only=True)
    ganador_nombre = serializers.CharField(source='ganador.nombre', read_only=True)
    
    competidor1_detalle = CompetidorSerializer(source='competidor1', read_only=True)
    competidor2_detalle = CompetidorSerializer(source='competidor2', read_only=True)
    ganador_detalle = CompetidorSerializer(source='ganador', read_only=True)
    
    # INCLUIR TODAS las técnicas (individuales Y de combinaciones)
    acciones_tashi_waza = AccionTashiWazaSerializer(many=True, read_only=True)
    acciones_ne_waza = AccionNeWazaSerializer(many=True, read_only=True)
    amonestaciones = AmonestacionSerializer(many=True, read_only=True)
    acciones_combinadas = AccionCombinadaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Combate
        fields = ['id', 'competicion', 'competidor1', 'competidor2', 'duracion', 
                  'fecha_hora', 'finalizado', 'iniciado', 'ganador', 'registrado_por',
                  'competidor1_nombre', 'competidor2_nombre', 'competicion_nombre', 'ganador_nombre',
                  'competidor1_detalle', 'competidor2_detalle', 'ganador_detalle',
                  'acciones_tashi_waza', 'acciones_ne_waza', 'amonestaciones', 'acciones_combinadas']
        read_only_fields = ['fecha_hora', 'registrado_por']
    
    def validate(self, data):
        competidor1 = data.get('competidor1')
        competidor2 = data.get('competidor2')
        
        if competidor1 and competidor2:
            if competidor1.genero != competidor2.genero:
                raise serializers.ValidationError({
                    'competidor2': 'Los competidores deben ser del mismo género para poder enfrentarse'
                })
            
            if competidor1.id == competidor2.id:
                raise serializers.ValidationError({
                    'competidor2': 'Un competidor no puede enfrentarse a sí mismo'
                })
        
        return data
    
    def create(self, validated_data):
        validated_data['registrado_por'] = self.context['request'].user
        return super().create(validated_data)