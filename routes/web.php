<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Contact;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\ProfileController;

Route::get('/contact', function () {
    return view('contact');
});

// Auth routes (login form served as a blade that mounts the React component)
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// SPA main app (protected)
Route::get('/', function () {
    return view('app');
})->middleware('auth');

// Session-authenticated profile endpoints (so fetch with cookies works)
Route::middleware('auth')->group(function(){
    Route::get('/api/user', [ProfileController::class, 'user']);
    Route::put('/api/profile', [ProfileController::class, 'update']);
    Route::post('/api/profile/avatar', [ProfileController::class, 'uploadAvatar']);
});

Route::post('/contact', function (Request $request) {
    // Validate input
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'message' => 'required|string',
    ]);

    // Save to DB
    Contact::create([
        'name' => $request->name,
        'email' => $request->email,
        'message' => $request->message,
    ]);

    return back()->with('success', 'Thanks, your message has been saved!');
});

// Catch-all route for SPA so client-side routes work (must be last)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*')->middleware('auth');

