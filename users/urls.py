from django.conf.urls import patterns, url
from .views import *

urlpatterns = patterns('',
    url(r'^$', UserCreate.as_view(), name='create'),
    url(r'^(?P<pk>\d+)/$', UserDetail.as_view(), name='detail')
)