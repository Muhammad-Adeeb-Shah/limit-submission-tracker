import django_filters
from django.db.models import Count

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    broker_id = django_filters.NumberFilter(field_name="broker_id")
    company_search = django_filters.CharFilter(
        field_name="company__legal_name", lookup_expr="icontains"
    )
    created_from = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_to = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    has_documents = django_filters.BooleanFilter(method="filter_has_documents")
    has_notes = django_filters.BooleanFilter(method="filter_has_notes")

    class Meta:
        model = models.Submission
        fields = ["status", "broker_id", "company_search", "created_from", "created_to"]

    def filter_has_documents(self, queryset, name, value):
        qs = queryset.annotate(_doc_count=Count("documents"))
        return qs.filter(_doc_count__gt=0) if value else qs.filter(_doc_count=0)

    def filter_has_notes(self, queryset, name, value):
        qs = queryset.annotate(_note_count=Count("notes"))
        return qs.filter(_note_count__gt=0) if value else qs.filter(_note_count=0)

