<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/password/change', [AuthController::class, 'changePassword']);

    Route::apiResource('projets', ProjetController::class);
    Route::apiResource('taches', TacheController::class)
    ->parameters([
        'taches' => 'tache',
    ]);
    // Route pour qu'un développeur prenne une tâche disponible
    Route::post('/taches/{tache}/take', [TacheController::class, 'take']);
    Route::post('/taches/{tache}/start', [TacheController::class, 'start']);
    Route::post('/taches/{tache}/branch', [TacheController::class, 'createBranch']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::apiResource('users', UserController::class)
    ->parameters([
        'users' => 'user',
    ]) ;
    // patch sert à mettre à jour partiellement une ressource, ici le statut de l'utilisateur
    Route::patch('/users/{user}/status', [UserController::class, 'toggleStatus']);
    Route::patch('/users/{user}/desactiver', [UserController::class, 'desactiver']);
    Route::patch('/users/{user}/activer', [UserController::class, 'activer']);
});