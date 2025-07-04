<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // Register a new user
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|string|max:255',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    // Get all users
    public function userLists()
    {
        $users = User::all();
        return response()->json(['users' => $users], 200);
    }

    public function updateUser(Request $request, $id)
    {
        // Find the user by ID
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    
        // Validate the update request
        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'role'     => 'sometimes|max:255',
            'status'   => 'sometimes|in:0,1', // Validate that the status is either 0 or 1
            'password' => 'sometimes|min:8', // Ensure password confirmation is provided
        ]);
    
        // Update user fields if they are provided in the request
        if ($request->has('name')) {
            $user->name = $request->name;
        }
    
        if ($request->has('email')) {
            $user->email = $request->email;
        }
    
        if ($request->has('role')) {
            $user->role = $request->role;
        }
    
        if ($request->has('status')) {
            $user->status = $request->status;
        }
    
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
    
        // Save updated user details
        $user->save();
    
        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user,
        ], 200);
    }
    


    // Delete a user
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
