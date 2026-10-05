from django.urls import path
from .Views import coursViews

urlpatterns = [
    path('cours/', coursViews.as_view(), name='cours'),
    
]