<template>
    <div class="wrap">
      <!-- Background blur -->
      <div class="bg"></div>
      <div class="overlay"></div>
  
      <main class="content">
        <!-- Logo -->
        <img src="/logo.png" alt="Deegaan Restaurant" class="logo" />
  
        <!-- Titles -->
        <h1 class="welcome">{{ t('Welcome.greeting') }}</h1>
        <h2 class="brand">{{ t('Welcome.brandName') }}</h2>
        <p class="subtitle">{{ t('Welcome.subtitle') }}</p>
  
        <!-- Dots -->
        <div class="dots">
          <span></span><span></span><span></span>
        </div>
  
        <!-- Button -->
        <button class="btn" @click="$router.push('/menu')">
            {{ t('Welcome.continueButton') }} <span class="arrow">{{ t('Welcome.continueButtonIcon') }}</span>
      </button>

      </main>
    </div>
  </template>
  
  <script setup>
  import { t } from '../config/appText.js'
  </script>
  
  <style scoped>
  .wrap {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .bg {
    position: absolute;
    inset: 0;
    background: url('/images/bg.jpg') center/cover no-repeat;
    filter: blur(2px) brightness(0.45);
    transform: scale(1.05);
  }
  
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.65));
  }
  
  .content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: #fff;
    padding: 2rem 1rem;
  }
  
  .logo {
    width: 140px;
    height: 140px;
    margin: 0 auto 1.5rem;
  }
  
  .welcome {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #C3A77F;
  }
  
  .brand {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    margin: .3rem 0 1rem;
    color: #C3A77F;
  }
  
  .subtitle {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: #d1d5db;
    margin-bottom: 1.5rem;
  }
  
  .dots {
    display: flex;
    justify-content: center;
    gap: .5rem;
    margin-bottom: 1.5rem;
  }
  .dots span {
    width: 8px;
    height: 8px;
    background: #e5e7eb;
    border-radius: 50%;
    opacity: 0.7;
  }
  
  .btn {
    background: #166534;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 0.9rem 2.5rem;
    border: none;
    border-radius: 999px;
    box-shadow: 0 6px 16px rgba(0,0,0,.4);
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    cursor: pointer;
    transition: background .2s ease;
  }
  .btn:hover { background: #14532d; }
  .arrow { font-size: 1.2rem; }
  </style>
  