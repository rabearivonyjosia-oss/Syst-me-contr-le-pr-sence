"""Routes des cours (montées sous /api/)."""

from rest_framework.routers import SimpleRouter

from .views import CoursViewSet

router = SimpleRouter()
router.register("cours", CoursViewSet, basename="cours")

urlpatterns = router.urls
