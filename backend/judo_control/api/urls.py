from django.urls import path, include
from rest_framework.routers import DefaultRouter
from usuarios.views import UsuarioViewSet
from competidores.views import CompetidorViewSet
from competiciones.views import CompeticionViewSet
from combates.views import (
    CombateViewSet, AccionTashiWazaViewSet, 
    AccionNeWazaViewSet, AmonestacionViewSet,
    obtener_puntuaciones_combate  # Add this import
)
from estadisticas.views import ReporteViewSet, EstadisticaCompetidorViewSet, estadisticas_detalladas_competidor
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'competidores', CompetidorViewSet)
router.register(r'competiciones', CompeticionViewSet)
router.register(r'combates', CombateViewSet)
router.register(r'acciones-tashi-waza', AccionTashiWazaViewSet)
router.register(r'acciones-ne-waza', AccionNeWazaViewSet)
router.register(r'amonestaciones', AmonestacionViewSet)
router.register(r'reportes', ReporteViewSet)
router.register(r'estadisticas', EstadisticaCompetidorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls')),
    path('token-auth/', obtain_auth_token, name='api_token_auth'),
    path('estadisticas/competidor/<int:competidor_id>/', estadisticas_detalladas_competidor, name='estadisticas_detalladas_competidor'),
    path('competidor/<int:competidor_id>/', estadisticas_detalladas_competidor, name='estadisticas-competidor'),
    # Cambiar a:
    path('combates/<int:combate_id>/puntuaciones/', obtener_puntuaciones_combate, name='obtener_puntuaciones_combate'),  # Remove 'views.' prefix
]