from rest_framework import serializers
from .models import DiscussionThread

class DiscussionThreadSerializer(serializers.ModelSerializer):

    user = serializers.SlugRelatedField(read_only=True, slug_field='first_name')
    reply = serializers.HyperlinkedIdentityField(read_only=True, view_name='issue:answers')

    reply_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DiscussionThread
        fields = ('id', 'title', 'issue', 'user', 'reply_count', 'reply', 'parent')
        extra_kwargs = {'parent': {'write_only': True}}

    def create(self, validated_data):
        user = self.context['request'].user
        reply = DiscussionThread.objects.create(user=user, **validated_data)

        return reply

    def get_reply_count(self, obj):
        return DiscussionThread.objects.filter(parent=obj).count()