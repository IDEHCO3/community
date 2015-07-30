from rest_framework import generics
from community_app.models import Community_Information_Field_Schema
from .serializers import Community_Information_Field_Schema_Serializer

from community.models import Community

from django.shortcuts import render_to_response
from django.template import RequestContext


class Community_Information_Field_Schema_List(generics.ListAPIView):
    queryset = Community_Information_Field_Schema.objects.all()
    serializer_class = Community_Information_Field_Schema_Serializer


class Community_Information_Field_Schema_Detail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community_Information_Field_Schema.objects.all()
    serializer_class = Community_Information_Field_Schema_Serializer

class Community_Information_Field_Schema_Create(generics.CreateAPIView):
    queryset = Community_Information_Field_Schema.objects.all()
    serializer_class = Community_Information_Field_Schema_Serializer

def new_layer(request, pk):
    community = Community.objects.get(pk=pk)

    context = {
        "request": request,
        "community": community
    }
    return render_to_response('create_layer/new_layer.html',
        RequestContext(request, context))