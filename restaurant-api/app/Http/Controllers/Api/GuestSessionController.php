<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GuestSessionController extends Controller
{
    /**
     * Generate a new guest session token
     */
    public function createGuestSession(Request $request)
    {
        try {
            // Create or find existing guest
            $guest = Guest::createOrFindGuest($request->ip(), $request->userAgent());
            
            // Create Sanctum token for the guest
            $token = $guest->createToken('guest-session', ['guest'], now()->addDays(7));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token->plainTextToken,
                    'guest_id' => $guest->guest_id,
                    'expires_at' => now()->addDays(7)->toISOString(),
                    'type' => 'guest'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create guest session',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Refresh guest session token
     */
    public function refreshGuestSession(Request $request)
    {
        try {
            $guest = $request->user();
            
            // Delete current token
            $guest->currentAccessToken()->delete();
            
            // Update last activity
            $guest->update(['last_activity' => now()]);
            
            // Create new token
            $token = $guest->createToken('guest-session', ['guest'], now()->addDays(7));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token->plainTextToken,
                    'expires_at' => now()->addDays(7)->toISOString(),
                    'type' => 'guest'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh guest session',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get current guest session info
     */
    public function getGuestSession(Request $request)
    {
        $guest = $request->user();
        $token = $guest->currentAccessToken();
        
        return response()->json([
            'success' => true,
            'data' => [
                'guest_id' => $guest->guest_id,
                'type' => 'guest',
                'created_at' => $token->created_at->toISOString(),
                'expires_at' => $token->expires_at ? $token->expires_at->toISOString() : null,
                'abilities' => $token->abilities,
                'session_data' => $guest->session_data
            ]
        ]);
    }
    
    /**
     * Update guest session data
     */
    public function updateSessionData(Request $request)
    {
        try {
            $guest = $request->user();
            $key = $request->input('key');
            $value = $request->input('value');
            
            if (!$key) {
                return response()->json([
                    'success' => false,
                    'message' => 'Key is required'
                ], 400);
            }
            
            $guest->updateSessionData($key, $value);
            
            return response()->json([
                'success' => true,
                'message' => 'Session data updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update session data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
