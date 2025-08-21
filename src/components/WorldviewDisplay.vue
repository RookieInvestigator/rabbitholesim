<script setup>
import { usePlayerStore } from '@/stores/playerStore';
const player = usePlayerStore();
const format = (num) => Number(num).toFixed(0);
</script>

<template>
  <div class="display-container">
    <div class="worldview-grid">
      <div class="worldview-item">
        <span class="icon">🧠</span>
        <span class="value">{{ format(player.logic) }}</span>
        <span class="label">邏輯</span>
      </div>
      <div class="worldview-item">
        <span class="icon">👁️</span>
        <span class="value">{{ format(player.gnosis) }}</span>
        <span class="label">靈知</span>
      </div>
      <div class="worldview-item">
        <span class="icon">🌀</span>
        <span class="value">{{ format(player.weirdness) }}</span>
        <span class="label">怪奇</span>
      </div>
      <div class="worldview-item">
        <span class="icon">🎭</span>
        <span class="value">{{ format(player.irony) }}</span>
        <span class="label">解構</span>
      </div>
    </div>
    <div class="core-stats-bar">
      <span>回合: {{ player.turn }}</span>
      <span>❤️: {{ format(player.health) }}</span>
      <span>🧠: {{ format(player.sanity) }}</span>
      <span>💰: {{ format(player.money) }}</span>
    </div>
  </div>
</template>

<style scoped>
/* ✨ 全新的超緊湊樣式 ✨ */
.display-container-compact {
  padding: 0.4rem; /* 再次縮小內邊距 */
  background-color: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #333;
  flex-shrink: 0;
}
.worldview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem; /* 再次縮小間距 */
  margin-bottom: 0.4rem;
}
.worldview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 0.9;
  border-radius: 6px;
  background-color: #2a2a2a;
  padding: 0.2rem;
}
.icon { font-size: 1.2rem; line-height: 1; } /* 縮小圖示 */
.value { font-size: 1rem; font-weight: bold; color: white; line-height: 1.2; } /* 縮小數值 */
.label { font-size: 0.65rem; color: #aaa; } /* 縮小標籤 */
.core-stats-bar {
  display: flex;
  justify-content: space-around;
  font-size: 0.75rem; /* 縮小核心狀態字體 */
  color: #ccc;
  border-top: 1px solid #333;
  padding-top: 0.4rem;
  margin-top: 0.2rem;
}
</style>