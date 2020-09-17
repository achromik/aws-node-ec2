.PHONY: build-backend run-backend push-image

include .env
export $(shell sed 's/=.*//' .env)

ENV_FILE_PARAM = --env-file .env

BE_TAG := $(shell echo $$(node -p "require('./backend/package.json').version"))

build-backend:
	docker build ./backend -t $(NAME)-backend

run-backend:
	docker run --rm --name app-backend $(ENV_FILE_PARAM) -p $(PORT):$(PORT) $(NAME)-backend

push-image: build-backend
	docker login
	docker tag ${NAME}-backend /$(NAME)-backend:$(BE_TAG)
	docker push $(DOCKER_HUB_USER)/$(NAME)-backend:$(BE_TAG)




