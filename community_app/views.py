from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import CommunityInformationSerializer
from .models import CommunityInformation

from community.models import Community
from community_app.forms import FactoryForm
from django.shortcuts import render_to_response
from django.template import RequestContext

@api_view(['GET', 'POST'])
def community_information_list(request, pk, format=None):
    """
    List all , or create a new snippet.
    """
    if request.method == 'GET':
        com_inf_list = CommunityInformation.objects.filter(community_id=pk)
        #com_inf_list = CommunityInformation.objects.all()
        serializer = CommunityInformationSerializer(com_inf_list, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def community_information_create(request, pk, format=None):
    if request.method == 'POST':

        request.data['properties']['community'] = pk

        serializer = CommunityInformationSerializer(data=request.data)

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
        ci = CommunityInformation.objects.get(pk=pk)
    except CommunityInformation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CommunityInformationSerializer(ci)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommunityInformationSerializer(ci, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        ci.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def as_json_str(communityinformationfieldschema_set):
    print(communityinformationfieldschema_set)
    a_list = list(('\"' + cif + '\"' + ':' + '\"\"') for cif in communityinformationfieldschema_set)
    return "{" + (",".join(a_list)) + "}"

def community_detail(request, pk):
    community = Community.objects.get(pk=pk)

    cifs = community.communityinformationfieldschema_set.all()
    a_list = list(cif.name_field for cif in cifs)

    schema_field = str(a_list).replace("'", '"')
    schema_field = schema_field.replace('u"', '"')

    a_form = FactoryForm.create(cifs)
    schema_json_str = as_json_str(a_list)

    geometry_type = ""
    for type in cifs:
        if type.name_field == "geometry":
            geometry_type = str(type.type_field)
            break

    url_list = "/community_app/"+str(pk)+"/community_information_list/?format=json"
    url_create = "/community_app/"+str(pk)+"/community_information_create/"
    url_update = "/community_app/community_information_detail/"
    url_community = "/communities/"+str(pk)+"/"

    zoom = 0
    if zoom in request.GET:
        zoom = float(request.GET['zoom'])

    lat = 0
    if 'lat' in request.GET:
        lat = float(request.GET['lat'])

    lng = 0
    if 'lng' in request.GET:
        lng = float(request.GET['lng'])

    context = {
        "request": request,
        "community": community,
        "zoom": zoom,
        "lat": lat,
        "lng": lng,
        "geometry_type": geometry_type,
        "url_community": url_community,
        "url_json": url_list,
        "form": a_form,
        "schema_field": schema_field,
        "schema_json_str": schema_json_str,
        "url_create": url_create,
        "url_update": url_update
    }

    return render_to_response('community_app/detail/index.html',
                              RequestContext(request, context))