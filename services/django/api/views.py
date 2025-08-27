from ast import alias
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import (
    UserWriteSerializer,
    UserReadSerializer,
    BlogReadSerializer,
    BlogWriteSerializer,
)
from rest_framework import permissions, generics

from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


# from rest_framework import serializers

# from django.shortcuts import get_object_or_404
from drf_spectacular.utils import (
    extend_schema,
    OpenApiResponse,
    OpenApiExample,
)
from drf_spectacular.types import OpenApiTypes
from .models import Blog

# from uuid import UUID
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer


@extend_schema(
    description="Register a new user.",
    methods=["POST"],
    request=UserWriteSerializer,
    responses={
        201: UserReadSerializer,
        400: OpenApiResponse(
            description="Validation errors: mapping from field to list of messages.",
            response=inline_serializer(
                name="ValidationError",
                fields={
                    "first_name": serializers.ListField(
                        child=serializers.CharField(), required=False
                    ),
                    "last_name": serializers.ListField(
                        child=serializers.CharField(), required=False
                    ),
                    "username": serializers.ListField(
                        child=serializers.CharField(), required=False
                    ),
                    "email": serializers.ListField(
                        child=serializers.CharField(), required=False
                    ),
                    "password": serializers.ListField(
                        child=serializers.CharField(), required=False
                    ),
                },
            ),
        ),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def api_user_register(request: Request):
    if request.method == "POST":
        serializer = UserWriteSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            read = UserReadSerializer(user)
            return Response(read.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _cookie_common(path: str):
    return {
        "httponly": True,
        "secure": True,
        "samesite": "Strict",
        "path": path,
    }


@extend_schema(
    description="Obtain JWT pair. Sets httpOnly cookies: `access`, `refresh`.",
    request=inline_serializer(
        name="UserLogin",
        fields={
            "email": serializers.EmailField(write_only=True),
            "password": serializers.CharField(write_only=True),
        },
    ),
    responses=(
        {
            200: inline_serializer(
                name="AuthOK",
                fields={"detail": serializers.CharField(read_only=True)},
            )
        }
    ),
)
class CookiesObtainView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        res = super().post(request, *args, **kwargs)
        access_token = res.data.get("access")
        refresh_token = res.data.get("refresh")
        if not access_token or not refresh_token:
            return res  # let SimpleJWT handle errors

        access_age = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        refresh_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())

        res.set_cookie(
            "access", access_token, max_age=access_age, **_cookie_common("/")
        )
        # Scope refresh cookie only to the refresh endpoint
        res.set_cookie(
            "refresh",
            refresh_token,
            max_age=refresh_age,
            **_cookie_common("/auth/token/refresh/"),
        )

        res.data = {"detail": "login successful"}


@extend_schema(
    description="Refresh access token using the `refresh` cookie.",
    request=inline_serializer(name="NoBody", fields={}),
    responses=(
        {
            200: inline_serializer(
                name="RefreshOK", fields={"detail": serializers.CharField()}
            )
        }
    ),
)
class CookieRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh") or request.data.get("refresh")
        if refresh_token is None:
            from rest_framework.exceptions import AuthenticationFailed

            raise AuthenticationFailed("No refresh token.")

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        access = data.get("access")
        new_refresh = data.get("refresh")  # present if ROTATE_REFRESH_TOKENS=True

        res = Response({"detail": "refreshed"})

        access_age = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        res.set_cookie("access", access, max_age=access_age, **_cookie_common("/"))

        if new_refresh:
            refresh_age = int(
                settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
            )
            res.set_cookie(
                "refresh",
                new_refresh,
                max_age=refresh_age,
                **_cookie_common("/auth/token/refresh/"),
            )

        return res


@extend_schema(
    description="List public blogs.",
    methods=["GET"],
    responses={200: BlogReadSerializer(many=True)},
)
@extend_schema(
    description="Create a blog post.",
    methods=["POST"],
    request=BlogWriteSerializer,
    responses={
        201: BlogReadSerializer,
        400: OpenApiResponse(
            description="Validation errors (field -> list of errors).",
            response=OpenApiTypes.OBJECT,
            examples=[
                OpenApiExample(
                    "ValidationError",
                    value={"title": ["This field is required."]},
                )
            ],
        ),
        401: OpenApiResponse(description="Not authenticated. Log in and try again."),
    },
)
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])  # returns 401 when unauthenticated.
def api_blogs(request: Request):
    if request.method == "GET":
        serializer = BlogReadSerializer(
            Blog.objects.filter(is_public=True).order_by("-created_at"), many=True
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        serializer = BlogWriteSerializer(data=request.data)
        if serializer.is_valid():
            blog = serializer.save(author=request.user)
            return Response(
                BlogReadSerializer(blog).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ApiBlogsSlugView(generics.RetrieveAPIView):
#     lookup_field = "slug"
#     queryset = Blog.objects.filter(
#         is_public=True,
#     )
#     serializer_class = BlogSerializer


# @api_view(
#     [
#         "GET",
#     ]
# )
# def blogs_slug(request: Request, slug: str):
#     blog = get_object_or_404(
#         Blog, slug=slug
#     )  # If user only if blog the is_public=True, if author always

#     serializer = BlogSerializer(blog)
#     return Response(serializer.data, status=status.HTTP_200_OK)


# @api_view(["PATCH", "DELETE"])
# def blogs_id(request: Request, id: UUID):  # Must be the author
#     blog = get_object_or_404(Blog, id=id)

#     if request.method == "PATCH":
#         serializer = BlogSerializer(blog, data=request.data, partial=True)
#         if serializer.is_valid():
#             updated = serializer.save()
#             updatedSerializer = BlogSerializer(updated)
#             return Response(updatedSerializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if request.method == "DELETE":
#         blog.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# @api_view(["GET"])
# def blogs_slug_comments(request: Request, slug: str):  # Everyone
#     blog = get_object_or_404(Blog, slug=slug)
#     comments = Comment.objects.filter(blog=blog).order_by("created_at")

#     serializer = CommentSerializer(comments, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)


# @api_view(["PATCH", "DELETE"])
# def blogs_comments_id(request: Request, id: UUID):  # Must be the user
#     comment = get_object_or_404(Comment, id=id)

#     if request.method == "PATCH":
#         serializer = CommentSerializer(comment, data=request.data, partial=True)
#         if serializer.is_valid():
#             updated = serializer.save()
#             updatedSerializer = CommentSerializer(updated)
#             return Response(updatedSerializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if request.method == "DELETE":
#         comment.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# @api_view(
#     [
#         "GET",
#     ]
# )
# def blogs_slug_likes(
#     request: Request, slug: str
# ):  # Everyone + (need to know if the user making the request has liked, so that he cannot like again on the front-end.)
#     blog = get_object_or_404(Blog, is_public=True, slug=slug)

#     if request.method == "GET":
#         likes = Like.objects.filter(blog=blog).count()
#         return Response({"likes": likes}, status=status.HTTP_200_OK)


# @api_view(["DELETE"])
# def blogs_likes_id(request: Request, id: UUID):  # Must be the user
#     like = get_object_or_404(Like.objects.select_related("blog"), id=id)

#     if not like.blog.is_public:
#         return Response(status=status.HTTP_404_NOT_FOUND)

#     like.delete()
#     return Response(status=status.HTTP_204_NO_CONTENT)
