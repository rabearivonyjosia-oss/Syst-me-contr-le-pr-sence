"""Routes des séances (montées sous /api/)."""

from rest_framework.routers import SimpleRouter

from .views import SeanceViewSet

router = SimpleRouter()
router.register("seances", SeanceViewSet, basename="seance")

urlpatterns = router.urls
