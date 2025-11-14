<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use App\Models\Archived;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $includeTrashed = filter_var($request->query('include_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->query('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $q = $request->query('q');

        $query = AcademicYear::query();
        if ($onlyTrashed) { $query->onlyTrashed(); }
        elseif ($includeTrashed) { $query->withTrashed(); }
        if ($q) { $query->where('label','like',"%$q%"); }
        return response()->json($query->orderByDesc('start_date')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|max:255|unique:academic_years,label',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|string|in:Active,Inactive',
        ]);
        $ay = AcademicYear::create($data);
        return response()->json($ay, 201);
    }

    public function show(AcademicYear $academic_year)
    {
        return response()->json($academic_year);
    }

    public function update(Request $request, AcademicYear $academic_year)
    {
        $data = $request->validate([
            'label' => 'sometimes|required|string|max:255|unique:academic_years,label,' . $academic_year->id,
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'status' => 'sometimes|required|string|in:Active,Inactive',
        ]);
        $academic_year->update($data);
        return response()->json($academic_year);
    }

    public function destroy(AcademicYear $academic_year)
    {
        $snapshot = $academic_year->toArray();
        $academic_year->delete();
        Archived::updateOrCreate(
            ['entity_type' => 'academic_years', 'entity_id' => $academic_year->id],
            [
                'name' => $snapshot['label'] ?? null,
                'snapshot_json' => $snapshot,
                'archived_at' => now(),
            ]
        );
        return response()->json(['message' => 'Academic Year deleted']);
    }

    public function restore($id)
    {
        $ay = AcademicYear::withTrashed()->findOrFail($id);
        $ay->restore();
        Archived::where('entity_type','academic_years')->where('entity_id',$ay->id)->delete();
        return response()->json(['message' => 'Academic Year restored']);
    }
}
