import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { v4 as uuidv4 } from 'uuid';

let allEvents = [];

export function useEventEngine() {
  const player = usePlayerStore();
  const isLoading = ref(true);

  async function loadEvents() {
    if (allEvents.length > 0) { isLoading.value = false; return; }
    const modules = import.meta.glob('../data/events/*.json');
    const promises = Object.values(modules).map(loader => loader());
    const loadedModules = await Promise.all(promises);
    allEvents = loadedModules.flatMap(module => module.default);
    isLoading.value = false;
  }

  function isConditionMet(condition) {
    const { type, params } = condition;
    switch(type) {
      case 'stat_check':
        const value = player[params.stat];
        if (value === undefined) return false;
        switch (params.operator) {
          case '>=': return value >= params.value;
          case '<=': return value <= params.value;
          case '==': return value == params.value;
          case '>': return value > params.value;
          case '<': return value < params.value;
          default: return false;
        }
      case 'worldview_check':
        return player.dominantWorldview === params.dominant;
      case 'status_check':
        if (params.has) return player.statusEffects.some(e => e.id === params.has);
        if (params.has_not) return !player.statusEffects.some(e => e.id === params.has_not);
        return false;
      case 'event_check':
        if (params.has_triggered) {
          return player.triggeredEventIds.has(params.has_triggered);
        }
        if (params.has_not_triggered) {
          return !player.triggeredEventIds.has(params.has_not_triggered);
        }
        return false;
      default: return true;
    }
  }
  
  // ... findTriggerableEvent, makeChoice, processEvent 函數保持不變 ...
  function findTriggerableEvent() {
    const available = allEvents.filter(event => {
      if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
      if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;
      return !event.conditions || event.conditions.every(isConditionMet);
    });
    if (available.length === 0) return null;
    const weights = available.map(event => Math.max(0.1, event.priority || 1));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomTarget = Math.random() * totalWeight;
    for (let i = 0; i < available.length; i++) {
      randomTarget -= weights[i];
      if (randomTarget <= 0) return available[i];
    }
    return available[available.length - 1];
  }
  function makeChoice(choices) {
    const validChoices = (choices || []).filter(c => !c.conditions || c.conditions.every(isConditionMet));
    if (validChoices.length === 0) return null;
    const scores = validChoices.map(choice => {
      const worldviewForce = (player[choice.worldview] || 0) * (choice.magnitude || 1);
      const randomImpulse = Math.random() * 40;
      return Math.max(0.1, worldviewForce + randomImpulse);
    });
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    let randomTarget = Math.random() * totalScore;
    for (let i = 0; i < validChoices.length; i++) {
      randomTarget -= scores[i];
      if (randomTarget <= 0) return validChoices[i];
    }
    return validChoices[validChoices.length - 1];
  }
  function processEvent(event) {
    player.addLog({ message: { title: event.title, text: event.text }, type: 'event' });
    player.triggeredEventIds.add(event.id);
    const choice = makeChoice(event.choices);
    if (choice) {
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
    } else {
      player.addLog({ message: '> 你感到一陣迷茫，不知何去何從。', type: 'system' });
    }
  }

  // ✨ 核心修改：全新的“智能選項”生成函數 ✨
  function getManualChoices(count = 3) {
    const finalChoices = [];
    
    // 1. 找出所有可觸發的事件
    const availableEvents = allEvents.filter(event => {
      if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
      if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;
      return !event.conditions || event.conditions.every(isConditionMet);
    });

    if (availableEvents.length === 0) return [];

    // 2. 遍歷所有事件，分離出“特殊選項”和“常規選項”
    const specialChoices = [];
    const normalChoices = [];

    availableEvents.forEach(event => {
      (event.choices || []).forEach(choice => {
        const choiceWithMeta = {
          ...choice,
          parentEvent: { id: event.id, title: event.title, text: event.text },
        };
        
        // 檢查選項自身是否有觸發條件
        const choiceConditionsMet = !choice.conditions || choice.conditions.every(isConditionMet);
        
        if (choice.isSpecial && choiceConditionsMet) {
          specialChoices.push(choiceWithMeta);
        } else if (!choice.isSpecial && choiceConditionsMet) {
          normalChoices.push(choiceWithMeta);
        }
      });
    });

    // 3. 處理特殊選項：如果存在，則有極大概率(80%)選取一個
    if (specialChoices.length > 0 && Math.random() < 0.8) {
      const selectedSpecial = specialChoices[Math.floor(Math.random() * specialChoices.length)];
      finalChoices.push(selectedSpecial);
    }

    // 4. 用“傾向加權隨機”填充剩餘的選項
    if (normalChoices.length > 0) {
      while (finalChoices.length < count) {
        // 計算所有常規選項的權重
        const weights = normalChoices.map(choice => {
          // 基礎權重 + 玩家傾向加成
          const baseWeight = 10;
          const tendencyBonus = player[choice.worldview] || 0;
          return Math.max(1, baseWeight + tendencyBonus * (choice.magnitude || 1));
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        if (totalWeight === 0) break; // 避免死循環

        let randomTarget = Math.random() * totalWeight;

        for (let i = 0; i < normalChoices.length; i++) {
          randomTarget -= weights[i];
          if (randomTarget <= 0) {
            finalChoices.push(normalChoices[i]);
            normalChoices.splice(i, 1); // 從池中移除，避免重複選取
            break;
          }
        }
      }
    }
    
    // 5. 為最終選項添加唯一 ID
    return finalChoices.map(c => ({ ...c, uuid: uuidv4() }));
  }

  return { isLoading, loadEvents, findTriggerableEvent, processEvent, getManualChoices, isConditionMet };
}