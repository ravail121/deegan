<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealNote extends Model
{
    protected $table = 'rs_meal_notes';
    protected $primaryKey = 'recID';
    public $timestamps = false;

    protected $fillable = [
        'mealID',
        'notes'
    ];

    protected $casts = [
        'recID' => 'integer',
        'mealID' => 'integer'
    ];
}

