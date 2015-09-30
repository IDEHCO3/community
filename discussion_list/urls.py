from django.conf.urls import patterns, url
from discussion_list import views

urlpatterns = patterns('',
    url(r'^$', views.DiscussionThreadList.as_view(), name='list'),
    url(r'^(?P<pk>\d+)/$', views.DiscussionThreadDetail.as_view(), name='detail'),
)