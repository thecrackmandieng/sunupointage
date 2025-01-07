<?php
namespace App\Http\Controllers;

use App\Models\Apprenant;
use App\Http\Controllers\CohorteController;
use App\Models\Cohorte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use League\Csv\Reader;
use MongoDB\BSON\ObjectId;


class ApprenantController extends Controller
{// Créer un apprenant
public function create(Request $request)
{
    // Vérifier si l'email existe déjà
    $existingEmail = Apprenant::where('email', $request->email)->first();
    if ($existingEmail) {
        return response()->json(['message' => 'Cet email est déjà utilisé.'], 400);
    }

    // Vérifier si le téléphone existe déjà
    $existingPhone = Apprenant::where('telephone', $request->telephone)->first();
    if ($existingPhone) {
        return response()->json(['message' => 'Ce numéro de téléphone est déjà attribué.'], 400);
    }

        // Vérifiez si le card_id existe uniquement si le champ est fourni
        if (!empty($request->card_id)) {
            $existingCardId = Apprenant::where('card_id', $request->card_id)->first();
            if ($existingCardId) {
                return response()->json(['message' => 'Ce card_id est déjà utilisé.'], 400);
            }
        }

    // Valider les données de la requête
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'email' => 'required|email|unique:apprenants,email',
        'adresse' => 'required|string|max:255',
        'telephone' => 'required|string|max:9|unique:apprenants,telephone',
        'cohorte_id' => 'required|exists:cohortes,_id',  // Vérification avec _id
        'matricule' => 'nullable|string', // Généré automatiquement si non fourni
        'password' => 'required|string|min:6',
        'role' => 'required|string|in:admin,utilisateur', // Rôle autorisé
        'card_id' => 'nullable|string|unique:apprenants,card_id', // Optionnel mais unique
        'photo' => 'nullable|file|mimes:jpg,png,jpeg|max:2048', // Validation pour le fichier
    ]);

    // Vérifiez si la cohorte existe
    $cohorte = Cohorte::find($validated['cohorte_id']);
    if (!$cohorte) {
        return response()->json(['message' => 'Cohorte non trouvée.'], 404);
    }

    // Générer le matricule si non fourni
    if (empty($validated['matricule'])) {
        $validated['matricule'] = Apprenant::generateMatricule();
    }

    // Si une photo est envoyée, stockez-la
   
    if ($request->hasFile('photo')) {
        $photoPath = $request->file('photo')->store('photos', 'public');
    } else {
        $photoPath = null; // Ou une valeur par défaut
    }
    
    // Hacher le mot de passe
    $validated['password'] = Hash::make($validated['password']);

    // Créer l'apprenant
    $apprenant = Apprenant::create([
        'nom' => $validated['nom'],
        'prenom' => $validated['prenom'],
        'email' => $validated['email'],
        'adresse' => $validated['adresse'],
        'telephone' => $validated['telephone'],
        'cohorte_id' => $validated['cohorte_id'], // Assurez-vous que cette clé est bien transmise
        'matricule' => $validated['matricule'],
        'role' => $validated['role'],
        'photo' => $data['photo'] ?? null, // Utilisez une valeur par défaut si `photo` n'existe pas
        'password' => bcrypt($validated['password']),
    ]);

    // Charger la cohorte liée
    $apprenant->load('cohorte');

    return response()->json(['message' => 'Apprenant créé avec succès', 'apprenant' => $apprenant], 201);
}



      // Mettre à jour un apprenant
      public function update(Request $request, $id)
      {
          // Trouver l'apprenant
          $apprenant = Apprenant::findOrFail($id);
      
          // Vérification si l'email est unique
          $existingEmail = Apprenant::where('email', $request->email)
                                    ->where('id', '!=', $apprenant->id)
                                    ->first();
          if ($existingEmail) {
              return response()->json(['message' => 'Cet email est déjà utilisé.'], 400);
          }
      
          // Vérification si le téléphone est unique
          $existingPhone = Apprenant::where('telephone', $request->telephone)
                                    ->where('id', '!=', $apprenant->id)
                                    ->first();
          if ($existingPhone) {
              return response()->json(['message' => 'Ce numéro de téléphone est déjà attribué.'], 400);
          }
      
          // Vérification si le card_id est unique
          $existingCardId = Apprenant::where('card_id', $request->card_id)
                                     ->where('id', '!=', $apprenant->id)
                                     ->first();
          if ($existingCardId) {
              return response()->json(['message' => 'Ce card_id est déjà utilisé.'], 400);
          }
      
          // Validation des données
          $validated = $request->only([
              'nom', 'prenom', 'email', 'adresse', 'telephone', 'cohorte', 'role', 'card_id'
          ]);
      
          // Si un mot de passe est fourni, on le hache
          if ($request->has('password')) {
              $validated['password'] = Hash::make($request->password);
          }
      
          // Mise à jour de l'apprenant
          $apprenant->update($validated);
      
          // Rafraîchissement de l'apprenant pour récupérer les données actuelles
          $apprenant->refresh();
      
          // Retourner une réponse JSON avec les informations mises à jour
          return response()->json(['message' => 'Apprenant mis à jour avec succès', 'apprenant' => $apprenant], 200);
      }
      


    // Lister tous les apprenants
    public function list(Request $request)
    {
        $apprenants = Apprenant::query();

        // Filtrer par statut actif (si applicable)
        if ($request->has('is_active')) {
            $apprenants->where('is_active', $request->is_active);
        }

        return response()->json($apprenants->get(), 200);
    }

    // Afficher un apprenant par ID
    public function show($id)
    {
        $apprenant = Apprenant::find($id);

        if (!$apprenant) {
            return response()->json(['message' => 'Apprenant non trouvé'], 404);
        }

        return response()->json($apprenant, 200);
    }

    // Bloquer un ou plusieurs apprenants
    public function block(Request $request)
    {
        // Valider les identifiants (peut être un tableau ou une valeur unique)
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:apprenants,id',  // Vérification que les IDs existent dans la table 'apprenants'
        ]);
    
        // Bloquer les apprenants
        Apprenant::whereIn('id', $validated['ids'])->update(['is_active' => false]);
    
        return response()->json(['message' => 'Apprenant(s) bloqué(s) avec succès'], 200);
    }
    
    // Bloquer un apprenant
    public function blockOne($id)
    {
        $apprenant = Apprenant::find($id);
    
        if (!$apprenant) {
            return response()->json(['message' => 'Apprenant non trouvé'], 404);
        }
    
        $apprenant->update(['is_active' => false]);
    
        return response()->json(['message' => 'Apprenant bloqué avec succès', 'apprenant' => $apprenant], 200);
    }
    

    // Supprimer un ou plusieurs apprenants
    public function delete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:apprenants,id',
        ]);

        Apprenant::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => 'Apprenant(s) supprimé(s) avec succès'], 200);
    }

    // Supprimer un apprenant
    public function deleteOne($id)
    {
        $apprenant = Apprenant::find($id);

        if (!$apprenant) {
            return response()->json(['message' => 'Apprenant non trouvé'], 404);
        }

        $apprenant->delete();

        return response()->json(['message' => 'Apprenant supprimé avec succès'], 200);
    }




    public function importCsv(Request $request)
    {
        // Validation du fichier : accepter uniquement CSV
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048', // Fichiers CSV ou TXT avec une limite de 2 Mo
        ]);
    
        // Récupérer le fichier téléchargé
        $file = $request->file('file');
    
        // Lire le fichier CSV
        $csv = Reader::createFromPath($file->getRealPath(), 'r');
        $csv->setHeaderOffset(0); // Utiliser la première ligne comme en-tête
    
        $records = $csv->getRecords(); // Récupérer toutes les lignes du fichier
    
        // Variables pour suivre les apprenants ajoutés et ignorés
        $addedApprenants = [];
        $ignoredApprenants = [];
    
        // Parcourir les enregistrements CSV et insérer les apprenants dans la base de données
        foreach ($records as $record) {
            $result = $this->createApprenant($record);
    
            if ($result === 'duplicate') {
                // Ajouter à la liste des ignorés en cas de doublon
                $ignoredApprenants[] = $record['email'] ?? 'Inconnu'; // Utiliser l'email comme identifiant unique
            } else {
                // Ajouter à la liste des ajoutés en cas de succès
                $addedApprenants[] = $record['email'] ?? 'Inconnu';

            }
        }
    
        // Construire le message de retour
        $message = 'Importation terminée.';
        if (!empty($ignoredApprenants)) {
            $message .= ' Les apprenants suivants ont été ignorés à cause de doublons : ' . implode(', ', $ignoredApprenants);
        }
        if (!empty($addedApprenants)) {
            $message .= ' Les apprenants suivants ont été ajoutés : ' . implode(', ', $addedApprenants);
        }
    
        // Retourner la réponse en JSON
        return response()->json([
            'message' => $message,
            'added_apprenants' => $addedApprenants,
            'ignored_apprenants' => $ignoredApprenants
        ], 200);
    }
    
    private function createApprenant($data)
    {
        // Vérifier les doublons (email, téléphone, card_id)
        $existingApprenant = Apprenant::where('email', $data['email'])
            ->orWhere('telephone', $data['telephone'])
            ->orWhere('card_id', $data['card_id'])
            ->first();
    
        // Si un doublon est trouvé, retourner 'duplicate'
        if ($existingApprenant) {
            return 'duplicate';
        }
    
        // Générer un matricule unique si non fourni
        $matricule = isset($data['matricule']) && !empty($data['matricule'])
            ? $data['matricule']
            : $this->generateMatricule();
    
        // Préparer les données validées pour l'insertion
        $validatedData = [
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'],
            'adresse' => $data['adresse'],
            'telephone' => $data['telephone'],
            'cohorte' => $data['cohorte'],
            'matricule' => $matricule,
            'password' => isset($data['password']) ? bcrypt($data['password']) : null, // Mot de passe optionnel
            'role' => $data['role'] ?? 'utilisateur', // Rôle par défaut
            'card_id' => $data['card_id'] ?? null,
            'is_active' => true, // Par défaut, actif
        ];
    
        // Gérer les photos si elles sont incluses
        if (isset($data['photo'])) {
            $validatedData['photo'] = $data['photo'];
        }
    
        // Insérer l'apprenant dans la base de données
        Apprenant::create($validatedData);
    
        // Retourner 'added' si l'apprenant a été ajouté
        return 'added';
    }
    
    private function generateMatricule()
    {
        $year = date('Y'); // L'année actuelle
        $randomNumber = rand(1000, 9999); // Nombre aléatoire à 4 chiffres
    
        return 'AP' . $year . $randomNumber; // Matricule au format "AP20241234"
    }


  
}    