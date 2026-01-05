<script setup>
import { ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import allEndings from '@/data/endings.json';

const player = usePlayerStore();
const emit = defineEmits(['restart']);
const finalEnding = ref({ title: '探索结束', description: '意识数据已成功归档至核心伺服器。' });

watch(() => player.deathReason, (newReason) => {
  if (newReason) {
    const matchedEnding = allEndings.find(ending => 
      ending.conditions.some(cond => {
        if (cond.type === 'death_reason' && cond.reason === newReason) return true;
        if (cond.type === 'ending_id' && cond.endingId === newReason) return true;
        return false;
      })
    );
    if (matchedEnding) finalEnding.value = matchedEnding;
  }
}, { immediate: true });

const format = (num) => Number(num).toFixed(0);
</script>

<template>
  <div class="game-over-root">
    <div class="report-container">
      <header class="report-header">
        <span class="report-code">DEBRIEFING_REPORT // {{ new Date().getFullYear() }}</span>
        <h2 class="ending-title">{{ finalEnding.title }}</h2>
      </header>

      <section class="description-section">
        <p class="description">{{ finalEnding.description }}</p>
      </section>
      
      <div class="stats-module">
        <div class="module-label">FINAL_DATA_EXTRACTED</div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="s-label">生存回合</span>
            <span class="s-value">{{ player.turn }}</span>
          </div>
          <div class="stat-item">
            <span class="s-label">最终金钱</span>
            <span class="s-value">{{ format(player.money) }}</span>
          </div>
          <div class="stat-item">
            <span class="s-label">🧠 逻辑</span>
            <span class="s-value">{{ format(player.logic) }}</span>
          </div>
          <div class="stat-item">
            <span class="s-label">👁️ 灵知</span>
            <span class="s-value">{{ format(player.gnosis) }}</span>
          </div>
          <div class="stat-item">
            <span class="s-label">🌀 怪奇</span>
            <span class="s-value">{{ format(player.weirdness) }}</span>
          </div>
          <div class="stat-item">
            <span class="s-label">🎭 戏讽</span>
            <span class="s-value">{{ format(player.irony) }}</span>
          </div>
        </div>
      </div>

      <footer class="footer-actions">
        <button class="btn-restart" @click="emit('restart')">
          > 重新开始
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 全面採用思源黑體與硬核直角 */
.game-over-root {
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
  height: 100vh;
  background-color: #000;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow-y: auto;
}

.report-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid #111;
  background: #000;
  display: flex;
  flex-direction: column;
}

/* 標頭樣式 */
.report-header {
  padding: 2rem;
  border-bottom: 1px solid #111;
  text-align: center;
}

.report-code {
  font-size: 0.65rem;
  color: #333;
  letter-spacing: 2px;
  display: block;
  margin-bottom: 0.5rem;
}

.ending-title {
  color: #ffc878; /* 史詩感金黃色 */
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
}

/* 描述區 */
.description-section {
  padding: 2rem;
  text-align: left;
}

.description {
  color: #888;
  line-height: 1.8;
  font-size: 1rem;
  margin: 0;
}

/* 數據網格模組 */
.stats-module {
  border-top: 1px solid #111;
  border-bottom: 1px solid #111;
}

.module-label {
  font-size: 0.6rem;
  color: #222;
  padding: 0.4rem 2rem;
  background: #050505;
  letter-spacing: 1px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: #111; /* 網格線 */
}

.stat-item {
  background-color: #000;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.s-label {
  font-size: 0.8rem;
  color: #444;
}

.s-value {
  font-size: 1rem;
  font-weight: 700;
  color: #ccc;
}

/* 操作底部 */
.footer-actions {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.btn-restart {
  width: 100%;
  max-width: 300px;
  background: #fff;
  color: #000;
  border: none;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.1s;
}

.btn-restart:hover {
  background: #a29bfe; /* 系統紫色反饋 */
}

/* ✨ 手機版適配 ✨ */
@media (max-width: 768px) {
  .game-over-root {
    align-items: flex-start; /* 手機版從頂部開始，防止長描述切斷 */
    padding: 0;
  }

  .report-container {
    border: none;
    height: 100%;
  }

  .report-header { padding: 3rem 1.5rem 1.5rem; }
  .ending-title { font-size: 1.5rem; }

  .description-section { padding: 1.5rem; }
  
  .stat-item { padding: 0.8rem 1.5rem; }
  
  .footer-actions {
    margin-top: auto; /* 置底 */
    padding: 1.5rem;
    background: #050505;
    border-top: 1px solid #111;
  }
}
</style>