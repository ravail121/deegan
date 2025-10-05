<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealOrderDetail extends Model
{
    use HasFactory;

        protected $table = 'rs_meal_order_details_temp';
    protected $primaryKey = 'detailID';
    public $timestamps = false;

    protected $fillable = [
        'orderID',
        'mealType',
        'mealID',
        'itemName',
        'quantity',
        'costPrice',
        'discount',
        'orderTo',
        'printOrderToIP',
        'status',
        'printStatus',
        'addedBy',
        'updatedBy',
        'PaidStatus',
        'packageID',
        'packageName',
        'notes',
        'coumptionCostPrice',
        'prepareTime',
        'prepareStatus',
        'userStarted',
        'startedTime',
        'readyTime',
        'foodCostPrice',
        'addedDate',
        'updatedDate'
    ];

    protected $casts = [
        'quantity' => 'string',
        'costPrice' => 'string',
        'discount' => 'string',
        'packageID' => 'integer',
        'coumptionCostPrice' => 'decimal:2',
        'prepareTime' => 'string',
        'startedTime' => 'datetime',
        'readyTime' => 'datetime',
        'foodCostPrice' => 'decimal:2',
        'addedDate' => 'datetime',
        'updatedDate' => 'datetime'
    ];

    /**
     * Get the order that owns this detail.
     */
    public function order()
    {
        return $this->belongsTo(MealOrder::class, 'orderID', 'orderID');
    }

    /**
     * Get the meal item for this detail.
     */
    public function mealItem()
    {
        return $this->belongsTo(MealItem::class, 'mealID', 'itemID');
    }

    /**
     * Get the meal package for this detail.
     */
    public function mealPackage()
    {
        return $this->belongsTo(MealPackage::class, 'packageID', 'packageID');
    }

    /**
     * Calculate line total (quantity * costPrice - discount).
     */
    public function getLineTotalAttribute()
    {
        return ($this->quantity * $this->costPrice) - $this->discount;
    }

    /**
     * Get effective prepare time.
     */
    public function getEffectivePrepareTimeAttribute()
    {
        return $this->prepareTime ?? $this->mealItem->getEffectivePrepareTime() ?? 15;
    }

    /**
     * Scope to get details by order.
     */
    public function scopeByOrder($query, $orderID)
    {
        return $query->where('orderID', $orderID);
    }

    /**
     * Scope to get details by package.
     */
    public function scopeByPackage($query, $packageID)
    {
        return $query->where('packageID', $packageID);
    }

    /**
     * Scope to get details by meal item.
     */
    public function scopeByMealItem($query, $mealID)
    {
        return $query->where('mealID', $mealID);
    }
}
