<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
    
        try {
            // Vérifier si l'utilisateur existe
            $utilisateur = Utilisateur::where('email', $request->email)->first();
    
            if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
                return response()->json(['message' => 'Identifiants incorrects.'], 401);
            }
    
            // Générer un token API
            $token = bin2hex(random_bytes(32));
    
            // Sauvegarder le token dans l'utilisateur
            $utilisateur->api_token = hash('sha256', $token);
            $utilisateur->save();
    
            return response()->json([
                'message' => 'Connexion réussie.',
                'token' => $token,
                'utilisateur' => $utilisateur,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la connexion.', 'error' => $e->getMessage()], 500);
        }
    }
    
    // Afficher tous les utilisateurs
    public function index()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json($utilisateurs);
    }

    // Créer un nouvel utilisateur
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:15',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:administrateur,vigile', // Limité à ces deux rôles
            'departement' => 'nullable|string|max:255', // Optionnel pour vigiles
            'cohorte' => 'nullable|string|max:255', // Optionnel pour apprenants
        ]);

        try {
            $utilisateur = new Utilisateur();
            $utilisateur->nom = $request->nom;
            $utilisateur->prenom = $request->prenom;
            $utilisateur->adresse = $request->adresse;
            $utilisateur->telephone = $request->telephone;

            // Gestion de l'upload de la photo
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $utilisateur->photo = $path;
            }

            $utilisateur->email = $request->email;
            $utilisateur->password = Hash::make($request->password);
            $utilisateur->role = $request->role;

            // Affecter les champs spécifiques (par exemple, départements ou cohortes selon le contexte)
            $utilisateur->departement = $request->departement;
            $utilisateur->cohorte = $request->cohorte;

            $utilisateur->save();

            return response()->json(['message' => 'Utilisateur créé avec succès.', 'utilisateur' => $utilisateur], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la création de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    // Méthode register mise à jour
    public function register(Request $request)
    {
        return $this->store($request); // Utilise la logique déjà définie dans la méthode store
    }

    // Afficher un utilisateur spécifique
    public function show($id)
    {
        try {
            $utilisateur = Utilisateur::find($id);

            if (!$utilisateur) {
                return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
            }

            return response()->json($utilisateur);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la récupération de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:15',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'email' => 'nullable|email|unique:utilisateurs,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:administrateur,vigile',
            'departement' => 'nullable|string|max:255',
            'cohorte' => 'nullable|string|max:255',
        ]);

        try {
            $utilisateur = Utilisateur::find($id);

            if (!$utilisateur) {
                return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
            }

            if ($request->filled('nom')) $utilisateur->nom = $request->nom;
            if ($request->filled('prenom')) $utilisateur->prenom = $request->prenom;
            if ($request->filled('adresse')) $utilisateur->adresse = $request->adresse;
            if ($request->filled('telephone')) $utilisateur->telephone = $request->telephone;

            // Gestion de l'upload de la photo
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $utilisateur->photo = $path;
            }

            if ($request->filled('email')) $utilisateur->email = $request->email;
            if ($request->filled('password')) $utilisateur->password = Hash::make($request->password);
            if ($request->filled('role')) $utilisateur->role = $request->role;

            $utilisateur->departement = $request->departement;
            $utilisateur->cohorte = $request->cohorte;

            $utilisateur->save();

            return response()->json(['message' => 'Utilisateur mis à jour avec succès.', 'utilisateur' => $utilisateur]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la mise à jour.', 'error' => $e->getMessage()], 500);
        }
    }

    // Supprimer un utilisateur
    public function destroy($id)
    {
        try {
            $utilisateur = Utilisateur::find($id);

            if (!$utilisateur) {
                return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
            }

            $utilisateur->delete();

            return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression.', 'error' => $e->getMessage()], 500);
        }
    }
}
