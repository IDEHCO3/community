from django import template
from community_app.forms import FactoryForm
from community.models import Community

register = template.Library()


def as_json_str(community_information_field_schema_set):
    print(community_information_field_schema_set)
    a_list = list(('\"' + cif + '\"' + ':' + '\"\"') for cif in community_information_field_schema_set)
    return "{" + (",".join(a_list)) + "}"

@register.inclusion_tag("community_app/editor_tag.html", takes_context=True)
def map(context):
    com = Community.objects.get(pk=1)
    cifs = com.community_information_field_schema_set.all()
    a_list = list(cif.name_field for cif in cifs)

    schema_field = str(a_list).replace("'", '"')
    schema_field = schema_field.replace("u", "")

    a_form = FactoryForm.create(cifs)
    schema_json_str = as_json_str(a_list)

    url_list = "http://127.0.0.1:8000/community_app/1/community_information_list/?format=json"
    url_create = "http://127.0.0.1:8000/community_app/1/community_information_create/"
    url_update = "http://127.0.0.1:8000/community_app/community_information_detail/"
    context['jsons'] = ''
    context['url_json'] = url_list
    context['form'] = a_form
    context['schema_field'] = schema_field
    context['schema_json_str'] = schema_json_str
    context['url_create'] = url_create
    context['url_update'] = url_update
    return context