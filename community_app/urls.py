from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    #url(r'^list/$', views.community_information_list, name='community_information_list'),
    url(r'^detail/(?P<pk>\d+)/$', views.community_detail, name='community_detail'),
    url(r'^detail/(?P<pk>\d+)/(?P<lat>\-?\d+\.?\d*),(?P<lng>\-?\d+\.?\d*),(?P<zoom>\d+)$', views.community_detail, name='community_detail_coordinates'),
    url(r'^community_information_detail/(?P<pk>\d+)$', views.community_information_detail, name='community_information_detail'),
    url(r'^(?P<pk>\d+)/community_information_list/$', views.community_information_list, name='community_information_list'),
    url(r'^(?P<pk>\d+)/community_information_create/$', views.community_information_create, name='community_information_create'),
]

urlpatterns = format_suffix_patterns(urlpatterns)