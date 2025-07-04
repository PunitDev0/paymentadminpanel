<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiLogs extends Model
{
    protected $table = 'api_logs';
    
    protected $fillable = [
        'user_id',
        'api_name',
        'request_id',
        'reference_id',
        'request_payload',
        'response_data',
        'status',
        'error_message',
        'ip_address',
        'execution_time',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}