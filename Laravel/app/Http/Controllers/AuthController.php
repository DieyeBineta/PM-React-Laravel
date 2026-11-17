<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // $request->validate([
        //     'email' => 'required|email',
        //     'password' => 'required|string',
        // ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides',
                'status' => 401,
            ], 401);
        }

        if ($user->statut !== 'Actif') {
            return response()->json([
                'message' => 'Utilisateur désactivé',
                'status' => 403,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'must_change_password' => $user->force_password_change,
            'message' => 'Login successful',
            'status' => 200,
        ], 200);
    }

    public function register(Request $request)
    {
        // $request->validate([
        //     'name' => 'required|string|max:255',
        //     'email' => 'required|string|email|max:255|unique:users,email',
        //     'password' => 'required|string|confirmed|min:8',
        //     'role_id' => 'required|exists:roles,id',
        // ]);

        $role = Role::findOrFail($request->role_id);
        if ($role->titre === 'Manager') {
            return response()->json([
                'message' => 'Le rôle Manager ne peut pas être attribué via l’enregistrement public.',
                'status' => 403,
            ], 403);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'statut' => 'Actif',
            'password' => Hash::make($request->password),
            'force_password_change' => false,
            'password_changed_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Registration successful',
            'status' => 201,
        ], 201);
    }

    public function changePassword(Request $request)
    {
        // $request->validate([
        //     'current_password' => 'required|string',
        //     'password' => 'required|string|confirmed|min:8',
        // ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel invalide',
                'status' => 401,
            ], 401);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'force_password_change' => false,
            'password_changed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès',
            'status' => 200,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
            'status' => 200,
        ]);
    }
}
