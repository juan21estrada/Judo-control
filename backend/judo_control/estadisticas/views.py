from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, F, Q
from .models import Reporte, EstadisticaCompetidor
from .serializers import ReporteSerializer, EstadisticaCompetidorSerializer
from usuarios.views import EsEntrenador
from competidores.models import Competidor
from competidores.serializers import CompetidorSerializer
from combates.models import Combate, AccionTashiWaza, AccionNeWaza, Amonestacion, AccionCombinada
from competiciones.models import Competicion
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from rest_framework.decorators import action
from rest_framework.response import Response
import io
from datetime import datetime

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'generar_estadisticas']:
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def generar_estadisticas(self, request, pk=None):
        reporte = self.get_object()
        
        # Eliminar estadísticas existentes para este reporte
        EstadisticaCompetidor.objects.filter(reporte=reporte).delete()
        
        for competidor in reporte.competidores.all():
            # Filtrar combates por período y competiciones si se especifican
            combates_query = Combate.objects.filter(
                Q(competidor1=competidor) | Q(competidor2=competidor),
                fecha_hora__date__gte=reporte.fecha_inicio,
                fecha_hora__date__lte=reporte.fecha_fin,
                finalizado=True
            )
            
            if reporte.competiciones.exists():
                combates_query = combates_query.filter(competicion__in=reporte.competiciones.all())
            
            # Contar combates
            total_combates = combates_query.count()
            combates_ganados = combates_query.filter(ganador=competidor).count()
            
            # NUEVAS ESTADÍSTICAS DE ATAQUES COMBINADOS
            acciones_combinadas = AccionCombinada.objects.filter(
                competidor=competidor,
                combate__in=combates_query
            )
            
            total_ataques_combinados = acciones_combinadas.count()
            
            # AGREGAR: Contar puntuaciones de acciones combinadas
            acciones_combinadas_ippon = acciones_combinadas.filter(puntuacion='ippon').count()
            acciones_combinadas_waza_ari = acciones_combinadas.filter(puntuacion='waza_ari').count()
            
            # Técnicas positivas y negativas en combinaciones
            # CORREGIDO: Contar las AccionCombinada directamente según su efectividad
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
            
            # Acciones Tashi Waza
            acciones_tashi = AccionTashiWaza.objects.filter(
                competidor=competidor,
                combate__in=combates_query
            )
            
            total_ataques_tashi = acciones_tashi.count()
            ataques_positivos = acciones_tashi.exclude(puntuacion='sin_puntuacion').count() + tecnicas_positivas_combinadas
            ataques_negativos = acciones_tashi.filter(puntuacion='sin_puntuacion').count() + tecnicas_negativas_combinadas
            
            wazari = acciones_tashi.filter(puntuacion='waza_ari').count()
            ippon = acciones_tashi.filter(puntuacion='ippon').count()
            
            ashi_waza = acciones_tashi.filter(tipo='ashi_waza').count()
            koshi_waza = acciones_tashi.filter(tipo='koshi_waza').count()
            kata_te_waza = acciones_tashi.filter(tipo='te_waza').count()
            sutemi_waza = acciones_tashi.filter(Q(tipo='ma_sutemi_waza') | Q(tipo='yoko_sutemi_waza')).count()
            
            combinaciones_tashi = acciones_tashi.filter(accion_combinada__isnull=False).count()
            
            # MODIFICAR: Incluir puntuaciones de acciones combinadas en los totales
            ippon_total = ippon + acciones_combinadas_ippon
            waza_ari_total = wazari + acciones_combinadas_waza_ari
            
            # Acciones Ne Waza
            acciones_ne = AccionNeWaza.objects.filter(
                competidor=competidor,
                combate__in=combates_query
            )
            
            total_acciones_ne = acciones_ne.count()
            inmovilizaciones = acciones_ne.filter(tipo='osaekomi_waza').count()
            luxaciones = acciones_ne.filter(tipo='kansetsu_waza').count()
            estrangulaciones = acciones_ne.filter(tipo='shime_waza').count()
            
            combinaciones_ne = acciones_ne.filter(accion_combinada__isnull=False).count()
            
            # Amonestaciones
            amonestaciones = Amonestacion.objects.filter(
                competidor=competidor,
                combate__in=combates_query
            )
            
            shido = amonestaciones.filter(tipo='shido').count()
            hansokumake = amonestaciones.filter(tipo='hansokumake').count()
            
            # Crear estadística con los nuevos campos
            estadistica = EstadisticaCompetidor.objects.create(
                reporte=reporte,
                competidor=competidor,
                total_combates=total_combates,
                combates_ganados=combates_ganados,
                combates_perdidos=total_combates - combates_ganados,
                total_ataques_tashi_waza=total_ataques_tashi,
                ataques_positivos=ataques_positivos,
                ataques_negativos=ataques_negativos,
                wazari=waza_ari_total,  # CAMBIO: Incluir waza-aris de acciones combinadas
                yuko=0,
                ippon=ippon_total,  # CAMBIO: Incluir ippons de acciones combinadas
                ashi_waza=ashi_waza,
                koshi_waza=koshi_waza,
                kata_te_waza=kata_te_waza,
                sutemi_waza=sutemi_waza,
                combinaciones=combinaciones_tashi + combinaciones_ne,
                ataques_combinados=total_ataques_combinados,
                tecnicas_positivas_combinadas=tecnicas_positivas_combinadas,
                tecnicas_negativas_combinadas=tecnicas_negativas_combinadas,
                total_acciones_ne_waza=total_acciones_ne,
                inmovilizaciones=inmovilizaciones,
                luxaciones=luxaciones,
                estrangulaciones=estrangulaciones,
                shido=shido,
                hansokumake=hansokumake
            )
        
        serializer = self.get_serializer(reporte)
        return Response(serializer.data)

