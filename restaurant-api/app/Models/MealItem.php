<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MealItem extends Model
{
    use HasFactory;

    protected $table = 'rs_meal_items';
    protected $primaryKey = 'itemID';

    protected $fillable = [
        'itemName',
        'packageID',
        'photo80',
        'photo320',
        'costPrice',
        'orderTo',
        'startFrom',
        'endTo',
        'status',
        'prepareTime',
        'description',
        'ingredients',
        'isVegetarian',
        'isSpicy',
    ];

    protected $casts = [
        'costPrice' => 'decimal:2',
        'prepareTime' => 'integer',
        'isVegetarian' => 'boolean',
        'isSpicy' => 'boolean',
    ];

    /**
     * Get the package that owns this meal item.
     */
    public function package()
    {
        return $this->belongsTo(MealPackage::class, 'packageID', 'packageID');
    }

    /**
     * Get the sizes for this meal item.
     */
    public function sizes()
    {
        return $this->hasMany(MealItemSize::class, 'itemID', 'itemID');
    }

    /**
     * Get only active sizes for this meal item.
     */
    public function activeSizes()
    {
        return $this->hasMany(MealItemSize::class, 'itemID', 'itemID')
                    ->where('status', 'active')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Get the addons for this meal item.
     */
    public function addons()
    {
        return $this->belongsToMany(Addon::class, 'rs_meal_item_addons', 'itemID', 'addonID');
    }

    /**
     * Get only active addons for this meal item.
     */
    public function activeAddons()
    {
        return $this->belongsToMany(Addon::class, 'rs_meal_item_addons', 'itemID', 'addonID')
                    ->where('rs_addons.status', 'active');
    }

    /**
     * Scope to get only active items.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter by availability time.
     */
    public function scopeAvailableNow($query)
    {
        $currentTime = Carbon::now()->format('H:i:s');
        
        return $query->where(function ($q) use ($currentTime) {
            $q->whereNull('startFrom')
              ->whereNull('endTo')
              ->orWhere(function ($q2) use ($currentTime) {
                  $q2->where('startFrom', '<=', $currentTime)
                     ->where('endTo', '>=', $currentTime);
              });
        });
    }

    /**
     * Scope to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('itemID', 'asc');
    }

    /**
     * Check if item is available at current time.
     */
    public function isAvailableNow()
    {
        if (!$this->startFrom && !$this->endTo) {
            return true;
        }

        $currentTime = Carbon::now()->format('H:i:s');
        return $currentTime >= $this->startFrom && $currentTime <= $this->endTo;
    }

    /**
     * Get the effective prepare time (item's or package's).
     */
    public function getEffectivePrepareTime()
    {
        return $this->prepareTime ?? $this->package->prepareTime ?? 15;
    }
}
