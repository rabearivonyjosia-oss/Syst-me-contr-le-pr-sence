from django.urls import path
from .Views import SeanceView

#le API 
urlpatterns=[
    path('seance/', Seanceviews.as_view(), name='seance')
]


