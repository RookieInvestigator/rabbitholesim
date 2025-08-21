<script setup>
import { ref, computed, onMounted } from 'vue';
import allStatusEffects from '@/data/status_effects.json';

// --- 資料結構定義 ---
const getNewEvent = () => ({ id: '', title: '', text: '', isUnique: false, requiresUnlock: false, priority: 1, conditions: [], choices: [] });
const getNewCondition = () => ({ type: 'stat_check', params: { stat: 'turn', operator: '>=', value: 0 } });
const getNewChoice = () => ({ text: '', worldview: 'logic', magnitude: 1, results: [getNewResult()] }); // 預設帶有一個結果
const getNewResult = () => ({ weight: 1, feedback: '', outcomes: [] });
const getNewOutcome = () => ({ type: 'change_stat', params: { stat: 'sanity', value: 0, eventId: '', itemId: '' } });

const event = ref(getNewEvent());
const allEvents = ref([]);
const selectedEventToLoad = ref(null);

onMounted(async () => {
    const modules = import.meta.glob('../data/events/*.json');
    const promises = Object.values(modules).map(loader => loader());
    const loadedModules = await Promise.all(promises);
    allEvents.value = loadedModules.flatMap(m => m.default).sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
});

function loadSelectedEvent() {
    if (!selectedEventToLoad.value) return;
    const eventToLoad = JSON.parse(JSON.stringify(selectedEventToLoad.value));
    
    // 兼容舊結構並轉換
    eventToLoad.choices.forEach(choice => {
        // 如果是舊結構，將其轉換為新的 results 結構
        if (choice.outcomes && !choice.results) {
            choice.results = [{
                weight: 1,
                feedback: choice.feedback || '',
                outcomes: choice.outcomes
            }];
            delete choice.outcomes;
            delete choice.feedback;
        }

        if (choice.results) {
            choice.results.forEach(result => {
                if (!result.outcomes) result.outcomes = [];
                result.outcomes.forEach(outcome => {
                    const oldParams = outcome.params;
                    outcome.params = { stat: '', value: 0, eventId: '', itemId: '' };
                    if (['change_stat', 'set_stat', 'add_multiplier'].includes(outcome.type)) {
                        const key = Object.keys(oldParams)[0];
                        outcome.params.stat = key;
                        outcome.params.value = oldParams[key];
                    } else if (outcome.type === 'unlocksEvent') {
                        outcome.params.eventId = oldParams.eventId;
                    } else if (outcome.type === 'add_item') {
                        outcome.params.itemId = oldParams.itemId;
                    }
                });
            });
        }
    });

    if (eventToLoad.conditions) {
        eventToLoad.conditions.forEach(cond => {
            if (cond.type === 'status_check') {
                if (cond.params.has) {
                    cond.params.operator = 'has';
                    cond.params.statusId = cond.params.has;
                } else if (cond.params.has_not) {
                    cond.params.operator = 'has_not';
                    cond.params.statusId = cond.params.has_not;
                }
            }
        });
    }

    event.value = { ...getNewEvent(), ...eventToLoad };
}

const playerStats = ['turn', 'health', 'sanity', 'money', 'logic', 'gnosis', 'weirdness', 'irony', 'fame', 'anonymity'];
const statOperators = ['>=', '<=', '==', '>', '<'];
const worldviews = ['logic', 'gnosis', 'weirdness', 'irony'];
const outcomeTypes = ['change_stat', 'unlocksEvent', 'add_item', 'set_stat', 'add_multiplier'];
const conditionTypes = ['stat_check', 'status_check', 'worldview_check'];
const statusEffectIds = Object.keys(allStatusEffects);

const addCondition = () => event.value.conditions.push(getNewCondition());
const removeCondition = (index) => event.value.conditions.splice(index, 1);
const addChoice = () => event.value.choices.push(getNewChoice());
const removeChoice = (index) => event.value.choices.splice(index, 1);
const addResult = (choice) => choice.results.push(getNewResult());
const removeResult = (choice, index) => choice.results.splice(index, 1);
const addOutcome = (result) => {
    if(!result.outcomes) result.outcomes = [];
    result.outcomes.push(getNewOutcome());
}
const removeOutcome = (result, index) => result.outcomes.splice(index, 1);

