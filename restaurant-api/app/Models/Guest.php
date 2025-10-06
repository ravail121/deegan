<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class Guest extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'guest_id',
        'ip_address',
        'user_agent',
        'last_activity',
        'session_data'
    ];

    protected $casts = [
        'last_activity' => 'datetime',
        'session_data' => 'array'
    ];

    protected $hidden = [
        'remember_token',
    ];

    /**
     * Generate a new guest ID
     */
    public static function generateGuestId()
    {
        return 'guest_' . Str::random(32);
    }

    /**
     * Create or find a guest session
     */
    public static function createOrFindGuest($ipAddress, $userAgent)
    {
        // Try to find existing guest by IP and recent activity (within 1 hour)
        $existingGuest = self::where('ip_address', $ipAddress)
            ->where('last_activity', '>', now()->subHour())
            ->first();

        if ($existingGuest) {
            $existingGuest->update([
                'last_activity' => now(),
                'user_agent' => $userAgent
            ]);
            return $existingGuest;
        }

        // Create new guest
        return self::create([
            'guest_id' => self::generateGuestId(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'last_activity' => now(),
            'session_data' => []
        ]);
    }

    /**
     * Update session data
     */
    public function updateSessionData($key, $value)
    {
        $sessionData = $this->session_data ?? [];
        $sessionData[$key] = $value;
        
        $this->update([
            'session_data' => $sessionData,
            'last_activity' => now()
        ]);
    }

    /**
     * Get session data
     */
    public function getSessionData($key = null, $default = null)
    {
        $sessionData = $this->session_data ?? [];
        
        if ($key === null) {
            return $sessionData;
        }
        
        return $sessionData[$key] ?? $default;
    }
}
