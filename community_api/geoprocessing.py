
import os
from zipfile import ZipFile
from django.contrib.gis.gdal import DataSource

def convertToDjangoType(GdalType):

    djangoType = {
        'OFTString': 'CharField',
        'OFTInteger': 'IntegerField',
        'OFTReal': 'DecimaField'
    }

    return djangoType.get(GdalType, 'CharField')

class GeoProcessing(object):

    def __init__(self, filepath):
        self.filepath = filepath
        filename_without_ext = os.path.split(os.path.splitext(filepath)[0])[1]
        path = os.path.split(filepath)[0] + '/' + filename_without_ext
        if not os.path.exists(path):
            os.makedirs(path)
        zip = ZipFile(filepath, 'r')
        zip.extractall(path)
        shp_file = path + '/' + filename_without_ext + '.shp'
        self.data = DataSource(shp_file)[0]

    def getAttributes(self):
        attributes = []
        for (attribute, type) in zip(self.data.fields, self.data.field_types):
            obj = {'name_field': attribute, 'type_field': convertToDjangoType(type)}
            attributes.append(obj)

        return attributes

    def getGeoData(self):
        pass

    def deleteFile(self):
        os.remove(self.filepath)