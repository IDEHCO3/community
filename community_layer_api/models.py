import importlib
from django.contrib.gis.db import models
from django_pgjson.fields import JsonBField
from community.models import Community


class CommunityInformation(models.Model):

    properties = JsonBField()  # can pass attributes like null, blank, ecc.
    geom = models.GeometryField(null=True)
    community = models.ForeignKey(Community, blank=True)

class CommunityInformationFieldSchema(models.Model):
    name_field = models.CharField(max_length=100)
    type_field = models.CharField(max_length=20)
    #widget_field = models.CharField(max_length=80, blank=True)
    name_module_field = models.CharField(max_length=100, blank=True)
    #name_module_widget_field = models.CharField(max_length=100, blank=True)
    options = JsonBField()
    community = models.ForeignKey(Community)

    def field_object_type(self):
        cls = getattr(importlib.import_module(self.name_module_field), self.type_field)
        cls_instance = cls()
        for key, value in self.options.items():
            setattr(cls_instance, key, value)

        return cls_instance