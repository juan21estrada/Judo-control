# Generated by Django 4.2.11 on 2025-06-08 06:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('combates', '0008_accioncombinada_descripcion_detallada_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='amonestacion',
            options={'ordering': ['-tiempo'], 'verbose_name': 'Amonestación', 'verbose_name_plural': 'Amonestaciones'},
        ),
    ]
