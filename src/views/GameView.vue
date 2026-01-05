<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventCenter } from '@/composables/eventCenter';
import { useDataCenter } from '@/composables/dataCenter';
import { useGameLoop } from '@/composables/useGameLoop';
import { useInteractiveGame } from '@/composables/useInteractiveGame';
import { v4 as uuidv4 } from 'uuid';

import WorldviewDisplay from '@/components/WorldviewDisplay.vue';
import EventLog from '@/components/EventLog.vue';
import TalentSelector from '@/components/TalentSelector.vue';
import GameOverScreen from '@/components/GameOverScreen.vue';
import ChoiceDisplay from '@/components/ChoiceDisplay.vue';
import EditorView from './EditorView.vue';

defineEmits(['back']);

const player = usePlayerStore();
const { findEventById } = useEventCenter();
const { loadAllData } = useDataCenter();
const { start: startSimulation, stop: stopSimulation } = useGameLoop();
const { currentManualChoices, nextTurn, handleChoiceSelected } = useInteractiveGame();

const gameState = ref('talent');
const gameMode = ref('interactive');
const loadedCustomStats = ref([]);
const logContainer = ref(null);

// --- 滾動邏輯 ---
const scrollToBottom = async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
};

watch(() => player.log, scrollToBottom, { deep: true, flush: 'post' });

onMounted(async () => {
  const stats = await loadAllData();
  loadedCustomStats.value = stats;
  scrollToBottom();
});

function startGame(pickedTalents, mode) {
  gameMode.value = mode;
  player.initializeWithTalents(pickedTalents, loadedCustomStats.value);
  if (gameMode.value === 'simulation') {
    startSimulation(player);
  } else {
    nextTurn();
  }
  gameState.value = 'playing';
}

function restartGame() {
  stopSimulation();
  gameState.value = 'talent';
}

function showEditor() { gameState.value = 'editor'; }
function hideEditor() { gameState.value = 'talent'; }

watch([() => player.isAlive, () => player.endingTriggered], ([isAlive, endingTriggered]) => {
  if (gameState.value !== 'playing') return;
  if (endingTriggered) {
    gameState.value = 'game_over';
  } else if (!isAlive) {
    stopSimulation();
    const endEvent = findEventById('meta_end_of_exploration');
    if (endEvent) {
      player.addLog({ message: { title: endEvent.title, text: endEvent.text }, type: 'event' });
      currentManualChoices.value = endEvent.choices.map(c => ({
        ...c,
        uuid: uuidv4()
      }));
    } else {
      gameState.value = 'game_over';
    }
  }
});
</script>

<template>
  <div class="terminal-frame">
    <div class="layout-grid" v-if="gameState === 'playing'">
      
      <section class="module monitor-section">
        <header class="wing-head">
          <span>MONITOR</span>
          <button class="exit-link" @click="$emit('back')">EXIT</button>
        </header>
        <div class="content-zone">
          <WorldviewDisplay />
        </div>
      </section>

      <main class="module log-section">
        <header class="wing-head">LOG_STREAM</header>
        <div class="log-container-fixed" ref="logContainer">
          <EventLog />
        </div>
      </main>

      <section class="module command-section">
        <header class="wing-head">COMMAND_INPUT</header>
        <div class="choice-scroll-lock">
          <ChoiceDisplay 
            v-if="gameMode === 'interactive' && currentManualChoices.length > 0"
            :choices="currentManualChoices"
            @choice-selected="handleChoiceSelected"
          />
          <div v-else class="status-msg">WAITING_FOR_RESPONSE...</div>
        </div>
      </section>

    </div>

    <TalentSelector v-if="gameState === 'talent'" @start="startGame" @back="$emit('back')" />
    <GameOverScreen v-else-if="gameState === 'game_over'" @restart="restartGame" />
    <EditorView v-else-if="gameState === 'editor'" @back="hideEditor" />
  </div>
</template>

<style scoped>
/* 全面採用思源黑體與硬核終端美學 */
.terminal-frame {
  height: 100vh;
  background: #000;
  color: #fff;
  overflow: hidden;
  font-family: "Source Han Sans SC", "Source Han Sans TC", sans-serif;
}

/* 核心響應式網格 */
.layout-grid {
  display: grid;
  height: 100%;
}

/* PC 版佈局：380px 左欄，其餘右欄 */
@media (min-width: 769px) {
  .layout-grid {
    grid-template-columns: 380px 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "monitor log"
      "command log";
  }
}

/* 手機版佈局：指令區置底，日誌居中伸展 */
@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
      "monitor"
      "log"
      "command";
  }
}

/* 區域指定 */
.monitor-section { grid-area: monitor; border-right: 1px solid #111; border-bottom: 1px solid #111; }
.log-section { grid-area: log; overflow: hidden; display: flex; flex-direction: column; }
.command-section { grid-area: command; border-right: 1px solid #111; display: flex; flex-direction: column; }

/* 手機版邊框修正 */
@media (max-width: 768px) {
  .monitor-section { border-right: none; }
  .command-section { border-right: none; border-top: 1px solid #111; }
  .log-section { border-bottom: 1px solid #111; }
}

/* 模組內容樣式 */
.module {
  background: #000;
}

.wing-head {
  height: 28px;
  background: #080808;
  border-bottom: 1px solid #111;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: #333;
  letter-spacing: 2px;
}

.content-zone {
  padding: 1rem;
}

.choice-scroll-lock {
  padding: 1rem;
  overflow: hidden; /* 強制選項區域不滾動 */
}

/* 日誌捲動區域 */
.log-container-fixed {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #222 #000;
}

.log-container-fixed::-webkit-scrollbar { width: 2px; }
.log-container-fixed::-webkit-scrollbar-thumb { background: #222; }

.status-msg {
  color: #1a1a1a;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 1rem;
}

.exit-link { background: transparent; border: none; color: #333; cursor: pointer; font-size: 0.6rem; }
.exit-link:hover { color: #833; }
</style>