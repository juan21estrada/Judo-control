from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from competidores.models import Competidor
from competiciones.models import Competicion
from combates.models import Combate
from datetime import date, timedelta
import json

Usuario = get_user_model()

class APIAuthenticationTest(TestCase):
    """Pruebas de autenticación de la API"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            email='test@example.com',
            password='testpass123',
            nombre='Usuario Test',
            rol='entrenador'
        )
        self.token = Token.objects.create(user=self.usuario)
    
    def test_acceso_sin_autenticacion(self):
        """Prueba que las rutas protegidas requieren autenticación"""
        url = reverse('competidor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_acceso_con_token_valido(self):
        """Prueba acceso con token válido"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        url = reverse('competidor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_acceso_con_token_invalido(self):
        """Prueba acceso con token inválido"""
        self.client.credentials(HTTP_AUTHORIZATION='Token invalid_token')
        url = reverse('competidor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CompetidorAPITest(TestCase):
    """Pruebas para la API de Competidores"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            email='entrenador@example.com',
            password='testpass123',
            nombre='Entrenador Test',
            rol='entrenador'
        )
        self.token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.competidor_data = {
            'nombre': 'Juan Pérez',
            'genero': 'M',
            'division_peso': 'ligero',
            'categoria': 'juvenil',
            'anos_experiencia': 5
        }
    
    def test_crear_competidor(self):
        """Prueba crear un nuevo competidor"""
        url = reverse('competidor-list')
        response = self.client.post(url, self.competidor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Competidor.objects.count(), 1)
        
        competidor = Competidor.objects.first()
        self.assertEqual(competidor.nombre, self.competidor_data['nombre'])
        self.assertEqual(competidor.usuario, self.usuario)
    
    def test_listar_competidores(self):
        """Prueba listar competidores"""
        # Crear algunos competidores
        Competidor.objects.create(
            usuario=self.usuario,
            **self.competidor_data
        )
        
        competidor_data_2 = self.competidor_data.copy()
        competidor_data_2['nombre'] = 'María García'
        competidor_data_2['genero'] = 'F'
        
        Competidor.objects.create(
            usuario=self.usuario,
            **competidor_data_2
        )
        
        url = reverse('competidor-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_obtener_competidor_detalle(self):
        """Prueba obtener detalles de un competidor específico"""
        competidor = Competidor.objects.create(
            usuario=self.usuario,
            **self.competidor_data
        )
        
        url = reverse('competidor-detail', kwargs={'pk': competidor.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], competidor.nombre)
    
    def test_actualizar_competidor(self):
        """Prueba actualizar un competidor"""
        competidor = Competidor.objects.create(
            usuario=self.usuario,
            **self.competidor_data
        )
        
        datos_actualizados = {
            'nombre': 'Juan Carlos Pérez',
            'anos_experiencia': 6
        }
        
        url = reverse('competidor-detail', kwargs={'pk': competidor.pk})
        response = self.client.patch(url, datos_actualizados, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        competidor.refresh_from_db()
        self.assertEqual(competidor.nombre, datos_actualizados['nombre'])
        self.assertEqual(competidor.anos_experiencia, datos_actualizados['anos_experiencia'])
    
    def test_eliminar_competidor(self):
        """Prueba eliminar un competidor"""
        competidor = Competidor.objects.create(
            usuario=self.usuario,
            **self.competidor_data
        )
        
        url = reverse('competidor-detail', kwargs={'pk': competidor.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Competidor.objects.count(), 0)
    
    def test_validacion_datos_invalidos(self):
        """Prueba validación con datos inválidos"""
        datos_invalidos = {
            'nombre': '',  # Nombre vacío
            'genero': 'X',  # Género inválido
            'division_peso': 'inexistente',  # División inválida
            'categoria': 'inexistente',  # Categoría inválida
            'anos_experiencia': -1  # Años negativos
        }
        
        url = reverse('competidor-list')
        response = self.client.post(url, datos_invalidos, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Competidor.objects.count(), 0)


class CompeticionAPITest(TestCase):
    """Pruebas para la API de Competiciones"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            email='organizador@example.com',
            password='testpass123',
            nombre='Organizador Test',
            rol='administrador'
        )
        self.token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.competicion_data = {
            'nombre': 'Torneo Nacional de Judo',
            'fecha': (date.today() + timedelta(days=30)).isoformat(),
            'evento': 'torneo',
            'tipo_competicion': 'eliminacion_directa',
            'cantidad_atletas': 16,
            'cantidad_combates': 15
        }
    
    def test_crear_competicion(self):
        """Prueba crear una nueva competición"""
        url = reverse('competicion-list')
        response = self.client.post(url, self.competicion_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Competicion.objects.count(), 1)
        
        competicion = Competicion.objects.first()
        self.assertEqual(competicion.nombre, self.competicion_data['nombre'])
        self.assertEqual(competicion.creado_por, self.usuario)
    
    def test_listar_competiciones(self):
        """Prueba listar competiciones"""
        Competicion.objects.create(
            creado_por=self.usuario,
            fecha=date.today() + timedelta(days=30),
            **{k: v for k, v in self.competicion_data.items() if k != 'fecha'}
        )
        
        url = reverse('competicion-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_finalizar_competicion(self):
        """Prueba finalizar una competición"""
        competicion = Competicion.objects.create(
            creado_por=self.usuario,
            fecha=date.today() + timedelta(days=30),
            **{k: v for k, v in self.competicion_data.items() if k != 'fecha'}
        )
        
        url = reverse('competicion-detail', kwargs={'pk': competicion.pk})
        response = self.client.patch(url, {'finalizada': True}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        competicion.refresh_from_db()
        self.assertTrue(competicion.finalizada)


class CombateAPITest(TestCase):
    """Pruebas para la API de Combates"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            email='juez@example.com',
            password='testpass123',
            nombre='Juez Test',
            rol='juez'
        )
        self.token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        # Crear competición
        self.competicion = Competicion.objects.create(
            nombre='Torneo Test',
            fecha=date.today() + timedelta(days=1),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=self.usuario
        )
        
        # Crear competidores
        self.competidor1 = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor 1',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=3
        )
        
        self.competidor2 = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor 2',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=4
        )
        
        self.competicion.competidores.add(self.competidor1, self.competidor2)
        
        self.combate_data = {
            'competicion': self.competicion.pk,
            'competidor1': self.competidor1.pk,
            'competidor2': self.competidor2.pk,
            'duracion': 300
        }
    
    def test_crear_combate(self):
        """Prueba crear un nuevo combate"""
        url = reverse('combate-list')
        response = self.client.post(url, self.combate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Combate.objects.count(), 1)
        
        combate = Combate.objects.first()
        self.assertEqual(combate.competicion, self.competicion)
        self.assertEqual(combate.registrado_por, self.usuario)
    
    def test_iniciar_combate(self):
        """Prueba iniciar un combate"""
        combate = Combate.objects.create(
            registrado_por=self.usuario,
            **self.combate_data
        )
        combate.competicion = self.competicion
        combate.competidor1 = self.competidor1
        combate.competidor2 = self.competidor2
        combate.save()
        
        url = reverse('combate-detail', kwargs={'pk': combate.pk})
        response = self.client.patch(url, {'iniciado': True}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        combate.refresh_from_db()
        self.assertTrue(combate.iniciado)
    
    def test_finalizar_combate_con_ganador(self):
        """Prueba finalizar un combate con ganador"""
        combate = Combate.objects.create(
            registrado_por=self.usuario,
            **self.combate_data
        )
        combate.competicion = self.competicion
        combate.competidor1 = self.competidor1
        combate.competidor2 = self.competidor2
        combate.save()
        
        url = reverse('combate-detail', kwargs={'pk': combate.pk})
        response = self.client.patch(url, {
            'finalizado': True,
            'ganador': self.competidor1.pk
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        combate.refresh_from_db()
        self.assertTrue(combate.finalizado)
        self.assertEqual(combate.ganador, self.competidor1)