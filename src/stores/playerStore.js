import { defineStore } from 'pinia'

const getInitialState = () => ({
  isAlive: true,
  // age: 0, // <-- 移除 age
  health: 100,
  sanity: 100,
  money: 500,
  turn: 0, // <-- turn 成為核心進度
  logic: 10,
  gnosis: 0,
  weirdness: 0,
  irony: 5,
  fame: 0,
  anonymity: 100,
  
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
      if (!outcomes) return;
      outcomes.forEach(outcome => {
        // ... applyOutcomes 的內部邏輯保持不變 ...
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

    async nextTurn() {
      if (!this.isAlive) return;
      this.turn++; 

      // --- 負債邏輯 (不變) ---
      const isInDebt = this.statusEffects.some(e => e.id === 'in_debt');
      if (this.money < 0 && !isInDebt) {
        this.statusEffects.push({ id: 'in_debt', duration: 9999 });
        this.addLog({ message: '你的財務狀況急轉直下，你陷入了負債。', type: 'feedback' });
      } 
      else if (this.money >= 0 && isInDebt) {
        this.statusEffects = this.statusEffects.filter(e => e.id !== 'in_debt');
        this.addLog({ message: '你還清了所有欠款，終於鬆了一口氣。', type: 'feedback' });
      }

      // --- 狀態效果結算 (不變) ---
      if (this.statusEffects.length > 0) {
        const allStatusEffects = (await import('@/data/status_effects.json')).default;
        this.statusEffects.forEach(effect => {
          const effectData = allStatusEffects[effect.id];
          if (effectData && effectData.outcomes) {
            this.applyOutcomes(effectData.outcomes);
          }
          effect.duration--;
        });
        this.statusEffects = this.statusEffects.filter(effect => effect.duration > 0);
      }
      
      // --- 檢查死亡條件 (移除年齡相關) ---
      if (this.health <= 0) this.endGame('你的身體機能已耗盡。');
      if (this.sanity <= 0) this.endGame('你的精神完整性已徹底崩潰。');
      if (this.money < -2000) this.endGame('你被巨額的債務徹底壓垮，在絕望中結束了這一切。');
    },

    endGame(reason) {
      if (!this.isAlive) return;
      this.isAlive = false;
      this.addLog({ message: `【探索結束】${reason}`, type: 'ending' });
    }
  },
})