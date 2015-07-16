from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from django.views.generic.edit import CreateView, UpdateView,DeleteView, FormView
from idehco3.community.models import Community
from idehco3.community.forms import CommunityForm
from django.core.mail import send_mail


#rest framework
from rest_framework.views import APIView
from rest_framework import generics

#REST api
from idehco3.community.serializers import CommunitySerializer

#List communities
class CommunityList(generic.ListView):
    model = Community

class CommunityDetail(generic.DetailView):
    model = Community

class CommunityCreate(FormView):

    #model = Community
    def __init__(self):
        community = None

    template_name = 'community/community_form.html'

    form_class = CommunityForm

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
    """
    List all Communities, or create a new community.
    """
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
