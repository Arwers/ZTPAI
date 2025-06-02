from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/categories/', include('categories.urls')),
    # ...other paths
]