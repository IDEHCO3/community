from django.conf.urls import patterns, url
from .views import *


urlpatterns = patterns('',
    url(r'^(?P<community>\d+)/files/$', FileList.as_view(), name='listCommunity'),
    url(r'^(?P<community>\d+)/files/(?P<pk>\d+)/$', FileDetail.as_view(), name='detailCommunity'),
    url(r'^(?P<community>\d+)/layers/(?P<layer>\d+)/files/$', FileLayerList.as_view(), name='listLayer'),
    url(r'^(?P<community>\d+)/layers/(?P<layer>\d+)/files/(?P<pk>\d+)/$', FileLayerDetail.as_view(), name='detailLayer'),
    url(r'^files/upload/(?P<filename>.+)/$', FileUploadView.as_view(), name='upload'),
)