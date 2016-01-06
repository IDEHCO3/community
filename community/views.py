from django.views.generic import TemplateView, ListView, DetailView
from django.views.generic.edit import DeleteView
from community_api.models import Community

from django.shortcuts import render_to_response
from django.template import RequestContext



#List communities
class CommunityList(ListView):
    model = Community
    template_name = 'community/list/index.html'

class CommunityDetail(DetailView):
    model = Community

class CommunityCreate(TemplateView):
    template_name = 'community/create/index.html'

class CommunityUpdate(DetailView):
    model = Community
    template_name = 'community/update/index.html'


class CommunityDelete(DeleteView):
    model = Community
    template_name = 'community/delete/index.html'
    success_url = '/communities/index'


def community_detail(request, pk, lat=0, lng=0, zoom=0):
    community = Community.objects.get(pk=pk)

    context = {
        "request": request,
        "community": community,
        "zoom": zoom,
        "lat": lat,
        "lng": lng
    }

    return render_to_response('community/detail/index.html',
                              RequestContext(request, context))
