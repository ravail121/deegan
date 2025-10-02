<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MealItemSize;
use App\Models\MealItem;

class MealItemSizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all meal items
        $mealItems = MealItem::all();

        // Define size templates for different types of items
        $sizeTemplates = [
            // Beverages
            'beverage' => [
                ['name' => 'Small', 'price_multiplier' => 1.0],
                ['name' => 'Medium', 'price_multiplier' => 1.3],
                ['name' => 'Large', 'price_multiplier' => 1.6],
            ],
            // Main dishes
            'main_dish' => [
                ['name' => 'Regular', 'price_multiplier' => 1.0],
                ['name' => 'Large', 'price_multiplier' => 1.4],
                ['name' => 'Extra Large', 'price_multiplier' => 1.8],
            ],
            // Appetizers/Snacks
            'appetizer' => [
                ['name' => 'Small', 'price_multiplier' => 1.0],
                ['name' => 'Medium', 'price_multiplier' => 1.5],
                ['name' => 'Large', 'price_multiplier' => 2.0],
            ],
            // Desserts
            'dessert' => [
                ['name' => 'Regular', 'price_multiplier' => 1.0],
                ['name' => 'Large', 'price_multiplier' => 1.3],
            ],
        ];

        foreach ($mealItems as $item) {
            // Determine item type based on name or package
            $itemType = $this->determineItemType($item);
            $sizes = $sizeTemplates[$itemType] ?? $sizeTemplates['main_dish'];

            // Create sizes for this item
            foreach ($sizes as $index => $size) {
                MealItemSize::create([
                    'itemID' => $item->itemID,
                    'sizeName' => $size['name'],
                    'price' => $item->costPrice * $size['price_multiplier'],
                    'status' => 'active',
                    'displayOrder' => $index + 1,
                ]);
            }
        }
    }

    /**
     * Determine item type based on item name or package
     */
    private function determineItemType($item)
    {
        $name = strtolower($item->itemName);
        $packageName = strtolower($item->package->packageName ?? '');

        // Beverages
        if (strpos($name, 'drink') !== false || 
            strpos($name, 'juice') !== false || 
            strpos($name, 'coffee') !== false || 
            strpos($name, 'tea') !== false ||
            strpos($name, 'lassi') !== false ||
            strpos($packageName, 'beverage') !== false ||
            strpos($packageName, 'drink') !== false) {
            return 'beverage';
        }

        // Appetizers/Starters
        if (strpos($name, 'pakora') !== false || 
            strpos($name, 'tikka') !== false || 
            strpos($name, 'kebab') !== false ||
            strpos($packageName, 'starter') !== false ||
            strpos($packageName, 'appetizer') !== false) {
            return 'appetizer';
        }

        // Desserts
        if (strpos($name, 'dessert') !== false || 
            strpos($name, 'sweet') !== false || 
            strpos($name, 'cake') !== false ||
            strpos($packageName, 'dessert') !== false) {
            return 'dessert';
        }

        // Default to main dish
        return 'main_dish';
    }
}
