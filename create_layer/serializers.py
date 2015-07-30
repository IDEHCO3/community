from rest_framework import serializers
from community_app.models import Community_Information_Field_Schema

class Community_Information_Field_Schema_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Community_Information_Field_Schema