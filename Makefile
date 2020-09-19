.PHONY: build-backend run-backend push-image dev-backend

include .env
export $(shell sed 's/=.*//' .env)

ENV_FILE_PARAM = --env-file .env
NVM := $(shell test -f "$$HOME/.nvm/nvm.sh"; echo $$?)

BE_TAG := $(shell echo $$(node -p "require('./backend/package.json').version"))

build-backend:
	docker build ./backend -t $(NAME)-backend

build-frontend:
	docker build ./frontend -t $(NAME)-frontend

build-frontend-prod:
	docker build \
	-f frontend/Dockerfile.prod \
	-t $(NAME)-frontend \
	./frontend

run-backend:
	docker run -d --rm --name app-backend $(ENV_FILE_PARAM) -p $(API_PORT):$(API_PORT) $(NAME)-backend

run-dev-frontend:
	docker run \
	-it \
	--rm \
	-v ${PWD}/frontend:/usr/src/app \
	-v /usr/src/app/node_modules \
	-p $(PORT):$(PORT) \
	-e CHOKIDAR_USEPOLLING=true \
	--name app-frontend \
	$(ENV_FILE_PARAM) \
	$(NAME)-frontend

push-image: build-backend
	docker login
	docker tag ${NAME}-backend $(DOCKER_HUB_USER)/$(NAME)-backend:$(BE_TAG)
	docker push $(DOCKER_HUB_USER)/$(NAME)-backend:$(BE_TAG)

dev-backend:
	cd backend && \
	node_modules/.bin/nodemon \
	--ignore './test/' \
	-r dotenv/config \
	src/server.js \
	dotenv_config_path=../.env |\
	| node_modules/.bin/bunyan -o short

dev-frontend:
	cd frontend && \
	node_modules/.bin/react-scripts start

run-dev: run-backend dev-frontend

backend-install:
	cd backend && \
	npm install

frontend-install:
	cd frontend && \
	npm install

install: backend-install frontend-install



