<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\ArchivedController;

Route::get('/contacts', [ContactController::class, 'index']);   // GET all
Route::post('/contacts', [ContactController::class, 'store']);  // POST create
Route::put('/contacts/{id}', [ContactController::class, 'update']); // PUT update
Route::delete('/contacts/{id}', [ContactController::class, 'destroy']); // DELETE

// Students API
Route::get('/students', [StudentController::class, 'index']);
Route::post('/students', [StudentController::class, 'store']);
Route::get('/students/{id}', [StudentController::class, 'show']);
Route::put('/students/{id}', [StudentController::class, 'update']);

// Profile routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [ProfileController::class, 'user']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
});
Route::delete('/students/{id}', [StudentController::class, 'destroy']);
Route::post('/students/{id}/restore', [StudentController::class, 'restore']);

// Faculties API (use implicit model binding)
Route::get('/faculties', [FacultyController::class, 'index']);
Route::post('/faculties', [FacultyController::class, 'store']);
Route::get('/faculties/{faculty}', [FacultyController::class, 'show']);
Route::put('/faculties/{faculty}', [FacultyController::class, 'update']);
Route::delete('/faculties/{faculty}', [FacultyController::class, 'destroy']);
Route::post('/faculties/{faculty}/restore', [FacultyController::class, 'restore']);

// Alternative way to define Students and Faculty API routes
Route::apiResource('students', StudentController::class);
// Removed duplicate resource route for 'faculty' to avoid conflicts with '/faculties' endpoints

// Departments, Courses, Academic Years
Route::apiResource('departments', DepartmentController::class);
Route::apiResource('courses', CourseController::class);
Route::apiResource('academic-years', AcademicYearController::class);
Route::post('/departments/{id}/restore', [DepartmentController::class, 'restore']);
Route::post('/courses/{id}/restore', [CourseController::class, 'restore']);
Route::post('/academic-years/{id}/restore', [AcademicYearController::class, 'restore']);

// Archived views (read-only)
Route::prefix('archived')->group(function(){
    Route::get('/students', [ArchivedController::class, 'students']);
    Route::get('/faculty', [ArchivedController::class, 'faculty']);
    Route::get('/departments', [ArchivedController::class, 'departments']);
    Route::get('/courses', [ArchivedController::class, 'courses']);
    Route::get('/academic-years', [ArchivedController::class, 'academicYears']);
});
