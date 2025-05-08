<?php

namespace App\Models\commissions;


use Illuminate\Database\Eloquent\Model;

/**
 * Class OperatorCommission
 *
 * Represents an operator commission configuration in the recharge system.
 *
 * @property int $id
 * @property string $operator_name
 * @property string $operator_id
 * @property string $type
 * @property float $commission
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class CableCommission extends Model
{
    protected $table = 'cable_commission';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'operator_name',
        'operator_id',
        'type',
        'commission',
        'our_commission',

    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'commission' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the operator associated with this commission.
     */
   
}