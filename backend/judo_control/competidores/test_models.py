from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from competidores.models import Competidor
from datetime import date

Usuario = get_user_model()

class CompetidorModelTest(TestCase):
    """Pruebas unitarias para el modelo Competidor"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario = Usuario.objects.create_user(
            email='entrenador@example.com',
            nombre='Entrenador Test',
            rol='entrenador'
        )
        
        self.competidor_data = {
            'usuario': self.usuario,
            'nombre': 'Juan Pérez',
            'genero': 'M',
            'division_peso': 'ligero',
            'categoria': 'juvenil',
            'anos_experiencia': 5
        }
    
    def test_crear_competidor_exitoso(self):
        """Prueba la creación exitosa de un competidor"""
        competidor = Competidor.objects.create(**self.competidor_data)
        
        self.assertEqual(competidor.nombre, self.competidor_data['nombre'])
        self.assertEqual(competidor.genero, self.competidor_data['genero'])
        self.assertEqual(competidor.division_peso, self.competidor_data['division_peso'])
        self.assertEqual(competidor.categoria, self.competidor_data['categoria'])
        self.assertEqual(competidor.anos_experiencia, self.competidor_data['anos_experiencia'])
        self.assertEqual(competidor.fecha_registro.date(), date.today())
    
    def test_validacion_anos_experiencia_negativo(self):
        """Prueba que no se permiten años de experiencia negativos"""
        self.competidor_data['anos_experiencia'] = -1
        competidor = Competidor(**self.competidor_data)
        
        with self.assertRaises(ValidationError):
            competidor.full_clean()
    
    def test_validacion_anos_experiencia_excesivo(self):
        """Prueba que no se permiten más de 50 años de experiencia"""
        self.competidor_data['anos_experiencia'] = 51
        competidor = Competidor(**self.competidor_data)
        
        with self.assertRaises(ValidationError):
            competidor.full_clean()
    
    def test_generos_validos(self):
        """Prueba que solo se aceptan géneros válidos"""
        generos_validos = ['M', 'F']
        
        for genero in generos_validos:
            competidor_data = self.competidor_data.copy()
            competidor_data['genero'] = genero
            
            competidor = Competidor.objects.create(**competidor_data)
            self.assertEqual(competidor.genero, genero)
            competidor.delete()  # Limpiar para la siguiente iteración
    
    def test_divisiones_peso_validas(self):
        """Prueba que solo se aceptan divisiones de peso válidas"""
        divisiones_validas = ['mosca', 'gallo', 'pluma', 'ligero', 'welter', 'medio', 'pesado']
        
        for division in divisiones_validas:
            competidor_data = self.competidor_data.copy()
            competidor_data['division_peso'] = division
            
            competidor = Competidor.objects.create(**competidor_data)
            self.assertEqual(competidor.division_peso, division)
            competidor.delete()  # Limpiar para la siguiente iteración
    
    def test_categorias_validas(self):
        """Prueba que solo se aceptan categorías válidas"""
        categorias_validas = ['infantil', 'cadete', 'juvenil', 'senior', 'veterano']
        
        for categoria in categorias_validas:
            competidor_data = self.competidor_data.copy()
            competidor_data['categoria'] = categoria
            
            competidor = Competidor.objects.create(**competidor_data)
            self.assertEqual(competidor.categoria, categoria)
            competidor.delete()  # Limpiar para la siguiente iteración
    
    def test_str_representation(self):
        """Prueba la representación string del competidor"""
        competidor = Competidor.objects.create(**self.competidor_data)
        expected_str = f"{self.competidor_data['nombre']} - {self.competidor_data['categoria']} - {self.competidor_data['division_peso']}"
        self.assertEqual(str(competidor), expected_str)
    
    def test_campos_requeridos(self):
        """Prueba que los campos requeridos no pueden estar vacíos"""
        campos_requeridos = ['usuario', 'nombre', 'genero', 'division_peso', 'categoria']
        
        for campo in campos_requeridos:
            competidor_data = self.competidor_data.copy()
            del competidor_data[campo]
            
            with self.assertRaises((TypeError, ValueError)):
                Competidor.objects.create(**competidor_data)