
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.posts, name="posts"),
    path("followers", views.followers, name="followers"),
    path("current_user", views.current_user, name="current_user"),
    path("posts/<int:post_id>", views.post, name="post"),
    path("likes", views.likes, name="likes")
]
