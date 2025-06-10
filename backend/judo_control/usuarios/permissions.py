from rest_framework import permissions

class EsEntrenador(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'entrenador'