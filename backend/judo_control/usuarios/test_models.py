from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

Usuario = get_user_model()

class UsuarioModelTest(TestCase):
    """Pruebas unitarias para el modelo Usuario"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.usuario_data = {
            'email': 'test@example.com',
            'nombre': 'Usuario Test',
            'rol': 'entrenador'
        }
    
    def test_crear_usuario_exitoso(self):
        """Prueba la creación exitosa de un usuario"""
        usuario = Usuario.objects.create_user(**self.usuario_data)
        
        self.assertEqual(usuario.email, self.usuario_data['email'])
        self.assertEqual(usuario.nombre, self.usuario_data['nombre'])
        self.assertEqual(usuario.rol, self.usuario_data['rol'])
        self.assertTrue(usuario.is_active)
        self.assertFalse(usuario.is_staff)
        self.assertFalse(usuario.is_superuser)
    
    def test_crear_superusuario(self):
        """Prueba la creación de un superusuario"""
        superuser = Usuario.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_active)
    
    def test_email_unico(self):
        """Prueba que el email debe ser único"""
        Usuario.objects.create_user(**self.usuario_data)
        
        with self.assertRaises(IntegrityError):
            Usuario.objects.create_user(**self.usuario_data)
    
    def test_email_requerido(self):
        """Prueba que el email es requerido"""
        with self.assertRaises(ValueError):
            Usuario.objects.create_user(email='', password='testpass123')
    
    def test_generacion_username_automatico(self):
        """Prueba que se genera username automáticamente desde el email"""
        usuario = Usuario.objects.create_user(**self.usuario_data)
        expected_username = self.usuario_data['email'].split('@')[0]
        self.assertEqual(usuario.username, expected_username)
    
    def test_str_representation(self):
        """Prueba la representación string del usuario"""
        usuario = Usuario.objects.create_user(**self.usuario_data)
        self.assertEqual(str(usuario), self.usuario_data['email'])
    
    def test_roles_validos(self):
        """Prueba que solo se aceptan roles válidos"""
        roles_validos = ['administrador', 'entrenador', 'juez']
        
        for rol in roles_validos:
            usuario_data = self.usuario_data.copy()
            usuario_data['email'] = f'{rol}@example.com'
            usuario_data['rol'] = rol
            
            usuario = Usuario.objects.create_user(**usuario_data)
            self.assertEqual(usuario.rol, rol)