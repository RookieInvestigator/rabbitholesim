// src/composables/useConditionChecker.js

/**
 * @description 一个可复用的条件检查器
 */
export function useConditionChecker() {
  
  /**
   * @description 检查单个条件是否满足
   * @param {object} condition - 要检查的条件对象
   * @param {object} playerState - 玩家状态对象 (来自 playerStore)
   * @returns {boolean}
   */
  function isConditionMet(condition, playerState) {
    if (!condition || !condition.type || !condition.params) return true;

    const { type, params } = condition;
    switch(type) {
      case 'stat_check':
        const value = playerState[params.stat];
        if (value === undefined) return false;
        switch (params.operator) {
          case '>=': return value >= params.value;
          case '<=': return value <= params.value;
          case '===': return value === params.value;
          case '>': return value > params.value;
          case '<': return value < params.value;
          default: return false;
        }
       case 'worldview_check':
         if (!playerState.dominantWorldview) {
           console.warn('worldview_check 需要传递完整的 store 实例以访问 dominantWorldview getter');
           return false;
         }
         return playerState.dominantWorldview === params.dominant;
      case 'status_check':
        if (params.has) return playerState.statusEffects.some(e => e.id === params.has);
        if (params.has_not) return !playerState.statusEffects.some(e => e.id === params.has_not);
        return false;
      case 'event_check':
        if (params.has_triggered) return playerState.triggeredEventIds.has(params.has_triggered);
        if (params.has_not_triggered) return !playerState.triggeredEventIds.has(params.has_not_triggered);
        return false;
      case 'inventory_check':
        if (params.has) return playerState.inventory.includes(params.has);
        if (params.has_not) return !playerState.inventory.includes(params.has_not);
        return false;
      case 'made_choice_check': 
        return playerState.madeChoices.has(params.choiceId);
      case 'talent_check':
        if (params.has) return playerState.talents.some(t => t.id === params.has);
        if (params.has_not) return !playerState.talents.some(t => t.id === params.has_not);
        return false;
      case 'tag_check':
        if (params.has) return playerState.tags.includes(params.has);
        if (params.has_not) return !playerState.tags.includes(params.has_not);
        return false;
      case 'ending_id': // ✨ 新增：用于成就检查
        return playerState.deathReason === params.is;
      default: return true;
    }
  }

  /**
   * @description 检查一组条件是否全部满足
   * @param {Array<object>} conditions - 要检查的条件对象数组
   * @param {object} playerState - 玩家状态对象
   * @returns {boolean}
   */
  function areConditionsMet(conditions, playerState) {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    return conditions.every(condition => isConditionMet(condition, playerState));
  }

  return { isConditionMet, areConditionsMet };
}
