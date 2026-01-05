<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allStatusEffects from '@/data/status_effects.json';

const player = usePlayerStore();
const format = (num) => Number(num).toFixed(0);

const displayedEffects = computed(() => {
  return player.statusEffects.map(effect => {
    return {
      id: effect.id,
      name: allStatusEffects[effect.id]?.name || effect.id
    };
  });
});
</script>

<template>
  <div class="monitor-container">
    <div class="worldview-grid">
      <div class="worldview-card">
        <span class="icon">🧠</span>
        <span class="value">{{ format(player.logic) }}</span>
        <span class="label">逻辑</span>
      </div>
      <div class="worldview-card">
        <span class="icon">👁️</span>
        <span class="value">{{ format(player.gnosis) }}</span>
        <span class="label">灵知</span>
      </div>
      <div class="worldview-card">
        <span class="icon">🌀</span>
        <span class="value">{{ format(player.weirdness) }}</span>
        <span class="label">怪奇</span>
      </div>
      <div class="worldview-card">
        <span class="icon">🎭</span>
        <span class="value">{{ format(player.irony) }}</span>
        <span class="label">戏讽</span>
      </div>
    </div>

    <div class="core-metrics">
      <div class="metric-item">
        <span class="m-label">回合</span>
        <span class="m-value">{{ player.turn }}</span>
      </div>
      <div class="metric-item">
        <span class="m-label">健康</span>
        <span class="m-value">{{ format(player.health) }}</span>
      </div>
      <div class="metric-item">
        <span class="m-label">理智</span>
        <span class="m-value">{{ format(player.sanity) }}</span>
      </div>
      <div class="metric-item">
        <span class="m-label">金钱</span>
        <span class="m-value">{{ format(player.money) }}</span>
      </div>
    </div>

    <div v-if="player.statusEffects.length > 0" class="effects-tray">
      <div v-for="effect in displayedEffects" :key="effect.id" class="status-tag">
        {{ effect.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全面採用思源黑體與直角細邊框 */
.monitor-container {
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
  background-color: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* 4 欄橫向網格 */
.worldview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.worldview-card {
  border: 1px solid #111;
  background: #000;
  padding: 0.8rem 0; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  text-align: center;
}

.icon { 
  font-size: 1.2rem; 
  margin-bottom: 0.4rem;
}

.value { 
  font-size: 1.2rem; 
  font-weight: 700; 
  color: #fff; 
  line-height: 1;
}

.label { 
  font-size: 0.65rem; 
  color: #333; 
  margin-top: 0.4rem;
  letter-spacing: 2px;
}

/* 核心指標 2x2 佈局 */
.core-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: #111; 
  border: 1px solid #111;
}

.metric-item {
  background-color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
}

.m-label {
  font-size: 0.7rem;
  color: #c0c0c0;
}

.m-value {
  font-size: 0.85rem;
  font-weight: bold;
  color: #888;
}

/* 狀態標籤區域 */
.effects-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center; 
  border-top: 1px dashed #111;
  padding-top: 0.8rem;
}

.status-tag {
  border: 1px solid #422;
  color: #833;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: bold;
}

/* ✨ 手機版專屬緊湊優化 ✨ */
@media (max-width: 768px) {
  .monitor-container {
    gap: 0.4rem; /* 縮小容器間距 */
  }

  .worldview-card {
    padding: 0.4rem 0; /* 縮減上下內邊距 */
  }

  .icon {
    font-size: 1rem; /* 縮小 Emoji */
    margin-bottom: 0.2rem;
  }

  .value {
    font-size: 1rem; /* 縮小數值 */
  }

  .label {
    font-size: 0.5rem; /* 縮小標籤文字 */
    margin-top: 0.1rem;
    letter-spacing: 0px;
  }

  .metric-item {
    padding: 0.3rem 0.6rem; /* 縮減核心指標內距 */
  }

  .m-label, .m-value {
    font-size: 0.65rem; /* 統一縮小核心指標文字 */
  }

  .effects-tray {
    padding-top: 0.4rem;
    margin-top: 0;
  }

  .status-tag {
    padding: 0.1rem 0.4rem;
    font-size: 0.6rem;
  }
}
</style>