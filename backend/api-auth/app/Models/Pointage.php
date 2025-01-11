<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Carbon\Carbon;

class Pointage extends Model
{
    protected $connection = 'mongodb'; // Déclare que ce modèle utilise MongoDB

    // Déclare explicitement que le champ `_id` doit être utilisé.
    protected $primaryKey = '_id';
    public $incrementing = false;  // `_id` n'est pas auto-incrémenté
    protected $keyType = 'string';  // Si tu utilises un string pour l'ID

    protected $fillable = ['utilisateur_id', 'date', 'firstTime', 'secondTime', 'status'];

    // Définir la relation avec Utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    protected static function booted()
    {
        static::saving(function ($pointage) {
            $pointage->status = $pointage->calculateStatus();
        });
    }

    public function calculateStatus(): string
    {
        if (is_null($this->firstTime)) {
            return 'Absent';
        }

        $heureDebut = Carbon::parse($this->firstTime);
        $limiteRetard = Carbon::parse('08:00');

        return $heureDebut->lt($limiteRetard) ? 'Présent' : 'Retard';
    }
}
