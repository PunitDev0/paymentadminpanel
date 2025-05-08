<?php

namespace App\Http\Controllers;

use App\Models\WhitelistingIps;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class WhitelistingIpsController extends Controller
{
    public function index()
    {
        $whitelistedIps = WhitelistingIps::all();

        return Inertia::render('Admin/IpWhitelist', [
            'whitelistedIps' => $whitelistedIps
        ]);
    }

    public function toggleStatus(Request $request, WhitelistingIps $whitelistingIp): JsonResponse
    {
        $whitelistingIp->update(['status' => !$whitelistingIp->status]);
        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $whitelistingIp->status,
        ]);
    }
}