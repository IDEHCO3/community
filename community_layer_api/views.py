from rest_framework import generics
from .serializers import *
from .models import *

from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from .metadata import LayerMetadata

# Create your views here.

class CommunityInformationFieldSchemaList(generics.ListCreateAPIView):
    serializer_class = CommunityInformationFieldSchemaSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        community = kwargs.get("community", None)
        request.data['community'] = community
        return self.create(request, *args, **kwargs)

    def get_queryset(self):

        community = self.kwargs.get("community")
        if community is not None:
            queryset_filter = CommunityInformationFieldSchema.objects.filter(community_id=community)
            return queryset_filter

        queryset = CommunityInformationFieldSchema.objects.all()
        return queryset

class CommunityInformationFieldSchemaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityInformationFieldSchema.objects.all()
    serializer_class = CommunityInformationFieldSchemaSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )

    def put(self, request, *args, **kwargs):
        community = kwargs.get("community", None)
        request.data['community'] = community
        return self.update(request, *args, **kwargs)

    def get_queryset(self):

        community = self.kwargs.get("community")
        if community is not None:
            queryset_filter = CommunityInformationFieldSchema.objects.filter(community_id=community)
            return queryset_filter

        queryset = CommunityInformationFieldSchema.objects.all()
        return queryset

class CommunityInformationList(generics.ListCreateAPIView):
    queryset = CommunityInformation.objects.all()
    serializer_class = CommunityInformationSerializer
    metadata_class = LayerMetadata

    permission_classes = (IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        community = kwargs.get("pk", None)
        request.data['properties']['community'] = community
        return self.create(request, *args, **kwargs)

    def get_queryset(self):

        community = self.kwargs.get("pk")
        if community is not None:
            queryset_filter = CommunityInformation.objects.filter(community_id=community)
            return queryset_filter

        queryset = CommunityInformation.objects.all()
        return queryset

class CommunityInformationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityInformation.objects.all()
    serializer_class = CommunityInformationSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )

    def put(self, request, *args, **kwargs):
        community = kwargs.get("community", None)
        request.data['properties']['community'] = community
        return self.update(request, *args, **kwargs)

    def get_queryset(self):

        community = self.kwargs.get("community")
        if community is not None:
            queryset_filter = CommunityInformation.objects.filter(community_id=community)
            return queryset_filter

        queryset = CommunityInformation.objects.all()
        return queryset
