<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SysInvoice extends Model
{
    use HasFactory;

    protected $table = 'sys_invoice';
    protected $primaryKey = 'invocID';
    public $timestamps = false;

    protected $fillable = [
        'whouseID',
        'invceType',
        'reference',
        'payeeID',
        'commissionerID',
        'commissionAmount',
        'commissionStatus',
        'paidStatus',
        'remarks',
        'financeYr',
        'status',
        'addedBy',
        'updatedBy',
        'addedDate',
        'updatedDate'
    ];

    protected $casts = [
        'commissionerID' => 'integer',
        'commissionAmount' => 'decimal:2',
        'addedDate' => 'datetime',
        'updatedDate' => 'datetime'
    ];

    /**
     * Get the invoice details for this invoice.
     */
    public function invoiceDetails()
    {
        return $this->hasMany(SysInvoiceDetail::class, 'invocID', 'invocID');
    }

    /**
     * Get the meal order for this invoice.
     */
    public function mealOrder()
    {
        return $this->belongsTo(MealOrder::class, 'reference', 'orderID');
    }

    /**
     * Scope to get invoices by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('invceType', $type);
    }

    /**
     * Scope to get invoices by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get invoices by warehouse.
     */
    public function scopeByWarehouse($query, $whouseID)
    {
        return $query->where('whouseID', $whouseID);
    }

    /**
     * Scope to get invoices by financial year.
     */
    public function scopeByFinancialYear($query, $financeYr)
    {
        return $query->where('financeYr', $financeYr);
    }

    /**
     * Check if invoice is paid.
     */
    public function isPaid()
    {
        return $this->balance <= 0;
    }

    /**
     * Get invoice status display name.
     */
    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'active' => 'Active',
            'paid' => 'Paid',
            'cancelled' => 'Cancelled',
            'overdue' => 'Overdue'
        ];

        return $statuses[$this->status] ?? ucfirst($this->status);
    }
}
