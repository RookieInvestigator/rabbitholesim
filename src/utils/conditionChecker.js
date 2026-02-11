export function createConditionChecker(getPlayerStore) {
  function isConditionMet(condition) {
    if (!condition || !condition.type || !condition.params) return true;
    const player = getPlayerStore();
    if (!player) return false;

    const { type, params } = condition;
    switch(type) {
      case 'stat_check':
        const value = player[params.stat];
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
        return player.dominantWorldview === params.dominant;
      case 'status_check':
        if (params.has) return player.statusEffects?.some(e => e.id === params.has);
        if (params.has_not) return !player.statusEffects?.some(e => e.id === params.has_not);
        return false;
      case 'event_check':
        if (params.has_triggered) return player.triggeredEventIds?.has(params.has_triggered);
        if (params.has_not_triggered) return !player.triggeredEventIds?.has(params.has_not_triggered);
        return false;
      case 'inventory_check':
        if (params.has) return player.inventory?.includes(params.has);
        if (params.has_not) return !player.inventory?.includes(params.has_not);
        return false;
      case 'made_choice_check':
        return player.madeChoices?.has(params.choiceId);
      case 'talent_check':
        if (params.has) return player.talents?.some(t => t.id === params.has);
        if (params.has_not) return !player.talents?.some(t => t.id === params.has_not);
        return false;
      case 'tag_check':
        if (params.has) return player.tags?.includes(params.has);
        if (params.has_not) return !player.tags?.includes(params.has_not);
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
            case '===': return numValue === params.value;
            case '>': return numValue > params.value;
            case '<': return numValue < params.value;
            case '!==': return numValue !== params.value;
            default: return !!value;
          }
        }
        return false;
      default: return true;
    }
  }

  function areConditionsMet(conditions) {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every(isConditionMet);
  }

  return { isConditionMet, areConditionsMet };
}
