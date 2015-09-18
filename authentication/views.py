from django.shortcuts import render_to_response
from django.template import RequestContext

import jwt

def authetication(request):
    context = {}
    return render_to_response('authentication/auth.html',
                              RequestContext(request, context))