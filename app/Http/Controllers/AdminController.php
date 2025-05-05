<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\OperatorList;
use App\Models\Recharge_Transaction;
use App\Models\RechargeCommission;
use App\Models\UtilityCommission;
use App\Models\CMSCommission;
use App\Models\GasFastagCommission;
use Illuminate\Support\Facades\Http;
use App\Models\BankCommission;
use App\Http\Controllers\Jwt;
use Illuminate\Http\Request;

class adminController extends Controller
{
    public function dashboard(){
    
        return Inertia::render('Admin/Dashboard/dashboard');

    }

    public function recharge(){
        return Inertia::render('Admin/RechargeDashboard');
    
    }

    public function commission(){
        return Inertia::render('Admin/commision');
    }
   
    public function operatorlistfetch(){
        $data=OperatorList::all();
        return response()->json(['data'=>$data]);
    }
    
   
    public function rechargetransaction(){
        $data=Recharge_Transaction::all();
        return response()->json(['data'=>$data]);
    }

    public function rechargecommission() {
        $commissions = RechargeCommission::all();
    
        \Log::info('Recharge Commission JSON Response: ', ['data' => $commissions]);
        return response()->json(['data' => $commissions]);
    }

    public function updateRechargeCommission(Request $request, $id)
    {
        $validatedData = $request->validate([
            'server_1_commission' => 'nullable|numeric',
            'server_2_commission' => 'nullable|numeric',
        ]);
    
        $commission = RechargeCommission::where('operator_id', $id)->first();
    
        if (!$commission) {
            return response()->json(['message' => 'Commission record not found'], 404);
        }
    
        $updatedFields = [];
    
        if ($request->has('server_1_commission') && $request->server_1_commission !== $commission->server_1_commission) {
            $updatedFields['server_1_commission'] = $request->server_1_commission;
        }
    
        if ($request->has('server_2_commission') && $request->server_2_commission !== $commission->server_2_commission) {
            $updatedFields['server_2_commission'] = $request->server_2_commission;
        }
    
        if (empty($updatedFields)) {
            return response()->json(['message' => 'No changes detected'], 400);
        }
    
        $updatedFields['updated_at'] = now();
        $commission->update($updatedFields);
    
        return response()->json(['message' => 'Commission updated successfully']);
    }
   
    public function fetchUtilityCommission(){
        $data=UtilityCommission::all();
        return response()->json(['data'=>$data]);
    }

    public function fetchGasfastagCommission(){
        $data=GasFastagCommission::all();
        return response()->json(['data'=>$data]);
    }


    public function updateUtilityCommission(Request $request, $id)
    {
        $validatedData = $request->validate([
            'commission' => 'nullable|numeric',
       
        ]);
    
        $commission = UtilityCommission::where('operator_id', $id)->first();
    
        if (!$commission) {
            return response()->json(['message' => 'Commission record not found'], 404);
        }
    
        $updatedFields = [];
    
        if ($request->has('commission') && $request->commission !== $commission->commission) {
            $updatedFields['commission'] = $request->commission;
        }
    
    
        if (empty($updatedFields)) {
            return response()->json(['message' => 'No changes detected'], 400);
        }
    
        $updatedFields['updated_at'] = now();
        $commission->update($updatedFields);
    
        return response()->json(['message' => 'Commission updated successfully']);
    }
    public function updateGasfastagCommission(Request $request, $id)
    {
        $validatedData = $request->validate([
            'commission' => 'nullable|numeric',
       
        ]);
    
        $commission = GasFastagCommission::where('id', $id)->first();
    
        if (!$commission) {
            return response()->json(['message' => 'Commission record not found'], 404);
        }
    
        $updatedFields = [];
    
        if ($request->has('commission') && $request->commission !== $commission->commission) {
            $updatedFields['commission'] = $request->commission;
        }
    
    
        if (empty($updatedFields)) {
            return response()->json(['message' => 'No changes detected'], 400);
        }
    
        $updatedFields['updated_at'] = now();
        $commission->update($updatedFields);
    
        return response()->json(['message' => 'Commission updated successfully']);
    }
    
