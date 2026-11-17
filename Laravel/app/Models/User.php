<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Role;
use App\Models\Projet;
use App\Models\Tache;

#[Fillable(['name', 'email', 'password', 'role_id', 'statut', 'force_password_change', 'password_changed_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_changed_at' => 'datetime',
            'force_password_change' => 'boolean',
        ];
    }

    public function role() : BelongsTo{
        return $this->belongsTo(Role::class);
    }

    public function projets(): BelongsToMany {
        return $this->belongsToMany(Projet::class, 'projet_users')
            ->withTimestamps();
    }

    public function taches(): HasMany
    {
        return $this->hasMany(Tache::class);
    }

    public function isManager(): bool
    {
        return $this->role?->titre === 'Manager';
    }

    public function isLeadDeveloppeur(): bool
    {
        return $this->role?->titre === 'Lead_Developpeur';
    }

    public function isDeveloppeur(): bool
    {
        return $this->role?->titre === 'Developpeur';
    }
}
