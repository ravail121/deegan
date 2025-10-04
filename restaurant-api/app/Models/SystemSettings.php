<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSettings extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sys_settings';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'recID';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'value',
        'status',
        'settingFor',
        'addedBy',
        'updatedBy'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'string',
    ];

    /**
     * Get the current financial year setting
     *
     * @return SystemSettings|null
     */
    public static function getCurrentFinancialYear()
    {
        return static::where('type', 'financeYr')
                    ->where('status', 'open')
                    ->first();
    }

    /**
     * Get the VAT percentage setting
     *
     * @return SystemSettings|null
     */
    public static function getVATPercentage()
    {
        return static::where('type', 'valvalue')
                    ->where('status', 'active')
                    ->first();
    }

    /**
     * Get all active system settings
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAllActiveSettings()
    {
        return static::where('status', 'active')
                    ->orWhere('status', 'open')
                    ->get();
    }

    /**
     * Get setting by type and status
     *
     * @param string $type
     * @param string $status
     * @return SystemSettings|null
     */
    public static function getSettingByTypeAndStatus($type, $status)
    {
        return static::where('type', $type)
                    ->where('status', $status)
                    ->first();
    }
}
