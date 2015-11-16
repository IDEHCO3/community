from django.conf.urls import patterns, url
from .views import *


urlpatterns = patterns('',
    url(r'^files/$', FileList.as_view(), name='list'),
    url(r'^files/(?P<pk>\d+)/$', FileDetail.as_view(), name='detail'),
    url(r'^files/upload/(?P<filename>.+)/$', FileUploadView.as_view(), name='upload'),
)