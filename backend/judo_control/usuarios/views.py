from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UsuarioSerializer, UsuarioRegistroSerializer, CambioRolSerializer

Usuario = get_user_model()

class EsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'administrador'

class EsEntrenador(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['administrador', 'entrenador']

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy', 'cambiar_rol', 'bloquear_usuario']:
            permission_classes = [EsAdministrador]
        elif self.action == 'list':
            permission_classes = [EsEntrenador]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioRegistroSerializer
        elif self.action == 'cambiar_rol':
            return CambioRolSerializer
        return self.serializer_class

    @action(detail=True, methods=['patch'])
    def cambiar_rol(self, request, pk=None):
        usuario = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            usuario.rol = serializer.validated_data['rol']
            usuario.save()
            return Response({'status': 'rol actualizado'})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def bloquear_usuario(self, request, pk=None):
        """Bloquear o desbloquear un usuario"""
        try:
            usuario = self.get_object()
            
            # No permitir que un usuario se bloquee a sí mismo
            if usuario.id == request.user.id:
                return Response(
                    {'error': 'No puedes bloquearte a ti mismo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            bloqueado = request.data.get('bloqueado', True)
            motivo = request.data.get('motivo', '')
            
            usuario.is_active = not bloqueado
            usuario.save()
            
            action_text = "bloqueado" if bloqueado else "desbloqueado"
            return Response({
                'message': f'Usuario {action_text} correctamente',
                'is_active': usuario.is_active
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al procesar la solicitud: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)