#!/bin/bash

echo "🔧 Running Size and Addon Migrations..."

# Run all remaining migrations (sizes and addons)
echo "💾 Creating tables..."

# Run the specific migrations we kept
docker exec restaurant_api php artisan migrate --path=/database/migrations/2024_10_01_100002_create_rs_meal_item_sizes_table.php
docker exec restaurant_api php artisan migrate --path=/database/migrations/2025_10_02_155206_create_rs_addons_table.php
docker exec restaurant_api php artisan migrate --path=/database/migrations/2025_10_02_155301_create_rs_meal_item_addons_table.php

echo "✅ All migrations completed!"
echo ""
echo "📋 Tables created:"
echo "  - rs_meal_item_sizes"
echo "  - rs_addons"
echo "  - rs_meal_item_addons"
echo ""
echo "🚀 Your size and addon system is ready to use!"
