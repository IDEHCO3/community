"""geo1 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
import settings

urlpatterns = [
    url(r'^community/communities/', include('community_pages.urls', namespace='communityPage')),
    url(r'^community/communities/', include('community_api.urls', namespace='community')),
    url(r'^community/communities/', include('community_layer_api.urls', namespace='communityLayer')),
    url(r'^community/communities/', include('discussion_list.urls', namespace='issue')),
    url(r'^community/communities/', include('community_files_api.urls', namespace='files')),
    #url(r'^community/vocab/', include('documentation.urls', namespace='documentation')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