class EstadisticaCompetidorViewSet(viewsets.ModelViewSet):
    queryset = EstadisticaCompetidor.objects.all()
    serializer_class = EstadisticaCompetidorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Si el usuario es un competidor, solo puede ver sus propias estadísticas
        if self.request.user.is_authenticated and hasattr(self.request.user, 'rol') and self.request.user.rol == 'competidor':
            try:
                competidor = Competidor.objects.get(usuario=self.request.user)
                queryset = queryset.filter(competidor=competidor)
            except Competidor.DoesNotExist:
                queryset = EstadisticaCompetidor.objects.none()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        # Verificar si el usuario competidor existe
        if request.user.rol == 'competidor':
            try:
                Competidor.objects.get(usuario=request.user)
            except Competidor.DoesNotExist:
                return Response({
                    'results': [],
                    'message': 'No se encontró un perfil de competidor para este usuario.'
                }, status=200)
        
        return super().list(request, *args, **kwargs)
    
    def get_permissions(self):
        """Configurar permisos según la acción"""
        if self.action in ['create', 'destroy']:
            self.permission_classes = [permissions.IsAdminUser]
        elif self.action in ['update', 'partial_update']:
            # Solo entrenadores y administradores pueden editar observaciones y recomendaciones
            self.permission_classes = [EsEntrenador]
        elif self.action == 'detalles_combinaciones':
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
    
    def update(self, request, *args, **kwargs):
        """Solo permitir actualización de observaciones y recomendaciones"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Solo permitir actualizar observaciones y recomendaciones
        allowed_fields = ['observaciones', 'recomendaciones']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(instance, data=filtered_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Permitir actualización parcial"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def detalles_combinaciones(self, request, pk=None):
        """Obtener detalles específicos de las acciones combinadas de un competidor"""
        estadistica = self.get_object()
        competidor = estadistica.competidor
        
        # Obtener todas las acciones combinadas del competidor
        acciones_combinadas = AccionCombinada.objects.filter(
            competidor=competidor
        ).select_related('combate', 'registrado_por')
        
        detalles_combinaciones = []
        
        for accion_combinada in acciones_combinadas:
            # Obtener técnicas Tashi Waza relacionadas
            tashi_relacionadas = AccionTashiWaza.objects.filter(
                accion_combinada=accion_combinada
            ).values('tecnica', 'efectiva', 'puntuacion')
            
            # Obtener técnicas Ne Waza relacionadas
            ne_relacionadas = AccionNeWaza.objects.filter(
                accion_combinada=accion_combinada
            ).values('tecnica', 'efectiva', 'puntuacion')
            
            # Clasificar técnicas por efectividad
            tecnicas_efectivas = []
            tecnicas_no_efectivas = []
            
            # Procesar técnicas Tashi Waza
            for tecnica in tashi_relacionadas:
                tecnica_info = {
                    'tipo': 'Tashi Waza',
                    'tecnica': tecnica['tecnica'],
                    'puntuacion': tecnica['puntuacion']
                }
                if tecnica['puntuacion'] != 'sin_puntuacion':
                    tecnicas_efectivas.append(tecnica_info)
                else:
                    tecnicas_no_efectivas.append(tecnica_info)
            
            # Procesar técnicas Ne Waza
            for tecnica in ne_relacionadas:
                tecnica_info = {
                    'tipo': 'Ne Waza',
                    'tecnica': tecnica['tecnica'],
                    'puntuacion': tecnica['puntuacion']
                }
                if tecnica['efectiva']:
                    tecnicas_efectivas.append(tecnica_info)
                else:
                    tecnicas_no_efectivas.append(tecnica_info)
            
            # Si no hay técnicas individuales, considerar la acción combinada directamente
            if not tashi_relacionadas and not ne_relacionadas:
                if accion_combinada.efectiva or accion_combinada.puntuacion != 'sin_puntuacion':
                    tecnicas_efectivas.append({
                        'tipo': 'Combinación Directa',
                        'tecnica': accion_combinada.descripcion,
                        'puntuacion': accion_combinada.puntuacion
                    })
                else:
                    tecnicas_no_efectivas.append({
                        'tipo': 'Combinación Directa',
                        'tecnica': accion_combinada.descripcion,
                        'puntuacion': accion_combinada.puntuacion
                    })
            
            detalles_combinaciones.append({
                'id': accion_combinada.id,
                'descripcion': accion_combinada.descripcion,
                'descripcion_detallada': accion_combinada.descripcion_detallada,
                'efectiva': accion_combinada.efectiva,
                'puntuacion': accion_combinada.puntuacion,
                'tiempo': str(accion_combinada.tiempo),
                'combate_id': accion_combinada.combate.id,
                'tecnicas_efectivas': tecnicas_efectivas,
                'tecnicas_no_efectivas': tecnicas_no_efectivas,
                'total_tecnicas': len(tecnicas_efectivas) + len(tecnicas_no_efectivas)
            })
        
        # Resumen estadístico
        total_combinaciones = len(detalles_combinaciones)
        combinaciones_efectivas = sum(1 for c in detalles_combinaciones if c['efectiva'])
        combinaciones_no_efectivas = total_combinaciones - combinaciones_efectivas
        
        # Contar tipos de técnicas en combinaciones
        total_tecnicas_tashi = sum(len([t for t in c['tecnicas_efectivas'] + c['tecnicas_no_efectivas'] if t['tipo'] == 'Tashi Waza']) for c in detalles_combinaciones)
        total_tecnicas_ne = sum(len([t for t in c['tecnicas_efectivas'] + c['tecnicas_no_efectivas'] if t['tipo'] == 'Ne Waza']) for c in detalles_combinaciones)
        total_combinaciones_directas = sum(len([t for t in c['tecnicas_efectivas'] + c['tecnicas_no_efectivas'] if t['tipo'] == 'Combinación Directa']) for c in detalles_combinaciones)
        
        # Técnicas efectivas vs no efectivas por tipo
        tecnicas_tashi_efectivas = sum(len([t for t in c['tecnicas_efectivas'] if t['tipo'] == 'Tashi Waza']) for c in detalles_combinaciones)
        tecnicas_ne_efectivas = sum(len([t for t in c['tecnicas_efectivas'] if t['tipo'] == 'Ne Waza']) for c in detalles_combinaciones)
        combinaciones_directas_efectivas = sum(len([t for t in c['tecnicas_efectivas'] if t['tipo'] == 'Combinación Directa']) for c in detalles_combinaciones)
        
        tecnicas_tashi_no_efectivas = sum(len([t for t in c['tecnicas_no_efectivas'] if t['tipo'] == 'Tashi Waza']) for c in detalles_combinaciones)
        tecnicas_ne_no_efectivas = sum(len([t for t in c['tecnicas_no_efectivas'] if t['tipo'] == 'Ne Waza']) for c in detalles_combinaciones)
        combinaciones_directas_no_efectivas = sum(len([t for t in c['tecnicas_no_efectivas'] if t['tipo'] == 'Combinación Directa']) for c in detalles_combinaciones)
        
        return Response({
            'resumen': {
                'total_combinaciones': total_combinaciones,
                'combinaciones_efectivas': combinaciones_efectivas,
                'combinaciones_no_efectivas': combinaciones_no_efectivas,
                'porcentaje_efectividad': round((combinaciones_efectivas / total_combinaciones * 100) if total_combinaciones > 0 else 0, 1),
                'tipos_tecnicas': {
                    'tashi_waza': {
                        'total': total_tecnicas_tashi,
                        'efectivas': tecnicas_tashi_efectivas,
                        'no_efectivas': tecnicas_tashi_no_efectivas
                    },
                    'ne_waza': {
                        'total': total_tecnicas_ne,
                        'efectivas': tecnicas_ne_efectivas,
                        'no_efectivas': tecnicas_ne_no_efectivas
                    },
                    'combinaciones_directas': {
                        'total': total_combinaciones_directas,
                        'efectivas': combinaciones_directas_efectivas,
                        'no_efectivas': combinaciones_directas_no_efectivas
                    }
                }
            },
            'detalles': detalles_combinaciones
        })
    
    @action(detail=False, methods=['get'])
    def generales(self, request):
        """Endpoint para obtener estadísticas generales del sistema"""
        try:
            # Contar totales básicos
            total_competidores = Competidor.objects.count()
            total_competiciones = Competicion.objects.count()
            total_combates = Combate.objects.filter(finalizado=True).count()
            total_reportes = Reporte.objects.count()
            
            # Estadísticas de técnicas Tashi Waza
            total_acciones_tashi = AccionTashiWaza.objects.count()
            tecnicas_acertadas_tashi = AccionTashiWaza.objects.exclude(puntuacion='sin_puntuacion').count()
            tecnicas_fallidas_tashi = AccionTashiWaza.objects.filter(puntuacion='sin_puntuacion').count()
            
            # Estadísticas de técnicas Ne Waza
            total_acciones_ne = AccionNeWaza.objects.count()
            tecnicas_acertadas_ne = AccionNeWaza.objects.filter(efectiva=True).count()
            tecnicas_fallidas_ne = AccionNeWaza.objects.filter(efectiva=False).count()
            
            # Estadísticas de combinaciones
            total_combinaciones = AccionCombinada.objects.count()
            combinaciones_efectivas = AccionCombinada.objects.filter(efectiva=True).count()
            combinaciones_fallidas = AccionCombinada.objects.filter(efectiva=False).count()
            
            # Técnicas en combinaciones
            tecnicas_en_combinaciones_tashi = AccionTashiWaza.objects.filter(accion_combinada__isnull=False).count()
            tecnicas_en_combinaciones_ne = AccionNeWaza.objects.filter(accion_combinada__isnull=False).count()
            
            # Técnicas acertadas y fallidas en combinaciones
            tecnicas_acertadas_combinaciones = (
                AccionTashiWaza.objects.filter(
                    accion_combinada__isnull=False
                ).exclude(puntuacion='sin_puntuacion').count() +
                AccionNeWaza.objects.filter(
                    accion_combinada__isnull=False,
                    efectiva=True
                ).count()
            )
            
            tecnicas_fallidas_combinaciones = (
                AccionTashiWaza.objects.filter(
                    accion_combinada__isnull=False,
                    puntuacion='sin_puntuacion'
                ).count() +
                AccionNeWaza.objects.filter(
                    accion_combinada__isnull=False,
                    efectiva=False
                ).count()
            )
            
            # Estadísticas por tipo de técnica Tashi Waza
            ashi_waza_total = AccionTashiWaza.objects.filter(tipo='ashi_waza').count()
            koshi_waza_total = AccionTashiWaza.objects.filter(tipo='koshi_waza').count()
            te_waza_total = AccionTashiWaza.objects.filter(tipo='te_waza').count()
            sutemi_waza_total = AccionTashiWaza.objects.filter(
                Q(tipo='ma_sutemi_waza') | Q(tipo='yoko_sutemi_waza')
            ).count()
            
            # Estadísticas por tipo de técnica Ne Waza
            osaekomi_total = AccionNeWaza.objects.filter(tipo='osaekomi_waza').count()
            shime_total = AccionNeWaza.objects.filter(tipo='shime_waza').count()
            kansetsu_total = AccionNeWaza.objects.filter(tipo='kansetsu_waza').count()
            
            # Puntuaciones - INCLUIR ACCIONES COMBINADAS
            total_ippon = AccionTashiWaza.objects.filter(puntuacion='ippon').count() + AccionCombinada.objects.filter(puntuacion='ippon').count()
            total_waza_ari = AccionTashiWaza.objects.filter(puntuacion='waza_ari').count() + AccionCombinada.objects.filter(puntuacion='waza_ari').count()
            
            # Amonestaciones
            total_shido = Amonestacion.objects.filter(tipo='shido').count()
            total_hansokumake = Amonestacion.objects.filter(tipo='hansokumake').count()
            
            data = {
                # Estadísticas básicas
                'competidores': total_competidores,
                'competiciones': total_competiciones,
                'combates': total_combates,
                'reportes': total_reportes,
                
                # Estadísticas de técnicas Tashi Waza
                'total_acciones_tashi': total_acciones_tashi,
                'tecnicas_acertadas_tashi': tecnicas_acertadas_tashi,
                'tecnicas_fallidas_tashi': tecnicas_fallidas_tashi,
                
                # Estadísticas de técnicas Ne Waza
                'total_acciones_ne': total_acciones_ne,
                'tecnicas_acertadas_ne': tecnicas_acertadas_ne,
                'tecnicas_fallidas_ne': tecnicas_fallidas_ne,
                
                # Estadísticas de combinaciones
                'total_combinaciones': total_combinaciones,
                'combinaciones_efectivas': combinaciones_efectivas,
                'combinaciones_fallidas': combinaciones_fallidas,
                'tecnicas_en_combinaciones_tashi': tecnicas_en_combinaciones_tashi,
                'tecnicas_en_combinaciones_ne': tecnicas_en_combinaciones_ne,
                'tecnicas_acertadas_combinaciones': tecnicas_acertadas_combinaciones,
                'tecnicas_fallidas_combinaciones': tecnicas_fallidas_combinaciones,
                
                # Estadísticas por tipo de técnica Tashi Waza
                'ashi_waza_total': ashi_waza_total,
                'koshi_waza_total': koshi_waza_total,
                'te_waza_total': te_waza_total,
                'sutemi_waza_total': sutemi_waza_total,
                
                # Estadísticas por tipo de técnica Ne Waza
                'osaekomi_total': osaekomi_total,
                'shime_total': shime_total,
                'kansetsu_total': kansetsu_total,
                
                # Puntuaciones
                'total_ippon': total_ippon,
                'total_waza_ari': total_waza_ari,
                
                # Amonestaciones
                'total_shido': total_shido,
                'total_hansokumake': total_hansokumake,
                
                # Totales generales
                'total_tecnicas_acertadas': tecnicas_acertadas_tashi + tecnicas_acertadas_ne,
                'total_tecnicas_fallidas': tecnicas_fallidas_tashi + tecnicas_fallidas_ne,
                'total_acciones': total_acciones_tashi + total_acciones_ne
            }
            
            return Response(data)
        except Exception as e:
            return Response({
                'error': 'Error al obtener estadísticas generales',
                'detail': str(e)
            }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_detalladas_competidor(request, competidor_id):
    try:
        competidor = Competidor.objects.get(id=competidor_id)
        
        # Obtener todas las estadísticas del competidor
        combates = Combate.objects.filter(
            Q(competidor1=competidor) | Q(competidor2=competidor)
        )
        
        # Acciones Tashi Waza para calcular estadísticas
        acciones_tashi = AccionTashiWaza.objects.filter(
            competidor=competidor,
            combate__in=combates
        )
        
        # Acciones Ne Waza
        acciones_ne = AccionNeWaza.objects.filter(
            competidor=competidor,
            combate__in=combates
        )
        
        # Calcular técnicas en combinaciones
        # CORREGIDO: Contar las AccionCombinada directamente según su efectividad
        tecnicas_positivas_combinadas = 0
        tecnicas_negativas_combinadas = 0
        
        for accion_combinada in AccionCombinada.objects.filter(competidor=competidor, combate__in=combates):
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
        
        # Acciones Tashi Waza - CAMPOS CORREGIDOS
        total_ataques_tashi = acciones_tashi.count()
        ataques_positivos = acciones_tashi.exclude(puntuacion='sin_puntuacion').count() + tecnicas_positivas_combinadas
        ataques_negativos = acciones_tashi.filter(puntuacion='sin_puntuacion').count() + tecnicas_negativas_combinadas
        
        wazari = acciones_tashi.filter(puntuacion='waza_ari').count()
        ippon = acciones_tashi.filter(puntuacion='ippon').count()
        
        ashi_waza = acciones_tashi.filter(tipo='ashi_waza').count()
        koshi_waza = acciones_tashi.filter(tipo='koshi_waza').count()
        kata_te_waza = acciones_tashi.filter(tipo='te_waza').count()
        sutemi_waza = acciones_tashi.filter(Q(tipo='ma_sutemi_waza') | Q(tipo='yoko_sutemi_waza')).count()
        
        combinaciones_tashi = acciones_tashi.filter(accion_combinada__isnull=False).count()
        
        # Acciones Ne Waza
        total_acciones_ne = acciones_ne.count()
        inmovilizaciones = acciones_ne.filter(tipo='osaekomi_waza').count()
        luxaciones = acciones_ne.filter(tipo='kansetsu_waza').count()
        estrangulaciones = acciones_ne.filter(tipo='shime_waza').count()
        combinaciones_ne = acciones_ne.filter(accion_combinada__isnull=False).count()
        
        # Amonestaciones
        amonestaciones = Amonestacion.objects.filter(
            competidor=competidor,
            combate__in=combates
        )
        
        shido = amonestaciones.filter(tipo='shido').count()
        hansokumake = amonestaciones.filter(tipo='hansokumake').count()
        
        # Técnicas fallidas
        tecnicas_fallidas_tashi = acciones_tashi.filter(efectiva=False).count()
        tecnicas_fallidas_ne = acciones_ne.filter(efectiva=False).count()
        tecnicas_fallidas_combinadas = 0
        
        # Contar técnicas fallidas en combinaciones
        for accion_combinada in AccionCombinada.objects.filter(competidor=competidor, combate__in=combates):
            tashi_en_combinacion = AccionTashiWaza.objects.filter(accion_combinada=accion_combinada)
            tecnicas_fallidas_combinadas += tashi_en_combinacion.filter(efectiva=False).count()
            
            ne_en_combinacion = AccionNeWaza.objects.filter(accion_combinada=accion_combinada)
            tecnicas_fallidas_combinadas += ne_en_combinacion.filter(efectiva=False).count()
        
        # Calcular estadísticas detalladas por técnica
        tecnicas_stats = {}
        for accion in acciones_tashi:
            if hasattr(accion, 'tecnica') and accion.tecnica:
                tecnica_nombre = str(accion.tecnica)
                if tecnica_nombre not in tecnicas_stats:
                    tecnicas_stats[tecnica_nombre] = {
                        'total': 0,
                        'efectivas': 0,
                        'puntos': 0
                    }
                tecnicas_stats[tecnica_nombre]['total'] += 1
                if hasattr(accion, 'efectiva') and accion.efectiva:
                    tecnicas_stats[tecnica_nombre]['efectivas'] += 1
                if hasattr(accion, 'puntuacion') and accion.puntuacion in ['ippon', 'waza_ari']:
                    puntos_map = {'ippon': 10, 'waza_ari': 7}
                    tecnicas_stats[tecnica_nombre]['puntos'] += puntos_map.get(accion.puntuacion, 0)
        
        data = {
            'competidor': CompetidorSerializer(competidor).data,
            'tecnicas_por_categoria': tecnicas_stats,
            'total_combates': combates.count(),
            'combates_ganados': combates.filter(ganador=competidor).count(),
            'total_acciones_tashi_waza': total_ataques_tashi,
            'ataques_positivos': ataques_positivos,
            'ataques_negativos': ataques_negativos,
            'wazari': wazari,
            'ippon': ippon,
            'ashi_waza': ashi_waza,
            'koshi_waza': koshi_waza,
            'kata_te_waza': kata_te_waza,
            'sutemi_waza': sutemi_waza,
            'combinaciones': combinaciones_tashi + combinaciones_ne,
            'total_acciones_ne_waza': total_acciones_ne,
            'inmovilizaciones': inmovilizaciones,
            'luxaciones': luxaciones,
            'estrangulaciones': estrangulaciones,
            'shido': shido,
            'hansokumake': hansokumake,
            'tecnicas_fallidas': tecnicas_fallidas_tashi + tecnicas_fallidas_ne,
            'tecnicas_fallidas_combinadas': tecnicas_fallidas_combinadas
        }
        
        return Response(data)
    except Competidor.DoesNotExist:
        return Response({'error': 'Competidor no encontrado'}, status=404)
    except Exception as e:
        return Response(
            {'error': f'Error al cargar estadísticas: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Agregar a ReporteViewSet
@action(detail=True, methods=['get'])
def exportar_pdf(self, request, pk=None):
    """Exportar reporte a PDF"""
    try:
        reporte = self.get_object()
        estadisticas = reporte.estadisticas.all()
        
        # Crear buffer para el PDF
        buffer = io.BytesIO()
        
        # Crear documento PDF
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Centrado
        )
        
        # Título
        story.append(Paragraph(f"Reporte: {reporte.titulo}", title_style))
        story.append(Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Tabla de estadísticas
        if estadisticas.exists():
            data = [['Competidor', 'Combates', 'Victorias', 'Ippon', 'Waza-ari', 'Efectividad']]
            
            for est in estadisticas:
                efectividad = 0
                if est.total_ataques_tashi_waza > 0:
                    efectividad = (est.ataques_positivos / est.total_ataques_tashi_waza) * 100
                
                data.append([
                    est.competidor_detalle.nombre if est.competidor_detalle else 'N/A',
                    str(est.total_combates or 0),
                    str(est.combates_ganados or 0),
                    str(est.ippon or 0),
                    str(est.waza_ari or 0),
                    f"{efectividad:.1f}%"
                ])
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        else:
            story.append(Paragraph("No hay estadísticas disponibles para este reporte.", styles['Normal']))
        
        # Construir PDF
        doc.build(story)
        
        # Preparar respuesta
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{reporte.titulo}.pdf"'
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)