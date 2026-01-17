<script setup>
// 逻辑部分完全保持原样，神力内核稳如老狗
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
</script>

<template>
  <div class="selector-container">
    <header class="header">
      <div class="header-left">
        <h2 class="title">天赋选择       
            <div class="subtitle">
              <span :class="{ 'text-highlight': selectedTalents.length === maxSelection }">
                [{{ selectedTalents.length }}/{{ maxSelection }}]
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
            `tier-${talent.tier || 1}`
          ]"
          @click="toggleTalent(talent)"
        >
          <div class="card-content">
            <h3 class="name">{{ talent.name }}</h3>
            <p class="desc">{{ talent.description }}</p>
          </div>
          <!-- 选中标记 -->
          <div class="selected-mark" v-if="isSelected(talent)"></div>
        </div>
      </div>
    </main>

    <!-- 底部双按钮归位！ -->
    <footer class="footer">
      <button
        class="btn-main"
        @click="confirmSelection('interactive')"
        :disabled="selectedTalents.length !== maxSelection"
      >
        > 手动探索
      </button>
      <button
        class="btn-link"
        @click="confirmSelection('simulation')"
        :disabled="selectedTalents.length !== maxSelection"
      >
        > 自动模拟
      </button>
    </footer>
  </div>
</template>

<style scoped>
/* 容器风格同 StartScreen，保持统一 */
.selector-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  /* 统一背景 */
  background-image:
    radial-gradient(circle at 50% 30%, rgba(20, 20, 30, 0.4) 0%, rgba(0, 0, 0, 1) 70%),
    repeating-linear-gradient(transparent 0, transparent 2px, rgba(255, 255, 255, 0.02) 3px);
  background-size: 100% 100%, 100% 4px;
}

/* Header & Footer */
.header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
/* 修改 Header 布局，让标题和计数器完美对齐 */
.header-left {
  /* 确保左侧容器内容横向排列 */
  display: flex;
  align-items: baseline; /* 关键：基线对齐，这样文字底部会在一条线上 */
  gap: 1rem;
}

.title {
  display: flex;
  align-items: baseline; /* 让 h2 内部的文字和那个 div 也对齐 */
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
  color: #fff;
}

/* 强行修正你那个嵌套 div 的样式，让它变回行内块 */
.title .subtitle {
  display: inline-block;
  font-size: 1.2rem; /* 比标题稍微小一点 */
  color: #666;
  font-weight: 400;
  letter-spacing: 1px;
}

/* 关键信息高亮状态 */
.text-highlight {
  color: #ffffff; /* 亮蓝色，或者换成你喜欢的金色 #ffd700 */
  text-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
  transition: all 0.3s ease;
}


/* 修改 .grid-wrapper 和 .talent-grid */

.grid-wrapper {
  flex: 1;
  min-height: 0;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  scrollbar-width: none;

  /* 新增：让内部的内容垂直居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.talent-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  /* 修改：让行高自适应，但给一个更大的最小值，让卡片看起来更饱满 */
  grid-auto-rows: minmax(160px, auto);
  gap: 1.5rem;
  width: 100%; /* 确保占满宽度 */
}

/* --- 卡牌设计：黑底 + 边框色区分 --- */
.card {
  position: relative;
  background: rgba(10, 10, 10, 0.6); /* 稍微深一点的黑底 */
  border: 1px solid #333;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 0.95rem; font-weight: 700; margin: 0 0 0.5rem 0; color: #ccc;
  transition: color 0.3s;
}

.desc {
  font-size: 0.75rem; color: #666; margin: 0; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
  transition: color 0.3s;
}

/* --- 稀有度与 Hover 效果 --- */

/* T1: 普通 (白/灰) */
.tier-1:hover { border-color: #888; background: rgba(255,255,255,0.05); }
.tier-1.selected {
  border-color: #fff;
  background: rgba(255,255,255,0.1); /* 只是稍微提亮背景，不刺眼 */
  box-shadow: 0 0 15px rgba(255,255,255,0.15);
}
.tier-1.selected .name { color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.5); }

/* T2: 稀有 (冰蓝) */
.tier-2 { border-color: rgba(0, 200, 255, 0.3); 
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.2);
}
.tier-2 .name { color: #5dade2; } /* 默认也是蓝色字 */
.tier-2:hover {
  border-color: #00c3ff;
  background: rgba(0, 195, 255, 0.05);
  box-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
}
.tier-2.selected {
  border-color: #00c3ff;
  background: rgba(0, 195, 255, 0.1); /* 蓝色背景光 */
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.4); /* 蓝色外发光 */
}
.tier-2.selected .name {
  color: #fff;
  text-shadow: 0 0 8px #00c3ff; /* 蓝色字光 */
}

/* T3: 传说 (辉金) */
.tier-3 {
  border-color: rgba(255, 215, 0, 0.5); /* 默认边框更亮 */
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); /* 默认就有一点点微光 */
}
.tier-3 .name { color: #f1c40f; } /* 默认也是金色字 */
.tier-3:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}
.tier-3.selected {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1); /* 金色背景光 */
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); /* 金色外发光 */
  animation: pulse-gold 2s infinite; /* 传说级要会呼吸！ */
}
.tier-3.selected .name {
  color: #fff;
  text-shadow: 0 0 10px #ffd700; /* 金色字光 */
}

@keyframes pulse-gold {
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
}

/* 选中后的通用变化：描述文字变亮 */
.card.selected .desc { color: #bbb; }


/* --- 底部按钮 (双按钮恢复) --- */
.footer {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-main {
  flex: 2;
  background: #fff;
  color: #000;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 15px rgba(255,255,255,0.3); }
.btn-main:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-link {
  flex: 1;
  background: transparent;
  color: #888;
  border: 1px solid #333;
  padding: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-link:hover:not(:disabled) { border-color: #fff; color: #fff; }
.btn-link.sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; flex: initial; }


/* 响应式 */
@media (max-width: 768px) {
  .header { padding: 1rem; }
  .grid-wrapper { padding: 1rem; }
  .footer { padding: 1rem; }
  .talent-grid { grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
}
</style>
