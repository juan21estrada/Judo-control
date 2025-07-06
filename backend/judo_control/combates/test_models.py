from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from combates.models import Combate, AccionTashiWaza, AccionNeWaza, Amonestacion
from competiciones.models import Competicion
from competidores.models import Competidor
from datetime import date, timedelta, datetime

Usuario = get_user_model()

class CombateModelTest(TestCase):
    """Pruebas unitarias para el modelo Combate"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario = Usuario.objects.create_user(
            email='juez@example.com',
            nombre='Juez Test',
            rol='juez'
        )
        
        self.competicion = Competicion.objects.create(
            nombre='Torneo Test',
            fecha=date.today() + timedelta(days=1),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=self.usuario
        )
        
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
        
        # Agregar competidores a la competición
        self.competicion.competidores.add(self.competidor1, self.competidor2)
        
        self.combate_data = {
            'competicion': self.competicion,
            'competidor1': self.competidor1,
            'competidor2': self.competidor2,
            'duracion': 300,  # 5 minutos
            'registrado_por': self.usuario
        }
    
    def test_crear_combate_exitoso(self):
        """Prueba la creación exitosa de un combate"""
        combate = Combate.objects.create(**self.combate_data)
        
        self.assertEqual(combate.competicion, self.competicion)
        self.assertEqual(combate.competidor1, self.competidor1)
        self.assertEqual(combate.competidor2, self.competidor2)
        self.assertEqual(combate.duracion, 300)
        self.assertFalse(combate.iniciado)
        self.assertFalse(combate.finalizado)
        self.assertIsNone(combate.ganador)
    
    def test_validacion_competidores_diferentes(self):
        """Prueba que los competidores deben ser diferentes"""
        self.combate_data['competidor2'] = self.competidor1
        combate = Combate(**self.combate_data)
        
        with self.assertRaises(ValidationError):
            combate.full_clean()
    
    def test_validacion_mismo_genero(self):
        """Prueba que los competidores deben ser del mismo género"""
        competidor_femenino = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidora Femenina',
            genero='F',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=3
        )
        
        self.combate_data['competidor2'] = competidor_femenino
        combate = Combate(**self.combate_data)
        
        with self.assertRaises(ValidationError):
            combate.full_clean()
    
    def test_validacion_competidores_inscritos(self):
        """Prueba que los competidores deben estar inscritos en la competición"""
        competidor_no_inscrito = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor No Inscrito',
            genero='M',
            division_peso='ligero',
            categoria='juvenil',
            anos_experiencia=2
        )
        
        self.combate_data['competidor2'] = competidor_no_inscrito
        combate = Combate(**self.combate_data)
        
        with self.assertRaises(ValidationError):
            combate.full_clean()
    
    def test_iniciar_combate(self):
        """Prueba iniciar un combate"""
        combate = Combate.objects.create(**self.combate_data)
        self.assertFalse(combate.iniciado)
        
        combate.iniciado = True
        combate.fecha_hora = datetime.now()
        combate.save()
        
        combate.refresh_from_db()
        self.assertTrue(combate.iniciado)
        self.assertIsNotNone(combate.fecha_hora)
    
    def test_finalizar_combate_con_ganador(self):
        """Prueba finalizar un combate con ganador"""
        combate = Combate.objects.create(**self.combate_data)
        
        combate.finalizado = True
        combate.ganador = self.competidor1
        combate.save()
        
        combate.refresh_from_db()
        self.assertTrue(combate.finalizado)
        self.assertEqual(combate.ganador, self.competidor1)
    
    def test_str_representation(self):
        """Prueba la representación string del combate"""
        combate = Combate.objects.create(**self.combate_data)
        expected_str = f"{self.competidor1.nombre} vs {self.competidor2.nombre} - {self.competicion.nombre}"
        self.assertEqual(str(combate), expected_str)


class AccionTashiWazaModelTest(TestCase):
    """Pruebas unitarias para el modelo AccionTashiWaza"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario = Usuario.objects.create_user(
            email='juez@example.com',
            nombre='Juez Test',
            rol='juez'
        )
        
        self.competicion = Competicion.objects.create(
            nombre='Torneo Test',
            fecha=date.today() + timedelta(days=1),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=self.usuario
        )
        
        self.competidor = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor Test',
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
        
        self.competicion.competidores.add(self.competidor, self.competidor2)
        
        self.combate = Combate.objects.create(
            competicion=self.competicion,
            competidor1=self.competidor,
            competidor2=self.competidor2,
            duracion=300,
            registrado_por=self.usuario
        )
    
    def test_crear_accion_tashi_waza(self):
        """Prueba la creación de una acción Tashi-waza"""
        accion = AccionTashiWaza.objects.create(
            combate=self.combate,
            competidor=self.competidor,
            tecnica='seoi_nage',
            puntuacion='ippon',
            tiempo=120,
            registrado_por=self.usuario
        )
        
        self.assertEqual(accion.combate, self.combate)
        self.assertEqual(accion.competidor, self.competidor)
        self.assertEqual(accion.tecnica, 'seoi_nage')
        self.assertEqual(accion.puntuacion, 'ippon')
        self.assertEqual(accion.tiempo, 120)
    
    def test_puntuaciones_validas(self):
        """Prueba que solo se aceptan puntuaciones válidas"""
        puntuaciones_validas = ['ippon', 'wazari', 'yuko']
        
        for puntuacion in puntuaciones_validas:
            accion = AccionTashiWaza.objects.create(
                combate=self.combate,
                competidor=self.competidor,
                tecnica='seoi_nage',
                puntuacion=puntuacion,
                tiempo=120,
                registrado_por=self.usuario
            )
            self.assertEqual(accion.puntuacion, puntuacion)
            accion.delete()


class AmonestacionModelTest(TestCase):
    """Pruebas unitarias para el modelo Amonestacion"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario = Usuario.objects.create_user(
            email='juez@example.com',
            nombre='Juez Test',
            rol='juez'
        )
        
        self.competicion = Competicion.objects.create(
            nombre='Torneo Test',
            fecha=date.today() + timedelta(days=1),
            evento='torneo',
            tipo_competicion='eliminacion_directa',
            cantidad_atletas=4,
            cantidad_combates=3,
            creado_por=self.usuario
        )
        
        self.competidor = Competidor.objects.create(
            usuario=self.usuario,
            nombre='Competidor Test',
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
        
        self.competicion.competidores.add(self.competidor, self.competidor2)
        
        self.combate = Combate.objects.create(
            competicion=self.competicion,
            competidor1=self.competidor,
            competidor2=self.competidor2,
            duracion=300,
            registrado_por=self.usuario
        )
    
    def test_crear_amonestacion(self):
        """Prueba la creación de una amonestación"""
        amonestacion = Amonestacion.objects.create(
            combate=self.combate,
            competidor=self.competidor,
            tipo='shido',
            tiempo=180,
            registrado_por=self.usuario
        )
        
        self.assertEqual(amonestacion.combate, self.combate)
        self.assertEqual(amonestacion.competidor, self.competidor)
        self.assertEqual(amonestacion.tipo, 'shido')
        self.assertEqual(amonestacion.tiempo, 180)
    
    def test_tipos_amonestacion_validos(self):
        """Prueba que solo se aceptan tipos de amonestación válidos"""
        tipos_validos = ['shido', 'hansokumake']
        
        for tipo in tipos_validos:
            amonestacion = Amonestacion.objects.create(
                combate=self.combate,
                competidor=self.competidor,
                tipo=tipo,
                tiempo=180,
                registrado_por=self.usuario
            )
            self.assertEqual(amonestacion.tipo, tipo)
            amonestacion.delete()