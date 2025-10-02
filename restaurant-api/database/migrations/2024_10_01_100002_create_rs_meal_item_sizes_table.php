<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rs_meal_item_sizes', function (Blueprint $table) {
            $table->id('sizeID');
            $table->unsignedBigInteger('itemID');
            $table->string('sizeName', 50); // e.g., 'Small', 'Medium', 'Large', 'Regular'
            $table->decimal('price', 8, 2); // Price for this size
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('displayOrder')->default(0);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('itemID')->references('itemID')->on('rs_meal_items')->onDelete('cascade');
            
            // Indexes
            $table->index(['itemID', 'status']);
            $table->index('displayOrder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rs_meal_item_sizes');
    }
};
