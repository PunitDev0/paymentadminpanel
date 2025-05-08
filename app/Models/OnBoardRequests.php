<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnBoardRequests extends Model
{
    use HasFactory;
 

    protected $table = 'onboarding_forms';

    protected $fillable = [
        'full_name',
        'merchantcode',
        'mobile',
        'status',
        'email',
        'firm',
        'aadhaarFront',
        'aadhaarBack',
        'panCard',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}