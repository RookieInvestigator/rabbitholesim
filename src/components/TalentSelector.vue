<script setup>
import { ref, onMounted } from 'vue';
import { useDataCenter } from '@/composables/dataCenter';

const emit = defineEmits(['start', 'back']);
const { gameData } = useDataCenter();

const availableTalents = ref([]);
const selectedTalents = ref([]);
const maxSelection = 3;

function drawTalents() {
  selectedTalents.value = [];
  const allTalents = [...gameData.talents];
  const tier1 = allTalents.filter(t => t.tier === 1);
  const tier2 = allTalents.filter(t => t.tier === 2);
  const tier3 = allTalents.filter(t => t.tier === 3);

  const shuffle = (array) => array.sort(() => 0.5 - Math.random());
  shuffle(tier1); shuffle(tier2); shuffle(tier3);

  const picked = [];
  const pickedIds = new Set();
  
  while (picked.length < 10 && (tier1.length + tier2.length + tier3.length > 0)) {
    const rand = Math.random();
    let chosenTierPool;
    if (rand < 0.05 && tier3.length > 0) chosenTierPool = tier3;
    else if (rand < 0.30 && tier2.length > 0) chosenTierPool = tier2;
    else if (tier1.length > 0) chosenTierPool = tier1;
    else chosenTierPool = tier2.length > 0 ? tier2 : tier3;

    if (!chosenTierPool || chosenTierPool.length === 0) break;
    const talent = chosenTierPool.pop(); 
    if (talent && !pickedIds.has(talent.id)) {
      picked.push(talent);
      pickedIds.add(talent.id);
    }
  }
  availableTalents.value = shuffle(picked);
}

onMounted(drawTalents);

function toggleTalent(talent) {
  const index = selectedTalents.value.findIndex(t => t.id === talent.id);
  if (index > -1) {
    selectedTalents.value.splice(index, 1);
  } else if (selectedTalents.value.length < maxSelection) {
    selectedTalents.value.push(talent);
  }
}

function isSelected(talent) {
  return selectedTalents.value.some(t => t.id === talent.id);
}

function confirmSelection(mode) {
  if (selectedTalents.value.length === maxSelection) {
    emit('start', selectedTalents.value, mode);
  }
}

const tierClass = (talent) => `tier-${talent.tier || 1}`;
</script>

<template>
  <div class="selector-fixed">
    <div class="header">
      <div class="header-info">
        <span class="system-code">PROTOCOL: INITIAL_INJECTION</span>
        <h2 class="title">选择初始天赋 [{{ selectedTalents.length }}/{{ maxSelection }}]</h2>
      </div>
      <div class="header-btns">
        <button @click="drawTalents" class="btn-refresh">重置</button>
        <button @click="$emit('back')" class="btn-back">返回</button>
      </div>
    </div>
    
    <div class="talent-grid">
      <div
        v-for="talent in availableTalents"
        :key="talent.id"
        class="talent-card"
        :class="[isSelected(talent) ? 'selected' : '', tierClass(talent)]"
        @click="toggleTalent(talent)"
      >
        <div class="side-bar"></div>
        <div class="card-content">
          <div class="name-row">
            <h3 class="name">{{ talent.name }}</h3>
            <span v-if="isSelected(talent)" class="check">●</span>
          </div>
          <p class="desc">{{ talent.description }}</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="btn-group">
        <button 
          class="btn-action primary" 
          @click="confirmSelection('interactive')" 
          :disabled="selectedTalents.length !== maxSelection"
        >
          [ 手动探索 ]
        </button>
        <button 
          class="btn-action" 
          @click="confirmSelection('simulation')" 
          :disabled="selectedTalents.length !== maxSelection"
        >
          [ 自动模拟 ]
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selector-fixed {
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 鎖定全屏高度 */
  background-color: #000;
  color: #fff;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* 標頭響應式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;
  border-bottom: 1px solid #111;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.system-code { font-size: 0.65rem; color: #333; letter-spacing: 2px; }
.title { font-size: 1.2rem; margin: 0.2rem 0 0 0; font-weight: 700; }
.header-btns { display: flex; gap: 0.5rem; }

.btn-refresh, .btn-back {
  background: transparent;
  color: #444;
  border: 1px solid #111;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* 網格佈局：PC 預設 5*2 */
.talent-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.5rem;
  flex-grow: 1;
  min-height: 0; /* 關鍵：允許內容在 flex 中縮小 */
  overflow-y: auto; /* 手機版內容過多時可捲動 */
  padding-right: 2px;
}

.talent-card {
  position: relative;
  background-color: #000;
  border: 1px solid #111;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.1s ease;
  overflow: hidden;
}

.side-bar {
  width: 2px;
  height: 100%;
  flex-shrink: 0;
  background-color: #111;
}

.card-content {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.name { font-size: 0.95rem; margin: 0; font-weight: 700; color: #ccc; }
.check { font-size: 0.5rem; color: #fff; }
.desc { font-size: 0.75rem; color: #444; margin: 0; line-height: 1.4; }

/* 稀有度顏色 */
.tier-2 { border-color: #0d1a26; }
.tier-2 .side-bar { background-color: #4A90E2; }
.tier-2 .name { color: #7aa5e6; }
.tier-3 { border-color: #261a0d; }
.tier-3 .side-bar { background-color: #ffc878; }
.tier-3 .name { color: #e6b46c; }

/* 選中狀態 */
.talent-card.selected { background-color: #0c0c0c; }
.talent-card.tier-1.selected { border-color: #888 !important; }
.talent-card.tier-2.selected { border-color: #4A90E2 !important; }
.talent-card.tier-3.selected { border-color: #ffc878 !important; }
.talent-card.selected .name { color: #fff; font-weight: 900; }
.talent-card.selected .desc { color: #888; }

/* 底部按鈕 */
.footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.btn-group { display: flex; gap: 0.8rem; width: 100%; max-width: 600px; }
.btn-action {
  flex: 1;
  background: transparent;
  color: #333;
  border: 1px solid #111;
  padding: 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-action.primary:not(:disabled) { background: #fff; color: #000; border-color: #fff; }
.btn-action:disabled { opacity: 0.1; cursor: not-allowed; }

/* ✨ 手機端適配 (Mobile) ✨ */
@media (max-width: 768px) {
  .selector-fixed { padding: 1rem; }
  
  .header { margin-bottom: 0.8rem; }
  .title { font-size: 1rem; }
  .system-code { display: none; } /* 手機版隱藏非必要裝飾 */

  /* 網格改為 2 欄 */
  .talent-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto; 
    gap: 0.4rem;
  }

  .talent-card {
    min-height: 100px; /* 確保有足夠點擊空間 */
  }

  .card-content { padding: 0.6rem; }
  .name { font-size: 0.85rem; }
  .desc { font-size: 0.7rem; }

  .btn-group { flex-direction: column; gap: 0.5rem; }
  .btn-action { padding: 0.6rem; font-size: 0.8rem; }
}

/* 極小螢幕適配 */
@media (max-width: 400px) {
  .talent-grid { grid-template-columns: 1fr; }
}
</style>