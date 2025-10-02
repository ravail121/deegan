<?php

namespace App\Http\Controllers;

use App\Models\MealItem;
use Illuminate\Http\Request;

class MealItemController extends Controller
{
    /**
     * Get all active meal items.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $items = MealItem::active()
                        ->ordered()
                        ->with(['package', 'activeSizes'])
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }

    /**
     * Get all active and available meal items (time-filtered).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function available()
    {
        $items = MealItem::active()
                        ->availableNow()
                        ->ordered()
                        ->with(['package', 'activeSizes'])
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }

    /**
     * Get items by package ID.
     *
     * @param  int  $packageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byPackage($packageId)
    {
        $items = MealItem::where('packageID', $packageId)
                        ->active()
                        ->ordered()
                        ->with(['package', 'activeSizes'])
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }

    /**
     * Get available items by package ID (time-filtered).
     *
     * @param  int  $packageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function availableByPackage($packageId)
    {
        $items = MealItem::where('packageID', $packageId)
                        ->active()
                        ->availableNow()
                        ->ordered()
                        ->with(['package', 'activeSizes'])
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }

    /**
     * Get a single meal item by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $item = MealItem::where('itemID', $id)
                       ->active()
                       ->with(['package', 'activeSizes'])
                       ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found or inactive',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Search items by name.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        $items = MealItem::active()
                        ->where('itemName', 'LIKE', "%{$query}%")
                        ->ordered()
                        ->with(['package', 'activeSizes'])
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
            'query' => $query,
        ]);
    }
}

