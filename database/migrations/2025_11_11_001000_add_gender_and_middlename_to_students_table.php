<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'middlename')) {
                $table->string('middlename')->nullable()->after('firstname');
            }
            if (!Schema::hasColumn('students', 'gender')) {
                $table->string('gender')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'gender')) {
                $table->dropColumn('gender');
            }
            if (Schema::hasColumn('students', 'middlename')) {
                $table->dropColumn('middlename');
            }
        });
    }
};
