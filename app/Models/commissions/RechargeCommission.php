<?php

namespace App\Models\commissions;


use Illuminate\Database\Eloquent\Model;

/**
 * Class Operator
 *
 * Represents an operator entity in the recharge system.
 *
 * @property int $id
 * @property string $operator_id
 * @property string $operator_name
 * @property float $server_1_commission
 * @property float $our_commission
 * @property string $category
 * @property \Illuminate\Support\Carbon $updated_at
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $created_at
 */
class RechargeCommission extends Model
{
    protected $table = 'recharge_commission';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'operator_id',
        'operator_name',
        'server_1_commission',
        'our_commission',
        'category',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'server_1_commission' => 'float',
        'our_commission' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}