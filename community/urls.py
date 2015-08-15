from django.conf.urls import patterns, url
from community import views

urlpatterns = patterns('',
    url(r'^$', views.CommunityListRest.as_view(), name='list_rest'),
    url(r'^(?P<pk>\d+)/$', views.CommunityDetailRest.as_view(), name='detail_rest'),

    url(r'^index$', views.CommunityList.as_view(), name='list'),
    url(r'detail/(?P<pk>\d+)/$', views.CommunityDetail.as_view(), name='detail'),
    url(r'create/$', views.CommunityCreate.as_view(), name='create'),
    url(r'update/(?P<pk>\d+)/$', views.CommunityUpdate.as_view(), name='update'),
    url(r'delete/(?P<pk>\d+)/$', views.CommunityDelete.as_view(), name='delete'),

)
