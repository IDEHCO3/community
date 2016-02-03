from rest_framework.metadata import SimpleMetadata
from .models import CommunityInformationFieldSchema
from .serializers import CommunityInformationFieldSchemaSerializer

class LayerMetadata(SimpleMetadata):

    def determine_metadata(self, request, view):
        pk_community = view.kwargs.get('pk', None)
        try:
            self.schema = CommunityInformationFieldSchema.objects.filter(community=pk_community)
        except CommunityInformationFieldSchema.DoesNotExist:
            self.schema = None
        return super(LayerMetadata, self).determine_metadata(request, view)

    def get_field_info(self, field):
        field_info = super(LayerMetadata, self).get_field_info(field)
        if field.field_name == "properties":
            field_info['type'] = "json"
            if self.schema is not None:
                fields_list = []
                for item in self.schema:
                    fields_list.append(CommunityInformationFieldSchemaSerializer(item).data)
                field_info['schema'] = fields_list
        return field_info