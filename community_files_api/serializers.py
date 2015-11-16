from rest_framework import serializers
from rest_framework.reverse import reverse
from .models import File, FileLayer

class CustomerHyperlink(serializers.HyperlinkedIdentityField):

    def get_url(self, obj, view_name, request, format):
        url_kwargs = {
            'community': obj.layer.community.id,
            'pk': obj.layer.id
        }
        return reverse(view_name, kwargs=url_kwargs, request=request, format=format)

class FileSerializer(serializers.ModelSerializer):

    community = serializers.HyperlinkedRelatedField(read_only=True, view_name='community:detail')

    class Meta:
        model = File
        fields = ('id', 'name', 'creation_date', 'file', 'community')

    def create(self, validated_data):
        community = self.context.get('view').kwargs.get('community')
        file = File.objects.create(community_id=community, **validated_data)
        return file


class FileLayerSerializer(serializers.ModelSerializer):

    layer = CustomerHyperlink(read_only=True, view_name='communityLayer:detailLayer')

    class Meta:
        model = FileLayer
        fields = ('id', 'name', 'creation_date', 'file', 'layer')

    def create(self, validated_data):
        layer = self.context.get('view').kwargs.get('layer')
        file = FileLayer.objects.create(layer_id=layer, **validated_data)
        return file