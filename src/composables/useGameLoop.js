import { ref } from 'vue';
// ✨ 修改：不再直接 import playerStore
// import { usePlayerStore } from '@/stores/playerStore';
import { useEventEngine } from './useEventEngine';

export function useGameLoop() {
  // ✨ 修改：player store 現在作為參數傳入
  let player = null; 
  const { findTriggerableEvent, processEvent } = useEventEngine();
  const isRunning = ref(false);
  let gameInterval = null;

  function runTurn() {
    if (!player || !player.isAlive) {
      stop();
      return;
    }
    
    player.nextTurn();
    
    const event = findTriggerableEvent();
    if (event) {
      processEvent(event);
    } else {
      if (Math.random() < 0.2) {
        player.addLog({ message: '日子在平淡中流逝...', type: 'system' });
      }
    }
  }

  // ✨ 修改：start 函數現在接收 player store 作為參數
  function start(playerStore) {
    if (isRunning.value) return;
    player = playerStore; // 設置 player store
    // player.reset(); // reset 的操作移到 GameView 中
    isRunning.value = true;
    gameInterval = setInterval(runTurn, 800);
  }

  function stop() {
    clearInterval(gameInterval);
    isRunning.value = false;
  }

  return { isRunning, start, stop };
}