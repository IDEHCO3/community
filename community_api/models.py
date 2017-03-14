from django.db import models
from community import settings
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
        membership = None
        try:
            membership = MembershipCommunity.objects.get(member=interested_user, community=self)
        except MembershipCommunity.DoesNotExist:
            membership = None

        if membership is None and not self.need_invitation:
            membership = MembershipCommunity.join_us(interested_user, self, "Sing up")

        return membership

    def __str__(self):
        return self.name

class RoleMembership(models.Model):

    name = models.CharField(max_length=255)
    actions = JsonBField()

    @staticmethod
    def get_entry(name=None):
        entries = {
            "all": "['create', 'delete', 'update', 'retrieve']",
            "admin": "['create', 'delete', 'update', 'retrieve']",
            "common": "['create', 'update', 'retrieve']",
            "basic": "['create', 'retrieve']",
            "create": "['create']",
            "delete": "['delete']",
            "update": "['update']",
            "retrieve": "['retrieve']"
        }

        out = entries.get(name)
        if out is None:
            return [{"name": key, "actions": entries[key]} for key in entries]
        return out

    @staticmethod
    def generate_default_instances():
        entries = RoleMembership.get_entry()
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

    @staticmethod
    def is_included(a_person, a_community):
        try:
            member = MembershipCommunity.objects.get(member=a_person, community=a_community)
        except MembershipCommunity.DoesNotExist:
            member = None
        return member is not None

    @staticmethod
    def is_not_included(a_person, a_community):
        try:
            member = MembershipCommunity.objects.get(member=a_person, community=a_community)
        except MembershipCommunity.DoesNotExist:
            member = None
        return member is None

    @staticmethod
    def join_us(a_person, a_community, an_invited_reason):
        member = None
        if MembershipCommunity.is_not_included(a_person, a_community) and a_person != a_community.manager:
            try:
                role = RoleMembership.objects.get(name="common")
                member = MembershipCommunity.objects.create(member=a_person, community=a_community, role=role, invite_reason=an_invited_reason)
            except RoleMembership.DoesNotExist:
                member = None
        return member

class Invitation(models.Model):
    community = models.ForeignKey(Community)
    email = models.CharField(max_length=255)