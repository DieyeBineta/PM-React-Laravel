<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $projectsWithoutLead = DB::table('projets')
            ->whereNull('lead_developpeur_id')
            ->pluck('id');

        if ($projectsWithoutLead->isNotEmpty()) {
            $leadRoleId = DB::table('roles')
                ->where('titre', 'Lead_Developpeur')
                ->value('id');

            foreach ($projectsWithoutLead as $projectId) {
                $projectLeadIds = $leadRoleId
                    ? DB::table('projet_users')
                        ->join('users', 'users.id', '=', 'projet_users.user_id')
                        ->where('projet_users.projet_id', $projectId)
                        ->where('users.role_id', $leadRoleId)
                        ->orderBy('users.id')
                        ->pluck('users.id')
                    : collect();

                if ($projectLeadIds->count() !== 1) {
                    throw new \RuntimeException(
                        "Cannot require a lead developer: project {$projectId} must be assigned exactly one lead developer before migrating."
                    );
                }

                DB::table('projets')
                    ->where('id', $projectId)
                    ->update(['lead_developpeur_id' => $projectLeadIds->first()]);
            }
        }

        $leadRoleId = DB::table('roles')
            ->where('titre', 'Lead_Developpeur')
            ->value('id');
        $projectsWithInvalidLead = DB::table('projets')
            ->join('users', 'users.id', '=', 'projets.lead_developpeur_id')
            ->where(function ($query) use ($leadRoleId) {
                if ($leadRoleId === null) {
                    $query->whereNotNull('projets.lead_developpeur_id');
                } else {
                    $query->where('users.role_id', '!=', $leadRoleId);
                }
            })
            ->pluck('projets.id');

        if ($projectsWithInvalidLead->isNotEmpty()) {
            throw new \RuntimeException(
                'Cannot require lead developers: assign a Lead_Developpeur to projects '
                . $projectsWithInvalidLead->implode(', ')
                . ' before migrating.'
            );
        }

        Schema::table('projets', function (Blueprint $table) {
            $table->dropForeign(['lead_developpeur_id']);
            $table->foreignId('lead_developpeur_id')->nullable(false)->change();
            $table->foreign('lead_developpeur_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projets', function (Blueprint $table) {
            $table->dropForeign(['lead_developpeur_id']);
            $table->foreignId('lead_developpeur_id')->nullable()->change();
            $table->foreign('lead_developpeur_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }
};
