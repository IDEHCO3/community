from django.conf.urls import patterns, url
from discussion_list import views

urlpatterns = patterns('',
    url(r'^(?P<community>\d+)/issues/$', views.DiscussionThreadList.as_view(), name='list'),
    url(r'^(?P<community>\d+)/issues/(?P<pk>\d+)/$', views.DiscussionThreadDetail.as_view(), name='detail'),
    url(r'^(?P<community>\d+)/issues/(?P<pk>\d+)/answers/$', views.DiscussionThreadDetailAnswers.as_view(), name='answers'),
)