# Generated by Django 5.2.1 on 2025-06-03 07:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competiciones', '0002_initial'),
        ('competidores', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='competicion',
            name='competidores',
            field=models.ManyToManyField(blank=True, related_name='competiciones', to='competidores.competidor'),
        ),
    ]
