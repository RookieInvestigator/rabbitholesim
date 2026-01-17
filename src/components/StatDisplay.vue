<script setup>
import { usePlayerStore } from '@/stores/playerStore';
const player = usePlayerStore();
const format = (num) => Number(num).toFixed(0);
</script>

<template>
  <div class="stats-container-bare">
    <div class="stat-group">
      <span class="stat-item">探索: <strong>{{ player.turn }}</strong></span>
      <span class="stat-item"><i class="fas fa-heart icon-heart"></i> <strong>{{ format(player.health) }}</strong></span>
      <span class="stat-item"><i class="fas fa-brain icon-sanity"></i> <strong>{{ format(player.sanity) }}</strong></span>
      <span class="stat-item"><i class="fas fa-coins icon-coins"></i> <strong>{{ format(player.money) }}</strong></span>
    </div>
    <div class="stat-group">
      <span class="stat-item"><i class="fas fa-atom icon-logic"></i> 逻辑 <strong>{{ format(player.logic) }}</strong></span>
      <span class="stat-item">灵知 <strong>{{ format(player.gnosis) }}</strong></span>
      <span class="stat-item"><i class="fas fa-spider icon-weirdness"></i> 怪奇 <strong>{{ format(player.weirdness) }}</strong></span>
      <span class="stat-item">戏讽 <strong>{{ format(player.irony) }}</strong></span>
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
}

.stat-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
}

.stat-item {
  color: #aaa;
  font-size: 0.9rem;
  white-space: nowrap;
}

.stat-item strong {
  color: #e0e0e0;
  margin-left: 0.25rem;
  font-size: 1.1em;
}

.stat-item i {
  margin-right: 0.35rem;
  font-size: 0.9em;
}

/* --- Icon Colors --- */
.icon-heart { color: #e74c3c; }
.icon-sanity { color: #888; }
.icon-coins { color: #f1c40f; }
.icon-logic { color: #3498db; }
.icon-weirdness { color: #2ecc71; }

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
  border-right: 1px solid #444;
}
</style>