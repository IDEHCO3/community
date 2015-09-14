from django import template

register = template.Library()

@register.inclusion_tag("authentication/auth_login.html")
def login(redirection_url):
    return {'next': redirection_url}

@register.inclusion_tag("authentication/auth_logout.html", takes_context=True)
def logout(context, redirection_url):
    context['next'] = redirection_url
    return context