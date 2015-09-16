from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from .views import *

urlpatterns = patterns('',
                       url(r'^schema/$', CommunityInformationFieldSchemaList.as_view(), name='listSchema'),
                       url(r'^schema/(?P<pk>\d+)/', CommunityInformationFieldSchemaDetail.as_view(), name='detailSchema'))

urlpatterns = format_suffix_patterns(urlpatterns)