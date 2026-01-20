<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Navbar />
    <main class="flex-grow py-8">
      <slot />
      <!-- 内容插槽 -->
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from "./Navbar.vue";
import Footer from "./Footer.vue";
</script>
