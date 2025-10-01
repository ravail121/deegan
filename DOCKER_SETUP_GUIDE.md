# 🐳 Docker Setup Guide - Restaurant Application

## What's Been Configured

Your restaurant application has been fully containerized with Docker! Here's what was created:

### 📁 New Files Created

1. **`docker-compose.yml`** - Orchestrates all services (API, PWA, Database)
2. **`restaurant-api/Dockerfile`** - Laravel API container configuration
3. **`restaurant-api/.dockerignore`** - Files to exclude from API build
4. **`restaurant-api/docker/nginx.conf`** - Nginx configuration for Laravel
5. **`restaurant-pwa/Dockerfile`** - Vue PWA container configuration  
6. **`restaurant-pwa/.dockerignore`** - Files to exclude from PWA build
7. **`restaurant-pwa/docker/nginx.conf`** - Nginx configuration for PWA
8. **`setup.sh`** - Automated setup script
9. **`README.md`** - Updated with Docker instructions

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Network                       │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────┐│
│  │   Vue PWA    │   │  Laravel API │  │  MySQL   ││
│  │   (Nginx)    │◄─►│   (PHP-FPM   │◄─►│   8.0    ││
│  │   Port 3000  │   │   + Nginx)   │  │  Port    ││
│  │              │   │   Port 8000  │  │  3306    ││
│  └──────────────┘   └──────────────┘  └──────────┘│
│        │                    │              │       │
└────────┼────────────────────┼──────────────┼───────┘
         │                    │              │
         ▼                    ▼              ▼
    localhost:3000      localhost:8000  localhost:3306
```

### 🎯 Container Details

#### 1. **restaurant_pwa** (Frontend)
- **Base**: Node.js 20 (build) → Nginx Alpine (production)
- **Port**: 3000
- **Features**:
  - Multi-stage build for optimized size
  - PWA-optimized nginx configuration
  - Gzip compression enabled
  - Service worker support
  - Static asset caching

#### 2. **restaurant_api** (Backend)
- **Base**: PHP 8.0-FPM
- **Port**: 8000
- **Features**:
  - Nginx web server integrated
  - All required PHP extensions (pdo_mysql, mbstring, etc.)
  - Composer dependencies installed
  - Optimized for production

#### 3. **restaurant_db** (Database)
- **Base**: MySQL 8.0
- **Port**: 3306
- **Configuration**:
  - Database: `restaurant_db`
  - User: `restaurant_user`
  - Password: `restaurant_pass`
  - Persistent volume for data storage

## 🚀 Getting Started

### Option 1: Automated Setup (Recommended)

**Step 1:** Start Docker Desktop  
Make sure Docker Desktop is running on your Mac.

**Step 2:** Run the setup script
```bash
cd /Users/ravail./deegan
./setup.sh
```

This script will:
- Check if Docker is running
- Build all Docker images
- Start all containers

**The Laravel container automatically handles:**
- ✅ Waiting for database connection
- ✅ Application key generation
- ✅ Cache clearing
- ✅ Database migrations
- ✅ Database seeding
- ✅ Application optimization
- ✅ Permission setup

### Option 2: Manual Setup

**Step 1:** Start Docker Desktop

**Step 2:** Build the images
```bash
cd /Users/ravail./deegan
docker-compose build
```

**Step 3:** Start the containers
```bash
docker-compose up -d
```

**Step 4:** Setup Laravel (first time only)
```bash
# Copy .env file if needed
cp restaurant-api/.env.example restaurant-api/.env

# Generate application key
docker exec restaurant_api php artisan key:generate

# Run migrations
docker exec restaurant_api php artisan migrate
```

## 📱 Access Your Application

Once running, you can access:

- **PWA Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:8000](http://localhost:8000)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f pwa
docker-compose logs -f api
docker-compose logs -f db
```

### Stop/Start Services
```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Restart a specific service
docker-compose restart api
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose up -d --build api

# Rebuild all services
docker-compose up -d --build
```

### Execute Commands in Containers
```bash
# Laravel Artisan commands
docker exec restaurant_api php artisan <command>

# Access API container shell
docker exec -it restaurant_api bash

# Access PWA container shell
docker exec -it restaurant_pwa sh

# Access MySQL
docker exec -it restaurant_db mysql -u restaurant_user -p
```

### Database Operations
```bash
# Run migrations
docker exec restaurant_api php artisan migrate

# Seed database
docker exec restaurant_api php artisan db:seed

# Create migration
docker exec restaurant_api php artisan make:migration <name>
```

## 🔧 Troubleshooting

### Docker daemon not running
```
Error: Cannot connect to the Docker daemon
```
**Solution**: Start Docker Desktop application

### Port already in use
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```
**Solution**: Either stop the conflicting service or change the port in `docker-compose.yml`

### Database connection issues
**Solution**: 
1. Check if database is ready: `docker-compose logs db`
2. Verify .env settings match docker-compose.yml
3. Wait a bit longer for MySQL to initialize (first startup takes time)

### Permission issues with Laravel
```bash
# Fix storage permissions
docker exec restaurant_api chown -R www-data:www-data /var/www/html/storage
docker exec restaurant_api chmod -R 755 /var/www/html/storage
```

### Clear Laravel cache
```bash
docker exec restaurant_api php artisan cache:clear
docker exec restaurant_api php artisan config:clear
docker exec restaurant_api php artisan route:clear
docker exec restaurant_api php artisan view:clear
```

## 🧹 Cleanup

### Remove containers but keep data
```bash
docker-compose down
```

### Remove everything including volumes
```bash
docker-compose down -v
```

### Remove all unused Docker resources
```bash
docker system prune -a
```

## 📝 Development Workflow

1. **Make code changes** in `restaurant-api/` or `restaurant-pwa/`
2. **For frontend changes**: Rebuild PWA container
   ```bash
   docker-compose up -d --build pwa
   ```
3. **For backend changes**: Rebuild API container
   ```bash
   docker-compose up -d --build api
   ```
4. **For database schema changes**: Run migrations
   ```bash
   docker exec restaurant_api php artisan migrate
   ```

## 🎉 Benefits of This Setup

✅ **Consistent Environment** - Same setup across all machines  
✅ **Easy Onboarding** - New developers run one command  
✅ **Isolated Dependencies** - No conflicts with local installs  
✅ **Production-Ready** - Similar to deployment environment  
✅ **PWA Optimized** - Proper nginx config for service workers  
✅ **Database Persistence** - Data survives container restarts  
✅ **Multi-Stage Builds** - Smaller, optimized images  

## 🚢 Deployment

This setup can be easily adapted for production by:
1. Using environment variables for secrets
2. Setting up SSL/TLS certificates
3. Using managed database services
4. Implementing CI/CD pipelines
5. Adding monitoring and logging solutions

---

**Need help?** Check the main [README.md](README.md) for more information.

