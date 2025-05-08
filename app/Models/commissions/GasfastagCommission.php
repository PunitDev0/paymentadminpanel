<?php

namespace App\Models\commissions;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CommissionConfig
 *
 * Represents a commission configuration in the recharge system.
 *
 * @property int $id
 * @property string $operator_name
 * @property string $category
 * @property string $type
 * @property float $commission
 * @property \Illuminate\Support\Carbon $updated_at
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $created_at
 */
class GasfastagCommission extends Model
{
    protected $table = 'gas_fastag_commission';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'operator_name',
        'category',
        'type',
        'commission',
        'our_commission',
        'user_id',
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
     * Get the user associated with this commission configuration.
     */
  
}