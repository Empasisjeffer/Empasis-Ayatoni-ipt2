<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create a default admin user for initial login
        if (!User::where('email', 'admin@urios.com')->exists()) {
            User::create([
                'name' => 'Admin',
                'email' => 'admin@urios.com',
                'password' => Hash::make('admin'),
            ]);
        }
    }
}
