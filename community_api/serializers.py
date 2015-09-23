from rest_framework import serializers
from .models import Community
from community_layer_api.serializers import CommunityInformationFieldSchemaSerializer

class CommunitySerializer(serializers.ModelSerializer):
    #schema = CommunityInformationFieldSchemaSerializer(many=True, read_only=True)
    class Meta:
        model = Community
        fields = ('id', 'name', 'description', 'need_invitation', 'manager')
        #fields = ('id', 'name', 'description', 'need_invitation', 'manager', 'schema')
