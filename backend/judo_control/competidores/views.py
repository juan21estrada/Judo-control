from rest_framework import viewsets, permissions
from .models import Competidor
from .serializers import CompetidorSerializer
from usuarios.views import EsEntrenador

class CompetidorViewSet(viewsets.ModelViewSet):
    queryset = Competidor.objects.all()
    serializer_class = CompetidorSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save()