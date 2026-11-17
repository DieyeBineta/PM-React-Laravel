<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => bcrypt('manager1234'),
            'role_id' => 1,
            'statut' => 'Actif',
            'force_password_change' => true,
            'password_changed_at' => null,
        ]);

        User::create([
            'name' => 'Lead Developpeur',
            'email' => 'lead@example.com',
            'password' => bcrypt('lead1234'),
            'role_id' => 2,
            'statut' => 'Actif',
            'force_password_change' => true,
            'password_changed_at' => null,
        ]);

        User::create([
            'name' => 'Developpeur',
            'email' => 'dev@example.com',
            'password' => bcrypt('dev1234'),
            'role_id' => 3,
            'statut' => 'Actif',
            'force_password_change' => true,
            'password_changed_at' => null,
        ]);
    }
}
