<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Archived;
use App\Models\Course;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $departmentId = $request->query('department_id');
        $perPage = (int)($request->query('per_page', 10));
        $includeTrashed = filter_var($request->query('include_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->query('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = Student::query();
        if ($onlyTrashed) { $query->onlyTrashed(); }
        elseif ($includeTrashed) { $query->withTrashed(); }
        if ($q) {
            $query->where(function($w) use ($q) {
                $w->where('firstname', 'like', "%$q%")
                  ->orWhere('lastname', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%");
            });
        }
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $result = $query->orderByDesc('id')->paginate($perPage);
        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'sometimes|nullable|string|unique:students,student_id',
            'firstname' => 'required|string|max:255',
            'middlename' => 'sometimes|nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'course' => 'sometimes|nullable|string|max:255',
            'year' => 'required|string|max:255',
            'student_category' => 'sometimes|nullable|string|max:255',
            'gender' => 'sometimes|nullable|string|in:Male,Female',
            'status' => 'required|string|max:255',
            'department_id' => 'sometimes|nullable|integer|exists:departments,id',
            'course_id' => 'sometimes|nullable|integer|exists:courses,id',
            'phone' => 'sometimes|nullable|string|max:255',
            'enrollment_date' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string',
        ]);

        // Denormalize: fill `course` text from `course_id` if missing
        if ((!isset($validated['course']) || $validated['course'] === null) && isset($validated['course_id'])) {
            $course = Course::find($validated['course_id']);
            if ($course) { $validated['course'] = $course->name; }
        }

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function show($id)
    {
        return response()->json(Student::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $data = $request->validate([
            'student_id' => 'sometimes|nullable|string|unique:students,student_id,' . $student->id,
            'firstname' => 'sometimes|required|string|max:255',
            'middlename' => 'sometimes|nullable|string|max:255',
            'lastname' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:students,email,' . $student->id,
            'course' => 'sometimes|nullable|string|max:255',
            'year' => 'sometimes|required|string|max:255',
            'student_category' => 'sometimes|nullable|string|max:255',
            'gender' => 'sometimes|nullable|string|in:Male,Female',
            'status' => 'sometimes|required|string|max:255',
            'department_id' => 'sometimes|nullable|integer|exists:departments,id',
            'course_id' => 'sometimes|nullable|integer|exists:courses,id',
            'phone' => 'sometimes|nullable|string|max:255',
            'enrollment_date' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string',
        ]);
        // Denormalize: fill `course` text from `course_id` if missing in payload
        if ((!isset($data['course']) || $data['course'] === null) && isset($data['course_id'])) {
            $course = Course::find($data['course_id']);
            if ($course) { $data['course'] = $course->name; }
        }

        $student->update($data);
        return response()->json($student);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        // capture snapshot before soft-delete
        $snapshot = $student->toArray();
        $student->delete();
        Archived::updateOrCreate(
            ['entity_type' => 'students', 'entity_id' => $student->id],
            [
                'name' => trim(($snapshot['firstname'] ?? '').' '.($snapshot['lastname'] ?? '')) ?: ($snapshot['email'] ?? null),
                'snapshot_json' => $snapshot,
                'archived_at' => now(),
            ]
        );
        return response()->json(['message' => 'Student deleted']);
    }

    public function restore($id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        $student->restore();
        Archived::where('entity_type','students')->where('entity_id',$student->id)->delete();
        return response()->json(['message' => 'Student restored']);
    }
}
