<script setup>
import GameView from './views/GameView.vue'
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <GameView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.main-content {
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>