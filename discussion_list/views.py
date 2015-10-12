from rest_framework import permissions
from rest_framework import generics
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .serializers import DiscussionThreadSerializer
from .models import DiscussionThread
from .permissions import IsOwnerOrReadOnly



class DiscussionThreadList(generics.ListCreateAPIView):
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get_queryset(self):
        community = self.kwargs.get('community')
        query = DiscussionThread.objects.filter(community_id=community, parent=None)
        return query


class DiscussionThreadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get_queryset(self):
        community = self.kwargs.get('community')
        issue = self.kwargs.get('pk')
        query = DiscussionThread.objects.filter(community_id=community, id=issue)
        return query


class DiscussionThreadDetailAnswers(generics.ListCreateAPIView):
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer

    def get_queryset(self):
        issue = self.kwargs.get('pk')
        community = self.kwargs.get('community')
        query = DiscussionThread.objects.filter(community=community, parent=issue)
        return query
