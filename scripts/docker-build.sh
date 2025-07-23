#!/bin/bash

# Beris Docker Build Script
echo "🐳 Building Beris Docker Image..."

# Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t beris:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "🚀 Image: beris:latest"
    echo ""
    echo "To run the application:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f app"
else
    echo "❌ Docker build failed!"
    exit 1
fi 