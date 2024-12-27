<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UtilisateurController;

Route::get('utilisateurs', [UtilisateurController::class, 'index']);
Route::post('utilisateurs', [UtilisateurController::class, 'store']);
Route::get('utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::put('utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

// Inscription et connexion
Route::post('register', [UtilisateurController::class, 'register']);
Route::post('login', [UtilisateurController::class, 'login']);

// Route pour vérifier l'utilisateur connecté
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::middleware('auth.token')->group(function () {
    Route::get('/protected-route', function () {
        return response()->json(['message' => 'Access granted']);
    });
});
