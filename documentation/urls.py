from django.conf.urls import patterns, url
from documentation.hydraSerializers import APISerializer
from hydra.urls import getURLSHydra
from hydra import views

views.main_serializer = APISerializer()

urlpatterns = getURLSHydra()