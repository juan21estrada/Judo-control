from django.db import models
from competidores.models import Competidor
from competiciones.models import Competicion
from combates.models import Combate

class Reporte(models.Model):
    TIPO_CHOICES = [
        ('individual', 'Reporte Individual'),
        ('comparativo', 'Reporte Comparativo'),
    ]
    
    titulo = models.CharField('Título', max_length=100)
    tipo = models.CharField('Tipo de reporte', max_length=20, choices=TIPO_CHOICES)
    fecha_creacion = models.DateTimeField('Fecha de creación', auto_now_add=True)
    fecha_inicio = models.DateField('Fecha de inicio del período')
    fecha_fin = models.DateField('Fecha de fin del período')
    competidores = models.ManyToManyField(Competidor, related_name='reportes')
    competiciones = models.ManyToManyField(Competicion, related_name='reportes', blank=True)
    
    def __str__(self):
        return f"{self.titulo} - {self.get_tipo_display()}"
    
    class Meta:
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'
        ordering = ['-fecha_creacion']

class EstadisticaCompetidor(models.Model):
    competidor = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='estadisticas')
    reporte = models.ForeignKey(Reporte, on_delete=models.CASCADE, related_name='estadisticas')
    
    # Estadísticas generales
    total_combates = models.PositiveIntegerField('Total de combates', default=0)
    combates_ganados = models.PositiveIntegerField('Combates ganados', default=0)
    combates_perdidos = models.PositiveIntegerField('Combates perdidos', default=0)
    
    # Estadísticas Tashi Waza
    total_ataques_tashi_waza = models.PositiveIntegerField('Total de ataques Tashi Waza', default=0)
    ataques_positivos = models.PositiveIntegerField('Ataques positivos', default=0)
    ataques_negativos = models.PositiveIntegerField('Ataques negativos', default=0)
    wazari = models.PositiveIntegerField('Wazari', default=0)
    yuko = models.PositiveIntegerField('Yuko', default=0)
    ippon = models.PositiveIntegerField('Ippon', default=0)
    
    # Desglose por tipo de técnica
    ashi_waza = models.PositiveIntegerField('Ashi Waza', default=0)
    koshi_waza = models.PositiveIntegerField('Koshi Waza', default=0)
    kata_te_waza = models.PositiveIntegerField('Kata Te Waza', default=0)
    sutemi_waza = models.PositiveIntegerField('Sutemi Waza', default=0)
    
    # Combinaciones - NUEVOS CAMPOS
    combinaciones = models.PositiveIntegerField('Combinaciones', default=0)
    ataques_combinados = models.PositiveIntegerField('Ataques Combinados', default=0)
    tecnicas_positivas_combinadas = models.PositiveIntegerField('Técnicas Positivas en Combinaciones', default=0)
    tecnicas_negativas_combinadas = models.PositiveIntegerField('Técnicas Negativas en Combinaciones', default=0)
    
    # Estadísticas Ne Waza
    total_acciones_ne_waza = models.PositiveIntegerField('Total de acciones Ne Waza', default=0)
    inmovilizaciones = models.PositiveIntegerField('Inmovilizaciones', default=0)
    luxaciones = models.PositiveIntegerField('Luxaciones', default=0)
    estrangulaciones = models.PositiveIntegerField('Estrangulaciones', default=0)
    
    # Amonestaciones
    shido = models.PositiveIntegerField('Shido', default=0)
    hansokumake = models.PositiveIntegerField('Hansokumake', default=0)
    
    def __str__(self):
        return f"Estadísticas de {self.competidor.nombre} - {self.reporte.titulo}"
    
    class Meta:
        verbose_name = 'Estadística de Competidor'
        verbose_name_plural = 'Estadísticas de Competidores'
        ordering = ['-id']
