<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * Apply middleware to restrict access to admins only.
     */
    // public function __construct()
    // {
    //     $this->middleware(function ($request, $next) {
    //         if ($request->user() && $request->user()->role === 'admin') {
    //             return $next($request);
    //         }
    //         return response()->json(['error' => 'Unauthorized: Admin access required'], 403);
    //     });
    // }

    /**
     * Fetch all users (for admin to select from).
     */
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'role')
                     ->where('status', 1)
                     ->get();
        return response()->json(['users' => $users]);
    }

    /**
     * Fetch permissions for a specific user.
     */
    public function index($userId)
    {
        $user = User::findOrFail($userId);

        // Fetch all services with their categories
        $services = Service::with('category')->get();

        // Fetch the user's accessible services
        $userServices = $user->services()->pluck('user_service_access.service_id')->toArray();


        // Prepare response: all services with a flag indicating if the user has access
        $permissions = $services->map(function ($service) use ($userServices) {
            return [
                'service_id' => $service->service_id,
                'service_name' => $service->service_name,
                'category_name' => $service->category->category_name,
                'description' => $service->description,
                'has_access' => in_array($service->service_id, $userServices),
            ];
        });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update permissions for a specific user.
     */
    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
    
        $permissions = $request->input('permissions'); // Array of { service_id, has_access }
    
        DB::beginTransaction();
    
        try {
            foreach ($permissions as $permission) {
                $serviceId = $permission['service_id'];
                $hasAccess = $permission['has_access'];
    
                if ($hasAccess) {
                    if (!$user->services()->where('user_service_access.service_id', $serviceId)->exists()) {
                        $user->services()->attach($serviceId, ['granted_at' => now()]);
                    }
                } else {
                    if ($user->services()->where('user_service_access.service_id', $serviceId)->exists()) {
                        $user->services()->detach($serviceId);
                    }
                }
            }
    
            DB::commit();
            return response()->json(['message' => 'Permissions updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update permissions',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}