<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;
 
    protected $table = 'bbps_fetch_bill';
    

    protected $fillable = [
        'ca_number',
        'biller_id',
        'biller_name',
        'consumer_name',
        'bill_amount',
        'bill_number',
        'bill_period',
        'bill_date',
        'due_date',
        'division',
        'lt_ht',
        'request_id',
        'raw_response',
    ];

    protected $casts = [
        'bill_date' => 'date',
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}