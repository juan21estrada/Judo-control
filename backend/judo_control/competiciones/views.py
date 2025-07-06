from rest_framework import viewsets, permissions
from .models import Competicion
from .serializers import CompeticionSerializer
from usuarios.views import EsEntrenador
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from competidores.models import Competidor
from competidores.serializers import CompetidorSerializer

class CompeticionViewSet(viewsets.ModelViewSet):
    queryset = Competicion.objects.all()
    serializer_class = CompeticionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Actualizar estados de competiciones basándose en fecha_fin
        for competicion in queryset:
            competicion.update_status_by_date()
        
        # Filtrar por estado finalizado si se proporciona el parámetro
        finalizada = self.request.query_params.get('finalizada')
        if finalizada is not None:
            is_finalizada = finalizada.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(finalizada=is_finalizada)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
    
    @action(detail=True, methods=['post'])
    def inscribir_competidores(self, request, pk=None):
        competicion = self.get_object()
        competidores_ids = request.data.get('competidores', [])

        try:
            # Verificar que se enviaron IDs de competidores
            if not competidores_ids:
                return Response(
                    {'error': 'Debe proporcionar al menos un competidor'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que los competidores existen
            competidores = Competidor.objects.filter(id__in=competidores_ids)
            if len(competidores) != len(competidores_ids):
                return Response(
                    {'error': 'Algunos competidores no existen'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que no exceda el límite de atletas
            competidores_actuales = competicion.competidores.count()
            if competidores_actuales + len(competidores_ids) > competicion.cantidad_atletas:
                return Response(
                    {'error': f'La cantidad de competidores excedería el límite de atletas permitidos. Límite: {competicion.cantidad_atletas}, Actuales: {competidores_actuales}, Intentando agregar: {len(competidores_ids)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que los competidores no estén ya inscritos
            competidores_ya_inscritos = competicion.competidores.filter(id__in=competidores_ids)
            if competidores_ya_inscritos.exists():
                nombres_inscritos = [comp.nombre for comp in competidores_ya_inscritos]
                return Response(
                    {'error': f'Los siguientes competidores ya están inscritos: {", ".join(nombres_inscritos)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Inscribir competidores
            competicion.competidores.add(*competidores)
            
            return Response({
                'message': f'Se inscribieron {len(competidores)} competidores exitosamente',
                'competidores_inscritos': [comp.nombre for comp in competidores]
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Agregar este nuevo método
    @action(detail=True, methods=['get'])
    def competidores_inscritos(self, request, pk=None):
        """Obtener competidores inscritos en esta competición"""
        competicion = self.get_object()
        competidores = competicion.competidores.all()
        serializer = CompetidorSerializer(competidores, many=True)
        return Response(serializer.data)