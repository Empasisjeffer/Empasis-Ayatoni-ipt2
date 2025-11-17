<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\Archived;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $includeTrashed = filter_var($request->query('include_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->query('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $q = $request->query('q');

        $query = Department::query();
        if ($onlyTrashed) { $query->onlyTrashed(); }
        elseif ($includeTrashed) { $query->withTrashed(); }
        if ($q) { $query->where('name','like',"%$q%"); }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'status' => 'required|string|in:Active,Inactive',
        ]);
        $department = Department::create($data);
        return response()->json($department, 201);
    }

    public function show(Department $department)
    {
        return response()->json($department);
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $department->id,
            'status' => 'sometimes|required|string|in:Active,Inactive',
        ]);
        $department->update($data);
        return response()->json($department);
    }

    public function destroy(Department $department)
    {
        $snapshot = $department->toArray();
        $department->delete();
        Archived::updateOrCreate(
            ['entity_type' => 'departments', 'entity_id' => $department->id],
            [
                'name' => $snapshot['name'] ?? null,
                'snapshot_json' => $snapshot,
                'archived_at' => now(),
            ]
        );
        return response()->json(['message' => 'Department deleted']);
    }

    public function restore($id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        $department->restore();
        Archived::where('entity_type','departments')->where('entity_id',$department->id)->delete();
        return response()->json(['message' => 'Department restored']);
    }
}
