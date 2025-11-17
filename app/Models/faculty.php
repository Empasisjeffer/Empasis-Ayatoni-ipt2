<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faculty extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'faculty';

    protected $fillable = [
        'name',
        'email',
        'department_id',
        'position',
        'experience',
        'gender',
        'contact_number',
        'address',
        'employment_type',
        'status',
    ];
}