    public function updateCmsCommission(Request $request, $id)
    {
        $validatedData = $request->validate([
            'Commission' => 'nullable|numeric',
        ]);

        $Commission = CMSCommission::where('Agent_ID', $id)->first();

        if (!$Commission) { // Fixed: Use $Commission (uppercase 'C') consistently
            return response()->json(['message' => 'Commission record not found'], 404);
        }

        $updatedFields = [];

        if ($request->has('Commission') && $request->Commission !== $Commission->Commission) {
            $updatedFields['Commission'] = $request->Commission;
        }

        if (empty($updatedFields)) {
            return response()->json(['message' => 'No changes detected'], 400);
        }

        $updatedFields['updated_at'] = now();
        $Commission->update($updatedFields);

        return response()->json(['message' => 'Commission updated successfully']);
    }

    // Assuming this is your fetch method, included for completeness
    public function fetchCmsCommission()
    {
        $data = CMSCommission::all();
        return response()->json(['data' => $data]);
    }

    // Fetch DMT Bank 1 Commissions
    public function fetchBank1Commission()
    {
        $data = BankCommission::where('category', 'dmt_bank_1')->get();
        return response()->json(['data' => $data]);
    }

    // Fetch DMT Bank 2 Commissions
    public function fetchBank2Commission()
    {
        $data = BankCommission::where('category', 'dmt_bank_2')->get();
        return response()->json(['data' => $data]);
    }

    // Update DMT Bank 1 or Bank 2 Commission (shared method)
    public function updateBankCommission(Request $request, $id)
    {
        $validatedData = $request->validate([
            'commission' => 'nullable|numeric',
        ]);

        $commission = BankCommission::find($id);

        if (!$commission) {
            return response()->json(['message' => 'Commission record not found'], 404);
        }

        $updatedFields = [];

        if ($request->has('commission') && $request->commission !== $commission->commission) {
            $updatedFields['commission'] = $request->commission;
        }

        if (empty($updatedFields)) {
            return response()->json(['message' => 'No changes detected'], 400);
        }

        $updatedFields['updated_at'] = now();
        $commission->update($updatedFields);

        return response()->json(['message' => 'Commission updated successfully']);
    }

    private $partnerId = 'PS005962';
    private $secretKey = 'UFMwMDU5NjJjYzE5Y2JlYWY1OGRiZjE2ZGI3NThhN2FjNDFiNTI3YTE3NDA2NDkxMzM=';
 
    private function generateJwtToken($requestId)
    {
        $timestamp = time();
        $payload = [
            'timestamp' => $timestamp,
            'partnerId' => $this->partnerId,
            'reqid' => $requestId
        ];
 
        return Jwt::encode($payload, $this->secretKey, 'HS256');
    }
 

    public function getWalletBalance()
    {
        $requestId = time() . rand(1000, 9999);
        $jwtToken = $this->generateJwtToken($requestId);
       
        try {
            $response = Http::withHeaders([
                'Token' => $jwtToken,
                'User-Agent' => $this->partnerId,
                'accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://api.paysprint.in/api/v1/service/balance/balance/cashbalance');
           
            return response()->json([
                'success' => true,
                'balance' => $response->json('cdwallet') ?? 0,
                'message' => 'Wallet balance retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'balance' => null,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getCreditBalance()
    {
        $requestId = time() . rand(1000, 9999);
        $jwtToken = $this->generateJwtToken($requestId);
       
        try {
            $response = Http::withHeaders([
                'Token' => $jwtToken,
                'Authorisedkey' => 'Y2RkZTc2ZmNjODgxODljMjkyN2ViOTlhM2FiZmYyM2I=',
                'User-Agent' => $this->partnerId,
                'accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://sit.paysprint.in/service-api/api/v1/service/balance/balance/mainbalance');
           
            return response()->json([
                'success' => true,
                'balance' => $response->json('data.balance') ?? 0,
                'message' => 'Credit balance retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'balance' => null,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
