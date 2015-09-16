from rest_framework import serializers
from .models import CommunityInformation
from .models import CommunityInformationFieldSchema
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class CommunityInformationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = CommunityInformation
        geo_field = 'geom'
        fields = ['id', 'properties', 'community']

class CommunityInformationFieldSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityInformationFieldSchema
