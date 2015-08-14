from rest_framework import serializers
from community_app.models import CommunityInformationFieldSchema

class CommunityInformationFieldSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityInformationFieldSchema