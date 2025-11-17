<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the gpa column if it exists
        if (Schema::hasColumn('students', 'gpa')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('gpa');
            });
        }
    }

    public function down(): void
    {
        // Recreate the gpa column as nullable float if rolling back
        if (!Schema::hasColumn('students', 'gpa')) {
            Schema::table('students', function (Blueprint $table) {
                $table->float('gpa')->nullable()->after('year');
            });
        }
    }
};
