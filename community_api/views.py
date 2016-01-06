from .models import Community, MembershipCommunity

from .permissions import IsOwnerOrReadOnly
from rest_framework import permissions

from rest_framework import generics
from .serializers import CommunitySerializer, MembershipSerializer
from community_layer_api.serializers import CommunityInformationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from geo1 import settings
from .geoprocessing import GeoProcessing

from django.contrib.auth.models import User
from django.core.mail import send_mail

class MembershipDetail(generics.RetrieveAPIView):

    queryset = MembershipCommunity.objects.all()
    serializer_class = MembershipSerializer

    permission_classes = (permissions.IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    lookup_field = "community"
    lookup_url_kwarg = "community"

    def get_queryset(self):
        user = self.request.user
        community = self.kwargs.get("community")
        membership = None
        try:
            membership = MembershipCommunity.objects.filter(member=user, community=community)
        except MembershipCommunity.DoesNotExist:
            membership = None

        return membership

class JoinUs(APIView):

    permission_classes = (permissions.IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community')
        try:
            community = Community.objects.get(id=community_id)
        except Community.DoesNotExist:
            community = None

        user = request.user
        if community is not None:
            membership = community.join_us(user)
            membership_serializer = MembershipSerializer(membership)
            return Response(status=status.HTTP_200_OK, data=membership_serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

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
            filename_with_path = unicode(settings.TEMPORARY_STORAGE, 'utf-8') + request.data['filename']
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

class InviteSomeone(APIView):

    permission_classes = (permissions.IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        email = request.data['email']
        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            user = None

        if user is None:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = None

        subject = "Invite to community"
        message = "You was invited to participate of community x."
        sender = "idehco3@gmail.com"
        recipients = []

        if user is None:
            recipients.append(email)
        else:
            recipients.append(user.email)

        print "before email."
        send_mail(subject, message, sender, recipients, fail_silently=True)
        print "after email."

        return Response(status=status.HTTP_200_OK)