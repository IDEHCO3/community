# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_pgjson.fields
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('community', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='CommunityInformation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('properties', django_pgjson.fields.JsonBField()),
                ('geom', django.contrib.gis.db.models.fields.GeometryField(srid=4326, null=True)),
                ('community', models.ForeignKey(to='community.Community', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='CommunityInformationFieldSchema',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name_field', models.CharField(max_length=100)),
                ('type_field', models.CharField(max_length=20)),
                ('name_module_field', models.CharField(max_length=100, blank=True)),
                ('options', django_pgjson.fields.JsonBField()),
                ('community', models.ForeignKey(to='community.Community')),
            ],
        ),
    ]
