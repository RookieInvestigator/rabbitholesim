import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { v4 as uuidv4 } from 'uuid';
import tagData from '@/data/tags.json';

const { tags: characterTagDefs, gated_event_tags } = tagData;
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

  function findEventById(eventId) {
    return allEvents.find(event => event.id === eventId) || null;
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
        if (params.has) return player.tags.includes(params.has);
        if (params.has_not) return !player.tags.includes(params.has_not);
        return false;

      default: return true;
    }
  }

  function getPlayerUnlockedEventTags() {
    const unlocked = new Set();
    const playerCharTags = player.tags;
    if (playerCharTags && characterTagDefs) {
      characterTagDefs.forEach(def => {
        if (playerCharTags.includes(def.id) && def.unlocks_event_tags) {
          def.unlocks_event_tags.forEach(tag => unlocked.add(tag));
        }
      });
    }
    return unlocked;
  }

  function isEventAvailable(event, playerUnlockedEventTags) {
    if (event.isUnique && player.triggeredEventIds.has(event.id)) return false;
    if (event.requiresUnlock && !player.unlockedEventIds.has(event.id)) return false;

    const eventTags = event.tags || [];
    const relevantGatedTags = eventTags.filter(t => gated_event_tags.includes(t));
    
    if (relevantGatedTags.length > 0) {
      const hasAccess = relevantGatedTags.some(gatedTag => playerUnlockedEventTags.has(gatedTag));
      if (!hasAccess) {
        return false;
      }
    }
    
    return !event.conditions || event.conditions.every(isConditionMet);
  }
  
  function findTriggerableEvent() {
    const playerUnlockedEventTags = getPlayerUnlockedEventTags();
    const available = allEvents.filter(event => {
      if (event.tags && event.tags.includes('meta')) return false;
      return isEventAvailable(event, playerUnlockedEventTags);
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
    } else {
      player.addLog({ message: '> 你感到一阵迷茫，不知何去何从。', type: 'system' });
    }
  }

  function getManualChoices(count = 3) {
    const finalChoices = [];
    const playerUnlockedEventTags = getPlayerUnlockedEventTags();
    
    const availableEvents = allEvents.filter(event => isEventAvailable(event, playerUnlockedEventTags));

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
        
        if (choice.isSpecial && choiceConditionsMet) {
          specialChoices.push(choiceWithMeta);
        } else if (!choice.isSpecial && choiceConditionsMet) {
          normalChoices.push(choiceWithMeta);
        }
      });
    });

    if (specialChoices.length > 0 && Math.random() < 0.8) {
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

  return { isLoading, loadEvents, findEventById, findTriggerableEvent, processEvent, getManualChoices, isConditionMet };
}