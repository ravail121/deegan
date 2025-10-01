#!/bin/bash

echo "🍽️  Restaurant Application Docker Setup"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env exists in restaurant-api
if [ ! -f "./restaurant-api/.env" ]; then
    echo "📝 Creating .env file for Laravel API..."
    if [ -f "./restaurant-api/.env.example" ]; then
        cp ./restaurant-api/.env.example ./restaurant-api/.env
        echo "✅ .env file created from .env.example"
    else
        echo "⚠️  No .env.example found. You'll need to create .env manually."
    fi
    echo ""
fi

# Build and start containers
echo "🔨 Building Docker images (this may take a few minutes)..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers!"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
echo "(Laravel setup commands will run automatically via entrypoint script)"
sleep 15

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access your application:"
echo "   - PWA Frontend: http://localhost:3000"
echo "   - API Backend:  http://localhost:8000"
echo "   - Database:     localhost:3306"
echo ""
echo "📋 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
echo ""

