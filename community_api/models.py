from django.db import models
from geo1 import settings
from django_pgjson.fields import JsonBField

class Community(models.Model):

    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    need_invitation = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True, null=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='MembershipCommunity', related_name='communities')
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='manager_of_community', db_column='id_manager')

    def users(self):
        return self.members.all()

    def __unicode__(self):
        return self.name

    def invite_someone_to_community(self):
        pass #send a email to the person.

    def invite_user_to_community(self):
        pass #send a notification to user and a email.

    def manager_community(self):
        pass

    def remove_user(self, a_member):
        self.members.remove(a_member)

    def join_us(self, interested_user):
        membership = MembershipCommunity.objects.get(member=interested_user, community=self)
        if membership is not None:
            membership = MembershipCommunity.join_us(interested_user, self, "Sing up")

        return membership

    def __str__(self):
        return self.name

class RoleMembership(models.Model):

    name = models.CharField(max_length=255)
    actions = JsonBField()

    @staticmethod
    def generate_default_instances():
        entries = [
            {
                "name": "all",
                "actions": "['create', 'delete', 'update', 'retrieve']"
            },
            {
                "name": "admin",
                "actions": "['create', 'delete', 'update', 'retrieve']"
            },
            {
                "name": "common",
                "actions": "['create', 'update', 'retrieve']"
            },
            {
                "name": "basic",
                "actions": "['create', 'retrieve']"
            },
            {
                "name": "create",
                "actions": "['create']"
            },
            {
                "name": "delete",
                "actions": "['delete']"
            },
            {
                "name": "update",
                "actions": "['update']"
            },
            {
                "name": "retrieve",
                "actions": "['retrieve']"
            }
        ]

        for one in entries:
            entry = RoleMembership(**one)
            entry.save()

class MembershipCommunity(models.Model):

    member = models.ForeignKey(settings.AUTH_USER_MODEL)
    community = models.ForeignKey(Community)
    role = models.ForeignKey(RoleMembership)

    date_joined = models.DateField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    invite_reason = models.CharField(max_length=100, null=True, default='Joined us')

    def is_included(self, a_person, a_community):
        return (self.objects.get(member=a_person, community=a_community)) is not None

    def is_not_included(self, a_person, a_community):
        return not self.is_person_included_in_community(self, a_person, a_community)

    def join_us(self, a_person, a_community, an_invited_reason):
        if self.is_not_included(a_person, a_community):
            role = RoleMembership.objects.get(name="common")
            return self.objects.create(member=a_person, community=a_community, role=role, invited_reason=an_invited_reason)
        return None