from django.urls import path
from .views import PresenceListCreateView, PresenceDetailView

urlpatterns = [
    path ('Presence/', PresenceViews.as_view(), name="Presence")
    
]
