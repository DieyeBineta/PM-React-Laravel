<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('taches')
            ->whereNotNull('user_id')
            ->select(['id', 'projet_id', 'user_id'])
            ->orderBy('id')
            ->chunk(500, function ($tasks) {
                foreach ($tasks as $task) {
                    $alreadyMember = DB::table('projet_users')
                        ->where('projet_id', $task->projet_id)
                        ->where('user_id', $task->user_id)
                        ->exists();

                    if (!$alreadyMember) {
                        DB::table('projet_users')->insert([
                            'projet_id' => $task->projet_id,
                            'user_id' => $task->user_id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Existing project memberships are preserved when rolling back this data migration.
    }
};
