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


class DiscussionThreadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )