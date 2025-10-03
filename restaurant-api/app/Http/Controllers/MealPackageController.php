<?php

namespace App\Http\Controllers;

use App\Models\MealPackage;
use Illuminate\Http\Request;

class MealPackageController extends Controller
{
    /**
     * Get all active meal packages.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $packages = MealPackage::active()
                               ->orderBy('packageID', 'asc')
                               ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'count' => $packages->count(),
        ]);
    }

    /**
     * Get all active packages with their active meal items.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexWithItems()
    {
        $packages = MealPackage::active()
                               ->orderBy('packageID', 'asc')
                               ->with(['activeMealItems' => function ($query) {
                                   $query->orderBy('itemID', 'asc')->with('activeSizes');
                               }])
                               ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'count' => $packages->count(),
        ]);
    }

    /**
     * Get a single package by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $package = MealPackage::where('packageID', $id)
                              ->active()
                              ->first();

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found or inactive',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $package,
        ]);
    }

    /**
     * Get a package with its meal items.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showWithItems($id)
    {
        $package = MealPackage::where('packageID', $id)
                              ->active()
                              ->with(['activeMealItems' => function ($query) {
                                  $query->orderBy('itemID', 'asc')->with('activeSizes');
                              }])
                              ->first();

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found or inactive',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $package,
        ]);
    }
}

