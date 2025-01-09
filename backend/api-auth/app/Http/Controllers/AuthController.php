<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AuthController extends Controller
{
    /**
     * Envoie un email de réinitialisation de mot de passe.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetPasswordEmail(Request $request)
    {
        // Valider l'email fourni
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Générer un token pour la réinitialisation du mot de passe
        $token = Str::random(60);

        // Stocker le token dans la table `password_resets`
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        // Construire le lien de réinitialisation
        $resetLink = env('FRONTEND_URL', 'http://127.0.0.1:4200') . "/reset-password?token=$token";

        // Envoyer l'email avec le lien de réinitialisation
        Mail::send('emails.reset_password', ['link' => $resetLink], function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Réinitialisation de votre mot de passe');
        });

        return response()->json([
            'message' => 'Email de réinitialisation envoyé avec succès.',
        ], 200);
    }
}
