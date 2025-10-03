<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MealPackageController;
use App\Http\Controllers\MealItemController;
use App\Http\Controllers\AddonController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Menu API Routes (Public - No Auth Required)
|--------------------------------------------------------------------------
*/

// Meal Packages Routes
Route::prefix('packages')->group(function () {
    Route::get('/', [MealPackageController::class, 'index']);
    Route::get('/with-items', [MealPackageController::class, 'indexWithItems']);
    Route::get('/{id}', [MealPackageController::class, 'show']);
    Route::get('/{id}/with-items', [MealPackageController::class, 'showWithItems']);
});

// Meal Items Routes
Route::prefix('items')->group(function () {
    Route::get('/', [MealItemController::class, 'index']);
    Route::get('/available', [MealItemController::class, 'available']);
    Route::get('/search', [MealItemController::class, 'search']);
    Route::get('/{id}', [MealItemController::class, 'show']);
    Route::get('/package/{packageId}', [MealItemController::class, 'byPackage']);
    Route::get('/package/{packageId}/available', [MealItemController::class, 'availableByPackage']);
});

// Addon Routes
Route::prefix('addons')->group(function () {
    Route::get('/', [AddonController::class, 'index']);
    Route::get('/all', [AddonController::class, 'all']);
    Route::get('/search', [AddonController::class, 'search']);
    Route::get('/{id}', [AddonController::class, 'show']);
    Route::get('/meal-item/{itemId}', [AddonController::class, 'byMealItem']);
    
    // Admin routes (you might want to add authentication middleware later)
    Route::post('/', [AddonController::class, 'store']);
    Route::put('/{id}', [AddonController::class, 'update']);
    Route::delete('/{id}', [AddonController::class, 'destroy']);
});

// Quick Menu Route - Get everything in one call
Route::get('/menu', [MealPackageController::class, 'indexWithItems']);
