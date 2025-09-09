from typing import Type, cast
from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from .models import Blog
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate


User = cast(
    Type[AbstractUser], get_user_model()
)  # drf-spectacular won't work otherwise.


class UserWriteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        max_length=254,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                lookup="iexact",  # case-insensitive
                message="A user with this email already exists.",
            )
        ],
    )

    class Meta:
        model = User
        fields = ["first_name", "last_name", "username", "email", "password"]
        extra_kwargs = {
            "first_name": {
                "max_length": 32,
                "error_messages": {
                    "blank": "This field may not be blank.",
                    "max_length": "This first name is too long. It must not contain more than 32 characters.",
                },
            },
            "last_name": {
                "max_length": 32,
                "error_messages": {
                    "blank": "This field may not be blank.",
                    "max_length": "This last name is too long. It must not contain more than 32 characters.",
                },
            },
            "username": {
                "min_length": 6,
                "max_length": 16,
                "error_messages": {
                    "blank": "This field may not be blank.",
                    "min_length": "This username is too short. It must contain at least 6 characters.",
                    "max_length": "This username is too long. It must not contain more than 16 characters.",
                },
            },
            "password": {
                "write_only": True,
                "min_length": 8,
                "max_length": 64,
                "error_messages": {
                    "blank": "This field may not be blank.",
                    "min_length": "This password is too short. It must contain at least 8 characters.",
                    "max_length": "This password is too long. It must not contain more than 64 characters.",
                },
            },
        }

    def validate_password(self, value: str) -> str:
        user = User(username=(getattr(self, "initial_data", {}) or {}).get("username"))
        try:
            password_validation.validate_password(value, user=user)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
        ]


class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password"]

    def validate(self, attrs):
        user = authenticate(
            email=attrs.get("email"),
        )


class BlogReadSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Blog
        fields = (
            "id",
            "is_public",
            "author",
            "slug",
            "title",
            "content",
            "created_at",
            "last_updated_at",
        )
        read_only_fields = ["id", "author", "slug", "created_at", "last_updated_at"]


class BlogWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ["title", "content"]


# class CommentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Comment
#         fields = ["id", "user", "content", "created_at", "last_updated_at"]
#         read_only_fields = ["id", "user", "created_at", "last_updated_at"]
