
import os
import shutil
import json
from zipfile import ZipFile
from django.contrib.gis.gdal import DataSource

def convertToDjangoType(GdalType):

    djangoType = {
        'OFTString': 'CharField',
        'OFTInteger': 'IntegerField',
        'OFTReal': 'DecimaField'
    }

    return djangoType.get(GdalType, 'CharField')

def getShapeFile(folder):
    files = os.listdir(folder)
    for file in files:
        if os.path.isfile(folder+'/'+file):
            ext = os.path.splitext(file)[1]
            if ext == '.shp':
                return folder+'/'+file

    return None

class GeoProcessing(object):

    def __init__(self, filepath):
        self.filepath = filepath
        filename_without_ext = os.path.split(os.path.splitext(filepath)[0])[1]
        ext = os.path.splitext(filepath)[1]
        path = os.path.split(filepath)[0] + '/' + filename_without_ext
        self.data = None
        self.unzip_folder = None

        if os.path.exists(filepath) and ext == '.zip':
            if not os.path.exists(path):
                os.makedirs(path)
            self.unzip_folder = path
            zip = ZipFile(filepath, 'r')
            zip.extractall(path)
            shp_file = getShapeFile(path)
            self.data = DataSource(shp_file)[0]

    def getGeomType(self):
        geometry_type = {
            'Point': 'point',
            'MultiPoint': 'point',
            'Line': 'line',
            'MultiLine': 'line',
            'Polygon': 'polygon',
            'MultiPolygon': 'polygon',
        }

        type = self.data.geom_type.__str__()
        return geometry_type.get(type, 'Polygon')

    def getAttributes(self):
        attributes = []
        geom = {
            'name_field': 'geometry',
            'type_field': self.getGeomType()
        }
        attributes.append(geom)

        for (attribute, type) in zip(self.data.fields, self.data.field_types):
            obj = {'name_field': attribute, 'type_field': convertToDjangoType(type)}
            attributes.append(obj)

        return attributes

    def getFeatures(self):
        return self.data

    def getJSONFromFeatureProperties(self, feature):
        properties = {}

        for field in feature.fields:
            properties[field] = feature.get(field)

        return json.dumps(properties)

    def getGeoJsonFeature(self, community_id, feat):

        feature = {
            "type": "Feature",
            "geometry": json.loads(feat.geom.json),
            "properties": {
                "properties": self.getJSONFromFeatureProperties(feat),
                "community": community_id
            }
        }

        return feature

    def deleteFiles(self):
        if os.path.exists(self.filepath):
            os.remove(self.filepath)

        if self.unzip_folder is not None and os.path.exists(self.unzip_folder):
            shutil.rmtree(self.unzip_folder)