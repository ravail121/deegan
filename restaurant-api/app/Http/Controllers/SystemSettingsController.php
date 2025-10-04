<?php

namespace App\Http\Controllers;

use App\Models\SystemSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SystemSettingsController extends Controller
{
    /**
     * Get all system settings
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $settings = SystemSettings::getAllActiveSettings();
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch system settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get VAT percentage setting
     *
     * @return JsonResponse
     */
    public function getVATPercentage(): JsonResponse
    {
        try {
            $vatSetting = SystemSettings::getVATPercentage();
            
            if (!$vatSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'VAT percentage setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'vat_percentage' => $vatSetting->value,
                    'description' => $vatSetting->description
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch VAT percentage',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current financial year setting
     *
     * @return JsonResponse
     */
    public function getCurrentFinancialYear(): JsonResponse
    {
        try {
            $financeYrSetting = SystemSettings::getCurrentFinancialYear();
            
            if (!$financeYrSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current financial year setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'financial_year' => $financeYrSetting->value,
                    'description' => $financeYrSetting->description
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch financial year',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system settings for app initialization
     *
     * @return JsonResponse
     */
    public function getAppSettings(): JsonResponse
    {
        try {
            $vatSetting = SystemSettings::getVATPercentage();
            $financeYrSetting = SystemSettings::getCurrentFinancialYear();
            
            $settings = [
                'vat_percentage' => $vatSetting ? $vatSetting->value : '0',
                'financial_year' => $financeYrSetting ? $financeYrSetting->value : null
            ];

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch app settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
