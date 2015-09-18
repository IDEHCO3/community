from rest_framework import generics
from rest_framework import permissions
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from django.contrib.auth.models import User
from .serializers import UserSerializer, UserCreateSerializer
from .permissions import IsOwner

class UserCreate(generics.CreateAPIView):
    model = User
    serializer_class = UserCreateSerializer


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication, )
