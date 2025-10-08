<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MealPackageController;
use App\Http\Controllers\MealItemController;
use App\Http\Controllers\AddonController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\GuestSessionController;

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
| Guest Session API Routes (Public - No Auth Required)
|--------------------------------------------------------------------------
*/

// Guest Session Routes
Route::prefix('guest')->group(function () {
    Route::post('/session', [GuestSessionController::class, 'createGuestSession']);
    Route::get('/session', [GuestSessionController::class, 'getGuestSession'])->middleware('auth:sanctum');
    Route::post('/session/refresh', [GuestSessionController::class, 'refreshGuestSession'])->middleware('auth:sanctum');
    Route::post('/session/data', [GuestSessionController::class, 'updateSessionData'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| Menu API Routes (JWT Auth Required)
|--------------------------------------------------------------------------
*/

// Meal Packages Routes
Route::prefix('packages')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [MealPackageController::class, 'index']);
    Route::get('/with-items', [MealPackageController::class, 'indexWithItems']);
    Route::get('/{id}', [MealPackageController::class, 'show']);
    Route::get('/{id}/with-items', [MealPackageController::class, 'showWithItems']);
});

// Meal Items Routes
Route::prefix('items')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [MealItemController::class, 'index']);
    Route::get('/available', [MealItemController::class, 'available']);
    Route::get('/search', [MealItemController::class, 'search']);
    Route::get('/{id}', [MealItemController::class, 'show']);
    Route::get('/package/{packageId}', [MealItemController::class, 'byPackage']);
    Route::get('/package/{packageId}/available', [MealItemController::class, 'availableByPackage']);
});

// Addon Routes
Route::prefix('addons')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AddonController::class, 'index']);
    Route::get('/all', [AddonController::class, 'all']);
    Route::get('/search', [AddonController::class, 'search']);
    Route::get('/{id}', [AddonController::class, 'show']);
    Route::get('/meal-item/{itemId}', [AddonController::class, 'byMealItem']);
    
    // Admin routes with JWT auth
    Route::post('/', [AddonController::class, 'store']);
    Route::put('/{id}', [AddonController::class, 'update']);
    Route::delete('/{id}', [AddonController::class, 'destroy']);
});

// Quick Menu Route - Get everything in one call
Route::get('/menu', [MealPackageController::class, 'indexWithItems'])->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| System Settings API Routes (JWT Auth Required)
|--------------------------------------------------------------------------
*/

// System Settings Routes
Route::prefix('settings')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [SystemSettingsController::class, 'index']);
    Route::get('/app', [SystemSettingsController::class, 'getAppSettings']);
    Route::get('/vat', [SystemSettingsController::class, 'getVATPercentage']);
    Route::get('/financial-year', [SystemSettingsController::class, 'getCurrentFinancialYear']);
});

/*
|--------------------------------------------------------------------------
| Order API Routes (JWT Auth Required)
|--------------------------------------------------------------------------
*/

// Order Routes
Route::prefix('orders')->group(function () {
    // Public routes for notification system (internal use only)
    Route::get('/latest', [OrderController::class, 'getLatestOrder']);
    Route::get('/newer/{orderID}', [OrderController::class, 'getNewerOrders']);
    
    // Protected routes requiring authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [OrderController::class, 'placeOrder']);
        Route::get('/{orderID}', [OrderController::class, 'getOrder']);
        Route::get('/table/{tableID}', [OrderController::class, 'getOrdersByTable']);
        Route::put('/{orderID}/status', [OrderController::class, 'updateOrderStatus']);
    });
});
