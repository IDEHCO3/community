from rest_framework import generics
from community_app.models import CommunityInformationFieldSchema
from .serializers import CommunityInformationFieldSchemaSerializer

from community.models import Community
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from django.shortcuts import render_to_response
from django.template import RequestContext

class CommunityInformationFieldSchemaListFilter(generics.ListAPIView):
    serializer_class = CommunityInformationFieldSchemaSerializer
    lookup_url_kwarg = "pk"

    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        pk = self.kwargs.get(self.lookup_url_kwarg)
        queryset = CommunityInformationFieldSchema.objects.filter(community_id=pk)
        return queryset

class CommunityInformationFieldSchemaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityInformationFieldSchema.objects.all()
    serializer_class = CommunityInformationFieldSchemaSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)

class CommunityInformationFieldSchemaCreate(generics.CreateAPIView):
    queryset = CommunityInformationFieldSchema.objects.all()
    serializer_class = CommunityInformationFieldSchemaSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)

def new_layer(request, pk):
    community = Community.objects.get(pk=pk)

    context = {
        "request": request,
        "community": community
    }
    return render_to_response('create_layer/new_layer.html',
        RequestContext(request, context))