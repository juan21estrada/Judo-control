from django.db import models
from django.core.exceptions import ValidationError
from competidores.models import Competidor
from competiciones.models import Competicion
from usuarios.models import Usuario

class Combate(models.Model):
    competicion = models.ForeignKey(Competicion, on_delete=models.CASCADE, related_name='combates')
    competidor1 = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='combates_como_competidor1')
    competidor2 = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='combates_como_competidor2')
    duracion = models.DurationField('Duración del combate', null=True, blank=True)
    fecha_hora = models.DateTimeField('Fecha y hora', auto_now_add=True)
    finalizado = models.BooleanField('Finalizado', default=False)
    iniciado = models.BooleanField('Iniciado', default=False)
    ganador = models.ForeignKey(Competidor, on_delete=models.SET_NULL, null=True, blank=True, related_name='combates_ganados')
    registrado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='combates_registrados')
    
    def clean(self):
        # Verificar que los competidores estén inscritos en la competición
        if not self.competicion.competidores.filter(id=self.competidor1.id).exists():
            raise ValidationError({
                'competidor1': 'Este competidor no está inscrito en la competición'
            })
        
        if not self.competicion.competidores.filter(id=self.competidor2.id).exists():
            raise ValidationError({
                'competidor2': 'Este competidor no está inscrito en la competición'
            })
        
        # Verificar que ambos competidores sean del mismo género
        if self.competidor1.genero != self.competidor2.genero:
            raise ValidationError({
                'competidor2': 'Los competidores deben ser del mismo género para poder enfrentarse'
            })
        
        # Verificar que los competidores no sean la misma persona
        if self.competidor1.id == self.competidor2.id:
            raise ValidationError({
                'competidor2': 'Un competidor no puede enfrentarse a sí mismo'
            })
    
        # Verificar que no se exceda la cantidad de combates planificados
        combates_actuales = self.competicion.combates.count()
        if not self.pk and combates_actuales >= self.competicion.cantidad_combates_planificados:
            raise ValidationError('No se pueden crear más combates de los planificados')

        super().clean()
    
    def __str__(self):
        return f"{self.competidor1.nombre} vs {self.competidor2.nombre} - {self.competicion.nombre}"
    
    def calcular_puntuacion_competidor(self, competidor_id):
        """Calcula la puntuación actual de un competidor según reglas IJF"""
        puntuacion = {
            'ippon': 0,
            'waza_ari': 0,
            'shidos': 0,
            'hansoku_make': False,
            'ganador': False
        }
        
        # Contar acciones Tashi Waza INDIVIDUALES (que NO pertenecen a combinaciones)
        acciones_tashi = self.acciones_tashi_waza.filter(
            competidor_id=competidor_id, 
            efectiva=True,
            accion_combinada__isnull=True
        )
        for accion in acciones_tashi:
            if accion.puntuacion == 'ippon':
                puntuacion['ippon'] += 1
            elif accion.puntuacion == 'waza_ari':
                puntuacion['waza_ari'] += 1
        
        # Contar acciones Ne Waza INDIVIDUALES (que NO pertenecen a combinaciones)
        acciones_ne = self.acciones_ne_waza.filter(
            competidor_id=competidor_id, 
            efectiva=True,
            accion_combinada__isnull=True
        )
        for accion in acciones_ne:
            if accion.puntuacion == 'ippon':
                puntuacion['ippon'] += 1
            elif accion.puntuacion == 'waza_ari':
                puntuacion['waza_ari'] += 1
        
        # Contar SOLO las acciones combinadas efectivas (no las técnicas individuales dentro)
        acciones_combinadas = self.acciones_combinadas.filter(competidor_id=competidor_id, efectiva=True)
        for accion in acciones_combinadas:
            if accion.puntuacion == 'ippon':
                puntuacion['ippon'] += 1
            elif accion.puntuacion == 'waza_ari':
                puntuacion['waza_ari'] += 1
        
        # Contar shidos
        shidos = self.amonestaciones.filter(competidor_id=competidor_id, tipo='shido').count()
        puntuacion['shidos'] = shidos
        
        # Verificar hansoku-make por acumulación de shidos (3 shidos = hansoku-make)
        if shidos >= 3:
            puntuacion['hansoku_make'] = True
            puntuacion['ganador'] = False  # El oponente gana
            return puntuacion
        
        # Verificar hansoku-make directo
        hansoku_directo = self.amonestaciones.filter(competidor_id=competidor_id, tipo='hansoku_make').exists()
        if hansoku_directo:
            puntuacion['hansoku_make'] = True
            puntuacion['ganador'] = False
            return puntuacion
        
        # Verificar condiciones de victoria
        # 1. Ippon directo
        if puntuacion['ippon'] >= 1:
            puntuacion['ganador'] = True
            return puntuacion
        
        # 2. Dos waza-ari = ippon ("waza-ari awasete ippon")
        if puntuacion['waza_ari'] >= 2:
            puntuacion['ganador'] = True
            puntuacion['ippon'] = 1  # Se convierte en ippon
            return puntuacion
        
        return puntuacion
    
    def verificar_finalizacion_automatica(self):
        """Verifica si el combate debe finalizar automáticamente según reglas IJF"""
        if self.finalizado:
            return None
        
        puntuacion_c1 = self.calcular_puntuacion_competidor(self.competidor1.id)
        puntuacion_c2 = self.calcular_puntuacion_competidor(self.competidor2.id)
        
        # Verificar si competidor 1 gana
        if puntuacion_c1['ganador'] or puntuacion_c2['hansoku_make']:
            self.ganador = self.competidor1
            self.finalizado = True
            self.save()
            return {
                'ganador': self.competidor1.id,
                'motivo': 'ippon' if puntuacion_c1['ippon'] >= 1 else 'waza_ari_awasete_ippon' if puntuacion_c1['waza_ari'] >= 2 else 'hansoku_make_oponente',
                'puntuacion_ganador': puntuacion_c1,
                'puntuacion_perdedor': puntuacion_c2
            }
        
        # Verificar si competidor 2 gana
        if puntuacion_c2['ganador'] or puntuacion_c1['hansoku_make']:
            self.ganador = self.competidor2
            self.finalizado = True
            self.save()
            return {
                'ganador': self.competidor2.id,
                'motivo': 'ippon' if puntuacion_c2['ippon'] >= 1 else 'waza_ari_awasete_ippon' if puntuacion_c2['waza_ari'] >= 2 else 'hansoku_make_oponente',
                'puntuacion_ganador': puntuacion_c2,
                'puntuacion_perdedor': puntuacion_c1
            }
        
        return None
    
    class Meta:
        verbose_name = 'Combate'
        verbose_name_plural = 'Combates'
        ordering = ['-fecha_hora']

