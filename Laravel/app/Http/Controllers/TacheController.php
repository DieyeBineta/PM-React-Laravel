<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Models\Tache;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TacheController extends Controller
{
    public function index(Request $request)
    {
        $query = Tache::with(['projet', 'user']);
        if ($request->user()->isLeadDeveloppeur()) {
            $query->whereHas('projet', fn ($projectQuery) =>
                $projectQuery->where('lead_developpeur_id', $request->user()->id)
            );
        } elseif ($request->user()->isDeveloppeur()) {
            $developerId = $request->user()->id;
            $query->where(function ($taskQuery) use ($developerId) {
                $taskQuery->where('user_id', $developerId)
                    ->orWhereHas('projet.users', fn ($userQuery) =>
                        $userQuery->where('users.id', $developerId)
                    );
            });
        }
        $taches = $query->get();

        if ($request->user()->isDeveloppeur() || $request->user()->isLeadDeveloppeur()) {
            foreach ($taches as $tache) {
                $this->gererTaskStatut($tache);
            }
        }

        return response()->json([
            'data' => $taches,
            'message' => 'Tâches récupérées avec succès',
            'statut' => 200,
        ], 200);
    }

    protected function gererTaskStatut(Tache $tache): void
    {
        if ($tache->user_id && $tache->statut === 'Attribuée' && $tache->date_debut) {
            $deadline = $tache->date_debut->copy()->addDay();
            if (Carbon::now()->gt($deadline)) {
                $tache->user_id = null;
                $tache->statut = 'Disponible';
                $tache->save();
                $tache->unsetRelation('user')->load('user');
            }
        }
    }

    protected function libererTachesExpirees(int $developerId): void
    {
        $tasks = Tache::where('user_id', $developerId)
            ->where('statut', 'Attribuée')
            ->whereNotNull('date_debut')
            ->get();

        foreach ($tasks as $task) {
            $this->gererTaskStatut($task);
        }
    }

    public function store(Request $request)
    {
        if (!$request->user()->isLeadDeveloppeur()) {
            return response()->json([
                'message' => 'Seul le lead développeur peut créer des tâches.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'projet_id' => 'required|exists:projets,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $projet = Projet::findOrFail($request->projet_id);
        if ($request->user()->id !== $projet->lead_developpeur_id) {
            return response()->json([
                'message' => 'Seul le lead développeur du projet peut ajouter une tâche.',
                'statut' => 403,
            ], 403);
        }

        $assigneeId = $request->user_id;
        if ($assigneeId) {
            $assignee = User::findOrFail($assigneeId);
            if (!$assignee->isDeveloppeur() || $assignee->statut !== 'Actif') {
                return response()->json([
                    'message' => 'La tâche ne peut être assignée qu\'à un développeur.',
                    'statut' => 422,
                ], 422);
            }
            if (!$projet->users()->where('users.id', $assignee->id)->exists()) {
                return response()->json([
                    'message' => 'Le développeur doit être membre du projet pour recevoir cette tâche.',
                    'statut' => 422,
                ], 422);
            }

        }

        $tache = DB::transaction(function () use ($request, $assigneeId) {
            if ($assigneeId) {
                User::whereKey($assigneeId)->lockForUpdate()->firstOrFail();
                $this->libererTachesExpirees($assigneeId);
                $activeTasks = Tache::where('user_id', $assigneeId)
                    ->whereIn('statut', ['Attribuée', 'En cours'])
                    ->count();
                if ($activeTasks >= 3) {
                    return null;
                }
            }

            return Tache::create([
                'nom' => $request->nom,
                'description' => $request->description,
                'statut' => $assigneeId ? 'Attribuée' : 'Disponible',
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'projet_id' => $request->projet_id,
                'user_id' => $assigneeId,
            ]);
        });

        if (!$tache) {
            return response()->json([
                'message' => 'L\'utilisateur a déjà 3 tâches en cours ou attribuées.',
                'statut' => 400,
            ], 400);
        }
        $tache->load(['projet', 'user']);

        return response()->json([
            'data' => $tache,
            'message' => 'Tâche créée avec succès',
            'statut' => 201,
        ], 201);
    }

    public function show(Request $request, Tache $tache)
    {
        $user = $request->user();
        $canView = $user->isManager()
            || ($user->isLeadDeveloppeur() && $user->id === $tache->projet()->value('lead_developpeur_id'))
            || ($user->isDeveloppeur()
                && (
                    (int) $tache->user_id === (int) $user->id
                    || $tache->projet->users()->where('users.id', $user->id)->exists()
                ));
        if (!$canView) {
            return response()->json([
                'message' => 'Vous ne pouvez consulter que les tâches de vos projets.',
                'statut' => 403,
            ], 403);
        }

        if ($user->isLeadDeveloppeur() || $user->isDeveloppeur()) {
            $this->gererTaskStatut($tache);
        }
        // Charger les relations projet et user pour la tâche
        $tache->load(['projet', 'user']);

        return response()->json([
            'data' => $tache,
            'message' => 'Tâche récupérée avec succès',
            'statut' => 200,
        ], 200);
    }

    public function update(Request $request, Tache $tache)
    {
        if (
            !$request->user()->isLeadDeveloppeur()
            || $request->user()->id !== $tache->projet()->value('lead_developpeur_id')
        ) {
            return response()->json([
                'message' => 'Seul le lead développeur du projet peut mettre à jour cette tâche.',
                'statut' => 403,
            ], 403);
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'statut' => 'nullable|string|in:Disponible,Attribuée,En cours,Terminé',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $assignee = null;
        $isExistingAssignee = false;
        if ($request->has('user_id')) {
            $assignee = $request->user_id ? User::findOrFail($request->user_id) : null;
            $isExistingAssignee = $assignee && $assignee->id === (int) $tache->user_id;
            if ($assignee && (!$assignee->isDeveloppeur() || ($assignee->statut !== 'Actif' && !$isExistingAssignee))) {
                return response()->json([
                    'message' => 'La tâche ne peut être assignée qu\'à un développeur actif.',
                    'statut' => 422,
                ], 422);
            }
            if ($assignee && !$tache->projet->users()->where('users.id', $assignee->id)->exists()) {
                return response()->json([
                    'message' => 'Le développeur doit être membre du projet pour recevoir cette tâche.',
                    'statut' => 422,
                ], 422);
            }

        }

        // Préparer les mises à jour pour la tâche
        $updates = $request->only(['nom', 'description', 'date_debut', 'date_fin']);
        
        // Only a changed assignment resets the task to its corresponding queue state.
        if ($request->filled('user_id')) {
            $updates['user_id'] = $request->user_id;
            if ((int) $request->user_id !== (int) $tache->user_id) {
                $updates['statut'] = 'Attribuée';
            }
        } elseif ($request->has('user_id') && $request->user_id === null) {
            $updates['user_id'] = null;
            if ($tache->user_id !== null) {
                $updates['statut'] = 'Disponible';
            }
        }

        if ($request->filled('statut')) {
            $updates['statut'] = $request->statut;
        }

        $updated = DB::transaction(function () use ($request, $assignee, $isExistingAssignee, $tache, $updates) {
            if ($request->has('user_id') && $assignee && !$isExistingAssignee) {
                User::whereKey($assignee->id)->lockForUpdate()->firstOrFail();
                $this->libererTachesExpirees($assignee->id);
                $activeTasks = Tache::where('user_id', $assignee->id)
                    ->where('id', '!=', $tache->id)
                    ->whereIn('statut', ['Attribuée', 'En cours'])
                    ->count();
                if ($activeTasks >= 3) {
                    return false;
                }
            }

            $tache->update($updates);
            return true;
        });

        if (!$updated) {
            return response()->json([
                'message' => 'Le développeur a déjà 3 tâches actives.',
                'statut' => 400,
            ], 400);
        }
        $tache->load(['projet', 'user']);
        return response()->json([
            'data' => $tache,
            'message' => 'Tâche mise à jour avec succès',
            'statut' => 200,
        ], 200);
    }

    public function take(Request $request, Tache $tache)
    {
        if (!$request->user()->isDeveloppeur()) {
            return response()->json([
                'message' => 'Seul un développeur peut prendre une tâche.',
                'statut' => 403,
            ], 403);
        }

        $result = DB::transaction(function () use ($request, $tache) {
            $developer = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $lockedTask = Tache::whereKey($tache->id)->lockForUpdate()->firstOrFail();
            $lockedTask->load('projet');

            if (
                !$lockedTask->projet->users()->where('users.id', $developer->id)->exists()
                && (int) $lockedTask->user_id !== (int) $developer->id
            ) {
                return ['error' => 'Vous ne faites pas partie de l’équipe de ce projet.', 'status' => 403];
            }

            $this->gererTaskStatut($lockedTask);
            if ($lockedTask->user_id !== null || $lockedTask->statut !== 'Disponible') {
                return ['error' => 'Cette tâche n’est pas disponible.', 'status' => 409];
            }

            if (!$lockedTask->created_at || $lockedTask->created_at->gt(Carbon::now()->subDays(3))) {
                return ['error' => 'Cette tâche pourra être prise trois jours après sa création.', 'status' => 409];
            }

            $this->libererTachesExpirees($developer->id);
            $activeTasks = Tache::where('user_id', $developer->id)
                ->whereIn('statut', ['Attribuée', 'En cours'])
                ->lockForUpdate()
                ->count();
            if ($activeTasks >= 3) {
                return ['error' => 'Vous avez déjà atteint la limite de 3 tâches actives.', 'status' => 409];
            }

            $lockedTask->update([
                'user_id' => $developer->id,
                'statut' => 'Attribuée',
            ]);

            return ['task' => $lockedTask->fresh()->load(['projet', 'user'])];
        });

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error'],
                'statut' => $result['status'],
            ], $result['status']);
        }

        return response()->json([
            'data' => $result['task'],
            'message' => 'Tâche prise avec succès',
            'statut' => 200,
        ], 200);
    }

    public function start(Request $request, Tache $tache)
    {
        if (
            !$request->user()->isDeveloppeur()
            || (int) $tache->user_id !== (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'Seul le développeur auquel la tâche est assignée peut la démarrer.',
                'statut' => 403,
            ], 403);
        }

        $this->gererTaskStatut($tache);
        if ((int) $tache->user_id !== (int) $request->user()->id || $tache->statut !== 'Attribuée') {
            return response()->json([
                'message' => 'Cette tâche n’est plus assignée ou a déjà été démarrée.',
                'statut' => 409,
            ], 409);
        }

        $tache->update(['statut' => 'En cours']);
        $tache->load(['projet', 'user']);

        return response()->json([
            'data' => $tache,
            'message' => 'Tâche démarrée avec succès',
            'statut' => 200,
        ]);
    }

    public function createBranch(Request $request, Tache $tache)
    {
        if (
            !$request->user()->isDeveloppeur()
            || (int) $tache->user_id !== (int) $request->user()->id
            || !in_array($tache->statut, ['Attribuée', 'En cours'], true)
        ) {
            return response()->json([
                'message' => 'Seul le développeur auquel la tâche est assignée peut créer sa branche.',
                'statut' => 403,
            ], 403);
        }

        $repository = config('services.github.repository');
        $token = config('services.github.token');
        $baseBranch = config('services.github.base_branch', 'main');
        if (!$repository || !$token || !preg_match('/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/', $repository)) {
            return response()->json([
                'message' => 'GitHub n’est pas configuré. Renseignez GITHUB_REPOSITORY et GITHUB_TOKEN dans le fichier .env du serveur.',
                'statut' => 503,
            ], 503);
        }

        [$owner, $repo] = explode('/', $repository, 2);
        $api = Http::withToken($token)
            ->accept('application/vnd.github+json')
            ->withHeaders(['X-GitHub-Api-Version' => '2022-11-28'])
            ->connectTimeout(5)
            ->timeout(15)
            ->baseUrl('https://api.github.com');

        $branch = 'task/' . $tache->id . '-' . Str::slug($tache->nom);
        $encodePath = fn (string $path): string => implode('/', array_map('rawurlencode', explode('/', $path)));
        $encodedBranch = $encodePath($branch);
        $branchUrl = "https://github.com/{$owner}/{$repo}/tree/{$encodedBranch}";
        if ($tache->github_branch) {
            return response()->json([
                'data' => ['branch' => $tache->github_branch, 'url' => $tache->github_branch_url],
                'message' => 'Cette tâche possède déjà une branche de travail.',
                'statut' => 200,
            ]);
        }

        try {
            $existingBranch = $api->get("/repos/{$owner}/{$repo}/git/ref/heads/{$encodedBranch}");
            if ($existingBranch->successful()) {
                $tache->update([
                    'github_branch' => $branch,
                    'github_branch_url' => $branchUrl,
                ]);
                return response()->json([
                    'data' => ['branch' => $branch, 'url' => $branchUrl],
                    'message' => 'La branche de cette tâche existe déjà.',
                    'statut' => 200,
                ]);
            }

            $baseResponse = $api->get("/repos/{$owner}/{$repo}/git/ref/heads/" . $encodePath($baseBranch));
            if (!$baseResponse->successful()) {
                return response()->json([
                    'message' => 'Impossible de lire la branche de base GitHub. Vérifiez le dépôt, le nom de branche et les permissions du token.',
                    'statut' => 502,
                ], 502);
            }

            $branchResponse = $api->post("/repos/{$owner}/{$repo}/git/refs", [
                'ref' => 'refs/heads/' . $branch,
                'sha' => $baseResponse->json('object.sha'),
            ]);
        } catch (ConnectionException) {
            return response()->json([
                'message' => 'GitHub est temporairement inaccessible. Réessayez dans quelques instants.',
                'statut' => 502,
            ], 502);
        }

        if (!$branchResponse->successful()) {
            return response()->json([
                'message' => 'GitHub n’a pas pu créer la branche. Vérifiez les permissions Contents en lecture/écriture et l’existence éventuelle de cette branche.',
                'statut' => 502,
            ], 502);
        }

        $tache->update([
            'github_branch' => $branch,
            'github_branch_url' => $branchUrl,
        ]);

        return response()->json([
            'data' => ['branch' => $branch, 'url' => $branchUrl],
            'message' => 'Branche créée avec succès',
            'statut' => 201,
        ], 201);
    }

    public function destroy(Request $request, Tache $tache)
    {
        if (
            !$request->user()->isLeadDeveloppeur()
            || $request->user()->id !== $tache->projet()->value('lead_developpeur_id')
        ) {
            return response()->json([
                'message' => 'Seul le lead développeur du projet peut supprimer cette tâche.',
                'statut' => 403,
            ], 403);
        }

        $tache->delete();

        return response()->json([
            'message' => 'Tâche supprimée avec succès',
            'statut' => 200,
        ], 200);
    }
}
