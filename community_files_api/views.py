from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.response import Response

from geo1 import settings

from .serializers import FileSerializer
from .models import File

# Create your views here.

class FileUploadView(APIView):

    parser_classes = (FileUploadParser,)

    def put(self, request, filename, format=None):
        file_obj = request.data['file']

        filename_with_path = unicode(settings.TEMPORARY_STORAGE, 'utf-8') + filename

        with open(filename_with_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        return Response(status=204)

class FileList(generics.ListCreateAPIView):

    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser,)


class FileDetail(generics.RetrieveDestroyAPIView):

    queryset = File.objects.all()
    serializer_class = FileSerializer

