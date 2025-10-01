# 📖 Restaurant Menu API Documentation

Base URL: `http://localhost:8000/api`

## 🍽️ Meal Packages Endpoints

### 1. Get All Active Packages
```
GET /api/packages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "packageID": 1,
      "packageName": "Starters",
      "photo80": "/images/packages/starters-80.jpg",
      "photo320": "/images/packages/starters-320.jpg",
      "status": "active",
      "prepareTime": 10,
      "description": "Delicious appetizers",
      "displayOrder": 1
    }
  ],
  "count": 5
}
```

### 2. Get All Packages With Their Items
```
GET /api/packages/with-items
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "packageID": 1,
      "packageName": "Starters",
      "photo80": "/images/packages/starters-80.jpg",
      "photo320": "/images/packages/starters-320.jpg",
      "status": "active",
      "prepareTime": 10,
      "active_meal_items": [
        {
          "itemID": 1,
          "itemName": "Spring Rolls",
          "costPrice": "8.99",
          "photo80": "/images/items/spring-rolls-80.jpg",
          "photo320": "/images/items/spring-rolls-320.jpg"
        }
      ]
    }
  ],
  "count": 5
}
```

### 3. Get Single Package
```
GET /api/packages/{id}
```

### 4. Get Single Package With Items
```
GET /api/packages/{id}/with-items
```

---

## 🍔 Meal Items Endpoints

### 1. Get All Active Items
```
GET /api/items
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "itemID": 1,
      "itemName": "Spring Rolls",
      "packageID": 1,
      "photo80": "/images/items/spring-rolls-80.jpg",
      "photo320": "/images/items/spring-rolls-320.jpg",
      "costPrice": "8.99",
      "orderTo": "kitchen",
      "startFrom": null,
      "endTo": null,
      "status": "active",
      "prepareTime": 10,
      "description": "Crispy vegetable spring rolls",
      "ingredients": "Cabbage, carrots, spring onions",
      "isVegetarian": true,
      "isSpicy": false,
      "displayOrder": 1,
      "package": {
        "packageID": 1,
        "packageName": "Starters"
      }
    }
  ],
  "count": 12
}
```

### 2. Get Available Items (Time-Filtered)
```
GET /api/items/available
```
Returns only items available at the current time based on `startFrom` and `endTo`.

### 3. Get Items By Package
```
GET /api/items/package/{packageId}
```

**Example:**
```
GET /api/items/package/1
```

### 4. Get Available Items By Package
```
GET /api/items/package/{packageId}/available
```

### 5. Get Single Item
```
GET /api/items/{id}
```

### 6. Search Items
```
GET /api/items/search?q=chicken
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 2,
  "query": "chicken"
}
```

---

## 🚀 Quick Menu Endpoint (Recommended for PWA)

### Get Complete Menu
```
GET /api/menu
```

Returns all active packages with their active items in one call. **Best for PWA initial load.**

---

## 📊 Database Schema

### Table: `rs_meal_packages`
| Column | Type | Description |
|--------|------|-------------|
| packageID | BIGINT | Primary Key |
| packageName | VARCHAR | Category name |
| photo80 | VARCHAR | Small thumbnail (80px) |
| photo320 | VARCHAR | Larger image (320px) |
| status | ENUM | 'active' or 'inactive' |
| prepareTime | INT | Default prep time (minutes) |
| description | TEXT | Package description |
| displayOrder | INT | Sort order |

### Table: `rs_meal_items`
| Column | Type | Description |
|--------|------|-------------|
| itemID | BIGINT | Primary Key |
| itemName | VARCHAR | Item name |
| packageID | BIGINT | Foreign Key to packages |
| photo80 | VARCHAR | Small image |
| photo320 | VARCHAR | Large image |
| costPrice | DECIMAL | Item price |
| orderTo | VARCHAR | 'kitchen', 'drinks', 'coffee' |
| startFrom | TIME | Availability start time |
| endTo | TIME | Availability end time |
| status | ENUM | 'active' or 'inactive' |
| prepareTime | INT | Override prep time |
| description | TEXT | Item description |
| ingredients | TEXT | Ingredients list |
| isVegetarian | BOOLEAN | Vegetarian flag |
| isSpicy | BOOLEAN | Spicy indicator |
| displayOrder | INT | Sort order |

---

## 🎯 Usage in PWA

### 1. Load Complete Menu on App Start
```javascript
// Fetch complete menu
const response = await fetch('http://localhost:8000/api/menu');
const { success, data } = await response.json();

// data contains all packages with their items
data.forEach(package => {
  console.log(package.packageName);
  package.active_meal_items.forEach(item => {
    console.log('  -', item.itemName, '$' + item.costPrice);
  });
});
```

### 2. Filter by Category
```javascript
// Get items for specific package
const packageId = 1;
const response = await fetch(`http://localhost:8000/api/items/package/${packageId}`);
const { data } = await response.json();
```

### 3. Check Time Availability
```javascript
// Get only currently available items
const response = await fetch('http://localhost:8000/api/items/available');
const { data } = await response.json();
```

### 4. Search Items
```javascript
// Search for items
const query = 'chicken';
const response = await fetch(`http://localhost:8000/api/items/search?q=${query}`);
const { data } = await response.json();
```

---

## 🔄 Running Migrations & Seeders

The Docker container automatically runs:
1. **Migrations** - Creates both tables
2. **Seeders** - Populates sample data

To manually run (if needed):
```bash
docker exec restaurant_api php artisan migrate
docker exec restaurant_api php artisan db:seed
```

---

## ✅ Testing the API

```bash
# Test packages endpoint
curl http://localhost:8000/api/packages

# Test complete menu
curl http://localhost:8000/api/menu

# Test items
curl http://localhost:8000/api/items

# Test search
curl http://localhost:8000/api/items/search?q=chicken
```

---

## 📝 Notes

- All endpoints return JSON
- No authentication required for menu endpoints
- Times are in 24-hour format (HH:MM:SS)
- Prices are in decimal format with 2 decimal places
- Images paths are relative (you can prepend your CDN/storage URL)
- `displayOrder` controls sort order (ascending)
- Items without `startFrom`/`endTo` are always available

