"""Pagination standard de l'API (20 \u00e9l\u00e9ments, param\u00e8tres `page` et `page_size`)."""

from rest_framework.pagination import PageNumberPagination


class PaginationStandard(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
    invalid_page_message = "Num\u00e9ro de page invalide."
    last_page_strings = ("last", "derniere", "derni\u00e8re")