class AccionCombinada(models.Model):
    combate = models.ForeignKey(Combate, on_delete=models.CASCADE, related_name='acciones_combinadas')
    competidor = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='acciones_combinadas')
    descripcion = models.CharField('Descripción de la combinación', max_length=200)
    descripcion_detallada = models.TextField('Descripción detallada con técnicas', blank=True)
    tiempo = models.DurationField('Tiempo de la acción')
    efectiva = models.BooleanField('Efectiva', default=False)
    puntuacion = models.CharField('Puntuación', max_length=20, choices=[
        ('sin_puntuacion', 'Sin puntuación'),
        ('yuko', 'Yuko'),  # Mantenido para compatibilidad
        ('waza_ari', 'Waza-ari'),
        ('ippon', 'Ippon')
    ], default='sin_puntuacion')
    registrado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='acciones_combinadas_registradas')
    
    def __str__(self):
        return f"{self.competidor.nombre} - {self.descripcion}"
    
    class Meta:
        verbose_name = 'Acción Combinada'
        verbose_name_plural = 'Acciones Combinadas'

class AccionTashiWaza(models.Model):
    # Te-waza (16 técnicas)
    TE_WAZA_CHOICES = [
        ('seoi_nage', 'Seoi-nage'),
        ('ippon_seoi_nage', 'Ippon-seoi-nage'),
        ('seoi_otoshi', 'Seoi-otoshi'),
        ('tai_otoshi', 'Tai-otoshi'),
        ('kata_guruma', 'Kata-guruma'),
        ('sukui_nage', 'Sukui-nage'),
        ('obi_otoshi', 'Obi-otoshi'),
        ('uki_otoshi', 'Uki-otoshi'),
        ('sumi_otoshi', 'Sumi-otoshi'),
        ('yama_arashi', 'Yama-arashi'),
        ('obi_tori_gaeshi', 'Obi-tori-gaeshi'),
        ('morote_gari', 'Morote-gari'),
        ('kuchiki_taoshi', 'Kuchiki-taoshi'),
        ('kibisu_gaeshi', 'Kibisu-gaeshi'),
        ('uchi_mata_sukashi', 'Uchi-mata-sukashi'),
        ('ko_uchi_gaeshi', 'Ko-uchi-gaeshi'),
    ]
    
    # Koshi-waza (10 técnicas)
    KOSHI_WAZA_CHOICES = [
        ('uki_goshi', 'Uki-goshi'),
        ('o_goshi', 'O-goshi'),
        ('koshi_guruma', 'Koshi-guruma'),
        ('tsurikomi_goshi', 'Tsurikomi-goshi'),
        ('sode_tsurikomi_goshi', 'Sode-tsurikomi-goshi'),
        ('harai_goshi', 'Harai-goshi'),
        ('tsuri_goshi', 'Tsuri-goshi'),
        ('hane_goshi', 'Hane-goshi'),
        ('utsuri_goshi', 'Utsuri-goshi'),
        ('ushiro_goshi', 'Ushiro-goshi'),
    ]
    
    # Ashi-waza (21 técnicas)
    ASHI_WAZA_CHOICES = [
        ('ashi_guruma', 'Ashi-guruma'),
        ('de_ashi_harai', 'De-ashi-harai'),
        ('harai_tsurikomi_ashi', 'Harai-tsurikomi-ashi'),
        ('hiza_guruma', 'Hiza-guruma'),
        ('kosoto_gake', 'Kosoto-gake'),
        ('kosoto_gari', 'Kosoto-gari'),
        ('kouchi_gari', 'Kouchi-gari'),
        ('o_guruma', 'O-guruma'),
        ('okuri_ashi_harai', 'Okuri-ashi-harai'),
        ('osoto_gari', 'Osoto-gari'),
        ('osoto_guruma', 'Osoto-guruma'),
        ('osoto_otoshi', 'Osoto-otoshi'),
        ('ouchi_gari', 'Ouchi-gari'),
        ('sasae_tsurikomi_ashi', 'Sasae-tsurikomi-ashi'),
        ('uchi_mata', 'Uchi-mata'),
        ('osoto_gaeshi', 'Osoto-gaeshi'),
        ('ouchi_gaeshi', 'Ouchi-gaeshi'),
        ('hane_goshi_gaeshi', 'Hane-goshi-gaeshi'),
        ('harai_goshi_gaeshi', 'Harai-goshi-gaeshi'),
        ('uchi_mata_gaeshi', 'Uchi-mata-gaeshi'),
        ('tsubame_gaeshi', 'Tsubame-gaeshi'),
    ]
    
    # Sutemi-waza (21 técnicas)
    MA_SUTEMI_CHOICES = [
        ('hikikomi_gaeshi', 'Hikikomi-gaeshi'),
        ('sumi_gaeshi', 'Sumi-gaeshi'),
        ('tawara_gaeshi', 'Tawara-gaeshi'),
        ('tomoe_nage', 'Tomoe-nage'),
        ('ura_nage', 'Ura-nage'),
    ]
    
    YOKO_SUTEMI_CHOICES = [
        ('daki_wakare', 'Daki-wakare'),
        ('hane_makikomi', 'Hane-makikomi'),
        ('harai_makikomi', 'Harai-makikomi'),
        ('osoto_makikomi', 'Osoto-makikomi'),
        ('soto_makikomi', 'Soto-makikomi'),
        ('tani_otoshi', 'Tani-otoshi'),
        ('uchi_makikomi', 'Uchi-makikomi'),
        ('uchi_mata_makikomi', 'Uchi-mata-makikomi'),
        ('uki_waza', 'Uki-waza'),
        ('yoko_gake', 'Yoko-gake'),
        ('yoko_guruma', 'Yoko-guruma'),
        ('yoko_otoshi', 'Yoko-otoshi'),
        ('yoko_wakare', 'Yoko-wakare'),
        ('ko_uchi_makikomi', 'Ko-uchi-makikomi'),
        ('kani_basami', 'Kani-basami (Prohibida)'),
        ('kawazu_gake', 'Kawazu-gake (Prohibida)'),
    ]
    
    TIPO_CHOICES = [
        ('kata_te_waza', 'Kata-te-waza (Técnicas de mano)'),  # Cambiado de 'te_waza'
        ('koshi_waza', 'Koshi-waza (Técnicas de cadera)'),
        ('ashi_waza', 'Ashi-waza (Técnicas de pie)'),
        ('ma_sutemi_waza', 'Ma-sutemi-waza (Sacrificio frontal)'),
        ('yoko_sutemi_waza', 'Yoko-sutemi-waza (Sacrificio lateral)'),
    ]
    
    TECNICA_CHOICES = TE_WAZA_CHOICES + KOSHI_WAZA_CHOICES + ASHI_WAZA_CHOICES + MA_SUTEMI_CHOICES + YOKO_SUTEMI_CHOICES
    
    PUNTUACION_CHOICES = [
        ('ippon', 'Ippon'),
        ('waza_ari', 'Waza-ari'),
        ('yuko', 'Yuko'),
        ('sin_puntuacion', 'Sin puntuación'),
    ]
    
    combate = models.ForeignKey(Combate, on_delete=models.CASCADE, related_name='acciones_tashi_waza')
    competidor = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='acciones_tashi_waza')
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    tecnica = models.CharField('Técnica específica', max_length=30, choices=TECNICA_CHOICES)
    puntuacion = models.CharField('Puntuación', max_length=15, choices=PUNTUACION_CHOICES, default='sin_puntuacion')
    efectiva = models.BooleanField('Efectiva', default=True)
    accion_combinada = models.ForeignKey(AccionCombinada, on_delete=models.CASCADE, null=True, blank=True, related_name='acciones_tashi')
    tiempo = models.DurationField('Tiempo de la acción')
    registrado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='acciones_tashi_registradas')
    
    def __str__(self):
        return f"{self.competidor.nombre} - {self.get_tecnica_display()} - {self.get_puntuacion_display()}"
    
    class Meta:
        verbose_name = 'Acción Tashi Waza'
        verbose_name_plural = 'Acciones Tashi Waza'

