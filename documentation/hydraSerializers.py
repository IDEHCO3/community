from hydra.serializers import HydraClassSerializer, HydraAPISerializer
from community_api.models import Community

class CommunityHydraSerializerList(HydraClassSerializer):

    model = Community
    is_collection = True

    def createProperties(self, property_serializer):
        property_serializer.addProperty(name='id', type=property_serializer.getTypeInteger(), readable=True)
        property_serializer.addProperty(name='name', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='description', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='need_invitation', type=property_serializer.getTypeBoolean(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='manager', type=property_serializer.getTypeID(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='schema', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='issues', type=property_serializer.getTypeID(), readable=True)
        property_serializer.addProperty(name='layers', type=property_serializer.getTypeID(), readable=True)
        property_serializer.addProperty(name='files', type=property_serializer.getTypeID(), readable=True)

    def createMethods(self, method_serializer):
        method_serializer.addDefaultCreateOperation(view="community:list")
        method_serializer.addCustomOperation(title="List", returns=method_serializer.getClassNameCollection(), view="community:list")

class CommunityHydraSerializerDetail(HydraClassSerializer):

    model = Community
    is_collection = False

    def createProperties(self, property_serializer):
        property_serializer.addProperty(name='id', type=property_serializer.getTypeInteger(), readable=True)
        property_serializer.addProperty(name='name', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='description', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='need_invitation', type=property_serializer.getTypeBoolean(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='manager', type=property_serializer.getTypeID(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='schema', type=property_serializer.getTypeString(), required=True, readable=True, writeable=True)
        property_serializer.addProperty(name='issues', type=property_serializer.getTypeID(), readable=True)
        property_serializer.addProperty(name='layers', type=property_serializer.getTypeID(), readable=True)
        property_serializer.addProperty(name='files', type=property_serializer.getTypeID(), readable=True)

    def createMethods(self, method_serializer):
        method_serializer.addDefaultUpdateOperation()
        method_serializer.addDefaultDeleteOperation()
        method_serializer.addCustomOperation(title="Retrieve", returns=method_serializer.getClassName())

class APISerializer(HydraAPISerializer):

    classes_serializers = (CommunityHydraSerializerList, CommunityHydraSerializerDetail)