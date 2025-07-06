from rest_framework import viewsets, permissions
from .models import Competidor
from .serializers import CompetidorSerializer
from usuarios.views import EsEntrenador

class CompetidorViewSet(viewsets.ModelViewSet):
    queryset = Competidor.objects.all()
    serializer_class = CompetidorSerializer
    
    def get_queryset(self):
        queryset = Competidor.objects.all()
        
        # Filtrar por estado activo si se proporciona el parámetro
        activo_param = self.request.query_params.get('activo', None)
        if activo_param is not None:
            activo = activo_param.lower() == 'true'
            queryset = queryset.filter(activo=activo)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save()