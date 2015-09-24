from django.conf.urls import patterns, url
from authentication import views
from django.contrib.auth.views import login
from django.contrib.auth.views import logout
from .views import authetication
from .views import WhoAmI

from rest_framework.urlpatterns import format_suffix_patterns

template_name = {'template_name': 'authentication/index.html'}

urlpatterns = patterns('',
    url(r'^token/', 'rest_framework_jwt.views.obtain_jwt_token', name='token'),
    url(r'^token-refresh/', 'rest_framework_jwt.views.refresh_jwt_token', name='tokenRefresh'),
    url(r'^token-verify/', 'rest_framework_jwt.views.verify_jwt_token'),
    url(r'^me/$', WhoAmI.as_view(), name='me'),
    url(r'^$', authetication, name='index'),
    url(r'^login/$', login, template_name, name='login'),
    url(r'^logout/$', logout, template_name, name='logout'),
)

urlpatterns = format_suffix_patterns(urlpatterns)