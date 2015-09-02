from django.conf.urls import patterns, url
from authentication import views
from django.contrib.auth.views import login
from django.contrib.auth.views import logout

from rest_framework.urlpatterns import format_suffix_patterns

template_name = {'template_name': 'authentication/community_app_detail.html'}

urlpatterns = patterns('',
    url(r'^login/$', login, template_name, name='login'),
    url(r'^logout/$', logout, template_name, name='logout'),
)

urlpatterns = format_suffix_patterns(urlpatterns)