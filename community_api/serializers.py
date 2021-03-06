from rest_framework import serializers
from .models import *
from community_layer_api.models import CommunityInformationFieldSchema
from community_layer_api.serializers import CommunityInformationFieldSchemaSerializer
from community import settings

class CommunitySerializer(serializers.ModelSerializer):

    schema = CommunityInformationFieldSchemaSerializer(many=True)
    issues = serializers.HyperlinkedIdentityField(read_only=True, view_name='issue:list', lookup_url_kwarg='community')
    layers = serializers.HyperlinkedIdentityField(read_only=True, view_name='communityLayer:listLayer')
    files = serializers.HyperlinkedIdentityField(read_only=True, view_name='files:listCommunity', lookup_url_kwarg='community')

    class Meta:
        model = Community
        fields = ('id', 'name', 'description', 'need_invitation', 'manager', 'schema', 'issues', 'layers', 'files')

    def create(self, validated_data):
        schema = validated_data.pop('schema')
        community = Community.objects.create(**validated_data)
        for attribute in schema:
            CommunityInformationFieldSchema.objects.create(community=community, **attribute)

        return community

    def update(self, instance, validated_data):
        schema_data = validated_data.pop('schema')
        schema = instance.schema.all()

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.need_invitation = validated_data.get('need_invitation', instance.need_invitation)

        instance.save()

        for attribute in schema:
            attribute.delete()

        for attribute in schema_data:
            CommunityInformationFieldSchema.objects.create(community=instance, **attribute)

        return instance

class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoleMembership
        fields = ('name', 'actions')

class CustomerHyperlinkMembership(serializers.HyperlinkedRelatedField):

    def get_url(self, obj, view_name, request, format):
        url = request.scheme + "://" + request.get_host() + settings.USER_DATA_URL + str(obj.pk)
        return url

class MembershipSerializer(serializers.ModelSerializer):

    role = RoleSerializer(read_only=True)
    member = CustomerHyperlinkMembership(read_only=True, view_name='community:membershipDetail')

    class Meta:
        model = MembershipCommunity
        fields = ('id', 'member', 'community', 'role', 'date_joined', 'is_blocked', 'is_banned',  'invite_reason')


class InvitationSerialiazer(serializers.ModelSerializer):

    class Meta:
        model = Invitation
        fields = ('id', 'email', 'community')