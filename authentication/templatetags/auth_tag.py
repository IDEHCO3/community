from django import template

register = template.Library()

@register.inclusion_tag("authentication/auth_login.html")
def login(redirection_url):
    return {'destiny': redirection_url}

@register.inclusion_tag("authentication/auth_logout.html", takes_context=True)
def logout(context, redirection_url):
    context['destiny'] = redirection_url
    return context