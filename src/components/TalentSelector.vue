<script setup>
import { ref, onMounted } from 'vue';
import allTalents from '@/data/talents.json';

const emit = defineEmits(['start', 'open-editor']);

const availableTalents = ref([]);
const selectedTalents = ref([]);
const maxSelection = 3;

// ✨ 核心修改：按真實機率抽樣天賦
onMounted(() => {
  const tier1 = allTalents.filter(t => t.tier === 1);
  const tier2 = allTalents.filter(t => t.tier === 2);
  const tier3 = allTalents.filter(t => t.tier === 3);

  const shuffle = (array) => array.sort(() => 0.5 - Math.random());
  
  // 先將所有池子洗牌
  shuffle(tier1);
  shuffle(tier2);
  shuffle(tier3);

  const picked = [];
  const pickedIds = new Set();
  
  // 總共要抽出 10 個天賦
  while (picked.length < 10 && (tier1.length + tier2.length + tier3.length > 0)) {
    const rand = Math.random();
    let chosenTierPool;

    // 按機率決定從哪個池子抽
    // 您可以在這裡調整機率！
    if (rand < 0.05 && tier3.length > 0) { // 5% 的機率抽傳說
      chosenTierPool = tier3;
    } else if (rand < 0.30 && tier2.length > 0) { // 25% 的機率抽稀有 (0.05 + 0.25 = 0.30)
      chosenTierPool = tier2;
    } else if (tier1.length > 0) { // 剩下 70% 的機率抽普通
      chosenTierPool = tier1;
    } else {
       // 如果高稀有度池子抽完了，就從還有剩的池子裡抽
       chosenTierPool = tier2.length > 0 ? tier2 : tier3;
       if (!chosenTierPool || chosenTierPool.length === 0) break; // 都抽完了
    }

    // 從選中的池子裡拿一個天賦，並確保不重複
    const talent = chosenTierPool.pop(); 
    if (talent && !pickedIds.has(talent.id)) {
      picked.push(talent);
      pickedIds.add(talent.id);
    }
  }

  availableTalents.value = shuffle(picked); // 最後再將抽出的卡片洗牌
});


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
  <div class="selector-compact">
    <div class="selector-header">
      <h2 class="selector-title">选择初始天赋 ({{ selectedTalents.length }}/{{ maxSelection }})</h2>
      <button @click="emit('open-editor')" class="editor-button">事件编辑器</button>
    </div>
    
    <div class="talent-grid">
      <div
        v-for="talent in availableTalents"
        :key="talent.id"
        class="talent-card"
        :class="[isSelected(talent) ? 'selected' : '', tierClass(talent)]"
        @click="toggleTalent(talent)"
      >
        <h3>{{ talent.name }}</h3>
        <p>{{ talent.description }}</p>
      </div>
    </div>

    <div class="button-group">
      <button @click="confirmSelection('interactive')" :disabled="selectedTalents.length !== maxSelection">
        手动探索
      </button>
      <button @click="confirmSelection('simulation')" :disabled="selectedTalents.length !== maxSelection">
        自动模拟（未完成）
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 樣式部分與上一版相同，無需修改 */
.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 1rem 0;
  flex-shrink: 0;
}
.selector-title {
  margin: 0;
  font-size: 1.2rem;
  color: #ccc;
}
.editor-button {
  background: #555;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}
.editor-button:hover {
  background: #666;
}
.selector-compact {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  flex-grow: 1;
  padding: 0 0.5rem;
}

.talent-card {
  border: 1px solid #333;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #242424;
  border-width: 2px;
}

.talent-card:hover {
  transform: translateY(-2px);
}

.talent-card.selected {
  box-shadow: 0 0 12px rgba(255, 200, 120, 0.5);
}

.talent-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1rem;
}

.talent-card p {
  font-size: 0.8em;
  color: #aaa;
  line-height: 1.5;
  margin: 0;
}

.talent-card.tier-1 {
  border-color: #444;
}
.talent-card.tier-1:hover {
  border-color: #666;
}
.talent-card.tier-1 h3 {
  color: #ccc;
}
.talent-card.tier-1.selected {
  border-color: #aaa;
}


.talent-card.tier-2 {
  border-color: #4A90E2;
}
.talent-card.tier-2:hover {
  border-color: #62a3f5;
}
.talent-card.tier-2 h3 {
  color: #8cb4ff;
}
.talent-card.tier-2.selected {
  border-color: #8cb4ff;
  background-color: #2a3a4a;
}

.talent-card.tier-3 {
  border-color: #ffc878;
  background: radial-gradient(ellipse at center, #3a342a 0%, #242424 70%);
}
.talent-card.tier-3:hover {
  border-color: #ffd898;
}
.talent-card.tier-3 h3 {
  color: #ffc878;
  text-shadow: 0 0 5px rgba(255, 200, 120, 0.4);
}
.talent-card.tier-3.selected {
  border-color: #ffd898;
  background: radial-gradient(ellipse at center, #4a443a 0%, #242424 70%);
}


.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-shrink: 0;
}

.button-group button {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
}

.button-group button:disabled {
  background-color: #333;
  cursor: not-allowed;
}

.button-group button:first-of-type {
    background-color: #4A90E2;
}

.button-group button:last-of-type {
    background-color: #5a9e5d;
}
</style>