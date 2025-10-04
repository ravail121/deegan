<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MealOrder extends Model
{
    use HasFactory;

    protected $table = 'rs_meal_order';
    protected $primaryKey = 'orderID';
    public $timestamps = false;

    protected $fillable = [
        'whouseID',
        'orderFrom',
        'orderType',
        'reference',
        'book',
        'orderAmount',
        'paidAmount',
        'financeYr',
        'status',
        'vatvalue',
        'vatpaid',
        'vatPercents',
        'vatStatus',
        'targetPrinterIP',
        'printStatus',
        'userLetterHead',
        'parentOrderID',
        'splitMethod',
        'splitTo',
        'autoPrintCustomerBill',
        'posLogoPath',
        'isFreeFood',
        'freeFoodType',
        'guestMealType',
        'servedBy',
        'checkInID',
        'checkDetID',
        'addedBy',
        'updatedBy',
        'orderDisplayScreen',
        'reason',
        'reasonForDiscount',
        'addedDate',
        'updatedDate'
    ];

    protected $casts = [
        'orderAmount' => 'decimal:2',
        'paidAmount' => 'decimal:2',
        'vatPercents' => 'string',
        'vatvalue' => 'string',
        'vatpaid' => 'string',
        'parentOrderID' => 'integer',
        'checkInID' => 'integer',
        'checkDetID' => 'integer',
        'addedDate' => 'datetime',
        'updatedDate' => 'datetime'
    ];

    /**
     * Get the order details for this order.
     */
    public function orderDetails()
    {
        return $this->hasMany(MealOrderDetail::class, 'orderID', 'orderID');
    }

    /**
     * Get the invoice for this order.
     */
    public function invoice()
    {
        return $this->hasOne(SysInvoice::class, 'reference', 'orderID');
    }

    /**
     * Get the client activity for this order.
     */
    public function clientActivity()
    {
        return $this->hasOne(FnClientActivity::class, 'transRef', 'orderID');
    }

    /**
     * Scope to get orders by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get orders by warehouse.
     */
    public function scopeByWarehouse($query, $whouseID)
    {
        return $query->where('whouseID', $whouseID);
    }

    /**
     * Scope to get orders by financial year.
     */
    public function scopeByFinancialYear($query, $financeYr)
    {
        return $query->where('financeYr', $financeYr);
    }

    /**
     * Scope to get orders by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('orderDate', [$startDate, $endDate]);
    }

    /**
     * Calculate total with VAT.
     */
    public function getTotalWithVATAttribute()
    {
        return $this->orderAmount + $this->vatvalue;
    }

    /**
     * Get order status display name.
     */
    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'ordered' => 'Ordered',
            'preparing' => 'Preparing',
            'ready' => 'Ready',
            'served' => 'Served',
            'cancelled' => 'Cancelled',
            'completed' => 'Completed'
        ];

        return $statuses[$this->status] ?? ucfirst($this->status);
    }

    /**
     * Check if order is paid.
     */
    public function isPaid()
    {
        return $this->paidAmount >= $this->getTotalWithVATAttribute();
    }

    /**
     * Get remaining amount to pay.
     */
    public function getRemainingAmountAttribute()
    {
        return $this->getTotalWithVATAttribute() - $this->paidAmount;
    }
}
