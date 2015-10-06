from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from .views import *

urlpatterns = patterns('',
                       url(r'^(?P<community>\d+)/schema/$', CommunityInformationFieldSchemaList.as_view(), name='listSchema'),
                       url(r'^(?P<community>\d+)/schema/(?P<pk>\d+)/', CommunityInformationFieldSchemaDetail.as_view(), name='detailSchema'),
                       url(r'^(?P<pk>\d+)/layers/$', CommunityInformationList.as_view(), name='listLayer'),
                       url(r'^(?P<community>\d+)/layers/(?P<pk>\d+)/', CommunityInformationDetail.as_view(), name='detailLayer'))

urlpatterns = format_suffix_patterns(urlpatterns)