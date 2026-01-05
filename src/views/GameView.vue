<script setup>
import { ref, watch, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventCenter } from '@/composables/eventCenter';
import { useDataCenter } from '@/composables/dataCenter';
import { useGameLoop } from '@/composables/useGameLoop';
import { useInteractiveGame } from '@/composables/useInteractiveGame'; // ✨ 1. 导入新的手动模式引擎
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
// ✨ 2. 使用新的手动模式引擎，并获取其状态和方法
const { currentManualChoices, nextTurn, handleChoiceSelected } = useInteractiveGame();

const gameState = ref('talent');
const gameMode = ref('interactive');
const loadedCustomStats = ref([]);

onMounted(async () => {
  const stats = await loadAllData();
  loadedCustomStats.value = stats;
});

// ✨ 3. startGame 现在调用从 useInteractiveGame 获取的 nextTurn
function startGame(pickedTalents, mode) {
  console.log('--- DEBUG: Starting game with mode:', mode, '---');
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

function showGameOverScreen() {
    gameState.value = 'game_over';
}

function showEditor() {
  gameState.value = 'editor';
}
function hideEditor() {
  gameState.value = 'talent';
}

watch([() => player.isAlive, () => player.endingTriggered], ([isAlive, endingTriggered]) => {
  if (gameState.value !== 'playing') return;

  if (endingTriggered) {
    // 结局已正式触发，直接跳转到结束画面
    gameState.value = 'game_over';
  } else if (!isAlive) {
    // 玩家刚刚“死亡”，但结局报告尚未查看
    stopSimulation();
    const endEvent = findEventById('meta_end_of_exploration');
    if (endEvent) {
      player.addLog({ message: { title: endEvent.title, text: endEvent.text }, type: 'event' });
      // 当玩家死亡或结局触发时，显示最终报告选项
      currentManualChoices.value = endEvent.choices.map(c => ({
        ...c,
        uuid: uuidv4()
      }));
    } else {
        // 如果找不到 meta 事件，作为后备方案直接结束
        gameState.value = 'game_over';
    }
  }
});
</script>

<template>
  <TalentSelector v-if="gameState === 'talent'" @start="startGame" @open-editor="showEditor" />
  
  <div v-else-if="gameState === 'playing'" class="game-grid-container">
    <button class="back-to-menu" @click="$emit('back')">返回菜单</button>
    <div class="stat-area"><WorldviewDisplay /></div>
    <div class="log-area"><EventLog /></div>
    <div class="choice-area">
      <!-- ✨ 4. 模板直接绑定从 useInteractiveGame 获取的状态和方法 -->
      <ChoiceDisplay 
        v-if="gameMode === 'interactive' && currentManualChoices.length > 0"
        :choices="currentManualChoices"
        @choice-selected="handleChoiceSelected"
      />
    </div>
  </div>

  <GameOverScreen v-else-if="gameState === 'game_over'" @restart="restartGame" />

  <EditorView v-else-if="gameState === 'editor'" @back="hideEditor" />
</template>

<style scoped>
.back-to-menu {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid #555;
  color: #ccc;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
.back-to-menu:hover {
  background: #c7a5ff;
  color: #1a1a1a;
}

.game-grid-container {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  gap: 1rem;
}

.stat-area, .log-area, .choice-area {
  min-width: 0;
}

.log-area {
  min-height: 0;
}

.log-area > :first-child {
  height: 100%;
}

@media (min-width: 992px) {
  .game-grid-container {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    grid-template-rows: auto 1fr;
    gap: 1.5rem;
    height: 100%;
  }
  .stat-area { grid-column: 1 / 2; grid-row: 1 / 2; }
  .choice-area { grid-column: 1 / 2; grid-row: 2 / 3; overflow-y: auto; overflow-x: hidden; min-height: 0; }
  .log-area { grid-column: 2 / 3; grid-row: 1 / 3; }
}
</style>