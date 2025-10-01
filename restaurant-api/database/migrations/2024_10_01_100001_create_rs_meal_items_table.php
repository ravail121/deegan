<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRsMealItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rs_meal_items', function (Blueprint $table) {
            $table->id('itemID');
            $table->string('itemName');
            $table->unsignedBigInteger('packageID');
            $table->string('photo80')->nullable();
            $table->string('photo320')->nullable();
            $table->decimal('costPrice', 10, 2);
            $table->string('orderTo')->default('kitchen'); // kitchen, drinks, coffee
            $table->time('startFrom')->nullable();
            $table->time('endTo')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('prepareTime')->nullable(); // override package prepareTime
            $table->text('description')->nullable();
            $table->text('ingredients')->nullable();
            $table->boolean('isVegetarian')->default(false);
            $table->boolean('isSpicy')->default(false);
            $table->integer('displayOrder')->default(0);
            $table->timestamps();
            
            $table->foreign('packageID')
                  ->references('packageID')
                  ->on('rs_meal_packages')
                  ->onDelete('cascade');
            
            $table->index('packageID');
            $table->index('status');
            $table->index('orderTo');
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
        Schema::dropIfExists('rs_meal_items');
    }
}