const generatedJson = computed(() => {
    const cleanEvent = JSON.parse(JSON.stringify(event.value));
    
    if (!cleanEvent.title) delete cleanEvent.title;
    if (cleanEvent.conditions && cleanEvent.conditions.length === 0) delete cleanEvent.conditions;
    if (!cleanEvent.isUnique) delete cleanEvent.isUnique;
    if (!cleanEvent.requiresUnlock) delete cleanEvent.requiresUnlock;
    if (cleanEvent.priority === 1) delete cleanEvent.priority;

    if(cleanEvent.conditions) {
        cleanEvent.conditions.forEach(cond => {
            if (cond.type === 'status_check') {
                const op = cond.params.operator;
                const id = cond.params.statusId;
                cond.params = {};
                if (op && id) {
                    cond.params[op] = id;
                }
            }
        });
    }
  
    cleanEvent.choices.forEach(choice => {
        if (!choice.results || choice.results.length === 0) {
           delete choice.results;
           return;
        }

        // 如果只有一个结果且权重为1，则简化为旧结构
        if (choice.results.length === 1 && choice.results[0].weight === 1) {
            choice.feedback = choice.results[0].feedback;
            choice.outcomes = choice.results[0].outcomes;
            delete choice.results;

            if (!choice.feedback) delete choice.feedback;
            if (!choice.outcomes || choice.outcomes.length === 0) {
                delete choice.outcomes;
            } else {
                 choice.outcomes.forEach(outcome => {
                    // ... (outcomes cleaning logic)
                 });
            }

        } else {
            choice.results.forEach(result => {
                if (!result.feedback) delete result.feedback;
                if (!result.outcomes || result.outcomes.length === 0) {
                    delete result.outcomes;
                } else {
                    result.outcomes.forEach(outcome => {
                        const { type, params } = outcome;
                        let newParams = {};
                        if (['change_stat', 'set_stat', 'add_multiplier'].includes(type) && params.stat) {
                            newParams[params.stat] = Number(params.value);
                        } else if (type === 'unlocksEvent' && params.eventId) {
                            newParams.eventId = params.eventId;
                        } else if (type === 'add_item' && params.itemId) {
                            newParams.itemId = params.itemId;
                        }
                        outcome.params = newParams;
                    });
                }
            });
        }
    });

    return JSON.stringify(cleanEvent, null, 2);
});

function resetForm() {
    selectedEventToLoad.value = null;
    event.value = getNewEvent();
}
</script>

<template>
  <div class="editor-container">
    <div class="form-panel">
      <div class="card">
        <h3>载入/编辑事件</h3>
        <div class="loader-group">
          <select v-model="selectedEventToLoad">
            <option :value="null" disabled>-- 请选择一个事件 --</option>
            <option v-for="evt in allEvents" :key="evt.id" :value="evt">{{ evt.title || evt.id }}</option>
          </select>
          <button @click="loadSelectedEvent" :disabled="!selectedEventToLoad">载入</button>
        </div>
      </div>

      <div class="card">
        <h3>基本资讯</h3>
        <div class="form-group"><label>事件 ID</label><input type="text" v-model="event.id"></div>
        <div class="form-group"><label>事件标题</label><input type="text" v-model="event.title"></div>
        <div class="form-group"><label>事件文本</label><textarea v-model="event.text"></textarea></div>
        <div class="form-group"><label>优先級</label><input type="number" v-model.number="event.priority"></div>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="event.isUnique">是否唯一</label>
          <label><input type="checkbox" v-model="event.requiresUnlock">是否需解锁</label>
        </div>
      </div>
      
      <div class="card">
        <h3>触发条件</h3>
        <div v-for="(condition, index) in event.conditions" :key="index" class="condition-item">
          <select v-model="condition.type" class="type-select"><option v-for="type in conditionTypes" :key="type" :value="type">{{ type }}</option></select>
          <div v-if="condition.type === 'stat_check'" class="param-group">
            <select v-model="condition.params.stat"><option v-for="stat in playerStats" :key="stat" :value="stat">{{ stat }}</option></select>
            <select v-model="condition.params.operator"><option v-for="op in statOperators" :key="op" :value="op">{{ op }}</option></select>
            <input type="number" v-model.number="condition.params.value">
          </div>
          <div v-if="condition.type === 'status_check'" class="param-group">
            <select v-model="condition.params.operator"><option value="has">拥有</option><option value="has_not">没有</option></select>
            <select v-model="condition.params.statusId"><option v-for="id in statusEffectIds" :key="id" :value="id">{{ id }}</option></select>
          </div>
          <button @click="removeCondition(index)" class="btn-remove">X</button>
        </div>
        <button @click="addCondition" class="btn-add">+ 添加条件</button>
      </div>

      <div class="card choice-card" v-for="(choice, cIndex) in event.choices" :key="cIndex">
          <h3>选项 {{ cIndex + 1 }} <button @click="removeChoice(cIndex)" class="btn-remove btn-remove-choice">移除选项</button></h3>
          <div class="form-group"><label>选项文本</label><textarea v-model="choice.text"></textarea></div>
          <div class="inline-group">
            <div class="form-group"><label>世界观</label><select v-model="choice.worldview"><option v-for="wv in worldviews" :key="wv" :value="wv">{{ wv }}</option></select></div>
            <div class="form-group"><label>程度</label><input type="number" v-model.number="choice.magnitude"></div>
          </div>
          
          <div class="results-section">
              <h4>可能的随机结果 (Results)</h4>
              <div v-for="(result, rIndex) in choice.results" :key="rIndex" class="result-item">
                  <div class="result-header">
                    <h5>结果 {{ rIndex + 1 }}</h5>
                    <div class="form-group weight-group">
                        <label>权重</label>
                        <input type="number" v-model.number="result.weight">
                    </div>
                    <button @click="removeResult(choice, rIndex)" class="btn-remove">移除此结果</button>
                  </div>
                  <div class="form-group"><label>回馈文本</label><textarea v-model="result.feedback"></textarea></div>
                  <div class="outcomes-section">
                      <h6>结果效果 (Outcomes)</h6>
                      <div v-for="(outcome, oIndex) in result.outcomes" :key="oIndex" class="outcome-item">
                          <select v-model="outcome.type"><option v-for="type in outcomeTypes" :key="type" :value="type">{{ type }}</option></select>
                          <div v-if="['change_stat', 'set_stat', 'add_multiplier'].includes(outcome.type)" class="param-group">
                              <select v-model="outcome.params.stat"><option disabled value="">属性</option><option v-for="stat in playerStats" :key="stat" :value="stat">{{ stat }}</option></select>
                              <input type="number" v-model.number="outcome.params.value" placeholder="值">
                          </div>
                          <div v-if="outcome.type === 'unlocksEvent'" class="param-group"><input type="text" v-model="outcome.params.eventId" placeholder="事件ID"></div>
                          <div v-if="outcome.type === 'add_item'" class="param-group"><input type="text" v-model="outcome.params.itemId" placeholder="物品ID"></div>
                          <button @click="removeOutcome(result, oIndex)" class="btn-remove">X</button>
                      </div>
                      <button @click="addOutcome(result)" class="btn-add">+ 添加效果</button>
                  </div>
              </div>
              <button @click="addResult(choice)" class="btn-add">+ 添加随机结果</button>
          </div>
      </div>
      <button @click="addChoice" class="btn-add">+ 添加选项</button>
    </div>

    <div class="json-panel">
        <div class="card json-output">
            <div class="json-header"><h3>生成的 JSON</h3><button @click="resetForm" class="btn-reset">清空/新增</button></div>
            <pre>{{ generatedJson }}</pre>
        </div>
    </div>
  </div>
