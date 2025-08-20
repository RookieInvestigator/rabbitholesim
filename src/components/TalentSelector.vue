<script setup>
import { ref, onMounted } from 'vue';
import allTalents from '@/data/talents.json';

const emit = defineEmits(['start']);

const availableTalents = ref([]);
const selectedTalents = ref([]);
const maxSelection = 3;

// 在組件掛載時，從所有天賦中隨機選出10個
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

function confirmSelection() {
  if (selectedTalents.value.length === maxSelection) {
    emit('start', selectedTalents.value);
  }
}
</script>

<template>
  <div class="selector">
    <h2>選擇初始天賦 ({{ selectedTalents.length }}/{{ maxSelection }})</h2>
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
    <button @click="confirmSelection" :disabled="selectedTalents.length !== maxSelection">
      進入兔子洞
    </button>
  </div>
</template>

<style scoped>
.selector { text-align: center; background: #1e1e1e; padding: 2rem; border-radius: 8px; border: 1px solid #333; }
.talent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  text-align: left;
}
.talent-card {
  border: 1px solid #333;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #242424;
}
.talent-card:hover {
  border-color: #4A90E2;
  transform: translateY(-4px);
}
.talent-card.selected {
  border-color: #ffc878;
  background-color: #3a342a;
}
.talent-card h3 { margin: 0 0 0.5rem; color: #ffc878; }
.talent-card p { font-size: 0.9em; color: #aaa; line-height: 1.6; margin: 0; }
button { padding: 1rem 2rem; font-size: 1.2rem; }
button:disabled { background-color: #333; cursor: not-allowed; }
</style>