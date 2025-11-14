<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Use raw SQL to avoid Doctrine DBAL requirement
        // Assumes MySQL; adjust as needed for other drivers
        DB::statement('ALTER TABLE `students` MODIFY `course` VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `students` MODIFY `course` VARCHAR(255) NOT NULL');
    }
};
