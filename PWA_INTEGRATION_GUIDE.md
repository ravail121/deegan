# 🍽️ PWA Integration Guide - Menu API

## ✅ What's Ready

### Database Tables Created:
1. **`rs_meal_packages`** - Meal categories (Starters, Main Course, etc.)
2. **`rs_meal_items`** - Individual menu items with pricing & details

### Sample Data Loaded:
- ✅ 5 Meal Packages (categories)
- ✅ 12 Meal Items (dishes)

---

## 🚀 Quick Start for PWA Integration

### Option 1: Load Complete Menu (Recommended)
```javascript
// src/stores/menu.js or similar
const loadMenu = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/menu');
    const { success, data } = await response.json();
    
    if (success) {
      return data; // Array of packages with their items
    }
  } catch (error) {
    console.error('Failed to load menu:', error);
  }
};

// Use in component
const menuData = await loadMenu();
menuData.forEach(package => {
  console.log(`Category: ${package.packageName}`);
  package.active_meal_items.forEach(item => {
    console.log(`  - ${item.itemName}: $${item.costPrice}`);
  });
});
```

### Option 2: Load Packages, Then Items
```javascript
// Load packages first
const packagesResponse = await fetch('http://localhost:8000/api/packages');
const { data: packages } = await packagesResponse.json();

// Load items for a specific package
const packageId = 2; // Main Course
const itemsResponse = await fetch(`http://localhost:8000/api/items/package/${packageId}`);
const { data: items } = await itemsResponse.json();
```

---

## 📋 Available API Endpoints

### Packages Endpoints
```javascript
// Get all active packages
GET /api/packages

// Get packages with their items (ONE CALL - BEST FOR PWA)
GET /api/menu
// or
GET /api/packages/with-items

// Get single package
GET /api/packages/1

// Get single package with items
GET /api/packages/1/with-items
```

### Items Endpoints
```javascript
// Get all active items
GET /api/items

// Get items available NOW (time-filtered)
GET /api/items/available

// Get items by package ID
GET /api/items/package/2

// Get available items by package (time-filtered)
GET /api/items/package/2/available

// Get single item
GET /api/items/1

// Search items
GET /api/items/search?q=chicken
```

---

## 📊 Response Structure

### Package Object
```json
{
  "packageID": 1,
  "packageName": "Starters",
  "photo80": "/images/packages/starters-80.jpg",
  "photo320": "/images/packages/starters-320.jpg",
  "status": "active",
  "prepareTime": 10,
  "description": "Delicious appetizers to start your meal",
  "displayOrder": 1
}
```

### Item Object
```json
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
  "isSpicy": true,
  "displayOrder": 1
}
```

---

## 💡 PWA Implementation Tips

### 1. Create a Menu Store (Pinia)
```javascript
// src/stores/menu.js
import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    packages: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchMenu() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:8000/api/menu');
        const { success, data } = await response.json();
        
        if (success) {
          this.packages = data;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    getItemsByPackage(packageId) {
      const pkg = this.packages.find(p => p.packageID === packageId);
      return pkg?.active_meal_items || [];
    },
    
    searchItems(query) {
      const lowercaseQuery = query.toLowerCase();
      const allItems = this.packages.flatMap(pkg => pkg.active_meal_items);
      return allItems.filter(item => 
        item.itemName.toLowerCase().includes(lowercaseQuery)
      );
    }
  }
});
```

### 2. Display Menu in Component
```vue
<template>
  <div v-if="menuStore.loading">Loading menu...</div>
  <div v-else>
    <div v-for="package in menuStore.packages" :key="package.packageID" class="category">
      <h2>{{ package.packageName }}</h2>
      <img :src="package.photo320" :alt="package.packageName" />
      
      <div v-for="item in package.active_meal_items" :key="item.itemID" class="menu-item">
        <img :src="item.photo80" :alt="item.itemName" />
        <h3>{{ item.itemName }}</h3>
        <p>{{ item.description }}</p>
        <p class="price">${{ item.costPrice }}</p>
        <span v-if="item.isVegetarian">🌱 Veg</span>
        <span v-if="item.isSpicy">🌶️ Spicy</span>
        <button @click="addToCart(item)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMenuStore } from '@/stores/menu';

