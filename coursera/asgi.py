"""
ASGI config for coursera project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application

# Set Django settings module before any Django imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coursera.settings')

# Initialize Django before importing other modules that use Django ORM
django.setup()

# Now import Django Channels modules
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from discussions.routing import websocket_urlpatterns
from discussions.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
