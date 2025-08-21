<script setup>
import { ref, onMounted } from 'vue';
import allTalents from '@/data/talents.json';

const emit = defineEmits(['start']);

const availableTalents = ref([]);
const selectedTalents = ref([]);
const maxSelection = 3;

onMounted(() => {
  const shuffled = [...allTalents].sort(() => 0.5 - Math.random());
  availableTalents.value = shuffled.slice(0, 10);
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
</script>

<template>
  <div class="selector-compact">
    <div class="selector-header">
      <h2 class="selector-title">選擇初始天賦 ({{ selectedTalents.length }}/{{ maxSelection }})</h2>
      <button @click="emit('open-editor')" class="editor-button">事件編輯器</button>
    </div>
    
    <div class="talent-grid">
      <div
        v-for="talent in availableTalents"
        :key="talent.id"
        class="talent-card"
        :class="{ selected: isSelected(talent) }"
        @click="toggleTalent(talent)"
      >
        <h3>{{ talent.name }}</h3>
        <p>{{ talent.description }}</p>
      </div>
    </div>

    <div class="button-group">
      <button @click="confirmSelection('interactive')" :disabled="selectedTalents.length !== maxSelection">
        手動探索
      </button>
      <button @click="confirmSelection('simulation')" :disabled="selectedTalents.length !== maxSelection">
        自動模擬
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ✨ 全新的緊湊型樣式 ✨ */
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
  height: 100%; /* 佔滿可用空間 */
  padding: 0.5rem;
  box-sizing: border-box;
}

.selector-title {
  text-align: center;
  font-size: 1.2rem; /* 縮小標題字體 */
  margin: 0 0 1rem 0; /* 調整邊距 */
  flex-shrink: 0;
  color: #ccc;
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 在小螢幕上更好地適應 */
  gap: 0.75rem; /* 縮小間距 */
  overflow-y: auto; /* 讓天賦列表可以滾動 */
  flex-grow: 1;
  padding: 0 0.5rem; /* 增加一點內邊距防止貼邊 */
}

.talent-card {
  border: 1px solid #333;
  padding: 0.75rem 1rem; /* 縮小內邊距 */
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #242424;
}

.talent-card:hover {
  border-color: #4A90E2;
  transform: translateY(-2px);
}

.talent-card.selected {
  border-color: #ffc878;
  background-color: #3a342a;
  box-shadow: 0 0 10px rgba(255, 200, 120, 0.3);
}

.talent-card h3 {
  margin: 0 0 0.4rem; /* 縮小邊距 */
  color: #ffc878;
  font-size: 1rem; /* 縮小字體 */
}

.talent-card p {
  font-size: 0.8em; /* 縮小字體 */
  color: #aaa;
  line-height: 1.5;
  margin: 0;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem; /* 縮小間距 */
  margin-top: 1rem; /* 縮小邊距 */
  flex-shrink: 0;
}

.button-group button {
  padding: 0.6rem 1.5rem; /* 縮小按鈕尺寸 */
  font-size: 1rem; /* 縮小字體 */
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