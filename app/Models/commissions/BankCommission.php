<?php

namespace App\Models\commissions;


use Illuminate\Database\Eloquent\Model;

/**
 * Class Transaction
 *
 * Represents a transaction entity in the recharge system.
 *
 * @property int $id
 * @property float $transaction_amount
 * @property float $commission
 * @property string $category
 * @property \Illuminate\Support\Carbon $updated_at
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $created_at
 */
class BankCommission extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    protected $table = 'bank_commission';

    
    protected $fillable = [
        'transaction_amount',
        'commission',
        'category',
        'user_id',
        'our_commission'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'transaction_amount' => 'float',
        'commission' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the transaction.
     */
 
}