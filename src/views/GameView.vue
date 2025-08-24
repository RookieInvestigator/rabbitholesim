<script setup>
import { ref, watch, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventEngine } from '@/composables/useEventEngine';
import { useGameLoop } from '@/composables/useGameLoop';
import { v4 as uuidv4 } from 'uuid';

import WorldviewDisplay from '@/components/WorldviewDisplay.vue';
import EventLog from '@/components/EventLog.vue';
import TalentSelector from '@/components/TalentSelector.vue';
import GameOverScreen from '@/components/GameOverScreen.vue';
import ChoiceDisplay from '@/components/ChoiceDisplay.vue';
import EditorView from './EditorView.vue';

const player = usePlayerStore();
const { isLoading, loadEvents, findTriggerableEvent, getManualChoices, isConditionMet } = useEventEngine();
const { start: startSimulation, stop: stopSimulation } = useGameLoop();

const gameState = ref('talent');
const gameMode = ref('interactive');
const currentManualChoices = ref([]);

onMounted(loadEvents);

function nextTurn() {
  if (!player.isAlive) return;
  player.nextTurn();
  if (gameMode.value === 'interactive') {
    currentManualChoices.value = []; // 清空选项，等待新事件
    const event = findTriggerableEvent();
    
    if (event) {
      player.addLog({ message: { title: event.title, text: event.text }, type: 'event' });
      
      let choicesToShow = (event.choices || []).filter(c => {
        if (!c.conditions || c.conditions.length === 0) {
          return true;
        }
        return c.conditions.every(isConditionMet);
      });
      
      if (choicesToShow.length > 3) {
        choicesToShow.sort(() => 0.5 - Math.random());
        choicesToShow = choicesToShow.slice(0, 3);
      }
      
      currentManualChoices.value = choicesToShow.map(c => ({ 
        ...c, 
        uuid: uuidv4(),
        parentEventId: event.id
      }));
    } else {
      player.addLog({ message: '你静静地思索着，没有什么特别的事情发生。', type: 'system' });
      setTimeout(nextTurn, 1000);
    }
  }
}

function handleChoiceSelected(choice) {
  if (!player.isAlive) return;
  
  if (choice.parentEventId) {
    player.triggeredEventIds.add(choice.parentEventId);
  }

  // --- 新增: 方案二 ---
  // 如果选项本身有ID，则记录下来
  if (choice.id) {
    player.madeChoices.add(choice.id);
  }
  
  player.addLog({ message: `> ${choice.text}`, type: 'choice' });

  let finalResult = null;
  if (choice.results && choice.results.length > 0) {
    const weights = choice.results.map(r => r.weight || 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomTarget = Math.random() * totalWeight;
    for (let i = 0; i < choice.results.length; i++) {
      randomTarget -= weights[i];
      if (randomTarget <= 0) { finalResult = choice.results[i]; break; }
    }
    if (!finalResult) finalResult = choice.results[choice.results.length - 1];
  } else {
    finalResult = { feedback: choice.feedback, outcomes: choice.outcomes };
  }

  if (finalResult) {
    player.applyOutcomes(finalResult.outcomes);
    if (finalResult.feedback) player.addLog({ message: finalResult.feedback, type: 'feedback' });
  }

  setTimeout(nextTurn, 1200);
}

function startGame(pickedTalents, mode) {
  gameMode.value = mode;
  player.initializeWithTalents(pickedTalents);
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
function showEditor() {
  gameState.value = 'editor';
}
function hideEditor() {
  gameState.value = 'talent';
}
watch(() => player.isAlive, (isAlive) => {
  if (!isAlive && gameState.value === 'playing') {
    stopSimulation();
    gameState.value = 'game_over';
  }
});
</script>

<template>
  <div v-if="isLoading">正在加载事件库...</div>

  <TalentSelector v-else-if="gameState === 'talent'" @start="startGame" @open-editor="showEditor" />
  
  <div v-else-if="gameState === 'playing'" class="game-grid-container">
    <div class="stat-area"><WorldviewDisplay /></div>
    <div class="log-area"><EventLog /></div>
    <div class="choice-area">
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
.game-grid-container {
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