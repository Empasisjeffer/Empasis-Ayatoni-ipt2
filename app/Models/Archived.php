<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Archived extends Model
{
    use HasFactory;

    protected $table = 'archived';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'name',
        'snapshot_json',
        'archived_at',
    ];

    protected $casts = [
        'snapshot_json' => 'array',
        'archived_at' => 'datetime',
    ];
}
