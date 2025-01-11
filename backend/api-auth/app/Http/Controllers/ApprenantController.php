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
        'role' => 'required|string|in:admin,utilisateur,apprenant,employe',
        'card_id' => 'nullable|string|unique:apprenants,card_id', // Optionnel mais unique
        'photo' => 'nullable|file|mimes:jpg,png,jpeg|max:2048', // Validation pour le fichier

    ]);
    $validated['is_active'] = true; // Par défaut actif

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
        'is_active' => $validated['is_active'],

    ]);


        // Mettre à jour le nombre de personnes dans la cohorte après l'ajout d'un apprenant
         $cohorte->increment('nombre_personnes');  // Cela va incrémenter le champ 'nombre_personnes' de +1


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
      
        
          // Validation des données
          $validated = $request->only([
              'nom', 'prenom', 'email', 'adresse', 'telephone', 'photo', 'role'
          ]);
      
        
      
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
    
    // Débloquer plusieurs apprenants
  public function unblock(Request $request)
 {
    // Valider les identifiants des apprenants
    $validated = $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'required|exists:apprenants,id',
    ]);

    // Récupérer tous les apprenants à débloquer
    $apprenants = Apprenant::whereIn('id', $validated['ids'])->get();

    // Débloquer chaque apprenant
    Apprenant::whereIn('id', $validated['ids'])->update(['is_active' => true]);

    return response()->json(['message' => 'Apprenant(s) débloqué(s) avec succès', 'apprenants' => $apprenants], 200);
}


// Débloquer un apprenant
public function unblockOne($id)
{
    // Chercher l'apprenant par ID
    $apprenant = Apprenant::find($id);

    if (!$apprenant) {
        return response()->json(['message' => 'Apprenant non trouvé'], 404);
    }

    // Débloquer l'apprenant en mettant 'is_active' à true
    $apprenant->update(['is_active' => true]);

    return response()->json(['message' => 'Apprenant débloqué avec succès', 'apprenant' => $apprenant], 200);
}



    // Supprimer un ou plusieurs apprenants
    public function delete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:apprenants,id',
        ]);
    
        // Récupérer tous les apprenants à supprimer
        $apprenants = Apprenant::whereIn('id', $validated['ids'])->get();
    
        // Supprimer les apprenants
        Apprenant::whereIn('id', $validated['ids'])->delete();
    
        // Mettre à jour le nombre de personnes dans la cohorte après la suppression des apprenants
        foreach ($apprenants as $apprenant) {
            $cohorte = $apprenant->cohorte;  // Récupérer la cohorte associée à l'apprenant
            if ($cohorte) {
                $cohorte->decrement('nombre_personnes');  // Décrémenter le nombre de personnes
            }
        }
    
        return response()->json(['message' => 'Apprenant(s) supprimé(s) avec succès'], 200);
    }
    

    // Supprimer un apprenant
    public function deleteOne($id)
    {
        // Trouver l'apprenant à supprimer
        $apprenant = Apprenant::find($id);
    
        if (!$apprenant) {
            return response()->json(['message' => 'Apprenant non trouvé'], 404);
        }
    
        // Récupérer la cohorte associée à l'apprenant
        $cohorte = $apprenant->cohorte;
    
        // Supprimer l'apprenant
        $apprenant->delete();
    
        // Mettre à jour le nombre de personnes dans la cohorte après la suppression de l'apprenant
        if ($cohorte) {
            $cohorte->decrement('nombre_personnes');  // Décrémenter le nombre de personnes
        }
    
        return response()->json(['message' => 'Apprenant supprimé avec succès'], 200);
    }
    



    
