<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    use HasFactory;

    protected $table = 'rs_addons';
    protected $primaryKey = 'addonID';

    protected $fillable = [
        'addonName',
        'description',
        'price',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * Get the meal items that have this addon.
     */
    public function mealItems()
    {
        return $this->belongsToMany(MealItem::class, 'rs_meal_item_addons', 'addonID', 'itemID');
    }

    /**
     * Scope to get only active addons.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query;
    }
}
