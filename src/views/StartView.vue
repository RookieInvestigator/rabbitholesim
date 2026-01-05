<template>
  <div class="start-screen-container">
    <div class="title-container">
      <h1 class="main-title">深渊模拟器</h1>
      <p class="subtitle">Rabbit Hole Simulator</p>
    </div>
    <div class="menu-container">
      <button class="menu-button" @click="$emit('startGame')" :disabled="isLoading">
        {{ isLoading ? '数据加载中...' : '开始探索' }}
      </button>
      <button class="menu-button" @click="$emit('manageDlc')" :disabled="isLoading">DLC管理</button>
      <button class="menu-button" @click="$emit('showAchievements')" :disabled="isLoading">成就</button>
      <button class="menu-button" @click="$emit('openEditor')" :disabled="isLoading">编辑器</button>
    </div>
    <footer class="footer">
      <p>v0.1.0-alpha</p>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean
});
defineEmits(['startGame', 'manageDlc', 'openEditor', 'showAchievements']);
</script>

<style scoped>
.start-screen-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1a1a1a;
  color: #e0e0e0;
  font-family: 'KaiTi', 'STKaiti', 'serif';
}

.title-container {
  text-align: center;
  margin-bottom: 4rem;
}

.main-title {
  font-size: 4rem;
  font-weight: bold;
  color: #f0f0f0;
  text-shadow: 0 0 10px #f0f0f0, 0 0 20px #f0f0f0, 0 0 30px #c7a5ff, 0 0 40px #c7a5ff;
  animation: flicker 3s infinite alternate;
}

.subtitle {
  font-size: 1.5rem;
  color: #a0a0a0;
  margin-top: -1rem;
  letter-spacing: 2px;
}

@keyframes flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% {
    text-shadow:
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #c7a5ff,
      0 0 80px #c7a5ff,
      0 0 90px #c7a5ff,
      0 0 100px #c7a5ff,
      0 0 150px #c7a5ff;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}

.menu-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 250px;
}

.menu-button {
  padding: 12px 20px;
  font-size: 1.2rem;
  background-color: transparent;
  color: #d0d0d0;
  border: 2px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'KaiTi', 'STKaiti', 'serif';
  letter-spacing: 1px;
}

.menu-button:hover:not(:disabled) {
  background-color: #c7a5ff;
  color: #1a1a1a;
  border-color: #c7a5ff;
  box-shadow: 0 0 15px #c7a5ff;
}

.menu-button:disabled {
  cursor: not-allowed;
  color: #666;
  border-color: #444;
}

.footer {
  position: absolute;
  bottom: 20px;
  font-size: 0.9rem;
  color: #555;
}
</style>
