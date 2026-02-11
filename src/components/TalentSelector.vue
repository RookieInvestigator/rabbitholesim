<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDataCenter } from '@/composables/dataCenter';
import { conflicts as tagConflicts } from '@/data/tags.json';

const emit = defineEmits(['start', 'back']);
const { gameData } = useDataCenter();

const availableTalents = ref([]);
const selectedTalents = ref([]);
const maxSelection = 3;

const getTalentTags = (talent) => {
  return (talent.effects || [])
    .filter(effect => effect.type === 'add_tag')
    .map(effect => effect.params.tag);
};

const allSelectedTags = computed(() => {
  return selectedTalents.value.flatMap(getTalentTags);
});

const conflictingGroup = computed(() => {
  const tags = allSelectedTags.value;
  for (const group of tagConflicts) {
    const intersection = tags.filter(tag => group.includes(tag));
    const uniqueIntersection = new Set(intersection);
    if (uniqueIntersection.size > 1) {
      return Array.from(uniqueIntersection);
    }
  }
  return null;
});

const isTalentDisabled = (talent) => {
  if (isSelected(talent)) return false;
  if (selectedTalents.value.length >= maxSelection) return true;
  const talentTags = getTalentTags(talent);
  if (talentTags.length === 0) return false;
  const currentSelectedTags = allSelectedTags.value;
  for (const tag of talentTags) {
    const conflictGroup = tagConflicts.find(group => group.includes(tag));
    if (!conflictGroup) continue;
    const opposingTagSelected = conflictGroup.some(opposingTag => {
      return tag !== opposingTag && currentSelectedTags.includes(opposingTag);
    });
    if (opposingTagSelected) return true;
  }
  return false;
};

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
  if (isTalentDisabled(talent) && !isSelected(talent)) return;
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
  if (selectedTalents.value.length === maxSelection && !conflictingGroup.value) {
    emit('start', selectedTalents.value, mode);
  }
}
</script>

<template>
  <div class="selector-container">
    <header class="header">
      <div class="header-left">
        <h2 class="title">天赋选择
            <div class="subtitle">
              <span :class="{ 'text-highlight': selectedTalents.length === maxSelection && !conflictingGroup, 'text-danger': conflictingGroup }">
                [{{ selectedTalents.length }}/{{ maxSelection }}] {{ conflictingGroup ? `冲突: ${conflictingGroup.join(', ')}` : '' }}
              </span>
           </div>
        </h2>

      </div>
      <div class="header-right">
        <button @click="drawTalents" class="btn-link sm">REROLL</button>
        <button @click="$emit('back')" class="btn-link sm">ABORT</button>
      </div>
    </header>

    <main class="grid-wrapper">
      <div class="talent-grid">
        <div
          v-for="talent in availableTalents"
          :key="talent.id"
          class="card"
          :class="[
            isSelected(talent) ? 'selected' : '',
            isTalentDisabled(talent) ? 'disabled' : '',
            `tier-${talent.tier || 1}`
          ]"
          @click="toggleTalent(talent)"
        >
          <div class="card-content">
            <h3 class="name">{{ talent.name }}</h3>
            <p class="desc">{{ talent.description }}</p>
          </div>
          <div class="selected-mark" v-if="isSelected(talent)"></div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <button
        class="btn-main"
        @click="confirmSelection('interactive')"
        :disabled="selectedTalents.length !== maxSelection || conflictingGroup"
      >
        > 手动探索
      </button>
      <button
        class="btn-link"
        @click="confirmSelection('simulation')"
        :disabled="selectedTalents.length !== maxSelection || conflictingGroup"
      >
        > 自动模拟
      </button>
    </footer>
  </div>
</template>

<style scoped>
.selector-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-image:
    radial-gradient(circle at 50% 30%, rgba(20, 20, 30, 0.4) 0%, rgba(0, 0, 0, 1) 70%),
    repeating-linear-gradient(transparent 0, transparent 2px, rgba(255, 255, 255, 0.02) 3px);
  background-size: 100% 100%, 100% 4px;
}

.header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.title {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
  color: var(--text-primary);
}

.title .subtitle {
  display: inline-block;
  font-size: 1.2rem;
  color: var(--text-dim);
  font-weight: 400;
  letter-spacing: 1px;
}

.text-highlight {
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
  transition: all 0.3s ease;
}

.text-danger {
  color: var(--danger);
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
  font-weight: 700;
}

.card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--border-light) !important;
  background: rgba(10, 10, 10, 0.4) !important;
  box-shadow: none !important;
  animation: none !important;
}

.card.disabled .name,
.card.disabled .desc {
  color: var(--text-dim) !important;
  text-shadow: none !important;
}

.grid-wrapper {
  flex: 1;
  min-height: 0;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: minmax(160px, auto);
  gap: 1.5rem;
  width: 100%;
}

.card {
  position: relative;
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid var(--border-light);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.desc {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.tier-1:hover {
  border-color: #888;
  background: rgba(255,255,255,0.05);
}

.tier-1.selected {
  border-color: var(--text-primary);
  background: rgba(255,255,255,0.1);
  box-shadow: 0 0 15px rgba(255,255,255,0.15);
}

.tier-1.selected .name {
  color: var(--text-primary);
  text-shadow: 0 0 5px rgba(255,255,255,0.5);
}

.tier-2 {
  border-color: rgba(0, 200, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.2);
}

.tier-2 .name {
  color: #5dade2;
}

.tier-2:hover {
  border-color: #00c3ff;
  background: rgba(0, 195, 255, 0.05);
  box-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
}

.tier-2.selected {
  border-color: #00c3ff;
  background: rgba(0, 195, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.4);
}

.tier-2.selected .name {
  color: var(--text-primary);
  text-shadow: 0 0 8px #00c3ff;
}

.tier-3 {
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.tier-3 .name {
  color: #f1c40f;
}

.tier-3:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.tier-3.selected {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
  animation: pulse-gold 2s infinite;
}

.tier-3.selected .name {
  color: var(--text-primary);
  text-shadow: 0 0 10px #ffd700;
}

@keyframes pulse-gold {
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
}

.selected-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: var(--text-primary);
  border-radius: 50%;
}

.card.selected .desc {
  color: var(--text-secondary);
}

.footer {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-main {
  flex: 2;
  background: var(--text-primary);
  color: var(--bg-color);
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(255,255,255,0.3);
}

.btn-main:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-link {
  flex: 1;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border-light);
  padding: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-link:hover:not(:disabled) {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.btn-link.sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  flex: initial;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .grid-wrapper {
    padding: 1rem;
  }

  .footer {
    padding: 1rem;
  }

  .talent-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
}
</style>
