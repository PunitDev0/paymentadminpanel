<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BalanceCheck extends Controller
{
    public function balanceCheck()
    {
        try {
            $response = Http::get('https://banking.peunique.com/api/balanceCheck');

            if ($response->successful()) {
                return response()->json([
                    'status' => true,
                    'data' => $response->json(),
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to fetch balance.',
                    'error' => $response->body(),
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
