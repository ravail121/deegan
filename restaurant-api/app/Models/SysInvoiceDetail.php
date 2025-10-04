<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SysInvoiceDetail extends Model
{
    use HasFactory;

    protected $table = 'sys_invoice_details';
    protected $primaryKey = 'detailID';
    public $timestamps = false;

    protected $fillable = [
        'invocID',
        'serviceType',
        'reference',
        'orderID',
        'quantity',
        'price',
        'discount',
        'paidStatus',
        'status',
        'addedBy',
        'updatedBy',
        'addedDate',
        'updatedDate',
        'userGenerated',
        'dateGenerated',
        'whatoffered',
        'propertyprice'
    ];

    protected $casts = [
        'quantity' => 'string',
        'price' => 'string',
        'discount' => 'decimal:2',
        'propertyprice' => 'decimal:2',
        'addedDate' => 'datetime',
        'updatedDate' => 'datetime',
        'dateGenerated' => 'datetime'
    ];

    /**
     * Get the invoice that owns this detail.
     */
    public function invoice()
    {
        return $this->belongsTo(SysInvoice::class, 'invocID', 'invocID');
    }

    /**
     * Get the meal order for this detail.
     */
    public function mealOrder()
    {
        return $this->belongsTo(MealOrder::class, 'orderID', 'orderID');
    }

    /**
     * Calculate line total (quantity * price - discount).
     */
    public function getLineTotalAttribute()
    {
        return ($this->quantity * $this->price) - $this->discount;
    }

    /**
     * Scope to get details by invoice.
     */
    public function scopeByInvoice($query, $invocID)
    {
        return $query->where('invocID', $invocID);
    }

    /**
     * Scope to get details by service type.
     */
    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('serviceType', $serviceType);
    }

    /**
     * Scope to get details by order.
     */
    public function scopeByOrder($query, $orderID)
    {
        return $query->where('orderID', $orderID);
    }
}
