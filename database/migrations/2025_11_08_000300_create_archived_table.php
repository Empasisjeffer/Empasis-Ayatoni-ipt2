<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archived', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // e.g. 'students','faculties','departments','courses','academic_years'
            $table->unsignedBigInteger('entity_id');
            $table->string('name')->nullable(); // display name
            $table->json('snapshot_json'); // full snapshot of the record
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archived');
    }
};
