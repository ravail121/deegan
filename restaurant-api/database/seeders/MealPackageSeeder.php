<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MealPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $packages = [
            [
                'packageName' => 'Starters',
                'photo80' => '/images/packages/starters-80.jpg',
                'photo320' => '/images/packages/starters-320.jpg',
                'status' => 'active',
                'prepareTime' => 10,
                'description' => 'Delicious appetizers to start your meal',
                'displayOrder' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Main Course',
                'photo80' => '/images/packages/main-course-80.jpg',
                'photo320' => '/images/packages/main-course-320.jpg',
                'status' => 'active',
                'prepareTime' => 20,
                'description' => 'Our signature main dishes',
                'displayOrder' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Beverages',
                'photo80' => '/images/packages/beverages-80.jpg',
                'photo320' => '/images/packages/beverages-320.jpg',
                'status' => 'active',
                'prepareTime' => 5,
                'description' => 'Refreshing drinks and beverages',
                'displayOrder' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Desserts',
                'photo80' => '/images/packages/desserts-80.jpg',
                'photo320' => '/images/packages/desserts-320.jpg',
                'status' => 'active',
                'prepareTime' => 8,
                'description' => 'Sweet endings to your meal',
                'displayOrder' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Coffee & Tea',
                'photo80' => '/images/packages/coffee-80.jpg',
                'photo320' => '/images/packages/coffee-320.jpg',
                'status' => 'active',
                'prepareTime' => 5,
                'description' => 'Hot and cold coffee and tea selections',
                'displayOrder' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('rs_meal_packages')->insert($packages);
    }
}

