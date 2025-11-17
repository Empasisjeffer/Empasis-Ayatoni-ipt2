<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Archived;
use Illuminate\Http\Request;
use App\Models\Faculty as FacultyModel;

class FacultyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $q = $request->query('q');
        $departmentId = $request->query('department_id');
        $perPage = (int)($request->query('per_page', 10));
        $includeTrashed = filter_var($request->query('include_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->query('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = FacultyModel::query();
        if ($onlyTrashed) { $query->onlyTrashed(); }
        elseif ($includeTrashed) { $query->withTrashed(); }
        if ($q) {
            $query->where(function($w) use ($q) {
                $w->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%");
            });
        }
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $result = $query->orderByDesc('id')->paginate($perPage);
        return response()->json($result);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:faculty,email',
            'department_id' => 'required|integer|exists:departments,id',
            'position' => 'required|string|max:255',
            'experience' => 'required|integer|min:0',
            'gender' => 'sometimes|nullable|string|in:Male,Female',
            'contact_number' => 'sometimes|nullable|string|max:255',
            'address' => 'sometimes|nullable|string',
            'employment_type' => 'sometimes|nullable|string|max:255',
            'status' => 'required|string|max:255',
        ]);

        $faculty = Faculty::create($validated);

        return response()->json($faculty, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function show(Faculty $faculty)
    {
        return response()->json($faculty);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Faculty $faculty)
    {
        $faculty->update($request->all());
        return response()->json($faculty);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function destroy(Faculty $faculty)
    {
        // capture snapshot before soft-delete
        $snapshot = $faculty->toArray();
        $faculty->delete();
        Archived::updateOrCreate(
            ['entity_type' => 'faculties', 'entity_id' => $faculty->id],
            [
                'name' => $snapshot['name'] ?? ($snapshot['email'] ?? null),
                'snapshot_json' => $snapshot,
                'archived_at' => now(),
            ]
        );
        return response()->json(['message' => 'Faculty deleted']);
    }

    public function restore($id)
    {
        $faculty = FacultyModel::withTrashed()->findOrFail($id);
        $faculty->restore();
        Archived::where('entity_type','faculties')->where('entity_id',$faculty->id)->delete();
        return response()->json(['message' => 'Faculty restored']);
    }
}
