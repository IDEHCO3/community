from django.conf.urls import patterns, url
from authentication import views

from rest_framework.urlpatterns import format_suffix_patterns

from django.conf.urls import include

urlpatterns = patterns('',
    url(r'^$', views.login, name='idehco3_login'),
)

urlpatterns = format_suffix_patterns(urlpatterns)