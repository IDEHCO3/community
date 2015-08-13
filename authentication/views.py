from django.shortcuts import render

from django.shortcuts import render_to_response
from django.template import RequestContext

# Create your views here.
def login(request):
    return render_to_response('authentication/index.html', RequestContext(request,{}))