const menuStore = useMenuStore();

onMounted(() => {
  menuStore.fetchMenu();
});

const addToCart = (item) => {
  // Your cart logic here
  console.log('Adding to cart:', item);
};
</script>
```

### 3. Filter by Time Availability
```javascript
// Check if item is available now (client-side)
const isAvailableNow = (item) => {
  if (!item.startFrom || !item.endTo) return true;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = item.startFrom.split(':').map(Number);
  const [endHour, endMin] = item.endTo.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
};

// Or use server-side filtering
const availableItems = await fetch('http://localhost:8000/api/items/available');
```

### 4. Display Filters
```javascript
// Filter vegetarian items
const vegetarianItems = menuStore.packages
  .flatMap(pkg => pkg.active_meal_items)
  .filter(item => item.isVegetarian);

// Filter by station (kitchen, drinks, coffee)
const kitchenItems = menuStore.packages
  .flatMap(pkg => pkg.active_meal_items)
  .filter(item => item.orderTo === 'kitchen');

// Filter by price range
const affordableItems = menuStore.packages
  .flatMap(pkg => pkg.active_meal_items)
  .filter(item => parseFloat(item.costPrice) < 10);
```

---

## 🎨 Image Paths

All image paths in the API are relative. You can:

1. **Serve from API container:**
   - Store images in `restaurant-api/public/images/`
   - Access: `http://localhost:8000/images/items/spring-rolls-320.jpg`

2. **Serve from PWA:**
   - Already have images in `restaurant-pwa/public/images/dishes/`
   - Map API paths to PWA paths

3. **Use CDN:**
   - Prepend CDN URL: `https://cdn.yoursite.com${item.photo320}`

---

## 🔄 Data Flow

```
User scans QR Code
        ↓
PWA Opens
        ↓
Fetch Menu: GET /api/menu
        ↓
Display Categories (Packages)
        ↓
User clicks category
        ↓
Show Items from package.active_meal_items
        ↓
User adds items to cart
        ↓
User places order
```

---

## 📝 Key Fields Explained

### Package Fields:
- **packageID**: Unique identifier
- **packageName**: Display name (e.g., "Starters")
- **photo80/photo320**: Image paths (use 80 for thumbnails, 320 for details)
- **status**: Filter only "active" packages
- **prepareTime**: Default preparation time for items in this category
- **displayOrder**: Sort order (lower number = first)

### Item Fields:
- **itemID**: Unique identifier
- **itemName**: Display name
- **packageID**: Links to parent package
- **costPrice**: Price to display
- **orderTo**: Station for kitchen display ("kitchen", "drinks", "coffee")
- **startFrom/endTo**: Time availability (null = always available)
- **status**: Filter only "active" items
- **prepareTime**: Override package's prepareTime
- **isVegetarian/isSpicy**: Display badges
- **ingredients**: Show in item details

---

## 🧪 Testing APIs

```bash
# Test complete menu
curl http://localhost:8000/api/menu | python3 -m json.tool

# Test search
curl "http://localhost:8000/api/items/search?q=chicken" | python3 -m json.tool

# Test specific package
curl http://localhost:8000/api/packages/2/with-items | python3 -m json.tool
```

---

## 📚 Files Created

### Migrations:
- `database/migrations/2024_10_01_100000_create_rs_meal_packages_table.php`
- `database/migrations/2024_10_01_100001_create_rs_meal_items_table.php`

### Models:
- `app/Models/MealPackage.php`
- `app/Models/MealItem.php`

### Controllers:
- `app/Http/Controllers/MealPackageController.php`
- `app/Http/Controllers/MealItemController.php`

### Seeders:
- `database/seeders/MealPackageSeeder.php`
- `database/seeders/MealItemSeeder.php`
- Updated: `database/seeders/DatabaseSeeder.php`

### Routes:
- Updated: `routes/api.php`

### Documentation:
- `API_DOCUMENTATION.md`
- `PWA_INTEGRATION_GUIDE.md` (this file)

---

## ✅ Everything Runs Automatically!

When you restart containers (`docker-compose up -d`):
- ✅ Tables are migrated
- ✅ Sample data is seeded
- ✅ APIs are ready to use

No manual commands needed! 🎉

