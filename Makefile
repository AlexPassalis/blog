install:
	pip install -r services/django/requirements-dev.txt 

git-crypt:
	git-crypt status -e

docker-dev:
	docker build -t image-blog-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build --target dev -t image-blog-django -f ./services/django/Dockerfile ./services/django
	docker build --target dev -t image-blog-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-blog-nginx -f ./services/nginx/Dockerfile ./services/nginx
	# docker network create -d overlay network-blog
	docker stack deploy -c ./docker-stack-dev.yaml --detach=false --with-registry-auth stack-blog

docker-test:
	docker build --target test -t image-blog-django-test -f ./services/django/Dockerfile ./services/django
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --privileged image-blog-django-test

typecheck:
	PYTHON_ENV=testing DJANGO_SETTINGS_MODULE=main.settings python -m mypy services/django

# source .venv/bin/activate
# python -m pip install -r services/django/requirements-dev.txt

# python manage.py createsuperuser

# python manage.py makemigrations api
# python manage.py showmigrations api
# python manage.py migrate api
