import { defineStore } from 'pinia'
import allStatusEffects from '@/data/status_effects.json'

const getInitialState = () => ({
  isAlive: true,
  health: 100,
  sanity: 100,
  money: 500,
  turn: 0,
  logic: 10,
  gnosis: 0,
  weirdness: 0,
  irony: 5,
  fame: 0,
  anonymity: 100,
  
  deathReason: null,

  statMultipliers: {},
  statusEffects: [],
  inventory: [],
  triggeredEventIds: new Set(),
  unlockedEventIds: new Set(),
  log: [],

  // --- 统一后的状态 ---
  madeChoices: new Set(), // 方案二: 记录玩家做出的选择ID
  tagProbabilityModifiers: {}, // 方案一: 储存事件标签的出现概率乘数 { tagName: multiplier }
  eventModifiers: [], // 方案三 (统一): 储存所有事件概率调整 { eventId, multiplier, duration }
});

export const usePlayerStore = defineStore('player', {
  state: getInitialState,

  getters: {
    dominantWorldview(state) {
      const worldviews = {
        logic: state.logic,
        gnosis: state.gnosis,
        weirdness: state.weirdness,
        irony: state.irony,
      };
      return Object.keys(worldviews).reduce((a, b) => worldviews[a] > worldviews[b] ? a : b);
    }
  },

  actions: {
    reset() {
      Object.assign(this, getInitialState());
      this.addLog({ message: '...系统重置 // 探索重开...', type: 'system' });
    },
    
    initializeWithTalents(talents) {
      this.reset();
      this.addLog({ message: `你带着天赋 [${talents.map(t => t.name).join(', ')}] 进入了兔子洞。`, type: 'system' });
      
      talents.forEach(talent => {
        if (talent.effects) {
          this.applyOutcomes(talent.effects);
        }
      });
    },

    addLog({ message, type = 'event' }) {
      this.log.push({ id: Date.now() + Math.random(), message, type });
      if (this.log.length > 500) this.log.shift();
    },

    applyOutcomes(outcomes) {
      if (!outcomes) return;
      outcomes.forEach(outcome => {
        switch (outcome.type) {
          case 'change_stat':
            for (const stat in outcome.params) {
              if (this[stat] !== undefined) {
                const baseValue = outcome.params[stat];
                const multiplier = this.statMultipliers[stat] || 1;
                const finalValue = Math.round(baseValue * multiplier);
                this[stat] += finalValue;
              }
            }
            break;
          case 'add_multiplier':
            const { stat, value } = outcome.params;
            if (this[stat] !== undefined) {
              if (!this.statMultipliers[stat]) {
                this.statMultipliers[stat] = 1;
              }
              this.statMultipliers[stat] *= value;
            }
            break;
          case 'add_item':
            this.inventory.push(outcome.params.itemId);
            break;
          case 'unlocksEvent':
            this.unlockedEventIds.add(outcome.params.eventId);
            break;
          case 'set_stat':
             for (const stat in outcome.params) {
              if (this[stat] !== undefined) {
                this[stat] = outcome.params[stat];
              }
            }
            break;
          case 'add_status_effect':
            if (outcome.params.statusId) {
              if (!this.statusEffects.some(e => e.id === outcome.params.statusId)) {
                this.statusEffects.push({ id: outcome.params.statusId, duration: outcome.params.duration || 9999 });
              }
            }
            break;
          
          case 'remove_status_effect':
            if (outcome.params.statusId) {
              this.statusEffects = this.statusEffects.filter(e => e.id !== outcome.params.statusId);
            }
            break;
          

          case 'change_tag_probability': 
            const { tag, multiplier: tagMultiplier } = outcome.params;
            if (!this.tagProbabilityModifiers[tag]) {
                this.tagProbabilityModifiers[tag] = 1;
            }
            this.tagProbabilityModifiers[tag] *= tagMultiplier;
            break;

          case 'add_event_modifier': 
            const { eventId, multiplier, duration } = outcome.params;
            this.eventModifiers.push({ 
              eventId, 
              multiplier, 
              duration 
            });
            break;

          case 'trigger_ending':
            this.endGame(outcome.params.endingId, '你的探索迎来了终局...');
            break;
            
          case 'reset_event':
            if (outcome.params.eventId) {
              this.triggeredEventIds.delete(outcome.params.eventId);
            }
            break;
        }
      });
    },

    nextTurn() {
      if (!this.isAlive) return;
      this.turn++;

      const isInDebt = this.statusEffects.some(e => e.id === 'in_debt');
      if (this.money < 0 && !isInDebt) {
        this.statusEffects.push({ id: 'in_debt', duration: 9999 });
        this.addLog({ message: '你的财务状况急转直下，你陷入了负债。', type: 'feedback' });
      }
      else if (this.money >= 0 && isInDebt) {
        this.statusEffects = this.statusEffects.filter(e => e.id !== 'in_debt');
        this.addLog({ message: '你还清了所有欠款，终于松了一口气。', type: 'feedback' });
      }

      // 处理 status effects
      if (this.statusEffects.length > 0) {
        this.statusEffects.forEach(effect => {
          const effectData = allStatusEffects[effect.id];
          if (effectData && effectData.outcomes) {
            this.applyOutcomes(effectData.outcomes);
          }
          effect.duration--;
        });
        this.statusEffects = this.statusEffects.filter(effect => effect.duration > 0);
      }
      
      // 处理事件概率调整的持续时间
      if (this.eventModifiers.length > 0) {
          this.eventModifiers.forEach(modifier => {
              modifier.duration--;
          });
          this.eventModifiers = this.eventModifiers.filter(modifier => modifier.duration > 0);
      }
      
      if (this.health <= 0) this.endGame('health', '你的心脏已不足以支撑身体。');
      if (this.sanity <= 0) this.endGame('sanity', '你的精神完整性已彻底崩溃。');
      if (this.money < -5000) this.endGame('debt', '你被巨额的债务彻底压垮，在绝望中结束了这一切。');
    },

    endGame(reasonKey, logMessage) {
      if (!this.isAlive) return;
      this.isAlive = false;
      this.deathReason = reasonKey;
      this.addLog({ message: `【探索结束】${logMessage}`, type: 'ending' });
    }
  },
})