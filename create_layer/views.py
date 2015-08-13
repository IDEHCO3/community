from rest_framework import generics
from community_app.models import Community_Information_Field_Schema
from .serializers import Community_Information_Field_Schema_Serializer

from community.models import Community
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from django.shortcuts import render_to_response
from django.template import RequestContext

from global_module.permissions import IsOwnerOrReadOnly

class Community_Information_Field_Schema_ListFilter(generics.ListAPIView):
    serializer_class = Community_Information_Field_Schema_Serializer
    lookup_url_kwarg = "pk"

    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        pk = self.kwargs.get(self.lookup_url_kwarg)
        queryset = Community_Information_Field_Schema.objects.filter(community_id=pk)
        return queryset

class Community_Information_Field_Schema_Detail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community_Information_Field_Schema.objects.all()
    serializer_class = Community_Information_Field_Schema_Serializer

    permission_classes = (IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)

class Community_Information_Field_Schema_Create(generics.CreateAPIView):
    queryset = Community_Information_Field_Schema.objects.all()
    serializer_class = Community_Information_Field_Schema_Serializer

    permission_classes = (IsAuthenticatedOrReadOnly,)

def new_layer(request, pk):
    community = Community.objects.get(pk=pk)

    context = {
        "request": request,
        "community": community
    }
    return render_to_response('create_layer/new_layer.html',
        RequestContext(request, context))