class AccionNeWaza(models.Model):
    # Osaekomi-waza (10 técnicas)
    OSAEKOMI_CHOICES = [
        ('kesa_gatame', 'Kesa-gatame'),
        ('kata_gatame', 'Kata-gatame'),
        ('kami_shiho_gatame', 'Kami-shiho-gatame'),
        ('kuzure_kami_shiho_gatame', 'Kuzure-kami-shiho-gatame'),
        ('yoko_shiho_gatame', 'Yoko-shiho-gatame'),
        ('tate_shiho_gatame', 'Tate-shiho-gatame'),
        ('kuzure_kesa_gatame', 'Kuzure-kesa-gatame'),
        ('uki_gatame', 'Uki-gatame'),
        ('ura_gatame', 'Ura-gatame'),
        ('ushiro_kesa_gatame', 'Ushiro-kesa-gatame'),
    ]
    
    # Shime-waza (12 técnicas)
    SHIME_CHOICES = [
        ('nami_juji_jime', 'Nami-juji-jime'),
        ('gyaku_juji_jime', 'Gyaku-juji-jime'),
        ('kata_juji_jime', 'Kata-juji-jime'),
        ('hadaka_jime', 'Hadaka-jime'),
        ('okuri_eri_jime', 'Okuri-eri-jime'),
        ('kataha_jime', 'Kataha-jime'),
        ('do_jime', 'Do-jime'),
        ('sode_guruma_jime', 'Sode-guruma-jime'),
        ('kata_te_jime', 'Kata-te-jime'),
        ('ryo_te_jime', 'Ryo-te-jime'),
        ('tsukkomi_jime', 'Tsukkomi-jime'),
        ('sankaku_jime', 'Sankaku-jime'),
    ]
    
    # Kansetsu-waza (10 técnicas)
    KANSETSU_CHOICES = [
        ('ude_garami', 'Ude-garami'),
        ('ude_hishigi_juji_gatame', 'Ude-hishigi-juji-gatame'),
        ('ude_hishigi_ude_gatame', 'Ude-hishigi-ude-gatame'),
        ('ude_hishigi_hiza_gatame', 'Ude-hishigi-hiza-gatame'),
        ('ude_hishigi_waki_gatame', 'Ude-hishigi-waki-gatame'),
        ('ude_hishigi_hara_gatame', 'Ude-hishigi-hara-gatame'),
        ('ude_hishigi_ashi_gatame', 'Ude-hishigi-ashi-gatame'),
        ('ude_hishigi_te_gatame', 'Ude-hishigi-te-gatame'),
        ('ude_hishigi_sankaku_gatame', 'Ude-hishigi-sankaku-gatame'),
        ('ashi_garami', 'Ashi-garami'),
    ]
    
    TIPO_CHOICES = [
        ('osaekomi_waza', 'Osaekomi-waza (Inmovilización)'),
        ('shime_waza', 'Shime-waza (Estrangulación)'),
        ('kansetsu_waza', 'Kansetsu-waza (Luxación)'),
    ]
    
    TECNICA_CHOICES = OSAEKOMI_CHOICES + SHIME_CHOICES + KANSETSU_CHOICES
    
    PUNTUACION_CHOICES = [
        ('ippon', 'Ippon'),
        ('waza_ari', 'Waza-ari'),
        ('sin_puntuacion', 'Sin puntuación'),
    ]
    
    combate = models.ForeignKey(Combate, on_delete=models.CASCADE, related_name='acciones_ne_waza')
    competidor = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='acciones_ne_waza')
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    tecnica = models.CharField('Técnica específica', max_length=30, choices=TECNICA_CHOICES)
    puntuacion = models.CharField('Puntuación', max_length=15, choices=PUNTUACION_CHOICES, default='sin_puntuacion')
    duracion_control = models.DurationField('Duración del control', null=True, blank=True)  # Para osaekomi
    efectiva = models.BooleanField('Efectiva', default=True)
    accion_combinada = models.ForeignKey(AccionCombinada, on_delete=models.CASCADE, null=True, blank=True, related_name='acciones_ne')
    tiempo = models.DurationField('Tiempo de la acción')
    registrado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='acciones_ne_registradas')
    
    def save(self, *args, **kwargs):
        # Lógica automática de puntuación para osaekomi
        if self.tipo == 'osaekomi_waza' and self.duracion_control:
            segundos = self.duracion_control.total_seconds()
            if segundos >= 20:
                self.puntuacion = 'ippon'
            elif segundos >= 10:
                self.puntuacion = 'waza_ari'
            else:
                self.puntuacion = 'sin_puntuacion'
        # Para shime y kansetsu, si es efectiva es ippon
        elif self.tipo in ['shime_waza', 'kansetsu_waza'] and self.efectiva:
            self.puntuacion = 'ippon'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.competidor.nombre} - {self.get_tecnica_display()} - {self.get_puntuacion_display()}"
    
    class Meta:
        verbose_name = 'Acción Ne Waza'
        verbose_name_plural = 'Acciones Ne Waza'

class Amonestacion(models.Model):
    TIPO_CHOICES = (
        ('shido', 'Shido'),
        ('hansokumake', 'Hansokumake'),
    )
    
    combate = models.ForeignKey(Combate, on_delete=models.CASCADE, related_name='amonestaciones')
    competidor = models.ForeignKey(Competidor, on_delete=models.CASCADE, related_name='amonestaciones')
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    tiempo = models.DurationField('Tiempo de la amonestación')
    registrado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='amonestaciones_registradas', default=1)
    
    def __str__(self):
        return f"{self.competidor.nombre} - {self.get_tipo_display()}"
    
    class Meta:
        verbose_name = 'Amonestación'
        verbose_name_plural = 'Amonestaciones'
        ordering = ['-tiempo']