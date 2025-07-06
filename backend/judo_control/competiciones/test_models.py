from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from competiciones.models import Competicion
from competidores.models import Competidor
from datetime import date, timedelta

Usuario = get_user_model()

class CompeticionModelTest(TestCase):
    """Pruebas unitarias para el modelo Competicion"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario = Usuario.objects.create_user(
            email='organizador@example.com',
            nombre='Organizador Test',
            rol='administrador'
        )
        
        self.competicion_data = {
            'nombre': 'Torneo Nacional de Judo',
            'fecha': date.today() + timedelta(days=30),
            'evento': 'torneo',
            'tipo_competicion': 'eliminacion_directa',
            'cantidad_atletas': 16,
            'cantidad_combates': 15,
            'creado_por': self.usuario
        }
    
    def test_crear_competicion_exitosa(self):
        """Prueba la creación exitosa de una competición"""
        competicion = Competicion.objects.create(**self.competicion_data)
        
        self.assertEqual(competicion.nombre, self.competicion_data['nombre'])
        self.assertEqual(competicion.fecha, self.competicion_data['fecha'])
        self.assertEqual(competicion.evento, self.competicion_data['evento'])
        self.assertEqual(competicion.tipo_competicion, self.competicion_data['tipo_competicion'])
        self.assertEqual(competicion.cantidad_atletas, self.competicion_data['cantidad_atletas'])
        self.assertEqual(competicion.cantidad_combates, self.competicion_data['cantidad_combates'])
        self.assertFalse(competicion.finalizada)
        self.assertEqual(competicion.fecha_creacion.date(), date.today())
    
    def test_validacion_cantidad_combates_torneo(self):
        """Prueba validación de cantidad de combates para torneo"""
        # Para 16 atletas en eliminación directa, debe ser 15 combates
        self.competicion_data['cantidad_combates'] = 10  # Incorrecto
        competicion = Competicion(**self.competicion_data)
        
        with self.assertRaises(ValidationError):
            competicion.full_clean()
    
    def test_validacion_cantidad_combates_liga(self):
        """Prueba validación de cantidad de combates para liga"""
        self.competicion_data['tipo_competicion'] = 'todos_contra_todos'
        self.competicion_data['cantidad_atletas'] = 4
        self.competicion_data['cantidad_combates'] = 5  # Incorrecto, debería ser 6
        
        competicion = Competicion(**self.competicion_data)
        
        with self.assertRaises(ValidationError):
            competicion.full_clean()
    
    def test_eventos_validos(self):
        """Prueba que solo se aceptan eventos válidos"""
        eventos_validos = ['torneo', 'campeonato', 'copa', 'festival']
        
        for evento in eventos_validos:
            competicion_data = self.competicion_data.copy()
            competicion_data['evento'] = evento
            competicion_data['nombre'] = f'Test {evento}'
            
            competicion = Competicion.objects.create(**competicion_data)
            self.assertEqual(competicion.evento, evento)
            competicion.delete()
    
    def test_tipos_competicion_validos(self):
        """Prueba que solo se aceptan tipos de competición válidos"""
        tipos_validos = ['eliminacion_directa', 'todos_contra_todos', 'suizo']
        
        for tipo in tipos_validos:
            competicion_data = self.competicion_data.copy()
            competicion_data['tipo_competicion'] = tipo
            competicion_data['nombre'] = f'Test {tipo}'
            
            # Ajustar cantidad de combates según el tipo
            if tipo == 'todos_contra_todos':
                competicion_data['cantidad_atletas'] = 4
                competicion_data['cantidad_combates'] = 6
            
            competicion = Competicion.objects.create(**competicion_data)
            self.assertEqual(competicion.tipo_competicion, tipo)
            competicion.delete()
    
    def test_agregar_competidores(self):
        """Prueba agregar competidores a una competición"""
        competicion = Competicion.objects.create(**self.competicion_data)
        
        # Crear competidores
        competidor1 = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor 1',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=3
        )
        
        competidor2 = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor 2',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=4
        )
        
        # Agregar competidores a la competición
        competicion.competidores.add(competidor1, competidor2)
        
        self.assertEqual(competicion.competidores.count(), 2)
        self.assertIn(competidor1, competicion.competidores.all())
        self.assertIn(competidor2, competicion.competidores.all())
    
    def test_str_representation(self):
        """Prueba la representación string de la competición"""
        competicion = Competicion.objects.create(**self.competicion_data)
        expected_str = f"{self.competicion_data['nombre']} - {self.competicion_data['fecha']}"
        self.assertEqual(str(competicion), expected_str)
    
    def test_finalizar_competicion(self):
        """Prueba finalizar una competición"""
        competicion = Competicion.objects.create(**self.competicion_data)
        self.assertFalse(competicion.finalizada)
        
        competicion.finalizada = True
        competicion.save()
        
        competicion.refresh_from_db()
        self.assertTrue(competicion.finalizada)
    
    def test_validacion_cantidad_atletas_minima(self):
        """Prueba que se requiere un mínimo de atletas"""
        self.competicion_data['cantidad_atletas'] = 1
        self.competicion_data['cantidad_combates'] = 0
        
        competicion = Competicion(**self.competicion_data)
        
        with self.assertRaises(ValidationError):
            competicion.full_clean()