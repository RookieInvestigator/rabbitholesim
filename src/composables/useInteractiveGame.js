import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventCenter } from '@/composables/eventCenter';
import { choiceAddsConflictingTag } from '@/utils/tagUtils';
import { parseText } from '@/utils/textParser';
import { v4 as uuidv4 } from 'uuid';

const TIME_PASSES_CHOICE = {
  id: 'system_time_passes',
  text: '[ 时间流逝... ]',
  isSystemChoice: true,
};

export function useInteractiveGame() {
  const player = usePlayerStore();
  const { findTriggerableEvent, isConditionMet } = useEventCenter();

  const currentManualChoices = ref([]);
  
  const nextTurn = () => {
    if (!player.isAlive) return;

    currentManualChoices.value = []; 
    player.nextTurn();

    if (!player.isAlive) return;

    const event = findTriggerableEvent();
    
    if (event) {
      const title = parseText(event.title, { player });
      const text = parseText(event.text, { player });
      player.addLog({ message: { title, text }, type: 'event' });

      let choicesToShow = (event.choices || []).filter(c => {
        if (c.isSystemChoice) return true;
        if (c.conditions && !c.conditions.every(isConditionMet)) return false;
        if (choiceAddsConflictingTag(c, player.tags)) return false;
        return true;
      });

      choicesToShow.sort(() => 0.5 - Math.random());

      if (choicesToShow.length > 3) {
        choicesToShow = choicesToShow.slice(0, 3);
      }

      currentManualChoices.value = choicesToShow.map(c => ({
        ...c,
        text: parseText(c.text, { player }),
        uuid: uuidv4(),
        parentEventId: event.id
      }));

      if (currentManualChoices.value.length === 0) {
        player.addLog({ message: '> 你感到一阵迷茫，不知何去何从。', type: 'system' });
        currentManualChoices.value = [TIME_PASSES_CHOICE];
      }
    } else {
      player.addLog({ message: '你静静地思索着，没有什么特别的事情发生。', type: 'system' });
      currentManualChoices.value = [TIME_PASSES_CHOICE];
    }
  };

  const handleChoiceSelected = (choice) => {
    if (choice.isSystemChoice) {
      nextTurn();
      return;
    }
    
    if (choice.parentEventId) player.triggeredEventIds.add(choice.parentEventId);
    if (choice.id) player.madeChoices.add(choice.id);
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
      if (finalResult.feedback) {
        const feedback = parseText(finalResult.feedback, { player });
        player.addLog({ message: feedback, type: 'feedback' });
      }
      player.applyOutcomes(finalResult.outcomes);
    }

    if (player.isAlive) {
      nextTurn();
    }
  };

  return {
    currentManualChoices,
    nextTurn,
    handleChoiceSelected,
  };
}
