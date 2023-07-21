import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follower, Like


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def posts(request):

    # Creating a new post must be via POST
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user 
        if user.is_authenticated:
            body = data.get("body", "")
            post = Post(user=user, body=body)
            post.save() 
            return JsonResponse({"message": "Post created successfully."}, status=201)
    else:
        posts = Post.objects.order_by("-timestamp").all()
        return JsonResponse([post.serialize() for post in posts], safe=False)

@csrf_exempt
def post(request,post_id):
    try:
        post = Post.objects.get(user=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("body") is not None:
            post.body = data["body"]
        post.save()
        return HttpResponse(status=204)

@csrf_exempt
@login_required(login_url='/login')
def followers(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        profileUserId = data.get("profileUserId", "")
        j = data.get("j", "")
        profileUser = User.objects.get(pk=profileUserId)

        if j>0:
            follower = Follower.objects.get(user=profileUser, follower=user)
            follower.delete()
            return JsonResponse({"message": "Unfollowed correctly."}, status=201)
        else:
            follower = Follower(user=profileUser, follower=user)
            follower.save()
            return JsonResponse({"message": "Followed correctly."}, status=201)
    else:
        followers = Follower.objects.all()
        return JsonResponse([follower.serialize() for follower in followers], safe=False)

@csrf_exempt
def likes(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        post_id = data.get("post_id", "")
        i = data.get("i", "")
        post = Post.objects.get(pk=post_id)

        if i>0:
            like = Like.objects.get(user=user, post=post)
            like.delete()
            return JsonResponse({"message": "Unliked correctly."}, status=201)
        else:
            like = Like(user=user, post=post)
            like.save()
            return JsonResponse({"message": "Liked correctly."}, status=201)
    else:
        likes = Like.objects.all()
        return JsonResponse([like.serialize() for like in likes], safe=False)

def current_user(request):
    current_user = {
        'id': request.user.id,
        'username': request.user.username
    }
    return JsonResponse(current_user, safe=False)