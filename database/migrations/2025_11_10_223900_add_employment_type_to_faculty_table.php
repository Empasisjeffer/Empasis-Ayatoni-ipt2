<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            if (!Schema::hasColumn('faculty', 'employment_type')) {
                $table->string('employment_type')->nullable()->after('experience');
            }
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            if (Schema::hasColumn('faculty', 'employment_type')) {
                $table->dropColumn('employment_type');
            }
        });
    }
};
