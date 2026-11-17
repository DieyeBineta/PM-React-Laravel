<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Tache;

class Projet extends Model
{
    protected $fillable = [
        "nom",
        "description",
        "lead_developpeur_id"
    ];

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'projet_users')
        ->withTimestamps();
    }

    public function leadDeveloppeur(): BelongsTo {
        return $this->belongsTo(User::class, 'lead_developpeur_id');
    }

    public function taches(): HasMany {
        return $this->hasMany(Tache::class);
    }
}
