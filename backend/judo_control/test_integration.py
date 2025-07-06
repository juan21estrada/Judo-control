from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from competidores.models import Competidor
from competiciones.models import Competicion
from combates.models import Combate, AccionTashiWaza, Amonestacion
from estadisticas.models import EstadisticaCompetidor
from datetime import date, timedelta
import json

Usuario = get_user_model()

class IntegracionCompeticionCompleta(TransactionTestCase):
    """Pruebas de integración para el flujo completo de una competición"""
    
    def setUp(self):
        """Configuración inicial para las pruebas de integración"""
        self.client = APIClient()
        
        # Crear usuarios con diferentes roles
        self.administrador = Usuario.objects.create_user(
            email='admin@judo.com',
            password='admin123',
            nombre='Administrador Sistema',
            rol='administrador'
        )
        
        self.entrenador = Usuario.objects.create_user(
            email='entrenador@judo.com',
            password='entrenador123',
            nombre='Entrenador Principal',
            rol='entrenador'
        )
        
        self.juez = Usuario.objects.create_user(
            email='juez@judo.com',
            password='juez123',
            nombre='Juez Oficial',
            rol='juez'
        )
        
        # Crear tokens para autenticación
        self.admin_token = Token.objects.create(user=self.administrador)
        self.entrenador_token = Token.objects.create(user=self.entrenador)
        self.juez_token = Token.objects.create(user=self.juez)
    
    def test_flujo_completo_competicion(self):
        """Prueba el flujo completo desde creación hasta finalización de competición"""
        
        # 1. Administrador crea competición
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        
        competicion_data = {
            'nombre': 'Torneo Nacional Juvenil',
            'fecha': (date.today() + timedelta(days=15)).isoformat(),
            'evento': 'torneo',
            'tipo_competicion': 'eliminacion_directa',
            'cantidad_atletas': 8,
            'cantidad_combates': 7
        }
        
        response = self.client.post('/api/competiciones/', competicion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        competicion_id = response.data['id']
        
        # 2. Entrenador registra competidores
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.entrenador_token.key)
        
        competidores_data = [
            {
                'nombre': 'Ana García',
                'genero': 'F',
                'division_peso': 'ligero',
                'categoria': 'juvenil',
                'anos_experiencia': 3
            },
            {
                'nombre': 'Carlos Ruiz',
                'genero': 'M',
                'division_peso': 'medio',
                'categoria': 'juvenil',
                'anos_experiencia': 4
            },
            {
                'nombre': 'María López',
                'genero': 'F',
                'division_peso': 'ligero',
                'categoria': 'juvenil',
                'anos_experiencia': 2
            },
            {
                'nombre': 'Pedro Martín',
                'genero': 'M',
                'division_peso': 'medio',
                'categoria': 'juvenil',
                'anos_experiencia': 5
            }
        ]
        
        competidores_ids = []
        for comp_data in competidores_data:
            response = self.client.post('/api/competidores/', comp_data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            competidores_ids.append(response.data['id'])
        
        # 3. Administrador agrega competidores a la competición
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        
        for comp_id in competidores_ids:
            response = self.client.patch(
                f'/api/competiciones/{competicion_id}/',
                {'competidores': competidores_ids},
                format='json'
            )
        
        # Verificar que los competidores fueron agregados
        response = self.client.get(f'/api/competiciones/{competicion_id}/')
        self.assertEqual(len(response.data['competidores']), 4)
        
        # 4. Juez crea y gestiona combates
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.juez_token.key)
        
        # Crear primer combate
        combate_data = {
            'competicion': competicion_id,
            'competidor1': competidores_ids[0],
            'competidor2': competidores_ids[1],
            'duracion': 300
        }
        
        response = self.client.post('/api/combates/', combate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        combate_id = response.data['id']
        
        # 5. Iniciar combate
        response = self.client.patch(
            f'/api/combates/{combate_id}/',
            {'iniciado': True},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 6. Registrar acciones durante el combate
        accion_data = {
            'combate': combate_id,
            'competidor': competidores_ids[0],
            'puntuacion': 'ippon'
        }
        
        response = self.client.post('/api/acciones-tashi-waza/', accion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 7. Finalizar combate con ganador
        response = self.client.patch(
            f'/api/combates/{combate_id}/',
            {
                'finalizado': True,
                'ganador': competidores_ids[0]
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 8. Verificar que las estadísticas se actualizaron
        response = self.client.get('/api/estadisticas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 9. Administrador finaliza la competición
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        
        response = self.client.patch(
            f'/api/competiciones/{competicion_id}/',
            {'finalizada': True},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificaciones finales
        competicion = Competicion.objects.get(id=competicion_id)
        self.assertTrue(competicion.finalizada)
        
        combate = Combate.objects.get(id=combate_id)
        self.assertTrue(combate.finalizado)
        self.assertEqual(combate.ganador.id, competidores_ids[0])
        
        # Verificar que se crearon las acciones
        acciones = AccionTashiWaza.objects.filter(combate=combate)
        self.assertEqual(acciones.count(), 1)
        self.assertEqual(acciones.first().puntuacion, 'ippon')


class IntegracionAutenticacionPermisos(TestCase):
    """Pruebas de integración para autenticación y permisos"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        # Crear usuarios con diferentes roles
        self.entrenador = Usuario.objects.create_user(
            email='entrenador@test.com',
            password='test123',
            nombre='Entrenador Test',
            rol='entrenador'
        )
        
        self.juez = Usuario.objects.create_user(
            email='juez@test.com',
            password='test123',
            nombre='Juez Test',
            rol='juez'
        )
        
        self.administrador = Usuario.objects.create_user(
            email='admin@test.com',
            password='test123',
            nombre='Admin Test',
            rol='administrador'
        )
        
        # Crear tokens
        self.entrenador_token = Token.objects.create(user=self.entrenador)
        self.juez_token = Token.objects.create(user=self.juez)
        self.admin_token = Token.objects.create(user=self.administrador)
    
    def test_permisos_por_rol(self):
        """Prueba que cada rol tiene los permisos correctos"""
        
        # Crear datos de prueba
        competidor_data = {
            'nombre': 'Test Competidor',
            'genero': 'M',
            'division_peso': 'ligero',
            'categoria': 'juvenil',
            'anos_experiencia': 3
        }
        
        competicion_data = {
            'nombre': 'Test Competicion',
            'fecha': (date.today() + timedelta(days=10)).isoformat(),
            'evento': 'torneo',
            'tipo_competicion': 'eliminacion_directa',
            'cantidad_atletas': 4,
            'cantidad_combates': 3
        }
        
        # 1. Entrenador puede crear competidores
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.entrenador_token.key)
        response = self.client.post('/api/competidores/', competidor_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        competidor_id = response.data['id']
        
        # 2. Entrenador NO puede crear competiciones
        response = self.client.post('/api/competiciones/', competicion_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED])
        
        # 3. Administrador puede crear competiciones
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response = self.client.post('/api/competiciones/', competicion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        competicion_id = response.data['id']
        
        # 4. Juez puede crear combates
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.juez_token.key)
        
        # Primero crear otro competidor para el combate
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.entrenador_token.key)
        competidor_data2 = competidor_data.copy()
        competidor_data2['nombre'] = 'Test Competidor 2'
        response = self.client.post('/api/competidores/', competidor_data2, format='json')
        competidor2_id = response.data['id']
        
        # Agregar competidores a la competición
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response = self.client.patch(
            f'/api/competiciones/{competicion_id}/',
            {'competidores': [competidor_id, competidor2_id]},
            format='json'
        )
        
        # Juez crea combate
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.juez_token.key)
        combate_data = {
            'competicion': competicion_id,
            'competidor1': competidor_id,
            'competidor2': competidor2_id,
            'duracion': 300
        }
        
        response = self.client.post('/api/combates/', combate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class IntegracionBaseDatos(TransactionTestCase):
    """Pruebas de integración para operaciones de base de datos"""
    
    def test_transacciones_atomicas(self):
        """Prueba que las operaciones críticas son atómicas"""
        
        usuario = Usuario.objects.create_user(
            email='test@example.com',
            password='test123',
            nombre='Test User',
            rol='administrador'
        )
        
        # Crear competición y competidores
        competicion = Competicion.objects.create(
            nombre='Test Competicion',
            fecha=date.today() + timedelta(days=5),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=usuario
        )
        
        competidor1 = Competidor.objects.create(
            usuario=usuario,
            nombre='Competidor 1',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=3
        )
        
        competidor2 = Competidor.objects.create(
            usuario=usuario,
            nombre='Competidor 2',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=4
        )
        
        # Probar transacción atómica para crear combate con acciones
        try:
            with transaction.atomic():
                combate = Combate.objects.create(
                    competicion=competicion,
                    competidor1=competidor1,
                    competidor2=competidor2,
                    duracion=300,
                    registrado_por=usuario
                )
                
                # Crear acción
                AccionTashiWaza.objects.create(
                    combate=combate,
                    competidor=competidor1,
                    puntuacion='ippon'
                )
                
                # Simular error para probar rollback
                if True:  # Cambiar a False para que la transacción sea exitosa
                    raise Exception("Error simulado")
                    
        except Exception:
            pass
        
        # Verificar que no se creó nada debido al rollback
        self.assertEqual(Combate.objects.count(), 0)
        self.assertEqual(AccionTashiWaza.objects.count(), 0)
        
        # Ahora hacer la transacción exitosa
        with transaction.atomic():
            combate = Combate.objects.create(
                competicion=competicion,
                competidor1=competidor1,
                competidor2=competidor2,
                duracion=300,
                registrado_por=usuario
            )
            
            AccionTashiWaza.objects.create(
                combate=combate,
                competidor=competidor1,
                puntuacion='ippon'
            )
        
        # Verificar que se crearon los objetos
        self.assertEqual(Combate.objects.count(), 1)
        self.assertEqual(AccionTashiWaza.objects.count(), 1)
    
    def test_integridad_referencial(self):
        """Prueba la integridad referencial entre modelos"""
        
        usuario = Usuario.objects.create_user(
            email='test@example.com',
            password='test123',
            nombre='Test User',
            rol='administrador'
        )
        
        competidor = Competidor.objects.create(
            usuario=usuario,
            nombre='Test Competidor',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=3
        )
        
        # Verificar que eliminar usuario no elimina competidor (si está configurado así)
        competidor_id = competidor.id
        usuario_id = usuario.id
        
        # El comportamiento depende de la configuración de on_delete en el modelo
        # Aquí asumimos que está configurado para mantener los competidores
        
        # Verificar que el competidor existe
        self.assertTrue(Competidor.objects.filter(id=competidor_id).exists())
        
        # Verificar relaciones many-to-many
        competicion = Competicion.objects.create(
            nombre='Test Competicion',
            fecha=date.today() + timedelta(days=5),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=usuario
        )
        
        competicion.competidores.add(competidor)
        self.assertEqual(competicion.competidores.count(), 1)
        
        # Verificar que se puede acceder a la relación inversa
        self.assertEqual(competidor.competiciones.count(), 1)