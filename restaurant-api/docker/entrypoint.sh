#!/bin/bash

echo "🚀 Starting Laravel Application Setup..."



# Generate application key if not set
echo "🔑 Generating application key..."
php artisan key:generate --force

# Clear all caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations
echo "💾 Running database migrations..."
php artisan migrate --force

# Run seeders (if any)
echo "🌱 Running database seeders..."
php artisan db:seed --force || echo "No seeders to run or seeder failed (continuing...)"

# Optimize for production
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ Laravel application is ready!"
echo ""

# Start nginx and PHP-FPM
echo "🌐 Starting web services..."
service nginx start
php-fpm

