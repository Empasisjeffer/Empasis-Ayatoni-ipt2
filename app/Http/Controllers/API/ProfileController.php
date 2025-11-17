<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['nullable', 'required_with:new_password', 'current_password'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable','string','max:50'],
            'department' => ['nullable','string','max:255'],
            'role' => ['nullable','string','max:255'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->department = $validated['department'] ?? $user->department;
        $user->role = $validated['role'] ?? $user->role;

        if (!empty($validated['new_password'])) {
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->only('id', 'name', 'email', 'phone', 'department', 'role', 'avatar_path')
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'avatar' => ['required','image','mimes:jpg,jpeg,png,webp','max:2048']
        ]);

        if ($user->avatar_path) {
            // stored as relative path like `avatars/xxx.jpg`
            $existing = $user->avatar_path;
            if (str_starts_with($existing, 'avatars/')) {
                Storage::disk('public')->delete($existing);
            } elseif (str_starts_with($existing, 'storage/')) {
                $trimmed = substr($existing, strlen('storage/'));
                Storage::disk('public')->delete($trimmed);
            }
        }

        $path = $request->file('avatar')->store('avatars','public');
        $user->avatar_path = $path; // keep relative; frontend can use Storage::url
        $user->save();

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }
}
