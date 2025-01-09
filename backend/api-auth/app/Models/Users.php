<?php

namespace App\Models;


use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
class Users extends Model
{
    protected $collection = 'users'; // Nom de la collection MongoDB
    protected $fillable = [
        'nom', 'prenom', 'email', 'telephone', 'adresse', 'role',
        'departement_id', 'cohorte_id', 'status', 'matricule', 'cardID', 'photo',
    ];
}
