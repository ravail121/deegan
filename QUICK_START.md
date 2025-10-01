# ⚡ Quick Start Guide

## 🎯 One Command Setup

```bash
docker-compose up -d
```

That's it! Everything else is automatic! ✨

## ⏱️ What Happens Automatically?

When you start the containers, the Laravel API automatically:

1. **Waits for Database** 🔄
   - Checks MySQL connection every 2 seconds
   - Proceeds once database is ready

2. **Generates App Key** 🔑
   - Creates secure application encryption key
   - Only if not already set

3. **Clears All Caches** 🧹
   - Application cache
   - Configuration cache
   - Route cache
   - View cache

4. **Runs Migrations** 💾
   - Creates all database tables
   - Applies any pending migrations

5. **Seeds Database** 🌱
   - Populates initial data
   - Safe to run multiple times

6. **Optimizes for Production** ⚡
   - Caches configuration
   - Caches routes
   - Compiles views

7. **Sets Permissions** 🔒
   - Configures storage permissions
   - Sets proper file ownership

8. **Starts Services** 🌐
   - Nginx web server
   - PHP-FPM processor

## 📍 Access Your Application

- **Frontend (PWA)**: http://localhost:3000
- **Backend (API)**: http://localhost:8000
- **Database**: localhost:3306

## 📊 Check Status

```bash
# View all containers
docker-compose ps

# Watch setup progress
docker logs restaurant_api --follow

# Check if services are responding
curl http://localhost:8000
curl http://localhost:3000
```

## 🔄 Common Operations

### Stop Everything
```bash
docker-compose down
```

### Start Again
```bash
docker-compose up -d
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
```

### Run Artisan Commands
```bash
docker exec restaurant_api php artisan <command>
```

## 🆘 Troubleshooting

### Container Won't Start?
Check if ports are in use:
```bash
lsof -i :3000
lsof -i :8000
lsof -i :3306
```

### Database Connection Issues?
Wait a bit longer - MySQL takes ~15 seconds to initialize on first start.

### See Setup Progress?
```bash
docker logs restaurant_api --tail 50
```

### Reset Everything?
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d    # Fresh start
```

## ✅ You're All Set!

No manual migrations, no manual seeding, no manual key generation!

Everything happens automatically when you start the containers! 🚀
