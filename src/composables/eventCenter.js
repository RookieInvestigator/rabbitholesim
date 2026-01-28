// src/composables/eventCenter.js
import { usePlayerStore } from '@/stores/playerStore';
import { useDataCenter } from '@/composables/dataCenter';
import { useDevConfig } from '@/composables/devConfig';
import { v4 as uuidv4 } from 'uuid';
import tagData from '@/data/tags.json';
import { getConflictingTags, choiceAddsConflictingTag } from '@/utils/tagUtils';
import { parseText } from '@/utils/textParser';

const { gated_event_tags } = tagData;

/**
 * @description 这是全新的事件处理中心！
 * 所有事件相关的逻辑都在这里。
 */
export function useEventCenter() {
  const player = usePlayerStore();
  const { gameData } = useDataCenter();
  const { showTestEvents } = useDevConfig();

  const allEvents = gameData.events;

  /**
   * @description 按ID查找特定事件
   * @param {string} eventId - 要查找的事件ID
   * @returns {object|null}
   */
  function findEventById(eventId) {
    return allEvents.find(event => event.id === eventId) || null;
  }

  /**
   * @description 检查单个条件是否满足
   * @param {object} condition - 要检查的条件对象
   * @returns {boolean}
   */
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
        if (params.has_triggered) return player.triggeredEventIds.has(params.has_triggered);
        if (params.has_not_triggered) return !player.triggeredEventIds.has(params.has_not_triggered);
        return false;
      case 'inventory_check':
        if (params.has) return player.inventory.includes(params.has);
        if (params.has_not) return !player.inventory.includes(params.has_not);
        return false;
      case 'made_choice_check': 
        return player.madeChoices.has(params.choiceId);
      case 'talent_check':
        if (params.has) return player.talents.some(t => t.id === params.has);
        if (params.has_not) return !player.talents.some(t => t.id === params.has_not);
        return false;
      case 'tag_check':
        if (params.has) return player.tags && player.tags.includes(params.has);
        if (params.has_not) return !player.tags || !player.tags.includes(params.has_not);
        return false;
      case 'variable_check':
        if (params.key) {
          const value = player.variables?.[params.key];
          if (value === undefined) {
            if (params.exists !== undefined) {
              return !params.exists;
            }
            return false;
          }
          const numValue = Number(value);
          switch (params.operator) {
            case '>=': return numValue >= params.value;
            case '<=': return numValue <= params.value;
            case '==': return numValue == params.value;
            case '>': return numValue > params.value;
            case '<': return numValue < params.value;
            case '!=': return numValue != params.value;
            default: return !!value;
          }
        }
        return false;
      default: return true;
    }
  }
  
  /**
   * @description 查找一个当前可以触发的事件
   * @returns {object|null}
   */
  function findTriggerableEvent() {
    const available = allEvents.filter(event => {
      if (event.tags && event.tags.includes('meta')) return false;
      if (!showTestEvents.value && event.tags && event.tags.includes('test')) return false;
      if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
      if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;
      return !event.conditions || event.conditions.every(isConditionMet);
    });

    if (available.length === 0) return null;

    const weights = available.map(event => {
      let finalWeight = Math.max(0.1, event.priority || 1);
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
          if (player.tagProbabilityModifiers[tag]) {
            finalWeight *= player.tagProbabilityModifiers[tag];
          }
        });
      }
      player.eventModifiers.forEach(modifier => {
        if (modifier.eventId === event.id) {
          finalWeight *= modifier.multiplier;
        }
      });
      return Math.max(0, finalWeight);
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) return null;

    let randomTarget = Math.random() * totalWeight;
    for (let i = 0; i < available.length; i++) {
      randomTarget -= weights[i];
      if (randomTarget <= 0) return available[i];
    }
    
    return available[available.length - 1];
  }

  /**
   * @description 根据玩家倾向性与随机性，从选项中自动选择一个
   * @param {Array<object>} choices - 事件的选项数组
   * @returns {object|null}
   */
  function makeChoice(choices) {
    const validChoices = (choices || []).filter(c => {
      if (c.conditions && !c.conditions.every(isConditionMet)) return false;
      if (choiceAddsConflictingTag(c, player.tags)) return false;
      return true;
    });
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

  /**
   * @description 处理一个完整的事件流程
   * @param {object} event - 要处理的事件对象
   */
  function processEvent(event) {
    const title = parseText(event.title, { player });
    const text = parseText(event.text, { player });
    player.addLog({ message: { title, text }, type: 'event' });
    player.triggeredEventIds.add(event.id);
    const choice = makeChoice(event.choices);
    if (choice) {
      if (choice.id) player.madeChoices.add(choice.id);
      const choiceText = parseText(choice.text, { player });
      player.addLog({ message: `> ${choiceText}`, type: 'choice' });
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
        if (finalResult.feedback) {
          const feedback = parseText(finalResult.feedback, { player });
          player.addLog({ message: feedback, type: 'feedback' });
        }
        player.applyOutcomes(finalResult.outcomes);
      }
    } else {
      player.addLog({ message: '> 你感到一阵迷茫，不知何去何从。', type: 'system' });
    }
  }

  /**
   * @description 手动选择模式下，获取候选项
   * @param {number} count - 需要的选项数量
   * @returns {Array<object>}
   */
   function getManualChoices(count = 3) {
     const finalChoices = [];

     const availableEvents = allEvents.filter(event => {
       if (event.tags && event.tags.includes('meta')) return false;
       if (!showTestEvents.value && event.tags && event.tags.includes('test')) return false;
       if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
       if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;
       return !event.conditions || event.conditions.every(isConditionMet);
     });

    if (availableEvents.length === 0) return [];

    const specialChoices = [];
    const normalChoices = [];

    availableEvents.forEach(event => {
      (event.choices || []).forEach(choice => {
        const choiceWithMeta = {
          ...choice,
          parentEvent: { id: event.id, title: event.title, text: event.text },
        };
        
        const choiceConditionsMet = !choice.conditions || choice.conditions.every(isConditionMet);
        const hasTagConflict = choiceAddsConflictingTag(choice, player.tags);
        
        if (hasTagConflict) return;
        
        if (choice.isSpecial && choiceConditionsMet) {
          specialChoices.push(choiceWithMeta);
        } else if (!choice.isSpecial && choiceConditionsMet) {
          normalChoices.push(choiceWithMeta);
        }
      });
    });

    if (specialChoices.length > 0 && Math.random() < 0.5) {
      const selectedSpecial = specialChoices[Math.floor(Math.random() * specialChoices.length)];
      finalChoices.push(selectedSpecial);
    }

    if (normalChoices.length > 0) {
      while (finalChoices.length < count) {
        const weights = normalChoices.map(choice => {
          const baseWeight = 10;
          const tendencyBonus = player[choice.worldview] || 0;
          return Math.max(1, baseWeight + tendencyBonus * (choice.magnitude || 1));
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        if (totalWeight === 0 || normalChoices.length === 0) break;

        let randomTarget = Math.random() * totalWeight;

        for (let i = 0; i < normalChoices.length; i++) {
          randomTarget -= weights[i];
          if (randomTarget <= 0) {
            const [selectedChoice] = normalChoices.splice(i, 1);
            finalChoices.push(selectedChoice);
            break;
          }
        }
      }
    }
    
    return finalChoices.map(c => ({ ...c, uuid: uuidv4() }));
  }

  // 返回所有可供外部使用的函数
  return { 
    findEventById,
    findTriggerableEvent, 
    processEvent, 
    getManualChoices, 
    isConditionMet 
  };
}
