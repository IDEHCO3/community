from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Community_Information

class Community_InformationSerializer( GeoFeatureModelSerializer ):
    class Meta:
        model = Community_Information
        geo_field = 'geom'
        fields = ['id', 'properties', 'community']
