import importlib
from django import forms

class FactoryForm():
    @classmethod
    def create(cls, community_Information_Field_Schema_list):
        a_form = DinamicForm()
        for dinamic_field in community_Information_Field_Schema_list:
            if dinamic_field.name_field != 'geometry':
                a_form.fields[dinamic_field.name_field] = dinamic_field.field_object_type()

        return a_form

class DinamicForm(forms.Form):
     pass

#I.e. DinamicFormField(name_field='a_CharField', type_field='CharField', options={'blank': True})
class DinamicFormField( ):
    def __init__(self, name_module_field='django.forms', name_field='', type_field='', options={}):
        self.name_module_field = name_module_field
        self.name_field = name_field
        self.type_field = type_field
        self.options = options

    def field_object_type(self):
        cls = getattr(importlib.import_module(self.name_module_field), self.type_field)
        cls_instance = cls()
        for key, value in self.options.items():
            setattr(cls_instance, key, value)

        return cls_instance