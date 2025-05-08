<?php

namespace App\Http\Controllers;

use App\Models\OnBoardRequests;
use Illuminate\Http\Request;

class OnBoardRequestController extends Controller
{
    /**
     * Retrieve all onboard requests.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $requests = OnBoardRequests::all();
            return response()->json(['onboard_requests' => $requests], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch onboard requests: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the status of an onboard request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required',
            ]);

            $onBoardRequest = OnBoardRequests::findOrFail($id);
            $onBoardRequest->status = $request->status;
            $onBoardRequest->save();

            return response()->json(['message' => 'Status updated successfully', 'onboard_request' => $onBoardRequest], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed: ' . $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update status: ' . $e->getMessage()], 500);
        }
    }
}