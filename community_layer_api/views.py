from rest_framework import generics
from .models import CommunityInformationFieldSchema
from .serializers import CommunityInformationFieldSchemaSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.

class CommunityInformationFieldSchemaList(generics.ListCreateAPIView):
    serializer_class = CommunityInformationFieldSchemaSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):

        community = self.request.query_params.get('community', None)

        if community is not None:
            community = int(community)
            queryset_filter = CommunityInformationFieldSchema.objects.filter(community_id=community)
            return queryset_filter

        queryset = CommunityInformationFieldSchema.objects.all()
        return queryset

class CommunityInformationFieldSchemaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityInformationFieldSchema.objects.all()
    serializer_class = CommunityInformationFieldSchemaSerializer

    permission_classes = (IsAuthenticatedOrReadOnly,)
