# Generated by Django 5.2.1 on 2025-06-05 04:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competiciones', '0004_alter_competicion_cantidad_combates_planificados'),
    ]

    operations = [
        migrations.AddField(
            model_name='competicion',
            name='finalizada',
            field=models.BooleanField(default=False, verbose_name='Competición finalizada'),
        ),
    ]
