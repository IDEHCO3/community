from django.shortcuts import render_to_response
from django.template import RequestContext

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.views import APIView

from .serializers import UserAutheticationSerializer

def authetication(request):
    context = {}
    if "next" in request.GET:
        context['next'] = request.GET['next']

    return render_to_response('authentication/auth.html',
                              RequestContext(request, context))

class WhoAmI(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )
    def get(self, request):
        serializer = UserAutheticationSerializer(request.user)
        return Response(serializer.data)