<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recharge_Transaction extends Model
{
    protected $table = 'recharge_transactions'; 

    protected $fillable = ['id','canumber','operator', 'amount', 'referenceid','status','response_code','ackno','message', 'updated_at','commission_amount', 'created_at']; 

    public $timestamps = true; 
}

