<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCommission extends Model
{
    protected $fillable = [
        'user_id',
        'commission_type',
        'commission_id',
        'user_commission',
    ];

    /**
     * Get the user that owns this commission.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}