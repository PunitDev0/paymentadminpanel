<?php

namespace App\Http\Controllers;

use App\Models\ApiLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApiLogsController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Validate query parameters
            $validator = Validator::make($request->all(), [
                'per_page' => 'integer|min:1|max:100',
                'page' => 'integer|min:1',
                'api_name' => 'string|nullable|max:255',
                'status' => 'string|nullable|in:success,failed,pending',
                'id' => 'integer|nullable|min:1',
                'user_id' => 'integer|nullable|min:1',
                'search' => 'string|nullable|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $perPage = $request->input('per_page', 10);
            $apiName = $request->input('api_name');
            $status = $request->input('status');
            $id = $request->input('id');
            $userId = $request->input('user_id');
            $search = $request->input('search');

            $query = ApiLogs::query();

            // Apply filters
            if ($id) {
                $query->where('id', $id);
            }
            if ($userId) {
                $query->where('user_id', $userId);
            }
            if ($apiName) {
                $query->where('api_name', 'like', '%' . $apiName . '%');
            }
            if ($status) {
                $query->where('status', $status);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('request_id', 'like', '%' . $search . '%')
                      ->orWhere('reference_id', 'like', '%' . $search . '%');
                });
            }

            // Paginate results
            $records = $query->paginate($perPage);

            $data = $records->map(function ($record) {
                return [
                    'id' => $record->id,
                    'user_id' => $record->user_id ?? '-',
                    'api_name' => $record->api_name ?? '-',
                    'request_id' => $record->request_id ?? '-',
                    'reference_id' => $record->reference_id ?? '-',
                    'request_payload' => $record->request_payload ? json_encode($record->request_payload) : '-',
                    'response_data' => $record->response_data ? json_encode($record->response_data) : '-',
                    'status' => $record->status ?? '-',
                    'error_message' => $record->error_message ?? '-',
                    'ip_address' => $record->ip_address ?? '-',
                    'execution_time' => $record->execution_time ?? '-',
                    'created_at' => $record->created_at ? $record->created_at->toDateTimeString() : '-',
                    'updated_at' => $record->updated_at ? $record->updated_at->toDateTimeString() : '-',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching API logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching records'
            ], 500);
        }
    }
}