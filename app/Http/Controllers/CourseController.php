<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Models\Archived;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $includeTrashed = filter_var($request->query('include_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->query('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $q = $request->query('q');

        $query = Course::query();
        if ($onlyTrashed) { $query->onlyTrashed(); }
        elseif ($includeTrashed) { $query->withTrashed(); }
        if ($q) { $query->where('name','like',"%$q%"); }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|integer|exists:departments,id',
            'status' => 'required|string|in:Active,Inactive',
        ]);
        $course = Course::create($data);
        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        return response()->json($course);
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'department_id' => 'sometimes|required|integer|exists:departments,id',
            'status' => 'sometimes|required|string|in:Active,Inactive',
        ]);
        $course->update($data);
        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $snapshot = $course->toArray();
        $course->delete();
        Archived::updateOrCreate(
            ['entity_type' => 'courses', 'entity_id' => $course->id],
            [
                'name' => $snapshot['name'] ?? null,
                'snapshot_json' => $snapshot,
                'archived_at' => now(),
            ]
        );
        return response()->json(['message' => 'Course deleted']);
    }

    public function restore($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        $course->restore();
        Archived::where('entity_type','courses')->where('entity_id',$course->id)->delete();
        return response()->json(['message' => 'Course restored']);
    }
}
