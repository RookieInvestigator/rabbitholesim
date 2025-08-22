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
  
  // ✨ 步驟一：新增一個狀態，用來記錄死亡原因的關鍵字
  deathReason: null, 

  statMultipliers: {}, 
  statusEffects: [],
  inventory: [],
  triggeredEventIds: new Set(),
  unlockedEventIds: new Set(),
  log: [],
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
      this.addLog({ message: '...系統重置 // 探索重開...', type: 'system' });
    },
    
    initializeWithTalents(talents) {
      this.reset();
      this.addLog({ message: `你帶著天賦 [${talents.map(t => t.name).join(', ')}] 進入了兔子洞。`, type: 'system' });
      
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
      // ... (此函數內容保持不變)
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
        }
      });
    },

    nextTurn() {
      if (!this.isAlive) return;
      this.turn++; 

      const isInDebt = this.statusEffects.some(e => e.id === 'in_debt');
      if (this.money < 0 && !isInDebt) {
        this.statusEffects.push({ id: 'in_debt', duration: 9999 });
        this.addLog({ message: '你的財務狀況急轉直下，你陷入了負債。', type: 'feedback' });
      } 
      else if (this.money >= 0 && isInDebt) {
        this.statusEffects = this.statusEffects.filter(e => e.id !== 'in_debt');
        this.addLog({ message: '你還清了所有欠款，終於鬆了一口氣。', type: 'feedback' });
      }

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
      
      if (this.health <= 0) this.endGame('health', '你的心脏已不足以支撑身体。');
      if (this.sanity <= 0) this.endGame('sanity', '你的精神完整性已彻底崩溃。');
      if (this.money < -2000) this.endGame('debt', '你被巨额的债务彻底压垮，在绝望中结束了这一切。');
    },

    endGame(reasonKey, logMessage) {
      if (!this.isAlive) return;
      this.isAlive = false;
      this.deathReason = reasonKey; 
      this.addLog({ message: `【探索结束】${logMessage}`, type: 'ending' });
    }
  },
})