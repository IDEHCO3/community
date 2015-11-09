from .models import Community

from permissions import IsOwnerOrReadOnly
from rest_framework import permissions

from rest_framework import generics
from .serializers import CommunitySerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser

from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from geo1 import settings
import os

class CommunityList(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        request.data['manager'] = request.user.id
        return self.create(request, *args, **kwargs)

class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    authentication_classes = (JSONWebTokenAuthentication, )

class FileUploadView(APIView):
    parser_classes = (FileUploadParser,)

    def put(self, request, filename, format=None):
        file_obj = request.data['file']

        if not os.path.exists(settings.DEFAULT_FILE_STORAGE):
            os.makedirs(settings.DEFAULT_FILE_STORAGE)

        filename_with_path = unicode(settings.DEFAULT_FILE_STORAGE, 'utf-8')+filename


        with open(filename_with_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        return Response(status=204)