from community.models import Community
from django import forms
from django.forms import ModelForm
from django.utils.translation import ugettext
class CommunityForm(forms.ModelForm):

    class Meta:
        model = Community
        exclude = ['manager', 'members']

    name = forms.CharField(label= ugettext('Name:'), max_length=100 )
    description = forms.CharField(label= ugettext('Description:'), max_length=1000)

    #manager_name = forms.CharField(label = ugettext('Creator:') )
    #members = forms.CharField(label= ugettext('Members:'), widget= forms.SelectMultiple, required = False)


