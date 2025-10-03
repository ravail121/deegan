<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRsMealItemAddonsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rs_meal_item_addons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('itemID');
            $table->unsignedBigInteger('addonID');
            $table->timestamps();
            
            // Note: Foreign key constraints removed since referenced tables don't exist yet
            // $table->foreign('itemID')->references('itemID')->on('rs_meal_items')->onDelete('cascade');
            // $table->foreign('addonID')->references('addonID')->on('rs_addons')->onDelete('cascade');
            
            $table->unique(['itemID', 'addonID']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rs_meal_item_addons');
    }
}
