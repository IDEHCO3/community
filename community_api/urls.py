from django.conf.urls import patterns, url
from community_api import views

urlpatterns = patterns('',
    url(r'^$', views.CommunityList.as_view(), name='list'),
    url(r'^(?P<pk>\d+)/?$', views.CommunityDetail.as_view(), name='detail'),
    url(r'^(?P<community>\d+)/joinus/?$', views.JoinUs.as_view(), name='joinUs'),
    url(r'^(?P<community>\d+)/memberships/?$', views.MembershipOfCommunityList.as_view(), name="membershipDetail"),
    url(r'^(?P<community>\d+)/invitesomeone/?$', views.InviteSomeone.as_view(), name="inviteSomeone"),
)