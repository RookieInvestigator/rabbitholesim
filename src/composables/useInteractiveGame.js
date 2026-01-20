import { ref } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useEventCenter } from '@/composables/eventCenter';
import { v4 as uuidv4 } from 'uuid';

// ✨ 用于无事发生时，伪装成选项的系统指令
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

    // 清空上一回合的选项
    currentManualChoices.value = []; 
    player.nextTurn();

    // ✨ 核心修正：在回合更新后，玩家可能因状态结算而“死亡”。
    // 如果“死亡”，则立刻停止，让 GameView 中的 watch 来处理结束流程。
    if (!player.isAlive) return;

    const event = findTriggerableEvent();
    
    if (event) {
      player.addLog({ message: { title: event.title, text: event.text }, type: 'event' });
      
      let choicesToShow = (event.choices || []).filter(c => {
        return !c.conditions || c.conditions.every(isConditionMet);
      });

      choicesToShow.sort(() => 0.5 - Math.random());
      
      if (choicesToShow.length > 3) {

        choicesToShow = choicesToShow.slice(0, 3);
      }
      
      currentManualChoices.value = choicesToShow.map(c => ({ 
        ...c, 
        uuid: uuidv4(),
        parentEventId: event.id
      }));

      // 如果事件没有有效选项，则提供“时间流逝”选项
      if (currentManualChoices.value.length === 0) {
        player.addLog({ message: '> 你感到一阵迷茫，不知何去何从。', type: 'system' });
        currentManualChoices.value = [TIME_PASSES_CHOICE];
      }
    } else {
      // 如果找不到任何可触发事件，也提供“时间流逝”选项
      player.addLog({ message: '你静静地思索着，没有什么特别的事情发生。', type: 'system' });
      currentManualChoices.value = [TIME_PASSES_CHOICE];
    }
  };

  const handleChoiceSelected = (choice) => {
    // 如果是系统生成的“时间流逝”选项，则直接进入下一回合
    if (choice.isSystemChoice) {
      nextTurn();
      return;
    }
    
    // --- 以下是选择处理逻辑 ---
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
      player.applyOutcomes(finalResult.outcomes);
      if (finalResult.feedback) player.addLog({ message: finalResult.feedback, type: 'feedback' });
    }

    // ✨ 核心修改：处理完结果后，如果玩家存活，立刻进入下一回合
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
