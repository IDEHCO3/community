from django.core.urlresolvers import reverse
from django.views import generic
from django.views.generic.edit import UpdateView, DeleteView, FormView
from community.models import Community
from community.forms import CommunityForm

from rest_framework import generics
from community.serializers import CommunitySerializer



#List communities
class CommunityList(generic.ListView):
    model = Community

class CommunityDetail(generic.DetailView):
    model = Community

class CommunityCreate(FormView):

    template_name = 'community/community_form.html'
    form_class = CommunityForm

    def __init__(self):
        community = None

    def form_valid(self, form):
        self.community = form.instance
        self.community.manager = self.request.user
        return super(CommunityCreate, self).form_valid(form)

    def get_success_url(self):
        self.community.save()
        return reverse('community:detail', kwargs={'pk': self.community.pk})

class CommunityUpdate(UpdateView):
    model = Community
    fields = ['name', 'description']
    template_name_suffix = '_update_form'
    success_url = '/communities'


class CommunityDelete(DeleteView):
    model = Community
    success_url = '/communities'


class CommunityListRest(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

#class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    #queryset = Community.objects.all()
    #serializer_class = CommunitySerializer

class InviteSomeone():
    """
    subject = form.cleaned_data['subject']
    message = form.cleaned_data['message']
    sender = form.cleaned_data['sender']
    cc_myself = form.cleaned_data['cc_myself']

    recipients = ['info@example.com']
    """
   # send_mail("subject", "message", "sender", ["recipients"])
