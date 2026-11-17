<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

class ProjetController extends Controller
{
    public function index(Request $request)
    {
        $query = Projet::with(['leadDeveloppeur', 'users', 'taches.user'])
            ->withCount('users')
            ->withMin('taches', 'date_debut')
            ->withMax('taches', 'date_fin');

        if ($request->user()->isLeadDeveloppeur()) {
            $query->where('lead_developpeur_id', $request->user()->id);
        } elseif ($request->user()->isDeveloppeur()) {
            $developerId = $request->user()->id;
            $query->where(function ($projectQuery) use ($developerId) {
                $projectQuery->whereHas('users', fn ($userQuery) =>
                    $userQuery->where('users.id', $developerId)
                )->orWhereHas('taches', fn ($taskQuery) =>
                    $taskQuery->where('user_id', $developerId)
                );
            });
        }

        $projets = $query->get();
        $projets->each(fn (Projet $projet) => $this->includeLeadInMembers($projet));

        return response()->json([
            'data' => $projets,
            'message' => 'Projets récupérés avec succès',
            'statut' => 200,
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seule le manager peut créer un projet.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lead_developpeur_id' => 'required|integer|exists:users,id',
            'developer_ids' => 'required|array|min:2|max:9',
            'developer_ids.*' => 'required|integer|distinct|exists:users,id',
        ]);

        $lead = User::findOrFail($request->lead_developpeur_id);
        if (!$lead->isLeadDeveloppeur() || $lead->statut !== 'Actif') {
            return response()->json([
                'message' => 'Le projet doit être lié à un lead développeur actif.',
                'statut' => 422,
            ], 422);
        } 

        $developers = User::whereIn('id', $request->developer_ids)->with('role')->get();
        if (
            $developers->count() !== count($request->developer_ids)
            || $developers->contains(fn (User $developer) =>
                !$developer->isDeveloppeur() || $developer->statut !== 'Actif'
            )
            || $developers->contains('id', $lead->id)
        ) {
            return response()->json([
                'message' => 'Les membres sélectionnés doivent être des développeurs actifs distincts du lead développeur.',
                'statut' => 422,
            ], 422);
        }

        $projet = DB::transaction(function () use ($request, $lead, $developers) {
            $project = Projet::create([
                'nom' => $request->nom,
                'description' => $request->description,
                'lead_developpeur_id' => $lead->id,
            ]);

            $project->users()->sync(array_merge([$lead->id], $developers->modelKeys()));
            return $project;
        });

        $projet->load(['leadDeveloppeur', 'users', 'taches.user'])
            ->loadCount('users')
            ->loadMin('taches', 'date_debut')
            ->loadMax('taches', 'date_fin');
        $this->includeLeadInMembers($projet);

        return response()->json([
            'data' => $projet,
            'message' => 'Projet créé avec succès',
            'statut' => 201,
        ], 201);
    }

    public function show(Request $request, Projet $projet)
    {
        $user = $request->user();
        $canView = $user->isManager()
            || ($user->isLeadDeveloppeur() && $projet->lead_developpeur_id === $user->id)
            || ($user->isDeveloppeur() && (
                $projet->users()->where('users.id', $user->id)->exists()
                || $projet->taches()->where('user_id', $user->id)->exists()
            ));

        if (!$canView) {
            return response()->json([
                'message' => 'Vous ne pouvez consulter que les projets auxquels vous participez.',
                'statut' => 403,
            ], 403);
        }

        $projet->load('leadDeveloppeur', 'users', 'taches.user')
            ->loadMin('taches', 'date_debut')
            ->loadMax('taches', 'date_fin');
        $this->includeLeadInMembers($projet);

        return response()->json([
            'data' => $projet,
            'message' => 'Projet récupéré avec succès',
            'statut' => 200,
        ], 200);
    }

    public function update(Request $request, Projet $projet)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'Seul le manager a le droit de modifier un projet',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lead_developpeur_id' => 'required|integer|exists:users,id',
        ]);

        $lead = User::findOrFail($request->lead_developpeur_id);
        if (!$lead->isLeadDeveloppeur() || $lead->statut !== 'Actif') {
            return response()->json([
                'message' => 'Le lead développeur doit être un utilisateur actif avec le rôle approprié.',
                'statut' => 422,
            ], 422);
        }

        DB::transaction(function () use ($request, $projet, $lead) {
            $projet->update([
                'nom' => $request->nom,
                'description' => $request->description,
                'lead_developpeur_id' => $lead->id,
            ]);

            $members = $projet->users()
                ->with('role')
                ->get()
                ->reject(fn (User $member) => $member->isLeadDeveloppeur())
                ->modelKeys();
            $projet->users()->sync(array_unique([...$members, $lead->id]));
        });

        $projet->refresh();
        $projet->load(['leadDeveloppeur', 'users', 'taches.user'])
            ->loadCount('users')
            ->loadMin('taches', 'date_debut')
            ->loadMax('taches', 'date_fin');
        $this->includeLeadInMembers($projet);

        return response()->json([
            'data' => $projet,
            'message' => 'Projet mis à jour avec succès',
            'statut' => 200,
        ], 200);
    }

    public function destroy(Request $request, Projet $projet)
    {
        if (!$request->user()->isManager()) {
            return response()->json([
                'message' => 'La suppression d\'un projet est réservée au manager.',
                'statut' => 403,
            ], 403);
        }

        $projet->delete();

        return response()->json([
            'data' => $projet,
            'message' => 'Projet supprimé avec succès',
            'statut' => 200,
        ], 200);
    }

    private function includeLeadInMembers(Projet $projet): void
    {
        $members = $projet->users ?? new Collection();
        if ($projet->relationLoaded('taches')) {
            $members = $members->concat($projet->taches->pluck('user')->filter());
        }
        if ($projet->leadDeveloppeur && !$members->contains('id', $projet->leadDeveloppeur->id)) {
            $members->push($projet->leadDeveloppeur);
        }

        $members = $members->unique('id')->values();
        $projet->setRelation('users', $members);
        $projet->setAttribute('users_count', $members->count());
    }
}
