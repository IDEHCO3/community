from django.views.generic import TemplateView, ListView, DetailView
from django.views.generic.edit import DeleteView
from community_api.models import Community

from community_layer_api.forms import FactoryForm
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

class InviteSomeone():
    """
    subject = form.cleaned_data['subject']
    message = form.cleaned_data['message']
    sender = form.cleaned_data['sender']
    cc_myself = form.cleaned_data['cc_myself']

    recipients = ['info@example.com']
    """
   # send_mail("subject", "message", "sender", ["recipients"])

def as_json_str(communityinformationfieldschema_set):
    print(communityinformationfieldschema_set)
    a_list = list(('\"' + cif + '\"' + ':' + '\"\"') for cif in communityinformationfieldschema_set)
    return "{" + (",".join(a_list)) + "}"

def community_detail(request, pk, lat=0, lng=0, zoom=0):
    community = Community.objects.get(pk=pk)

    cifs = community.communityinformationfieldschema_set.all()
    a_list = list(cif.name_field for cif in cifs)

    schema_field = str(a_list).replace("'", '"')
    schema_field = schema_field.replace('u"', '"')

    a_form = FactoryForm.create(cifs)
    schema_json_str = as_json_str(a_list)

    geometry_type = ""
    for type in cifs:
        if type.name_field == "geometry":
            geometry_type = str(type.type_field)
            break

    context = {
        "request": request,
        "community": community,
        "zoom": zoom,
        "lat": lat,
        "lng": lng,
        "geometry_type": geometry_type,
        "form": a_form,
        "schema_field": schema_field,
        "schema_json_str": schema_json_str
    }

    return render_to_response('community/detail/index.html',
                              RequestContext(request, context))
