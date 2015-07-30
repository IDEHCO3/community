from django import template

register = template.Library()

@register.inclusion_tag('create_layer/_in_new_layer.html', takes_context=True)
def new_layer_editor(context):
    return {"request": context['request'], "community": context["community"]}