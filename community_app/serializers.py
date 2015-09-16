from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from community_layer_api.models import CommunityInformation

class CommunityInformationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = CommunityInformation
        geo_field = 'geom'
        fields = ['id', 'properties', 'community']
