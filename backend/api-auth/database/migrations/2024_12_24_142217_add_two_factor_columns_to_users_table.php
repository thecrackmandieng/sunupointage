<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Fortify\Fortify;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajout des colonnes pour l'authentification à deux facteurs
            $table->text('two_factor_secret')->nullable(); // Colonne nullable
            $table->text('two_factor_recovery_codes')->nullable();

            // Ajout de la colonne si Fortify confirme l'authentification à deux facteurs
            if (Fortify::confirmsTwoFactorAuthentication()) {
                $table->timestamp('two_factor_confirmed_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Suppression des colonnes ajoutées
            $columnsToDrop = ['two_factor_secret', 'two_factor_recovery_codes'];

            if (Fortify::confirmsTwoFactorAuthentication()) {
                $columnsToDrop[] = 'two_factor_confirmed_at';
            }

            $table->dropColumn($columnsToDrop);
        });
    }
};
