<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRsMealPackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rs_meal_packages', function (Blueprint $table) {
            $table->id('packageID');
            $table->string('packageName');
            $table->string('photo80')->nullable();
            $table->string('photo320')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('prepareTime')->default(15); // in minutes
            $table->text('description')->nullable();
            $table->integer('displayOrder')->default(0);
            $table->timestamps();
            
            $table->index('status');
            $table->index('displayOrder');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rs_meal_packages');
    }
}

