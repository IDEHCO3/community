from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from community import settings

from .serializers import FileSerializer, FileLayerSerializer
from .models import File, FileLayer

# Create your views here.

class FileUploadView(APIView):

    parser_classes = (FileUploadParser,)

    def put(self, request, filename, format=None):
        file_obj = request.data['file']

        filename_with_path = unicode(settings.TEMPORARY_STORAGE, 'utf-8') + filename

        with open(filename_with_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        return Response(status=status.HTTP_204_NO_CONTENT)

class FileList(generics.ListCreateAPIView):

    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser,)

    def get_queryset(self):
        community_id = self.kwargs.get('community')
        return File.objects.filter(community_id=community_id)


class FileDetail(generics.RetrieveDestroyAPIView):

    queryset = File.objects.all()
    serializer_class = FileSerializer




class FileLayerList(generics.ListCreateAPIView):

    queryset = FileLayer.objects.all()
    serializer_class = FileLayerSerializer
    parser_classes = (MultiPartParser, FormParser,)

    def get_queryset(self):
        layer_id = self.kwargs.get('layer')
        return FileLayer.objects.filter(layer_id=layer_id)


class FileLayerDetail(generics.RetrieveDestroyAPIView):

    queryset = FileLayer.objects.all()
    serializer_class = FileLayerSerializer

