from django.db import models
from usuarios.models import Usuario
from django.core.validators import MaxValueValidator, MinValueValidator

class Competidor(models.Model):
    GENERO_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    )
    
    DIVISION_PESO_MASCULINO = (
        ('55', '55 Kg'),
        ('60', '60 Kg'),
        ('66', '66 Kg'),
        ('73', '73 Kg'),
        ('81', '81 Kg'),
        ('90', '90 Kg'),
        ('100', '100 Kg'),
        ('+100', '+100 Kg'),
    )
    
    DIVISION_PESO_FEMENINO = (
        ('44', '44 Kg'),
        ('48', '48 Kg'),
        ('52', '52 Kg'),
        ('57', '57 Kg'),
        ('63', '63 Kg'),
        ('70', '70 Kg'),
        ('78', '78 Kg'),
        ('+78', '+78 Kg'),
    )
    
    CATEGORIA_CHOICES = (
        ('sub21_juvenil', 'Sub 21 - Juvenil'),
        ('sub21_primera', 'Sub 21 - 1ra categoría'),
    )
    
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    identificacion_personal = models.CharField(
        'Identificación Personal (CI)', 
        max_length=11, 
        unique=True,
        help_text='Carnet de identidad del competidor'
    )
    nombre = models.CharField('Nombre completo', max_length=100)
    genero = models.CharField('Género', max_length=1, choices=GENERO_CHOICES)
    division_peso = models.CharField('División de peso', max_length=10)
    categoria = models.CharField('Categoría', max_length=20, choices=CATEGORIA_CHOICES)
    anos_experiencia = models.PositiveIntegerField(
        'Años de experiencia',
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    activo = models.BooleanField('Activo', default=True, help_text='Indica si el competidor está activo en el sistema')
    fecha_registro = models.DateTimeField('Fecha de registro', auto_now_add=True)
    
    def __str__(self):
        return f"{self.nombre} - {self.get_division_peso_display()}"
    
    def get_division_peso_display(self):
        if self.genero == 'M':
            for key, value in self.DIVISION_PESO_MASCULINO:
                if key == self.division_peso:
                    return value
        else:
            for key, value in self.DIVISION_PESO_FEMENINO:
                if key == self.division_peso:
                    return value
        return self.division_peso
    
    class Meta:
        verbose_name = 'Competidor'
        verbose_name_plural = 'Competidores'
        ordering = ['nombre']