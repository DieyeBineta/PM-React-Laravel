<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProjetUser extends Pivot
{
    protected $table = 'projet_users';

    protected $fillable = [
        'user_id',
        'projet_id',
    ];
}
