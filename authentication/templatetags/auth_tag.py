from django import template

register = template.Library()

@register.inclusion_tag("authentication/auth.html")
def auth_tag():
    return {}