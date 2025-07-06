from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from usuarios.models import Usuario
from competidores.models import Competidor

class Competicion(models.Model):
    EVENTO_CHOICES = (
        ('entrenamiento', 'Entrenamiento'),
        ('combate_oficial', 'Combate oficial'),
    )
    
    TIPO_CHOICES = (
        ('nacional', 'Nacional'),
        ('internacional', 'Internacional'),
    )
    
    nombre = models.CharField('Nombre', max_length=100)
    fecha = models.DateField('Fecha de inicio')
    fecha_fin = models.DateField('Fecha de fin', null=True, blank=True)
    evento = models.CharField('Evento', max_length=20, choices=EVENTO_CHOICES)
    tipo = models.CharField('Tipo de competencia', max_length=20, choices=TIPO_CHOICES)
    cantidad_atletas = models.PositiveIntegerField('Cantidad de atletas')
    cantidad_combates_planificados = models.IntegerField(default=0)
    cantidad_combates_realizados = models.PositiveIntegerField('Número de combates realizados', default=0)
    finalizada = models.BooleanField('Competición finalizada', default=False)
    creado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='competiciones_creadas')
    fecha_creacion = models.DateTimeField('Fecha de creación', auto_now_add=True)
    competidores = models.ManyToManyField(Competidor, related_name='competiciones', blank=True)
    
    def save(self, *args, **kwargs):
        # Guardar primero sin validar para obtener el ID
        if self._state.adding:  # Si es un nuevo objeto
            super().save(*args, **kwargs)
            return
            
        # Para objetos existentes, realizar validaciones normales
        self.clean()
        super().save(*args, **kwargs)

    def clean(self):
        if not self._state.adding:  # Solo validar si no es un nuevo objeto
            if self.cantidad_combates_realizados > self.cantidad_combates_planificados:
                raise ValidationError('El número de combates realizados no puede ser mayor que el número de combates planificados')
            
            if self.competidores.count() > self.cantidad_atletas:
                raise ValidationError({
                    'competidores': 'La cantidad de competidores inscritos no puede exceder la cantidad máxima de atletas'
                })
    
    def is_finished_by_date(self):
        """Verifica si la competición debería estar finalizada por fecha"""
        if self.fecha_fin:
            return timezone.now().date() > self.fecha_fin
        return False
    
    def update_status_by_date(self):
        """Actualiza el estado de finalización basándose en la fecha"""
        if self.is_finished_by_date() and not self.finalizada:
            self.finalizada = True
            self.save(update_fields=['finalizada'])
            return True
        return False
    
    def __str__(self):
        return f"{self.nombre} - {self.fecha}"
    
    class Meta:
        verbose_name = 'Competición'
        verbose_name_plural = 'Competiciones'
        ordering = ['-fecha']