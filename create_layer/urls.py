from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from .views import *

urlpatterns = patterns('',
                       url(r'^list/(?P<pk>\d+)/', CommunityInformationFieldSchemaListFilter.as_view(), name='filter'),
                       url(r'^create/', CommunityInformationFieldSchemaCreate.as_view(), name='create'),
                       url(r'^detail/(?P<pk>\d+)/', CommunityInformationFieldSchemaDetail.as_view(), name='detail'),
                       url(r'^new_layer/(?P<pk>\d+)/$', new_layer, name='new_layer'))

urlpatterns = format_suffix_patterns(urlpatterns)