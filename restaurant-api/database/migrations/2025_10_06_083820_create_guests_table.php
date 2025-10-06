<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGuestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->string('guest_id')->unique();
            $table->string('ip_address');
            $table->text('user_agent')->nullable();
            $table->timestamp('last_activity');
            $table->json('session_data')->nullable();
            $table->timestamps();
            
            $table->index(['ip_address', 'last_activity']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('guests');
    }
}
