from rest_framework import serializers
from django.contrib.auth.models import User

class UserCreateSerializer(serializers.ModelSerializer):

    def save(self, **kwargs):
        password = self.validated_data['password']
        user = User(username=self.validated_data['username'],
                    first_name=self.validated_data['first_name'],
                    last_name=self.validated_data['last_name'],
                    email=self.validated_data['email'])
        user.set_password(password)

        user.save()

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'first_name', 'last_name', 'email')

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')