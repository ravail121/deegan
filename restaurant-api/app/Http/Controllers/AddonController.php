<?php

namespace App\Http\Controllers;

use App\Models\Addon;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    /**
     * Get all active addons.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $addons = Addon::active()
                       ->ordered()
                       ->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
            'count' => $addons->count(),
        ]);
    }

    /**
     * Get all addons (including inactive).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function all()
    {
        $addons = Addon::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
            'count' => $addons->count(),
        ]);
    }

    /**
     * Get a single addon by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $addon = Addon::where('addonID', $id)->first();

        if (!$addon) {
            return response()->json([
                'success' => false,
                'message' => 'Addon not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $addon,
        ]);
    }

    /**
     * Get addons for a specific meal item.
     *
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byMealItem($itemId)
    {
        $addons = Addon::whereHas('mealItems', function ($query) use ($itemId) {
            $query->where('rs_meal_items.itemID', $itemId);
        })
        ->active()
        ->ordered()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
            'count' => $addons->count(),
            'meal_item_id' => $itemId,
        ]);
    }

    /**
     * Create a new addon.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'addonName' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        $addon = Addon::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Addon created successfully',
            'data' => $addon,
        ], 201);
    }

    /**
     * Update an existing addon.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $addon = Addon::where('addonID', $id)->first();

        if (!$addon) {
            return response()->json([
                'success' => false,
                'message' => 'Addon not found',
            ], 404);
        }

        $request->validate([
            'addonName' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        $addon->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Addon updated successfully',
            'data' => $addon,
        ]);
    }

    /**
     * Delete an addon.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $addon = Addon::where('addonID', $id)->first();

        if (!$addon) {
            return response()->json([
                'success' => false,
                'message' => 'Addon not found',
            ], 404);
        }

        $addon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Addon deleted successfully',
        ]);
    }

    /**
     * Search addons by name.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        $addons = Addon::active()
                       ->where('addonName', 'LIKE', "%{$query}%")
                       ->ordered()
                       ->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
            'count' => $addons->count(),
            'query' => $query,
        ]);
    }
}
