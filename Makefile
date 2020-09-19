.PHONY:

build-dev: build-dev-frontend build-dev-backend

run-dev: build-dev
	docker-compose -f docker-compose.dev.yml up

build-dev-frontend:
	docker-compose -f docker-compose.dev.yml build frontend

build-dev-backend:
	docker-compose -f docker-compose.dev.yml build backend

run-dev-backend:
	docker-compose -f docker-compose.dev.yml up backend

backend-install:
	cd backend && \
	npm install

frontend-install:
	cd frontend && \
	npm install

install: backend-install frontend-install

build-prod: build-prod-frontend build-prod-backend

run-prod: build-prod
	docker-compose up -d

build-prod-frontend:
	docker-compose build frontend

build-prod-backend:
	docker-compose build backend
