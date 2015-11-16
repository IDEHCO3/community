from django.db import models
from community_api.models import Community
from community_layer_api.models import CommunityInformation

# Create your models here.
class File(models.Model):

    community = models.ForeignKey(Community, related_name='files')
    name = models.CharField(max_length=1000)
    creation_date = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='files/%Y/%m/%d')


class FileLayer(models.Model):

    layer = models.ForeignKey(CommunityInformation, related_name='files')
    name = models.CharField(max_length=1000)
    creation_date = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='files_layer/%Y/%m/%d')
