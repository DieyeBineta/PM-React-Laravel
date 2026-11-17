<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->isManager() && !$request->user()->isLeadDeveloppeur()) {
            return response()->json([
                'message' => 'Accès refusé à la liste des utilisateurs.',
                'statut' => 403,
            ], 403);
        }

        $usersQuery = User::with('role');
        if ($request->user()->isManager()) {
            $usersQuery->with('projets')
                ->where('role_id', '!=', Role::where('titre', 'Manager')->first()->id);
        } else {
            $usersQuery->with('projets')
                ->whereHas('role', fn ($query) => $query->where('titre', 'Developpeur'))
                ->where('statut', 'Actif');
        }
        $users = $usersQuery->get();

        return response()->json([
            'data' => $users,
            'message' => 'Utilisateurs récupérés avec succès',
            'statut' => 200,
        ], 200);
    }

    public function show(User $user)
    {
        return response()->json([
            'data' => $user->load(['role', 'projets']),
            'message' => 'Utilisateur récupéré avec succès',
            'statut' => 200,
        ], 200);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seul le manager peut créer un utilisateur.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|confirmed|min:8',
            'role_id' => 'required|exists:roles,id',
            'projet_ids' => 'nullable|array',
            'projet_ids.*' => 'exists:projets,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        if ($role->titre === 'Manager') {
            return response()->json([
                'message' => 'Le rôle Manager ne peut pas être attribué.',
                'statut' => 403,
            ], 403);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'statut' => 'Actif',
            'password' => Hash::make($request->password),
            'force_password_change' => true,
            'password_changed_at' => null,
        ]);

        // Associer les projets à l'utilisateur si des IDs de projets sont fournis
        if ($request->filled('projet_ids')) {
            $user->projets()->sync($request->projet_ids);
        }

        return response()->json([
            'data' => $user->load(['role', 'projets']),
            'message' => 'Utilisateur créé avec succès',
            'statut' => 201,
        ], 201);
    }

    // Bascule le statut d'un utilisateur
    public function toggleStatus(Request $request, User $user)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Autorisation refusée',
                'statut' => 403,
            ], 403);
        }

        if ($user->isManager()) {
            return response()->json([
                'message' => 'Le statut du manager ne peut pas être modifié via cette route.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'statut' => 'required|in:Actif,Desactivé',
        ]);

        $user->update([
            'statut' => $request->statut,
        ]);

        return response()->json([
            'data' => $user,
            'message' => 'Statut utilisateur mis à jour',
            'statut' => 200,
        ], 200);
    }

    public function update(Request $request, User $user)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seul le manager peut modifier un utilisateur.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => 'required|exists:roles,id',
            'projet_ids' => 'sometimes|nullable|array',
            'projet_ids.*' => 'exists:projets,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        if ($role->titre === 'Manager') {
            return response()->json([
                'message' => 'Le rôle Manager ne peut pas être attribué.',
                'statut' => 403,
            ], 403);
        }

        if (
            Projet::where('lead_developpeur_id', $user->id)->exists()
            && $role->titre !== 'Lead_Developpeur'
        ) {
            return response()->json([
                'message' => 'Un lead développeur responsable d’un projet ne peut pas perdre ce rôle.',
                'statut' => 422,
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ]);

        if ($request->has('projet_ids')) {
            $user->projets()->sync($request->input('projet_ids') ?? []);
        }

        return response()->json([
            'data' => $user->load(['role', 'projets']),
            'message' => 'Utilisateur mis à jour avec succès',
            'statut' => 200,
        ], 200);
    }

    public function desactiver(Request $request, User $user)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seul le manager peut désactiver un utilisateur.',
                'statut' => 403,
            ], 403);
        }

        if ($user->isManager()) {
            return response()->json([
                'message' => 'Le manager ne peut pas être désactivé.',
                'statut' => 403,
            ], 403);
        }

        $user->update(['statut' => 'Desactivé']);

        return response()->json([
            'data' => $user,
            'message' => 'Utilisateur désactivé avec succès',
            'statut' => 200,
        ], 200);
    }

    public function activer(Request $request, User $user)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seul le manager peut activer un utilisateur.',
                'statut' => 403,
            ], 403);
        }

        if ($user->isManager()) {
            return response()->json([
                'message' => 'Le manager ne peut pas être activé.',
                'statut' => 403,
            ], 403);
        }

        $user->update(['statut' => 'Actif']);

        return response()->json([
            'data' => $user,
            'message' => 'Utilisateur activé avec succès',
            'statut' => 200,
        ], 200);
    }
}
