#!/bin/bash

# Config
IMAGE_NAME_LOCAL="betel-docker"
DOCKERHUB_USER="traitimtrongvang10"
DOCKERHUB_REPO="betel-hospitability"
TAG="latest"

echo "🚀 Building Docker image..."
docker build -t $IMAGE_NAME_LOCAL .

echo "🏷️ Tagging image for Docker Hub..."
docker tag $IMAGE_NAME_LOCAL $DOCKERHUB_USER/$DOCKERHUB_REPO:$TAG

echo "🔐 Logging in to Docker Hub..."
docker login

echo "📤 Pushing image to Docker Hub..."
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:$TAG

echo "✅ Deploy complete!"
echo "Image pushed: $DOCKERHUB_USER/$DOCKERHUB_REPO:$TAG"
