#!/bin/bash

# Deployment script for Insurance Management System Frontend
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}
IMAGE_NAME="insurance-frontend"
VERSION=$(date +%Y%m%d-%H%M%S)

echo "======================================"
echo "Deploying Insurance Frontend"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "======================================"

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "Loading environment variables from .env.$ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "Warning: .env.$ENVIRONMENT not found, using defaults"
fi

# Build the Docker image
echo "Building Docker image..."
docker build \
    --build-arg VITE_API_URL=${VITE_API_URL} \
    -t ${IMAGE_NAME}:${VERSION} \
    -t ${IMAGE_NAME}:latest \
    .

echo "Build completed successfully!"

# Stop and remove existing container
echo "Stopping existing container..."
docker-compose down 2>/dev/null || true

# Start the new container
echo "Starting new container..."
docker-compose up -d

# Wait for health check
echo "Waiting for application to be healthy..."
sleep 5

# Check if container is running
if docker ps | grep -q ${IMAGE_NAME}; then
    echo "======================================"
    echo "Deployment successful!"
    echo "Application is running at: http://localhost:3000"
    echo "======================================"

    # Show logs
    echo ""
    echo "Recent logs:"
    docker-compose logs --tail=20
else
    echo "======================================"
    echo "Deployment failed!"
    echo "======================================"
    docker-compose logs
    exit 1
fi

# Cleanup old images (keep last 3 versions)
echo ""
echo "Cleaning up old images..."
docker images ${IMAGE_NAME} --format "{{.Tag}}" | grep -v "latest" | tail -n +4 | xargs -r -I {} docker rmi ${IMAGE_NAME}:{} 2>/dev/null || true

echo "Deployment complete!"
