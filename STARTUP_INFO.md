# 🚀 Automatic Startup Process

When you run `docker-compose up -d`, the following happens automatically:

## Container Startup Sequence

### 1. **Database Container (`restaurant_db`)**
- Starts MySQL 8.0
- Creates database: `restaurant_db`
- Health check ensures it's ready before API starts

### 2. **API Container (`restaurant_api`)**  
**Automatic Setup via Entrypoint Script:**

```
🚀 Starting Laravel Application Setup...
⏳ Waiting for database connection...
✅ Database connection established!
🔑 Generating application key... (if needed)
🧹 Clearing caches...
   - Application cache cleared
   - Configuration cache cleared
   - Route cache cleared
   - Compiled views cleared
💾 Running database migrations...
   - Creates/updates all database tables
🌱 Running database seeders...
   - Populates initial data
⚡ Optimizing application...
   - Config cached
   - Routes cached
   - Views cached
🔒 Setting permissions...
   - Storage directory permissions set
✅ Laravel application is ready!
🌐 Starting web services...
   - Nginx started
   - PHP-FPM started
```

### 3. **PWA Container (`restaurant_pwa`)**
- Nginx serves built Vue.js PWA
- PWA-optimized configuration active
- Service worker support enabled

## ⏱️ Typical Startup Time

- **Database**: ~10-15 seconds
- **API Setup**: ~15-20 seconds (includes migrations, seeding, optimization)
- **PWA**: ~2-3 seconds
- **Total**: ~25-35 seconds

## 🔍 Monitoring Startup

Watch the automated setup process:
```bash
docker logs restaurant_api --follow
```

Check all services:
```bash
docker-compose ps
```

## 🔄 What Happens on Restart?

When you stop and restart containers:

1. **If volumes persist** (default):
   - Database data remains
   - No need to re-seed
   - Migrations only run new ones
   - Application key persists

2. **If volumes are removed** (`docker-compose down -v`):
   - Fresh database created
   - All migrations run
   - Seeders populate data
   - New application key generated

## 🎯 Key Features

### Intelligent Database Waiting
The entrypoint script waits up to 60 seconds for the database to be ready before timing out.

### Idempotent Operations
- Key generation: Only runs if not already set
- Migrations: Only runs pending migrations
- Seeders: Safe to run multiple times

### Production-Ready
- Configuration cached for performance
- Routes cached for faster routing
- Views compiled for speed
- Proper file permissions set

## 🛠️ Manual Commands (if needed)

Even though everything is automatic, you can still run commands manually:

```bash
# Clear specific caches
docker exec restaurant_api php artisan cache:clear
docker exec restaurant_api php artisan config:clear

# Run migrations manually
docker exec restaurant_api php artisan migrate

# Run seeders manually
docker exec restaurant_api php artisan db:seed

# Generate new key
docker exec restaurant_api php artisan key:generate --force
```

## 📝 Entrypoint Script Location

The automatic setup script is located at:
- `/Users/ravail./deegan/restaurant-api/docker/entrypoint.sh`

You can customize it to add more startup commands if needed.

## ✅ Success Indicators

Container is ready when you see:
```
✅ Laravel application is ready!
[TIMESTAMP] NOTICE: fpm is running, pid XXX
[TIMESTAMP] NOTICE: ready to handle connections
```

Test endpoints:
```bash
curl http://localhost:8000  # Should return 200
curl http://localhost:3000  # Should return 200
```

