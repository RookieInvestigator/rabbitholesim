<script setup>
import { usePlayerStore } from '@/stores/playerStore';
const player = usePlayerStore();
const format = (num) => Number(num).toFixed(0);
</script>

<template>
  <div class="stats-container-bare">
    <div class="stat-group">
      <span class="stat-item">探索: <strong>{{ player.turn }}</strong></span>
      <span class="stat-item">❤️ <strong>{{ format(player.health) }}</strong></span>
      <span class="stat-item">🧠 <strong>{{ format(player.sanity) }}</strong></span>
      <span class="stat-item">💰 <strong>{{ format(player.money) }}</strong></span>
    </div>
    <div class="stat-group">
      <span class="stat-item">邏: <strong>{{ format(player.logic) }}</strong></span>
      <span class="stat-item">靈: <strong>{{ format(player.gnosis) }}</strong></span>
      <span class="stat-item">奇: <strong>{{ format(player.weirdness) }}</strong></span>
      <span class="stat-item">構: <strong>{{ format(player.irony) }}</strong></span>
    </div>
    <div v-if="player.statusEffects.length > 0" class="stat-group status-group">
        <span v-for="effect in player.statusEffects" :key="effect.id" class="stat-item status-effect">
            {{ effect.id }}
        </span>
    </div>
  </div>
</template>

<style scoped>
/* ✨ 全新的無背景樣式 ✨ */
.stats-container-bare {
  display: flex;
  flex-wrap: nowrap; /* 強制不換行 */
  gap: 0.5rem 1.5rem;
  align-items: center;
  /* 移除了 background, padding, border, border-radius */
}

.stat-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
}

.stat-item {
  color: #aaa; /* 顏色變淺以適應頂欄 */
  font-size: 0.9rem;
  white-space: nowrap;
}

.stat-item strong {
  color: #e0e0e0;
  margin-left: 0.25rem;
  font-size: 1.1em;
}

.status-effect {
  background-color: #c94e4e;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.stat-group:not(:last-child) {
  padding-right: 1.5rem;
  border-right: 1px solid #444; /* 分隔線顏色變深 */
}
</style>