<script setup>
import GameView from './views/GameView.vue'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Project Terminus</h1>
      <p class="subtitle">一個關於偏執、謎團與人生選擇的模擬器</p>
    </header>
    <main>
      <GameView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
}
.subtitle { color: #888; }
</style>