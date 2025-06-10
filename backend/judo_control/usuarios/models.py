from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El Email es obligatorio')
            
        email = self.normalize_email(email)
        # Generar username basado en el email si no se proporciona
        if 'username' not in extra_fields or not extra_fields['username']:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while self.model.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            extra_fields['username'] = username

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'administrador')
        
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    ROLES = (
        ('administrador', 'Administrador'),
        ('entrenador', 'Entrenador'),
        ('competidor', 'Competidor'),
    )
    
    username = models.CharField('Nombre de usuario', max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField('Correo electrónico', unique=True)
    nombre = models.CharField('Nombre completo', max_length=100)
    rol = models.CharField('Rol', max_length=20, choices=ROLES, default='competidor')
    
    USERNAME_FIELD = 'email'  # Cambiar a email
    REQUIRED_FIELDS = ['nombre']  # Quitar email de aquí
    
    objects = UsuarioManager()
    
    def save(self, *args, **kwargs):
        if not self.username:
            # Generar username basado en el email si no existe
            base_username = self.email.split('@')[0]
            username = base_username
            counter = 1
            while Usuario.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            self.username = username
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'