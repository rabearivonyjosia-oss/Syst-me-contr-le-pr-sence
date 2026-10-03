from django.urls import path
from .views import ResgisterView


#indique aya mandeha demande reny

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register')

]
