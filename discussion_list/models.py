from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
# Create your models here.

class DiscussionThread(models.Model):
    title = models.CharField(max_length=1000, default='', blank=True)
    issue = models.CharField(max_length=10000, default='', blank=True)
    post_date = models.DateTimeField(default=now())
    user = models.ForeignKey(User)
    parent = models.ForeignKey('self', null=True, related_name='reply')

    def __str__(self):
        return self.issue