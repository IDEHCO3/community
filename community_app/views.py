from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import Community_InformationSerializer
from .forms import FactoryForm
from community.models import Community
from django.shortcuts import render
from .models import Community_Information


@api_view(['GET', 'POST'])
def community_information_list(request, pk, format=None):
    """
    List all , or create a new snippet.
    """
    if request.method == 'GET':
        com_inf_list = Community_Information.objects.filter(community_id=pk)
        #com_inf_list = Community_Information.objects.all()
        serializer = Community_InformationSerializer(com_inf_list, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def community_information_create(request, pk, format=None):
    if request.method == 'POST':

        request.data['properties']['community'] = pk

        serializer = Community_InformationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'DELETE'])
def community_information_detail(request, pk, format=None):
    """
    Retrieve, update or delete a snippet instance.
    """
    try:
        ci = Community_Information.objects.get(pk=pk)
    except Community_Information.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = Community_InformationSerializer(ci)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = Community_InformationSerializer(ci, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        ci.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def as_json_str(community_information_field_schema_set):
    print(community_information_field_schema_set)
    a_list = list(('\"' + cif + '\"' + ':'  + '\"\"') for cif in community_information_field_schema_set)
    return "{" + (",".join(a_list)) + "}"

def basic(request):

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
    context = {'jsons': '', 'url_json' : url_list,  'form': a_form, 'schema_field': schema_field, 'schema_json_str': schema_json_str, 'url_create': url_create, 'url_update': url_update }

    return render(request, 'community_app/editor.html', context)

