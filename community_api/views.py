from .models import Community

from permissions import IsOwnerOrReadOnly
from rest_framework import permissions

from rest_framework import generics
from .serializers import CommunitySerializer

from rest_framework_jwt.authentication import JSONWebTokenAuthentication

class CommunityList(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )

class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )