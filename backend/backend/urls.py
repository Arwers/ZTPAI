from django.contrib import admin
from django.urls import include, path
from users.views import CreateUserView, CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView, MeView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin site URLs
    path("admin/", admin.site.urls),

    # Custom users app URLs
    path("api/users/register/", CreateUserView.as_view(), name="register"),
    
    # JWT authentication URLs with cookies
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/auth/me/", MeView.as_view(), name="me"),

    # Accounts API endpoints
    path('api/accounts/', include('accounts.urls')),


    # Swagger URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path("api-auth/", include("rest_framework.urls")),
]
