import { defineStore } from 'pinia'

const getInitialState = () => ({
  // ... 其他基礎屬性 ...
  isAlive: true,
  age: 0,
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
  exposure: 0,
  
  // ✨ 新增：用於存放所有屬性獲取倍率的對象
  statMultipliers: {}, 

  // ... 其他進程屬性 ...
  statusEffects: [],
  inventory: [],
  triggeredEventIds: new Set(),
  unlockedEventIds: new Set(),
  log: [],
});

export const usePlayerStore = defineStore('player', {
  state: getInitialState,

  getters: {
    // ... dominantWorldview getter 不變 ...
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
      this.addLog({ message: '...系統重置 // 人生重開...', type: 'system' });
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
      this.log.unshift({ id: Date.now() + Math.random(), message, type });
      if (this.log.length > 50) this.log.pop();
    },

    applyOutcomes(outcomes) {
      if (!outcomes) return;
      outcomes.forEach(outcome => {
        switch (outcome.type) {
          case 'change_stat':
            for (const stat in outcome.params) {
              if (this[stat] !== undefined) {
                // ✨ 核心修改：在增加屬性值前，先乘以倍率
                const baseValue = outcome.params[stat];
                const multiplier = this.statMultipliers[stat] || 1; // 如果沒有倍率，則默認為 1
                const finalValue = Math.round(baseValue * multiplier);
                this[stat] += finalValue;
              }
            }
            break;
          
          // ✨ 新增：處理 add_multiplier 效果類型
          case 'add_multiplier':
            const { stat, value } = outcome.params;
            if (this[stat] !== undefined) {
              // 如果還沒有這個屬性的倍率，先初始化為 1
              if (!this.statMultipliers[stat]) {
                this.statMultipliers[stat] = 1;
              }
              // 將新的倍率乘上去
              this.statMultipliers[stat] *= value;
            }
            break;
            
          case 'add_item':
            this.inventory.push(outcome.params.itemId);
            break;
          case 'unlocksEvent':
            this.unlockedEventIds.add(outcome.params.eventId);
            break;
        }
      });
    },

    async nextTurn() {
      if (!this.isAlive) return;
      this.turn++;
      this.age += 0.5;

      // 基礎衰減
      if (this.age > 30) this.health -= 0.1;
      if (this.age > 20) this.sanity -= 0.05;

      // ✨ --- 負債邏輯開始 --- ✨
      const isInDebt = this.statusEffects.some(e => e.id === 'in_debt');
      if (this.money < 0 && !isInDebt) {
        this.statusEffects.push({ id: 'in_debt', duration: 9999 });
        this.addLog({ message: '你的財務狀況急轉直下，你陷入了負債。', type: 'feedback' });
      } 
      // 如果錢大於等於0且當前有負債狀態，則移除負債狀態
      else if (this.money >= 0 && isInDebt) {
        this.statusEffects = this.statusEffects.filter(e => e.id !== 'in_debt');
        this.addLog({ message: '你還清了所有欠款，終於鬆了一口氣。', type: 'feedback' });
      }
      // ✨ --- 負債邏輯結束 --- ✨

      // 狀態效果結算
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
      
      // 檢查死亡條件
      if (this.health <= 0) this.endGame('你的身體機能已耗盡。');
      if (this.sanity <= 0) this.endGame('你的精神完整性已徹底崩潰。');
      if (this.age > 100) this.endGame('生命走到了自然的終點。');
      // 新增：長期負債導致的特殊死亡
      if (this.money < -20000) this.endGame('你被巨額的債務徹底壓垮，在絕望中結束了這一切。');
    },

    endGame(reason) {
      if (!this.isAlive) return;
      this.isAlive = false;
      this.addLog({ message: `【模擬結束】${reason}`, type: 'ending' });
    }
  },
})