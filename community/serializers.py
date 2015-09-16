from rest_framework import serializers
from community_api.models import Community

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ('id', 'name', 'description', 'need_invitation', 'manager')

