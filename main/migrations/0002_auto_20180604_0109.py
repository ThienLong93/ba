# Generated by Django 2.0.5 on 2018-06-03 23:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='scrapytask',
            old_name='csrf_token',
            new_name='pid',
        ),
    ]
