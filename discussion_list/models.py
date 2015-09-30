from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class DiscussionThread(models.Model):
    title = models.CharField(max_length=1000, default='', blank=True)
    issue = models.CharField(max_length=10000, default='', blank=True)
    user = models.ForeignKey(User)
    parent = models.ForeignKey('self', null=True)

    def __str__(self):
        return self.issue