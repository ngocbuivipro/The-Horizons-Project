$ErrorActionPreference = "Stop"

$IMAGE_LOCAL = "betel-docker"
$REMOTE = "traitimtrongvang10/betel-hospitability:latest"

Write-Host "Checking Docker login..."
docker login

Write-Host "Building image..."
docker build -t $IMAGE_LOCAL .

Write-Host "🏷Tagging..."
docker tag $IMAGE_LOCAL $REMOTE

Write-Host "Pushing..."
docker push $REMOTE

Write-Host "DONE: Image pushed successfully!"
