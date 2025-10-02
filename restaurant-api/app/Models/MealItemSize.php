<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealItemSize extends Model
{
    use HasFactory;

    protected $table = 'rs_meal_item_sizes';
    protected $primaryKey = 'sizeID';

    protected $fillable = [
        'itemID',
        'sizeName',
        'price',
        'status',
        'displayOrder',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'displayOrder' => 'integer',
    ];

    /**
     * Get the meal item that owns this size.
     */
    public function mealItem()
    {
        return $this->belongsTo(MealItem::class, 'itemID', 'itemID');
    }

    /**
     * Scope to get only active sizes.
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
        return $query->orderBy('displayOrder');
    }
}
