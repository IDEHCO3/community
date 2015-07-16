from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    url(r'^new$', views.basic, name='community_information_'),
    #url(r'^list/$', views.community_information_list, name='community_information_list'),
    url(r'^community_information_detail/(?P<pk>\d+)$', views.community_information_detail, name='community_information_detail'),
    url(r'^(?P<pk>\d+)/community_information_list/$', views.community_information_list, name='community_information_list'),
    url(r'^(?P<pk>\d+)/community_information_create/$', views.community_information_create, name='community_information_create'),
]

urlpatterns = format_suffix_patterns(urlpatterns)