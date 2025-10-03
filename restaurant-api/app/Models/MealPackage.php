<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPackage extends Model
{
    use HasFactory;

    protected $table = 'rs_meal_packages';
    protected $primaryKey = 'packageID';

    protected $fillable = [
        'packageName',
        'photo80',
        'photo320',
        'status',
        'prepareTime',
        'description',
    ];

    protected $casts = [
        'prepareTime' => 'integer',
    ];

    /**
     * Get the meal items for this package.
     */
    public function mealItems()
    {
        return $this->hasMany(MealItem::class, 'packageID', 'packageID');
    }

    /**
     * Get only active meal items for this package.
     */
    public function activeMealItems()
    {
        return $this->hasMany(MealItem::class, 'packageID', 'packageID')
                    ->where('status', 'active')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Scope to get only active packages.
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
        return $query->orderBy('packageID', 'asc');
    }
}
