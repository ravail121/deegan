<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FnClientActivity extends Model
{
    use HasFactory;

    protected $table = 'fn_client_activity';
    protected $primaryKey = 'acvtyID';
    public $timestamps = false;

    protected $fillable = [
        'acvtyType',
        'clientID',
        'transRef',
        'amountIN',
        'amountOut',
        'vat',
        'financeYr',
        'addedBy',
        'addedDate'
    ];

    protected $casts = [
        'amountIN' => 'float',
        'amountOut' => 'float',
        'vat' => 'string',
        'addedDate' => 'datetime'
    ];

    /**
     * Get the meal order for this activity.
     */
    public function mealOrder()
    {
        return $this->belongsTo(MealOrder::class, 'transRef', 'orderID');
    }

    /**
     * Scope to get activities by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('acvtyType', $type);
    }

    /**
     * Scope to get activities by client.
     */
    public function scopeByClient($query, $clientID)
    {
        return $query->where('clientID', $clientID);
    }

    /**
     * Scope to get activities by financial year.
     */
    public function scopeByFinancialYear($query, $financeYr)
    {
        return $query->where('financeYr', $financeYr);
    }

    /**
     * Scope to get activities by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('activityDate', [$startDate, $endDate]);
    }

    /**
     * Get net amount (amountIN - amountOUT).
     */
    public function getNetAmountAttribute()
    {
        return $this->amountIN - $this->amountOUT;
    }

    /**
     * Get total amount with VAT.
     */
    public function getTotalWithVATAttribute()
    {
        return $this->getNetAmountAttribute() + $this->vat;
    }

    /**
     * Get activity type display name.
     */
    public function getTypeDisplayAttribute()
    {
        $types = [
            'restaurant' => 'Restaurant Order',
            'payment' => 'Payment',
            'refund' => 'Refund',
            'adjustment' => 'Adjustment'
        ];

        return $types[$this->acvtyType] ?? ucfirst($this->acvtyType);
    }
}
