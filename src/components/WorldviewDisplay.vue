<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allStatusEffects from '@/data/status_effects.json';

const player = usePlayerStore();
const format = (num) => Number(num).toFixed(0);

const displayedEffects = computed(() => {
  return player.statusEffects.map(effect => {
    const def = allStatusEffects[effect.id];
    return {
      id: effect.id,
      name: def?.name || effect.id,
      levels: effect.levels
    };
  });
});
</script>

<template>
  <div class="monitor-container">
    <div class="worldview-grid">
      <div class="worldview-card logic-card">
        <span class="icon"><i class="fas fa-atom icon-logic"></i></span>
        <span class="value">{{ format(player.logic) }}</span>
        <span class="label">逻辑</span>
      </div>
      <div class="worldview-card gnosis-card">
        <span class="icon"><i class="fas fa-eye icon-gnosis"></i></span>
        <span class="value">{{ format(player.gnosis) }}</span>
        <span class="label">灵知</span>
      </div>
      <div class="worldview-card weirdness-card">
        <span class="icon"><i class="fas fa-spider icon-weirdness"></i></span>
        <span class="value">{{ format(player.weirdness) }}</span>
        <span class="label">怪奇</span>
      </div>
      <div class="worldview-card irony-card">
        <span class="icon"><i class="fas fa-masks-theater icon-irony"></i></span>
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
        {{ effect.name }}<span v-if="effect.levels && effect.levels > 1" class="effect-level"> {{ effect.levels }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-container {
  font-family: var(--font-sans);
  background-color: var(--bg-color);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.worldview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.worldview-card {
  border: 1px solid var(--border);
  background: var(--bg-color);
  padding: 0.8rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: background-color 0.2s ease;
}

.logic-card:hover { background-color: rgba(52, 152, 219, 0.1); }
.gnosis-card:hover { background-color: rgba(155, 89, 182, 0.1); }
.weirdness-card:hover { background-color: rgba(46, 204, 113, 0.1); }
.irony-card:hover { background-color: rgba(230, 126, 34, 0.1); }

.icon {
  font-size: 1.2rem;
  margin-bottom: 0.4rem;
}

.icon-logic { color: #3498db; }
.icon-gnosis { color: #9b59b6; }
.icon-weirdness { color: #2ecc71; }
.icon-irony { color: #e67e22; }

.value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.label {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-weight: 500;
  margin-top: 0.4rem;
  letter-spacing: 1px;
}

.core-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: var(--border);
  border: 1px solid var(--border);
}

.metric-item {
  background-color: var(--bg-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
}

.m-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.m-value {
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--text-dim);
}

.effects-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  border-top: 1px dashed var(--border);
  padding-top: 0.8rem;
}

.status-tag {
  border: 1px solid #422;
  color: #833;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: bold;
}

.effect-level {
  color: #c66;
  margin-left: 2px;
}

@media (max-width: 768px) {
  .monitor-container {
    gap: 0.4rem;
  }

  .worldview-card {
    padding: 0.4rem 0;
  }

  .icon {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }

  .value {
    font-size: 1rem;
  }

  .label {
    font-size: 0.6rem;
    color: var(--text-dim);
    margin-top: 0.2rem;
  }

  .metric-item {
    padding: 0.3rem 0.6rem;
  }

  .m-label, .m-value {
    font-size: 0.65rem;
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
