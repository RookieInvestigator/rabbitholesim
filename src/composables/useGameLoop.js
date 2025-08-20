import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventEngine } from './useEventEngine';

export function useGameLoop() {
  const player = usePlayerStore();
  const { findTriggerableEvent, processEvent } = useEventEngine();
  const isRunning = ref(false);
  let gameInterval = null;

  function runTurn() {
    if (!player.isAlive) {
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

  function start() {
    if (isRunning.value) return;
    player.reset();
    isRunning.value = true;
    gameInterval = setInterval(runTurn, 800);
  }

  function stop() {
    clearInterval(gameInterval);
    isRunning.value = false;
  }

  return { isRunning, start, stop };
}