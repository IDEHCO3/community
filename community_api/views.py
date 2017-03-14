from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from community import settings
from community_layer_api.serializers import CommunityInformationSerializer
#from documentation.hydraSerializers import CommunityHydraSerializerList
from .geoprocessing import GeoProcessing
from .models import *
from .permissions import IsOwnerOrReadOnly
from .serializers import CommunitySerializer, MembershipSerializer

class MembershipOfCommunityList(generics.ListAPIView):

    queryset = MembershipCommunity.objects.all()
    serializer_class = MembershipSerializer

    permission_classes = (permissions.IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get_queryset(self):
        community = self.kwargs.get("community")

        try:
            membership = MembershipCommunity.objects.filter(community=community)
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
            if membership is None:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            membership_serializer = MembershipSerializer(membership, context={'request': request})
            return Response(status=status.HTTP_200_OK, data=membership_serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

class CommunityList(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    #metadata_class = CommunityHydraSerializerList

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
        authenticated_user = request.user

        try:
            community = Community.objects.get(id=kwargs.get('community'))
        except Community.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            user = None

        if user is None:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = None

        subject = "IDEHCO3: Invite to Community "
        message = "You was invited by " + authenticated_user.first_name + " " + authenticated_user.last_name + " to participate of community " + community.name + ".\n"
        sender = "idehco3@gmail.com"
        recipients = []


        link = ""
        invite = None

        if user is not None:
            recipients.append(user.email)
            invite = Invitation(email=user.email, community=community)
            invite.save()
            link = "Link to participate of community:\n"
            link += "http://ecoide.cos.ufrj.br/idehco3/community/" + str(community.id) + "/invitesomeone/" + str(invite.id) + "/"
        else:
            recipients.append(email)
            invite = Invitation(email=email, community=community)
            invite.save()
            link = "Link to create a new user before participate of community:\n"
            link += "http://ecoide.cos.ufrj.br/idehco3/users/create?next=/community/" + str(community.id) + "/invitesomeone/" + str(invite.id) + "/"

        message += link

        try:
            send_mail(subject, message, sender, recipients, fail_silently=True)
        except:
            invite.delete()
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)