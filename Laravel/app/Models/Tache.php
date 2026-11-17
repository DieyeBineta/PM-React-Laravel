<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Projet;
use App\Models\User;

class Tache extends Model
{
    protected $fillable = [
        "nom",
        "description",
        "date_debut",
        "date_fin",
        "statut",
        "projet_id",
        "user_id",
        "github_branch",
        "github_branch_url"
    ];


    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function projet(): BelongsTo {
        return $this->belongsTo(Projet::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
