from django.conf.urls import patterns, url
from community import views

urlpatterns = patterns('',
    url(r'^index$', views.CommunityList.as_view(), name='list'),

    url(r'^detail/(?P<pk>\d+)/$', views.community_detail, name='detail'),
    url(r'^detail/(?P<pk>\d+)/(?P<lat>\-?\d+\.?\d*),(?P<lng>\-?\d+\.?\d*),(?P<zoom>\d+)$', views.community_detail, name='detail_coordinates'),

    url(r'create/$', views.CommunityCreate.as_view(), name='create'),
    url(r'update/(?P<pk>\d+)/$', views.CommunityUpdate.as_view(), name='update'),
    url(r'delete/(?P<pk>\d+)/$', views.CommunityDelete.as_view(), name='delete'),

)
