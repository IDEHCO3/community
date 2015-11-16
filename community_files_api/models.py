from django.db import models

# Create your models here.
class File(models.Model):

    name = models.CharField(max_length=1000)
    creation_date = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='files/%Y/%m/%d')
