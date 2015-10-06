from rest_framework import serializers
from .models import DiscussionThread
from rest_framework.reverse import reverse
from community_api.models import Community

class CustomerHyperlink(serializers.HyperlinkedIdentityField):

    def get_url(self, obj, view_name, request, format):
        url_kwargs = {
            'community': obj.community.id,
            'pk': obj.pk
        }
        return reverse(view_name, kwargs=url_kwargs, request=request, format=format)

class DiscussionThreadSerializer(serializers.ModelSerializer):

    user = serializers.SlugRelatedField(read_only=True, slug_field='first_name')
    community = serializers.HyperlinkedRelatedField(view_name='community:detail', queryset=Community.objects.all())
    reply = CustomerHyperlink(read_only=True, view_name='issue:answers')

    reply_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DiscussionThread
        fields = ('id', 'title', 'issue', 'user', 'community', 'post_date', 'parent', 'reply_count', 'reply')
        extra_kwargs = {'parent': {'write_only': True}}

    def create(self, validated_data):
        user = self.context['request'].user
        reply = DiscussionThread.objects.create(user=user, **validated_data)

        return reply

    def get_reply_count(self, obj):
        return DiscussionThread.objects.filter(parent=obj).count()