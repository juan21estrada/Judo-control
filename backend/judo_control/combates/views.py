from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Combate, AccionTashiWaza, AccionNeWaza, Amonestacion, AccionCombinada
from .serializers import (
    CombateSerializer, AccionTashiWazaSerializer, 
    AccionNeWazaSerializer, AmonestacionSerializer, AccionCombinadaSerializer
)
from usuarios.views import EsEntrenador
from competiciones.models import Competicion
from datetime import timedelta
import re

class CombateViewSet(viewsets.ModelViewSet):
    queryset = Combate.objects.all()
    serializer_class = CombateSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por competición si se proporciona el parámetro
        competicion_id = self.request.query_params.get('competicion')
        if competicion_id:
            queryset = queryset.filter(competicion_id=competicion_id)
        
        # Filtrar por estado finalizado si se proporciona el parámetro
        finalizado = self.request.query_params.get('finalizado')
        if finalizado is not None:
            # Convertir string a boolean
            is_finalizado = finalizado.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(finalizado=is_finalizado)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 
                          'registrar_accion_tashi_waza', 'registrar_accion_ne_waza', 
                          'registrar_amonestacion', 'finalizar_combate', 'iniciar_combate',
                          'registrar_accion_combinada']:
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)
    
    @action(detail=True, methods=['post'])
    def iniciar_combate(self, request, pk=None):
        combate = self.get_object()
        
        if combate.finalizado:
            return Response(
                {'error': 'No se puede iniciar un combate finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if combate.iniciado:
            return Response(
                {'error': 'El combate ya está iniciado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        combate.iniciado = True
        combate.save()
        
        return Response({'message': 'Combate iniciado correctamente'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    @action(detail=True, methods=['post'])
    def registrar_accion_combinada(self, request, pk=None):
        combate = self.get_object()
        
        # VERIFICACIÓN CRÍTICA: Combate finalizado
        if combate.finalizado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not combate.iniciado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate no iniciado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        acciones = request.data.get('acciones', [])
        competidor_id = request.data.get('competidor')
        tiempo = request.data.get('tiempo')
        observaciones = request.data.get('observaciones', '')
        resultado_final = request.data.get('resultado_final', 'sin_puntuacion')
        
        if not acciones:
            return Response(
                {'error': 'No se proporcionaron acciones para la combinación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear la acción combinada principal
        categorias_usadas = []
        tecnicas_detalle = []
        tecnicas_efectivas = 0
        tecnicas_fallidas = 0
        
        for accion in acciones:
            categoria = accion.get('categoria', '')
            tecnica = accion.get('tecnica', '')
            efectiva = accion.get('efectiva', True)
            puntuacion = accion.get('puntuacion', 'sin_puntuacion')
            
            if categoria and categoria not in categorias_usadas:
                categorias_usadas.append(categoria)
            
            if tecnica:
                tecnicas_detalle.append(tecnica)
                
            if efectiva and puntuacion != 'sin_puntuacion':
                tecnicas_efectivas += 1
            else:
                tecnicas_fallidas += 1
        
        # Mapas para generar descripción
        codigos_map = {
            'ashi_waza': 'A', 'koshi_waza': 'K', 'kata_te_waza': 'KTW',
            'ma_sutemi_waza': 'MS', 'yoko_sutemi_waza': 'YS',
            'osaekomi_waza': 'O', 'shime_waza': 'S', 'kansetsu_waza': 'KN'
        }
        
        nombres_map = {
            'ashi_waza': 'Ashi waza', 'koshi_waza': 'Koshi waza', 'kata_te_waza': 'Kata waza',
            'ma_sutemi_waza': 'Ma sutemi waza', 'yoko_sutemi_waza': 'Yoko sutemi waza',
            'osaekomi_waza': 'Osaekomi waza', 'shime_waza': 'Shime waza', 'kansetsu_waza': 'Kansetsu waza'
        }
        
        if not categorias_usadas:
            return Response(
                {'error': 'No se encontraron categorías válidas en las acciones'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nombres_categorias = [nombres_map.get(cat, cat) for cat in categorias_usadas]
        codigos_categorias = [codigos_map.get(cat, cat[:2].upper()) for cat in categorias_usadas]
        
        descripcion_formato = f"{' - '.join(nombres_categorias)} ({'-'.join(codigos_categorias)})"
        descripcion_detallada = f"Técnicas: {', '.join(tecnicas_detalle)} | Efectivas: {tecnicas_efectivas}/{len(acciones)}"
        
        efectiva_combinacion = resultado_final != 'sin_puntuacion'
        
        accion_combinada_data = {
            'competidor': competidor_id,
            'descripcion': descripcion_formato,
            'descripcion_detallada': descripcion_detallada,
            'tiempo': tiempo,
            'efectiva': efectiva_combinacion,
            'puntuacion': resultado_final
        }
        
        # Agregar contexto del combate al serializer
        accion_combinada_serializer = AccionCombinadaSerializer(
            data=accion_combinada_data, 
            context={'combate': combate}
        )
        
        if accion_combinada_serializer.is_valid():
            accion_combinada = accion_combinada_serializer.save(
                combate=combate, 
                registrado_por=request.user
            )
            
            # Registrar técnicas individuales manteniendo sus puntuaciones reales
            acciones_tashi = request.data.get('acciones_tashi', [])
            acciones_ne = request.data.get('acciones_ne', [])
            
            acciones_registradas = []
            
            # Registrar acciones Tashi Waza
            for accion_data in acciones_tashi:
                accion_data['accion_combinada'] = accion_combinada.id
                # MANTENER la puntuación original, no forzar 'sin_puntuacion'
                # accion_data['puntuacion'] = accion_data.get('puntuacion', 'sin_puntuacion')
                
                serializer = AccionTashiWazaSerializer(
                    data=accion_data, 
                    context={'combate': combate}
                )
                if serializer.is_valid():
                    accion = serializer.save(
                        combate=combate, 
                        registrado_por=request.user,
                        accion_combinada=accion_combinada
                    )
                    acciones_registradas.append(serializer.data)
                else:
                    print(f"Error en Tashi Waza: {serializer.errors}")
            
            # Registrar acciones Ne Waza
            for accion_data in acciones_ne:
                accion_data['accion_combinada'] = accion_combinada.id
                # MANTENER la puntuación original, no forzar 'sin_puntuacion'
                # accion_data['puntuacion'] = accion_data.get('puntuacion', 'sin_puntuacion')
                
                serializer = AccionNeWazaSerializer(
                    data=accion_data, 
                    context={'combate': combate}
                )
                if serializer.is_valid():
                    accion = serializer.save(
                        combate=combate, 
                        registrado_por=request.user,
                        accion_combinada=accion_combinada
                    )
                    acciones_registradas.append(serializer.data)
                else:
                    print(f"Error en Ne Waza: {serializer.errors}")
            
            # Verificar finalización automática
            resultado_finalizacion = combate.verificar_finalizacion_automatica()
            
            # Calcular puntuaciones actualizadas
            puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
            puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
            
            response_data = {
                'accion_combinada': accion_combinada_serializer.data,
                'acciones': acciones_registradas,
                'combate_finalizado': combate.finalizado,
                'ganador': combate.ganador.id if combate.ganador else None,
                'ganador_nombre': combate.ganador.nombre if combate.ganador else None,
                'puntuaciones': {
                    'competidor1': {
                        'id': combate.competidor1.id,
                        'nombre': combate.competidor1.nombre,
                        'puntuacion': puntuacion_c1
                    },
                    'competidor2': {
                        'id': combate.competidor2.id,
                        'nombre': combate.competidor2.nombre,
                        'puntuacion': puntuacion_c2
                    }
                },
                'estadisticas': {
                    'tecnicas_totales': len(acciones),
                    'tecnicas_efectivas': tecnicas_efectivas,
                    'tecnicas_fallidas': tecnicas_fallidas,
                    'resultado_combinacion': resultado_final
                }
            }
            
            if resultado_finalizacion:
                response_data.update({
                    'motivo_victoria': resultado_finalizacion['motivo'],
                    'puntuacion_final': {
                        'ganador': resultado_finalizacion['puntuacion_ganador'],
                        'perdedor': resultado_finalizacion['puntuacion_perdedor']
                    }
                })
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(accion_combinada_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def registrar_accion_tashi_waza(self, request, pk=None):
        combate = self.get_object()
        
        if combate.finalizado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not combate.iniciado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate no iniciado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Agregar contexto del combate al serializer
        serializer = AccionTashiWazaSerializer(data=request.data, context={'combate': combate})
        if serializer.is_valid():
            accion = serializer.save(combate=combate, registrado_por=request.user)
            
            # Verificar finalización automática
            resultado_combate = combate.verificar_finalizacion_automatica()
            
            # Calcular puntuaciones actualizadas
            puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
            puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
            
            response_data = {
                'accion': AccionTashiWazaSerializer(accion).data,
                'ganador': combate.ganador.id if combate.ganador else None,
                'combate_finalizado': combate.finalizado,
                'puntuaciones': {
                    'competidor1': {
                        'id': combate.competidor1.id,
                        'nombre': combate.competidor1.nombre,
                        'puntuacion': puntuacion_c1,
                        'ippon': puntuacion_c1.get('ippon', 0),
                        'waza_ari': puntuacion_c1.get('waza_ari', 0),
                        'shidos': puntuacion_c1.get('shidos', 0)
                    },
                    'competidor2': {
                        'id': combate.competidor2.id,
                        'nombre': combate.competidor2.nombre,
                        'puntuacion': puntuacion_c2,
                        'ippon': puntuacion_c2.get('ippon', 0),
                        'waza_ari': puntuacion_c2.get('waza_ari', 0),
                        'shidos': puntuacion_c2.get('shidos', 0)
                    }
                },
                'resultado_combate': resultado_combate,
                'mensaje': f"Técnica registrada: {accion.get_puntuacion_display()}"
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Datos inválidos',
            'detalles': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def registrar_accion_ne_waza(self, request, pk=None):
        combate = self.get_object()
        
        if combate.finalizado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not combate.iniciado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate no iniciado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Agregar contexto del combate al serializer
        serializer = AccionNeWazaSerializer(data=request.data, context={'combate': combate})
        if serializer.is_valid():
            accion = serializer.save(combate=combate, registrado_por=request.user)
            
            # Verificar finalización automática
            resultado_combate = combate.verificar_finalizacion_automatica()
            
            # Calcular puntuaciones actualizadas
            puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
            puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
            
            response_data = {
                'accion': AccionNeWazaSerializer(accion).data,
                'ganador': combate.ganador.id if combate.ganador else None,
                'combate_finalizado': combate.finalizado,
                'puntuaciones': {
                    'competidor1': {
                        'id': combate.competidor1.id,
                        'nombre': combate.competidor1.nombre,
                        'puntuacion': puntuacion_c1,
                        'ippon': puntuacion_c1.get('ippon', 0),
                        'waza_ari': puntuacion_c1.get('waza_ari', 0),
                        'shidos': puntuacion_c1.get('shidos', 0)
                    },
                    'competidor2': {
                        'id': combate.competidor2.id,
                        'nombre': combate.competidor2.nombre,
                        'puntuacion': puntuacion_c2,
                        'ippon': puntuacion_c2.get('ippon', 0),
                        'waza_ari': puntuacion_c2.get('waza_ari', 0),
                        'shidos': puntuacion_c2.get('shidos', 0)
                    }
                },
                'resultado_combate': resultado_combate,
                'mensaje': f"Técnica registrada: {accion.get_puntuacion_display()}"
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Datos inválidos',
            'detalles': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def registrar_amonestacion(self, request, pk=None):
        combate = self.get_object()
        
        if combate.finalizado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not combate.iniciado:
            return Response(
                {'error': 'No se pueden registrar acciones en un combate no iniciado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AmonestacionSerializer(data=request.data)
        if serializer.is_valid():
            amonestacion = serializer.save(combate=combate, registrado_por=request.user)
            
            resultado_combate = combate.verificar_finalizacion_automatica()
            
            puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
            puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
            
            response_data = {
                'amonestacion': AmonestacionSerializer(amonestacion).data,
                'ganador': combate.ganador.id if combate.ganador else None,
                'combate_finalizado': combate.finalizado,
                'puntuaciones': {
                    'competidor1': {
                        'id': combate.competidor1.id,
                        'nombre': combate.competidor1.nombre,
                        'puntuacion': puntuacion_c1
                    },
                    'competidor2': {
                        'id': combate.competidor2.id,
                        'nombre': combate.competidor2.nombre,
                        'puntuacion': puntuacion_c2
                    }
                },
                'resultado_combate': resultado_combate
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def finalizar_combate(self, request, pk=None):
        combate = self.get_object()
        
        if combate.finalizado:
            return Response(
                {'error': 'El combate ya está finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ganador_id = request.data.get('ganador')
        duracion_str = request.data.get('duracion')
        
        if not duracion_str:
            return Response(
                {'error': 'Se requiere la duración del combate'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            time_parts = duracion_str.split(':')
            if len(time_parts) == 2:
                minutes, seconds = map(int, time_parts)
                duracion = timedelta(minutes=minutes, seconds=seconds)
            elif len(time_parts) == 3:
                hours, minutes, seconds = map(int, time_parts)
                duracion = timedelta(hours=hours, minutes=minutes, seconds=seconds)
            else:
                raise ValueError("Formato de duración inválido")
        except (ValueError, TypeError):
            return Response(
                {'error': 'Formato de duración inválido. Use HH:MM:SS o MM:SS'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        combate.finalizado = True
        combate.duracion = duracion
        
        if ganador_id:
            try:
                from competidores.models import Competidor
                ganador = Competidor.objects.get(id=ganador_id)
                if ganador.id not in [combate.competidor1.id, combate.competidor2.id]:
                    return Response(
                        {'error': 'El ganador debe ser uno de los competidores del combate'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                combate.ganador = ganador
            except Competidor.DoesNotExist:
                return Response(
                    {'error': 'Competidor no encontrado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        combate.save()
        
        return Response(
            {'message': 'Combate finalizado correctamente'},
            status=status.HTTP_200_OK
        )

class AccionTashiWazaViewSet(viewsets.ModelViewSet):
    queryset = AccionTashiWaza.objects.all()
    serializer_class = AccionTashiWazaSerializer
    permission_classes = [EsEntrenador]

class AccionNeWazaViewSet(viewsets.ModelViewSet):
    queryset = AccionNeWaza.objects.all()
    serializer_class = AccionNeWazaSerializer
    permission_classes = [EsEntrenador]

class AmonestacionViewSet(viewsets.ModelViewSet):
    queryset = Amonestacion.objects.all()
    serializer_class = AmonestacionSerializer
    permission_classes = [EsEntrenador]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_accion_tashi_waza(request, combate_id):
    try:
        combate = Combate.objects.get(id=combate_id)
        
        if combate.finalizado:
            return Response({'error': 'El combate ya ha finalizado'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not combate.iniciado:
            return Response({'error': 'El combate no ha iniciado'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AccionTashiWazaSerializer(data=request.data)
        if serializer.is_valid():
            accion = serializer.save(combate=combate, registrado_por=request.user)
            
            ganador = combate.actualizar_ganador()
            
            response_data = {
                'accion': AccionTashiWazaSerializer(accion).data,
                'ganador': ganador.id if ganador else None,
                'combate_finalizado': combate.finalizado
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Combate.DoesNotExist:
        return Response({'error': 'Combate no encontrado'}, status=status.HTTP_404_NOT_FOUND)

# Agregar este método a la clase CombateViewSet
@action(detail=True, methods=['get'])
def estadisticas(self, request, pk=None):
    """Obtener estadísticas del combate en tiempo real"""
    combate = self.get_object()
    
    puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
    puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
    
    return Response({
        'combate_id': combate.id,
        'estado': 'iniciado' if combate.iniciado and not combate.finalizado else 'finalizado' if combate.finalizado else 'no_iniciado',
        'puntuaciones': {
            'competidor1': {
                'id': combate.competidor1.id,
                'nombre': combate.competidor1.nombre,
                'puntuacion': puntuacion_c1
            },
            'competidor2': {
                'id': combate.competidor2.id,
                'nombre': combate.competidor2.nombre,
                'puntuacion': puntuacion_c2
            }
        },
        'duracion': str(combate.duracion) if combate.duracion else None,
        'ganador': combate.ganador.id if combate.ganador else None
    })

@action(detail=True, methods=['get'])
def puntuaciones(self, request, pk=None):
    """Obtener puntuaciones calculadas del combate"""
    combate = self.get_object()
    
    puntuacion_c1 = combate.calcular_puntuacion_competidor(combate.competidor1.id)
    puntuacion_c2 = combate.calcular_puntuacion_competidor(combate.competidor2.id)
    
    return Response({
        'competidor1': puntuacion_c1,
        'competidor2': puntuacion_c2
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_puntuaciones_combate(request, combate_id):
    """
    Endpoint para obtener las puntuaciones calculadas de un combate específico.
    Calcula las puntuaciones según las reglas IJF basándose en las técnicas registradas.
    """
    try:
        combate = Combate.objects.get(id=combate_id)
        
        # Obtener todas las acciones del combate
        acciones_tashi_a = AccionTashiWaza.objects.filter(
            combate=combate, 
            competidor=combate.competidor_a
        )
        acciones_tashi_b = AccionTashiWaza.objects.filter(
            combate=combate, 
            competidor=combate.competidor_b
        )
        
        acciones_ne_a = AccionNeWaza.objects.filter(
            combate=combate, 
            competidor=combate.competidor_a
        )
        acciones_ne_b = AccionNeWaza.objects.filter(
            combate=combate, 
            competidor=combate.competidor_b
        )
        
        # Obtener técnicas de combinaciones
        acciones_combi_a = []
        acciones_combi_b = []
        
        for combinacion in combate.acciones_combinadas.all():
            for accion in combinacion.acciones.all():
                if accion.competidor == combate.competidor_a:
                    acciones_combi_a.append(accion)
                else:
                    acciones_combi_b.append(accion)
        
        # Calcular puntuaciones para competidor A
        puntuacion_a = calcular_puntuacion_ijf(
            list(acciones_tashi_a) + list(acciones_ne_a) + acciones_combi_a
        )
        
        # Calcular puntuaciones para competidor B
        puntuacion_b = calcular_puntuacion_ijf(
            list(acciones_tashi_b) + list(acciones_ne_b) + acciones_combi_b
        )
        
        return Response({
            'competidor_a': puntuacion_a,
            'competidor_b': puntuacion_b
        })
        
    except Combate.DoesNotExist:
        return Response(
            {'error': 'Combate no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def calcular_puntuacion_ijf(acciones):
    """
    Calcula la puntuación según las reglas IJF.
    Retorna un diccionario con ippon, waza_ari y yuko.
    """
    puntuacion = {'ippon': 0, 'waza_ari': 0, 'yuko': 0}
    
    for accion in acciones:
        if hasattr(accion, 'puntuacion') and accion.puntuacion:
            if accion.puntuacion == 'ippon':
                puntuacion['ippon'] = 1
                # Un ippon termina el combate, no se cuentan otras puntuaciones
                puntuacion['waza_ari'] = 0
                puntuacion['yuko'] = 0
                break
            elif accion.puntuacion == 'waza_ari':
                puntuacion['waza_ari'] += 1
                # Dos waza-ari equivalen a un ippon
                if puntuacion['waza_ari'] >= 2:
                    puntuacion['ippon'] = 1
                    puntuacion['waza_ari'] = 0
                    puntuacion['yuko'] = 0
                    break
            elif accion.puntuacion == 'yuko':
                puntuacion['yuko'] += 1
    
    return puntuacion