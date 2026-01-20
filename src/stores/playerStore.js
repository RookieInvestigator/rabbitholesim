import { defineStore } from 'pinia';
import { useAchievementStore } from './achievementStore';
import allStatusEffects from '@/data/status_effects.json';

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

//事件进度
  primitivism: 0,

  deathReason: null,
  endingTriggered: false,

  statMultipliers: {},
  statusEffects: [],
  inventory: [],
  talents: [],
  triggeredEventIds: new Set(),
  unlockedEventIds: new Set(),
  tags: [], // 储存玩家的永久状态Tag
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
    reset(customStats = []) {
      Object.assign(this, getInitialState());

      // ✨ 新增：初始化来自DLC的自定义数值
      customStats.forEach(stat => {
        this[stat.id] = stat.initialValue;
      });

      this.addLog({ message: '...系统重置 // 探索重开...', type: 'system' });
    },
    
    initializeWithTalents(talents, customStats = []) {
      this.reset(customStats);
      this.talents = talents;
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
      const achievementStore = useAchievementStore();

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
            if (!this.inventory.includes(outcome.params.itemId)) {
                this.inventory.push(outcome.params.itemId);
            }
            break;
          case 'remove_item':
             const index = this.inventory.indexOf(outcome.params.itemId);
             if (index > -1) {
                this.inventory.splice(index, 1);
             }
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

          case 'add_tag':
            if (outcome.params.tag) {
              if (!this.tags.includes(outcome.params.tag)) {
                this.tags.push(outcome.params.tag);
              }
            }
            break;
          
          case 'remove_tag':
            if (outcome.params.tag) {
              const tagIndex = this.tags.indexOf(outcome.params.tag);
              if (tagIndex > -1) {
                this.tags.splice(tagIndex, 1);
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
            this.triggerEnding(outcome.params.endingId, '你的探索迎来了终局...');
            break;
            
          case 'reset_event':
            if (outcome.params.eventId) {
              this.triggeredEventIds.delete(outcome.params.eventId);
            }
            break;
          
          case 'unlock_achievement':
            if (outcome.params.achievementId) {
              achievementStore.unlockAchievement(outcome.params.achievementId);
            }
            break;
        }
      });
    },

    // ✨ 新增：专门处理因数值归零导致的“死亡”
    handleStatDeath(reasonKey, logMessage) {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.deathReason = reasonKey;
        this.addLog({ message: `【探索中断】${logMessage}`, type: 'ending' });
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
      
      // ✨ 修改：调用新的 handleStatDeath
      if (this.health <= 0) {
        this.handleStatDeath('health', '你的心脏已不足以支撑身体。');
      } else if (this.sanity <= 0) {
        this.handleStatDeath('sanity', '你的精神完整性已彻底崩溃。');
      } else if (this.money < -5000) {
        this.handleStatDeath('debt', '你被巨额的债务彻底压垮，在绝望中结束了这一切。');
      } else if (this.fame > 100) {
        this.handleStatDeath('fame_death', '你变得过于出名，一举一动都活在聚光灯下，失去了探索的自由。');
      } else if (this.anonymity < 0) {
        this.handleStatDeath('anonymity_death', '你的身份被彻底曝光，来自现实的压力让你无法再继续探索。');
      }
    },

    // ✨ 修改：原 endGame 重命名为 triggerEnding，专门用于触发结局画面
    triggerEnding(reasonKey, logMessage) {
      if (!this.isAlive) {
        // 如果玩家已经“死亡”，现在就正式触发结局
        // 关键修正：不覆盖已有的stat death reason
        if (!this.deathReason) {
            this.deathReason = reasonKey;
        }
        this.endingTriggered = true;
        // this.addLog({ message: `【最终报告】${logMessage}`, type: 'ending' });
      } else {
        // 如果玩家还“活着”，那么这是一个直接的叙事性结局
        this.isAlive = false;
        this.deathReason = reasonKey;
        this.endingTriggered = true;
        this.addLog({ message: `【探索结束】${logMessage}`, type: 'ending' });
      }
    }
  },
})