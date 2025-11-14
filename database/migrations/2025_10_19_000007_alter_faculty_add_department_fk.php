<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            if (Schema::hasColumn('faculty', 'department')) {
                $table->dropColumn('department');
            }
            $table->foreignId('department_id')->after('email')->constrained('departments')->restrictOnDelete();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['department_id','deleted_at']);
            $table->string('department')->nullable();
        });
    }
};