</template>

<style scoped>
:root { --card-padding: 1.5rem 2rem; }
.editor-container { display: flex; gap: 1.5rem; align-items: flex-start; }
.form-panel { flex: 2; display: flex; flex-direction: column; gap: 1.5rem; }
.json-panel { flex: 1; position: sticky; top: 1rem; }
.card { background: #1e1e1e; padding: var(--card-padding); border-radius: 8px; border: 1px solid #333; }
h3, h4, h5, h6 { margin-top: 0; color: #8cb4ff; }
h4 { color: #ccc; }
h5 { color: #a2c6ff; margin-bottom: 1rem; }
h6 { color: #bbb; font-size: 0.9em; margin-bottom: 0.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; color: #aaa; margin-bottom: 0.5rem; font-size: 0.9em; }
input, textarea, select { width: 100%; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; padding: 0.5rem 0.75rem; color: #e0e0e0; font-size: 1rem; box-sizing: border-box; }
textarea { min-height: 60px; resize: vertical; }
.inline-group { display: flex; gap: 1rem; }
.checkbox-group { display: flex; gap: 1.5rem; color: #ccc; }
.btn-add, .btn-remove, .btn-reset, .loader-group button { border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s; }
.btn-add { background-color: #4A90E2; color: white; margin-top: 0.5rem; }
.btn-remove { background-color: #c94e4e; color: white; padding: 0.2rem 0.6rem; font-size: 0.8rem; }
.btn-reset { background-color: #888; color: white; }
.condition-item { display: flex; gap: 0.75rem; align-items: center; background: #252525; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.5rem; }
.condition-item .type-select { flex-shrink: 0; width: 150px; }
.outcomes-section { border-top: 1px solid #333; margin-top: 1.5rem; padding-top: 1rem; }
.outcome-item { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
.param-group { display: flex; gap: 0.5rem; flex-grow: 1; }
.json-panel pre { background: #121212; padding: 1rem; border-radius: 4px; white-space: pre-wrap; word-break: break-all; max-height: 75vh; overflow-y: auto; }
.loader-group { display: flex; gap: 1rem; }
.loader-group select { flex-grow: 1; }
.loader-group button { background-color: #5a9e5d; color: white; }
.loader-group button:disabled { background-color: #444; }
.json-header { display: flex; justify-content: space-between; align-items: center; }
.results-section { background: #252525; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
.result-item { background: #1e1e1e; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; border: 1px solid #333; }
.result-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 0.75rem; margin-bottom: 1rem; }
.weight-group { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; }
.weight-group input { width: 70px; }
</style>