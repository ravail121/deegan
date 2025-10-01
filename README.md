# Restaurant Application - Docker Setup

This project contains a restaurant management system with:
- **Laravel API Backend** (restaurant-api)
- **Vue.js PWA Frontend** (restaurant-pwa)
- **MySQL Database**

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Setup and Run

**Start all services:**
```bash
docker-compose up -d
```

That's it! The Laravel container automatically handles:
- ✅ Application key generation
- ✅ Database migrations
- ✅ Database seeding
- ✅ Cache optimization
- ✅ Permission setup

### Access the Application

- **PWA Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Database**: localhost:3306

### Useful Commands

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f pwa
docker-compose logs -f api
docker-compose logs -f db
```

**Stop services:**
```bash
docker-compose down
```

**Rebuild after changes:**
```bash
docker-compose up -d --build
```

**Access container shell:**
```bash
# API container
docker exec -it restaurant_api bash

# PWA container
docker exec -it restaurant_pwa sh

# Database container
docker exec -it restaurant_db mysql -u restaurant_user -p
```

**Run Laravel commands:**
```bash
docker exec -it restaurant_api php artisan <command>
```

## 📦 Services

### API (Port 8000)
- PHP 8.0 with FPM
- Nginx web server
- Laravel 8.x framework

### PWA (Port 3000)
- Node.js 20 build environment
- Nginx serving static files
- Vue 3 with Vite

### Database (Port 3306)
- MySQL 8.0
- Database: restaurant_db
- User: restaurant_user
- Password: restaurant_pass

## 🛠️ Development

To make changes:

1. Edit files in `restaurant-api/` or `restaurant-pwa/`
2. Rebuild the affected service:
```bash
docker-compose up -d --build api
# or
docker-compose up -d --build pwa
```

## 🧹 Cleanup

Remove all containers, networks, and volumes:
```bash
docker-compose down -v
```
