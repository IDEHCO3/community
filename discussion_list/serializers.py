from rest_framework import serializers
from .models import DiscussionThread

class DiscussionThreadSerializer(serializers.ModelSerializer):

    class Meta:
        model = DiscussionThread
        fields = ('id', 'title', 'issue', 'user', 'parent')