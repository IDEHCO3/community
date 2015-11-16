from django.conf.urls import patterns, url
from community_api import views

urlpatterns = patterns('',
    url(r'^$', views.CommunityList.as_view(), name='list'),
    url(r'^(?P<pk>\d+)/$', views.CommunityDetail.as_view(), name='detail'),
    #url(r'^upload/(?P<filename>.+)/$', views.FileUploadView.as_view(), name='upload'),
)