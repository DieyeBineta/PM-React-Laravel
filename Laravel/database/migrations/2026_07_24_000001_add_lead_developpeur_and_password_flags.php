<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projets', function (Blueprint $table) {
            $table->foreignId('lead_developpeur_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->after('description');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('force_password_change')
                ->default(false)
                ->after('statut');
            $table->timestamp('password_changed_at')
                ->nullable()
                ->after('force_password_change');
        });
    }

    public function down(): void
    {
        Schema::table('projets', function (Blueprint $table) {
            $table->dropForeign(['lead_developpeur_id']);
            $table->dropColumn('lead_developpeur_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['force_password_change', 'password_changed_at']);
        });
    }
};
