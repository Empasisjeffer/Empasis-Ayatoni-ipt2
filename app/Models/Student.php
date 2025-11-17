<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'firstname',
        'middlename',
        'lastname',
        'email',
        'course',
        'year',
        'student_category',
        'gender',
        'status',
        'department_id',
        'course_id',
        'phone',
        'enrollment_date',
        'address',
    ];
}
