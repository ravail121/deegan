#!/bin/bash

# Start the database container
echo "Starting database container..."
docker compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Start Laravel development server
echo "Starting Laravel server on port 8000..."
cd restaurant-api
php artisan serve --host=0.0.0.0 --port=8000
