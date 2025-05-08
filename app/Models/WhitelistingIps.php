<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhitelistingIps extends Model
{
    use HasFactory;

    protected $table = 'whitelisted_ips';

    protected $fillable = [
        'ip_address',
        'user_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}