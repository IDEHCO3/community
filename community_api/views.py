from .models import Community

from .permissions import IsOwnerOrReadOnly
from rest_framework import permissions

from rest_framework import generics
from .serializers import CommunitySerializer
from community_layer_api.serializers import CommunityInformationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser

from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from geo1 import settings
from .geoprocessing import GeoProcessing

class CommunityList(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        request.data['manager'] = request.user.id
        geodata = None
        community = None
        if 'filename' in request.data and request.data['filename'] != '':
            filename_with_path = unicode(settings.DEFAULT_FILE_STORAGE, 'utf-8') + request.data['filename']
            geodata = GeoProcessing(filename_with_path)
            request.data['schema'] = geodata.getAttributes()
            del request.data['filename']

            community = self.create(request, *args, **kwargs)

            #here will be the code to save the shapes coordinates
            for feature in geodata.getFeatures():
                geojson_feature = geodata.getGeoJsonFeature(community.data['id'], feature)
                community_information = CommunityInformationSerializer(data=geojson_feature)
                if community_information.is_valid():
                    community_information.save()

            geodata.deleteFiles()
        else:
            community = self.create(request, *args, **kwargs)

        return community

class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )