<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        // Accept either 'username' or 'email' for identifier
        $request->validate([
            'password' => 'required|string',
        ]);
        $identifier = $request->input('username');
        if (!$identifier) { $identifier = $request->input('email'); }
        if (!$identifier) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => ['username' => ['Username or email is required.']]
            ], 422);
        }

        $password = (string)$request->input('password');

        // Try to authenticate with email first
        if (Auth::attempt(['email' => $identifier, 'password' => $password], $request->filled('remember'))) {
            $request->session()->regenerate();
            return response()->json(['message' => 'Authenticated']);
        }
        
        // If email auth fails, try with username (name column)
        if (Auth::attempt(['name' => $identifier, 'password' => $password], $request->filled('remember'))) {
            $request->session()->regenerate();
            return response()->json(['message' => 'Authenticated']);
        }

        // As a fallback, manually verify and log in (handles edge cases with guards/providers)
        $user = User::where('email', $identifier)->orWhere('name', $identifier)->first();
        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user, $request->filled('remember'));
            $request->session()->regenerate();
            return response()->json(['message' => 'Authenticated']);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
            'errors' => [
                'username' => ['These credentials do not match our records.']
            ]
        ], 422);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
