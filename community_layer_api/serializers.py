from rest_framework import serializers
from rest_framework.reverse import reverse
from .models import CommunityInformation
from .models import CommunityInformationFieldSchema
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class CustomerHyperlink(serializers.HyperlinkedIdentityField):

    def get_url(self, obj, view_name, request, format):
        url_kwargs = {
            'community': obj.community.id,
            'layer': obj.id
        }
        return reverse(view_name, kwargs=url_kwargs, request=request, format=format)

class CommunityInformationSerializer(GeoFeatureModelSerializer):

    files = CustomerHyperlink(read_only=True, view_name='files:listLayer')

    class Meta:
        model = CommunityInformation
        geo_field = 'geom'
        fields = ['id', 'properties', 'community', 'files']

class CommunityInformationFieldSchemaSerializer(serializers.ModelSerializer):

    class Meta:
        model = CommunityInformationFieldSchema
        fields = ['id', 'name_field', 'type_field']
