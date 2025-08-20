import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';

let allEvents = []; // 緩存事件數據

export function useEventEngine() {
  const player = usePlayerStore();
  const isLoading = ref(true);

  // 載入所有事件數據 (此函數不變)
  async function loadEvents() {
    if (allEvents.length > 0) {
      isLoading.value = false;
      return;
    }
    const modules = import.meta.glob('../data/events/*.json');
    const promises = Object.values(modules).map(loader => loader());
    const loadedModules = await Promise.all(promises);
    allEvents = loadedModules.flatMap(module => module.default);
    isLoading.value = false;
  }

  // 檢查單個條件是否滿足 (此函數不變)
  function isConditionMet(condition) {
    const { type, params } = condition;
    switch(type) {
      case 'stat_check':
        const value = player[params.stat];
        switch (params.operator) {
          case '>=': return value >= params.value;
          case '<=': return value <= params.value;
          case '==': return value == params.value;
          default: return false;
        }
      case 'worldview_check':
        return player.dominantWorldview === params.dominant;
      default: return true;
    }
  }

  // 尋找一個可觸發的事件 (此函數不變)
  function findTriggerableEvent() {
    const available = allEvents.filter(event => {
      if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
      if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;
      return !event.conditions || event.conditions.every(isConditionMet);
    });
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }
  
  // ✨ 核心修改：makeChoice 函數的邏輯替換 ✨
  function makeChoice(choices) {
    const CHAOS_FACTOR = 40;
    
    const validChoices = choices.filter(c => !c.conditions || c.conditions.every(isConditionMet));
    if (validChoices.length === 0) return null;

    // 第一步：計算每個選項的最終得分 (包含信念引力和混沌因子)
    // 確保分數都是正數，避免後續計算出問題
    const scores = validChoices.map(choice => {
      const worldviewForce = (player[choice.worldview] || 0) * (choice.magnitude || 1);
      const randomImpulse = Math.random() * CHAOS_FACTOR;
      return Math.max(0.1, worldviewForce + randomImpulse); // 最低為0.1，避免完全無權重
    });

    // 第二步：計算總權重
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    // 第三步：生成一個在總權重範圍內的隨機數
    let randomTarget = Math.random() * totalScore;

    // 第四步：輪盤選擇算法
    for (let i = 0; i < validChoices.length; i++) {
      randomTarget -= scores[i];
      if (randomTarget <= 0) {
        return validChoices[i]; // 當隨機數被減至0時，返回當前選項
      }
    }
    
    // 作為保險，如果循環結束仍未返回，則返回最後一個選項
    return validChoices[validChoices.length - 1];
  }
  
  // 處理單個事件的完整流程 (此函數不變)
  function processEvent(event) {
    player.addLog({ message: `【 ${player.age.toFixed(1)} 歲】${event.text}`, type: 'event' });
    player.triggeredEventIds.add(event.id);

    const choice = makeChoice(event.choices);
    if (choice) {
      player.addLog({ message: `> ${choice.text}`, type: 'choice' });
      player.applyOutcomes(choice.outcomes);
      if (choice.feedback) player.addLog({ message: choice.feedback, type: 'feedback' });
    } else {
      player.addLog({ message: '> 你感到一陣迷茫，不知何去何從。', type: 'system' });
    }
  }

  return { isLoading, loadEvents, findTriggerableEvent, processEvent };
}