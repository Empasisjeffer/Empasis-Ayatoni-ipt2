<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            if (!Schema::hasColumn('faculty', 'gender')) {
                $table->string('gender')->nullable()->after('experience');
            }
            if (!Schema::hasColumn('faculty', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('faculty', 'address')) {
                $table->text('address')->nullable()->after('contact_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            if (Schema::hasColumn('faculty', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('faculty', 'contact_number')) {
                $table->dropColumn('contact_number');
            }
            if (Schema::hasColumn('faculty', 'gender')) {
                $table->dropColumn('gender');
            }
        });
    }
};
