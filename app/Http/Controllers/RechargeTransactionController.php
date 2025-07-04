<?php

namespace App\Http\Controllers;

use App\Models\Recharge_Transaction;
use Illuminate\Http\Request;

class RechargeTransactionController extends Controller
{
    /**
     * Fetch all recharge transactions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function rechargetransaction()
    {
        $data = Recharge_Transaction::all();
        return response()->json(['data' => $data]);
    }
}