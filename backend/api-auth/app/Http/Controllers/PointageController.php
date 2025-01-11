<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use Illuminate\Http\Request;

class PointageController extends Controller
{
    /**
     * Récupère tous les pointages.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
{
    try {
        // Récupérer tous les pointages et s'assurer que le champ "_id" est inclus
        $pointages = Pointage::all()->toArray();

        // Assurez-vous que chaque pointage a un champ "_id" (si non, tu peux en ajouter un)
        foreach ($pointages as &$pointage) {
            if (!isset($pointage['_id'])) {
                $pointage['_id'] = (string) $pointage['id'];  // Ajouter un _id s'il n'existe pas
            }
        }

        return response()->json([
            'message' => 'Pointages récupérés avec succès.',
            'data' => $pointages,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la récupération des pointages.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


    /**
     * Récupère un pointage par son ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            // Récupérer le pointage par ID
            $pointage = Pointage::findOrFail($id);

            return response()->json([
                'message' => 'Pointage récupéré avec succès.',
                'data' => $pointage,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du pointage.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crée un nouveau pointage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation des données entrantes
        $validatedData = $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'date' => 'required|date',
            'firstTime' => 'nullable|date_format:H:i',
            'secondTime' => 'nullable|date_format:H:i',
        ]);

        try {
            // Créer un nouveau pointage
            $pointage = Pointage::create($validatedData);

            return response()->json([
                'message' => 'Pointage créé avec succès.',
                'data' => $pointage,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du pointage.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Met à jour un pointage existant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Validation des données entrantes
        $validatedData = $request->validate([
            'firstTime' => 'nullable|date_format:H:i',
            'secondTime' => 'nullable|date_format:H:i',
        ]);

        try {
            // Récupérer le pointage par ID
            $pointage = Pointage::findOrFail($id);

            // Mettre à jour le pointage
            $pointage->updatePointage([
                'firstTime' => $request->input('firstTime'),
                'secondTime' => $request->input('secondTime'),
            ]);

            return response()->json([
                'message' => 'Pointage mis à jour avec succès.',
                'data' => $pointage,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du pointage.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Supprime un pointage existant.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            // Récupérer le pointage par ID
            $pointage = Pointage::findOrFail($id);

            // Supprimer le pointage
            $pointage->delete();

            return response()->json([
                'message' => 'Pointage supprimé avec succès.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du pointage.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
