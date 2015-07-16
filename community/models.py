from django.db import models
import datetime
from geo1 import settings

class Community(models.Model):

    name = models.CharField(max_length = 150)

    description = models.TextField(null=True, blank=True)

    need_invitation = models.BooleanField(default=False)

    date_creation = models.DateTimeField(default=datetime.datetime.now(), null=True)

    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='MembershipCommunity', related_name='communities')

    manager = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='manager_of_community', db_column='id_manager')


    def users(self):
        return self.members.all()

    def __unicode__(self):
        return self.name

    def invite_someone_to_community(self):
        pass

    def invite_user_to_community(self):
        pass

    def manager_community(self):
        pass

    def remove_user(self, a_member):
        self.members.remove(a_member)

    def join_us(self, interested_user):
        pass

class MembershipCommunity(models.Model):

    member = models.ForeignKey(settings.AUTH_USER_MODEL)

    community = models.ForeignKey(Community)

    date_joined = models.DateField(default=datetime.datetime.now())

    is_blocked = models.BooleanField(default=False)

    is_banned = models.BooleanField(default=False)

    invite_reason = models.CharField(max_length=100, null=True, default='Joined us')

    def is_included(self, a_person, a_community):

        return (self.objects.get(member=a_person, community=a_community)) is not None

    def is_not_included(self, a_person, a_community):

        return not self.is_person_included_in_community(self, a_person, a_community)

    def join_us(self, a_person, a_community, an_invited_reason):

        if self.is_not_included(a_person, a_community):

            return self.objects.create(member=a_person,community=a_community, invited_reason=an_invited_reason)

        return None
