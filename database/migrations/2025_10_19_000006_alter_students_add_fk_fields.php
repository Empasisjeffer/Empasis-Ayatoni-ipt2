<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('status');
            $table->unsignedBigInteger('course_id')->nullable()->after('department_id');
            $table->string('phone')->nullable()->after('course_id');
            $table->date('enrollment_date')->nullable()->after('phone');
            $table->text('address')->nullable()->after('enrollment_date');
            $table->softDeletes();

            $table->foreign('department_id')->references('id')->on('departments')->restrictOnDelete();
            $table->foreign('course_id')->references('id')->on('courses')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['course_id']);
            $table->dropColumn(['department_id','course_id','phone','enrollment_date','address','deleted_at']);
        });
    }
};
