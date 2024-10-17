install:
	pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

format:
	# format code
	black .

lint:
	# flake8 or pylint
	find . -type f -name "*.py" -exec pylint --disable=R,C {} +

test:
	# test
	python manage.py test

build:
	docker compose build

run:
	docker compose up --build


all: install format lint test build run