public function importCsv(Request $request)
{
    // Validation pour accepter uniquement un fichier CSV
    $request->validate([
        'file' => 'required|file|mimes:csv,txt|max:2048', // Validation pour CSV
    ], [
        'file.required' => 'Le fichier est requis.',
        'file.file' => 'Le fichier doit être un fichier valide.',
        'file.mimes' => 'Le fichier doit être au format CSV.',
        'file.max' => 'Le fichier ne doit pas dépasser 2 Mo.',
    ]);

    // Récupérer le fichier téléchargé
    $file = $request->file('file');

    // Lire le fichier CSV
    try {
        $csv = Reader::createFromPath($file->getRealPath(), 'r');
        $csv->setHeaderOffset(0); // Utiliser la première ligne comme en-tête
        $records = $csv->getRecords(); // Récupérer toutes les lignes
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la lecture du fichier CSV.',
            'error' => $e->getMessage(),
        ], 400);
    }

    // Variables pour suivre les apprenants ajoutés et ignorés
    $addedApprenants = [];
    $ignoredApprenants = [];
    $errors = [];

    // Parcourir les enregistrements CSV et insérer les apprenants dans la base de données
    foreach ($records as $record) {
        // Vérification de l'existence de la cohorte
        $cohorte = Cohorte::find($record['cohorte_id']);
        if (!$cohorte) {
            $errors[] = 'Cohorte ID ' . $record['cohorte_id'] . ' non trouvée pour l\'apprenant ' . $record['email'];
            continue;
        }

        // Vérification des doublons (email ou téléphone)
        $result = $this->createApprenant($record);
        if ($result === 'duplicate') {
            $ignoredApprenants[] = $record['email']; // Ajouter à la liste des ignorés en cas de doublon
        } else {
            $addedApprenants[] = $record['email']; // Ajouter à la liste des ajoutés si l'apprenant est créé
        }
    }

    // Message à retourner
    $message = 'Importation terminée.';
    if (!empty($ignoredApprenants)) {
        $message .= ' Les apprenants suivants ont été ignorés en raison de doublons ou d\'erreurs : ' . implode(', ', $ignoredApprenants);
    }

    if (!empty($addedApprenants)) {
        $message .= ' Les apprenants suivants ont été ajoutés : ' . implode(', ', $addedApprenants);
    }

    // Retourner une réponse JSON avec les erreurs éventuelles
    return response()->json([
        'message' => $message,
        'added_apprenants' => $addedApprenants,
        'ignored_apprenants' => $ignoredApprenants,
        'errors' => $errors,
    ], 201);
}

private function createApprenant($data)
{
    // Vérifier si un apprenant avec le même email ou téléphone existe déjà
    $existingEmail = Apprenant::where('email', $data['email'])->first();
    if ($existingEmail) {
        return 'duplicate';
    }

    $existingPhone = Apprenant::where('telephone', $data['telephone'])->first();
    if ($existingPhone) {
        return 'duplicate';
    }

    // Générer un matricule unique
    $matricule = $this->generateMatricule();

    // Valider les données de l'apprenant
    $validated = [
        'nom' => $data['nom'],
        'prenom' => $data['prenom'],
        'email' => $data['email'],
        'telephone' => $data['telephone'],
        'adresse' => $data['adresse'],
        'photo' => $data['photo'] ?? null, // Validation de la photo
        'role' => $data['role'] ?? 'apprenant', // Utiliser 'apprenant' par défaut si aucun rôle n'est fourni
        'cohorte_id' => $data['cohorte_id'],
        'matricule' => $matricule,
        'is_active' => true, // L'apprenant sera actif par défaut
    ];

    // Créer l'apprenant
    Apprenant::create([
        'nom' => $validated['nom'],
        'prenom' => $validated['prenom'],
        'email' => $validated['email'],
        'telephone' => $validated['telephone'],
        'adresse' => $validated['adresse'],
        'photo' => $validated['photo'],
        'role' => $validated['role'],
        'cohorte_id' => $validated['cohorte_id'],
        'matricule' => $validated['matricule'],
        'is_active' => $validated['is_active'],
    ]);

    return 'added';
}

private function generateMatricule()
{
    $year = date('Y');  // L'année actuelle
    $randomNumber = rand(1000, 9999);  // Nombre aléatoire à 4 chiffres

    return 'AP' . $year . $randomNumber; // Format : APP20231234
}

// Compter les apprenants
public function countApprenants()
{
    $count = Apprenant::count(); // Utilisation de la méthode Laravel `count`

    return response()->json(['count' => $count], 200);
}

}