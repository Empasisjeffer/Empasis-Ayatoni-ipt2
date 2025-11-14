<?php

namespace App\Http\Controllers;

use App\Models\Archived;

class ArchivedController extends Controller
{
    public function students()
    {
        return response()->json(
            Archived::where('entity_type','students')->orderByDesc('archived_at')->get()
        );
    }

    public function faculty()
    {
        return response()->json(
            Archived::where('entity_type','faculties')->orderByDesc('archived_at')->get()
        );
    }

    public function departments()
    {
        return response()->json(
            Archived::where('entity_type','departments')->orderByDesc('archived_at')->get()
        );
    }

    public function courses()
    {
        return response()->json(
            Archived::where('entity_type','courses')->orderByDesc('archived_at')->get()
        );
    }

    public function academicYears()
    {
        return response()->json(
            Archived::where('entity_type','academic_years')->orderByDesc('archived_at')->get()
        );
    }
}
