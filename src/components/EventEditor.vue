<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import allStatusEffects from '@/data/status_effects.json';
import allTalents from '@/data/talents.json';

// --- 数据结构定义 ---
const getNewEvent = () => ({ id: '', title: '新事件', text: '', tags: [], isUnique: false, requiresUnlock: false, priority: 1, conditions: [], choices: [] });
const getNewCondition = () => ({ type: 'stat_check', params: { stat: 'turn', operator: '>=', value: 0 } });
const getNewChoice = () => ({ id: '', text: '', worldview: 'logic', magnitude: 1, conditions: [], results: [getNewResult()] });
const getNewResult = () => ({ weight: 1, feedback: '', outcomes: [] });
const getNewOutcome = () => ({ type: 'change_stat', params: { stat: 'sanity', value: 0, eventId: '', itemId: '', tag: '', multiplier: 1, duration: 5 } });

// --- 编辑器核心状态 ---
const currentFileName = ref('new_events.json');
const eventsInFile = ref([]);
const activeEventIndex = ref(-1);

// --- 用于加载现有事件作为参考 ---
const allEvents = ref([]);
const selectedEventToImport = ref(null);

// --- 计算属性，用于绑定表单 ---
const activeEvent = computed(() => {
  if (activeEventIndex.value >= 0 && eventsInFile.value[activeEventIndex.value]) {
    return eventsInFile.value[activeEventIndex.value];
  }
  return null;
});

const tagsAsString = computed({
  get: () => activeEvent.value?.tags ? activeEvent.value.tags.join(',') : '',
  set: (value) => {
    if (activeEvent.value) {
        if (value.trim() === '') {
            activeEvent.value.tags = [];
        } else {
            activeEvent.value.tags = value.split(',').map(tag => tag.trim());
        }
    }
  }
});

onMounted(async () => {
    const modules = import.meta.glob('../data/events/*.json');
    const promises = Object.values(modules).map(loader => loader());
    const loadedModules = await Promise.all(promises);
    allEvents.value = loadedModules.flatMap(m => m.default).sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
});

// --- 文件与事件管理函数 ---
function createNewFile() {
    if (confirm('确定要清空当前列表并新建文件吗？未导出的内容将会丢失。')) {
        eventsInFile.value = [];
        activeEventIndex.value = -1;
        currentFileName.value = 'new_events.json';
    }
}

function selectEvent(index) {
    activeEventIndex.value = index;
}

function addNewEvent() {
    const newEvent = getNewEvent();
    newEvent.id = `event_${Date.now()}`; // Assign a temporary unique ID
    eventsInFile.value.push(newEvent);
    activeEventIndex.value = eventsInFile.value.length - 1;
}

function deleteSelectedEvent() {
    if (activeEventIndex.value !== -1) {
        if (confirm(`确定要删除事件 "${activeEvent.value.title || activeEvent.value.id}" 吗？`)) {
            eventsInFile.value.splice(activeEventIndex.value, 1);
            if (activeEventIndex.value >= eventsInFile.value.length) {
                activeEventIndex.value = eventsInFile.value.length - 1;
            }
        }
    } else {
        alert('请先选择一个事件！');
    }
}

function cloneSelectedEvent() {
    if (activeEvent.value) {
        const clonedEvent = JSON.parse(JSON.stringify(activeEvent.value));
        clonedEvent.id = `${clonedEvent.id}_copy_${Date.now()}`;
        clonedEvent.title = `${clonedEvent.title} (副本)`;
        eventsInFile.value.push(clonedEvent);
        activeEventIndex.value = eventsInFile.value.length - 1;
    } else {
        alert('请先选择一个事件进行克隆！');
    }
}

function importSelectedEvent() {
    if (!selectedEventToImport.value) return;
    const eventToImport = JSON.parse(JSON.stringify(selectedEventToImport.value));
    
    // 兼容旧结构并转换
    if (!eventToImport.tags) eventToImport.tags = [];
    (eventToImport.choices || []).forEach(choice => {
        if (!choice.conditions) choice.conditions = [];
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
                    const oldParams = { ...outcome.params };
                    outcome.params = getNewOutcome().params; // Reset with all possible keys
                    
                    if (['change_stat', 'set_stat', 'add_multiplier'].includes(outcome.type)) {
                        const key = Object.keys(oldParams)[0];
                        outcome.params.stat = key;
                        outcome.params.value = oldParams[key];
                    } else if (outcome.type === 'unlocksEvent') {
                        outcome.params.eventId = oldParams.eventId;
                    } else if (outcome.type === 'add_item') {
                        outcome.params.itemId = oldParams.itemId;
                    } else {
                        Object.assign(outcome.params, oldParams);
                    }
                });
            });
        }
    });

    eventsInFile.value.push(eventToImport);
    activeEventIndex.value = eventsInFile.value.length - 1;
}


// --- 导出JSON文件 ---
function exportJsonFile() {
    if (eventsInFile.value.length === 0) {
        alert('文件中没有任何事件可以导出！');
        return;
    }
    const cleanEvents = JSON.parse(JSON.stringify(eventsInFile.value));
    
    cleanEvents.forEach(event => {
        if (!event.title) delete event.title;
        if (!event.tags || event.tags.length === 0) delete event.tags;
        if (event.conditions && event.conditions.length === 0) delete event.conditions;
        if (!event.isUnique) delete event.isUnique;
        if (!event.requiresUnlock) delete event.requiresUnlock;
        if (event.priority === 1) delete event.priority;
        (event.choices || []).forEach(choice => {
            if (!choice.id) delete choice.id;
            if (choice.conditions && choice.conditions.length === 0) delete choice.conditions;
            (choice.results || []).forEach(result => {
                if (!result.feedback) delete result.feedback;
                if (!result.outcomes || result.outcomes.length === 0) {
                    delete result.outcomes;
                } else {
                    result.outcomes.forEach(outcome => {
                        const { type, params } = outcome;
                        let newParams = {};
                        if (['change_stat', 'set_stat', 'add_multiplier'].includes(type) && params.stat) { newParams[params.stat] = Number(params.value); } 
                        else if (type === 'unlocksEvent' && params.eventId) { newParams.eventId = params.eventId; } 
                        else if (type === 'add_item' && params.itemId) { newParams.itemId = params.itemId; } 
                        else if (type === 'change_tag_probability' && params.tag && params.multiplier) { newParams.tag = params.tag; newParams.multiplier = Number(params.multiplier); } 
                        else if (type === 'add_event_modifier' && params.eventId && params.multiplier && params.duration) { newParams.eventId = params.eventId; newParams.multiplier = Number(params.multiplier); newParams.duration = Number(params.duration); }
                        outcome.params = newParams;
                    });
                }
            });
        });
    });

    const dataStr = JSON.stringify(cleanEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = currentFileName.value;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// --- 数据常量 ---
const playerStats = ['turn', 'health', 'sanity', 'money', 'logic', 'gnosis', 'weirdness', 'irony', 'fame', 'anonymity'];
const statOperators = ['>=', '<=', '==', '>', '<'];
const worldviews = ['logic', 'gnosis', 'weirdness', 'irony'];
const outcomeTypes = ['change_stat', 'set_stat', 'add_multiplier', 'unlocksEvent', 'add_item', 'add_status_effect', 'remove_status_effect', 'change_tag_probability', 'add_event_modifier'];
const conditionTypes = ['stat_check', 'status_check', 'worldview_check', 'made_choice_check'];
const statusEffectIds = Object.keys(allStatusEffects);
const talentIds = allTalents.map(t => t.id);

// --- 动态添加/删除元素的函数 ---
const addEventCondition = () => activeEvent.value.conditions.push(getNewCondition());
const removeEventCondition = (index) => activeEvent.value.conditions.splice(index, 1);
const addChoiceCondition = (choice) => {
    if (!choice.conditions) choice.conditions = [];
    choice.conditions.push(getNewCondition());
}
const removeChoiceCondition = (choice, index) => choice.conditions.splice(index, 1);
const addChoice = () => activeEvent.value.choices.push(getNewChoice());
const removeChoice = (index) => activeEvent.value.choices.splice(index, 1);
const addResult = (choice) => choice.results.push(getNewResult());
const removeResult = (choice, index) => choice.results.splice(index, 1);
const addOutcome = (result) => {
    if(!result.outcomes) result.outcomes = [];
    result.outcomes.push(getNewOutcome());
}
const removeOutcome = (result, index) => result.outcomes.splice(index, 1);

</script>

<template>
  <div class="editor-container-full">
    <div class="management-panel">
        <div class="card">
            <h3>文件管理</h3>
            <div class="form-group">
                <label>文件名</label>
                <input type="text" v-model="currentFileName">
            </div>
            <div class="button-group">
                <button @click="createNewFile" class="btn-secondary">新建文件</button>
                <button @click="exportJsonFile" class="btn-primary">导出JSON文件</button>
            </div>
        </div>
        <div class="card">
            <h3>从游戏中汇入</h3>
             <div class="loader-group">
                <select v-model="selectedEventToImport">
                    <option :value="null" disabled>-- 选择一个现有事件 --</option>
                    <option v-for="evt in allEvents" :key="evt.id" :value="evt">{{ evt.title || evt.id }}</option>
                </select>
                <button @click="importSelectedEvent" :disabled="!selectedEventToImport">汇入</button>
            </div>
        </div>
        <div class="card event-list-card">
            <h3>事件列表 ({{ eventsInFile.length }})</h3>
            <div class="event-list">
                <div 
                    v-for="(event, index) in eventsInFile" 
                    :key="event.id"
                    class="event-list-item"
                    :class="{ active: index === activeEventIndex }"
                    @click="selectEvent(index)"
                >
                    <span>{{ event.title || event.id }}</span>
                </div>
            </div>
            <div class="button-group">
                <button @click="addNewEvent" class="btn-add">+ 添加新事件</button>
                <button @click="deleteSelectedEvent" class="btn-remove">删除选中事件</button>
                <button @click="cloneSelectedEvent" class="btn-secondary">克隆选中事件</button>
            </div>
        </div>
    </div>

    <div class="form-panel">
      <div v-if="!activeEvent" class="placeholder-panel">
          <h2>事件编辑器</h2>
          <p>请从左侧列表选择一个事件进行编辑，或添加一个新事件。</p>
          <p>您也可以从现有事件中“汇入”一个作为模板。</p>
      </div>
      
      <template v-else>
        <div class="card">
            <h3>基本资讯</h3>
            <div class="form-group"><label>事件 ID</label><input type="text" v-model="activeEvent.id"></div>
            <div class="form-group"><label>事件标题</label><input type="text" v-model="activeEvent.title"></div>
            <div class="form-group"><label>事件文本</label><textarea v-model="activeEvent.text"></textarea></div>
            <div class="form-group"><label>Tags (英文, 逗号分隔)</label><input type="text" v-model="tagsAsString"></div>
            <div class="form-group"><label>优先级</label><input type="number" v-model.number="activeEvent.priority"></div>
            <div class="checkbox-group">
            <label><input type="checkbox" v-model="activeEvent.isUnique">是否唯一</label>
            <label><input type="checkbox" v-model="activeEvent.requiresUnlock">是否需解锁</label>
            </div>
        </div>
        
        <div class="card">
            <h3>事件触发条件</h3>
            <div v-for="(condition, index) in activeEvent.conditions" :key="index" class="condition-item">
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
            <div v-if="condition.type === 'made_choice_check'" class="param-group">
                <input type="text" v-model="condition.params.choiceId" placeholder="需要的选项ID">
            </div>
            <button @click="removeEventCondition(index)" class="btn-remove">X</button>
            </div>
            <button @click="addEventCondition" class="btn-add">+ 添加条件</button>
        </div>

        <div class="card choice-card" v-for="(choice, cIndex) in activeEvent.choices" :key="cIndex">
            <div class="choice-header">
                <h3>选项 {{ cIndex + 1 }}</h3>
                <div class="form-group choice-id-group">
                    <label>选项 ID</label>
                    <input type="text" v-model="choice.id" placeholder="可选, 用于依赖检查">
                </div>
                <button @click="removeChoice(cIndex)" class="btn-remove btn-remove-choice">移除选项</button>
            </div>
            <div class="form-group"><label>选项文本</label><textarea v-model="choice.text"></textarea></div>
            <div class="inline-group">
                <div class="form-group"><label>世界观</label><select v-model="choice.worldview"><option v-for="wv in worldviews" :key="wv" :value="wv">{{ wv }}</option></select></div>
                <div class="form-group"><label>程度</label><input type="number" v-model.number="choice.magnitude"></div>
            </div>
            
            <div class="sub-section">
                <h4>选项出现条件</h4>
                <div v-for="(condition, condIndex) in choice.conditions" :key="condIndex" class="condition-item">
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
                    <div v-if="condition.type === 'made_choice_check'" class="param-group">
                        <input type="text" v-model="condition.params.choiceId" placeholder="需要的选项ID">
                    </div>
                    <div v-if="condition.type === 'talent_check'" class="param-group">
                        <select v-model="condition.params.operator"><option value="has">拥有</option><option value="has_not">没有</option></select>
                        <select v-model="condition.params.talentId"><option v-for="id in talentIds" :key="id" :value="id">{{ id }}</option></select>
                    </div>
                    <button @click="removeChoiceCondition(choice, condIndex)" class="btn-remove">X</button>
                </div>
                <button @click="addChoiceCondition(choice)" class="btn-add">+ 添加选项条件</button>
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
                            <div v-if="outcome.type === 'change_tag_probability'" class="param-group">
                                <input type="text" v-model="outcome.params.tag" placeholder="Tag名称">
                                <input type="number" step="0.1" v-model.number="outcome.params.multiplier" placeholder="乘数">
                            </div>
                            <div v-if="outcome.type === 'add_event_modifier'" class="param-group">
                                <input type="text" v-model="outcome.params.eventId" placeholder="事件ID">
                                <input type="number" step="0.1" v-model.number="outcome.params.multiplier" placeholder="乘数">
                                <input type="number" v-model.number="outcome.params.duration" placeholder="持续回合">
                            </div>
                            <button @click="removeOutcome(result, oIndex)" class="btn-remove">X</button>
                        </div>
                        <button @click="addOutcome(result)" class="btn-add">+ 添加效果</button>
                    </div>
                </div>
                <button @click="addResult(choice)" class="btn-add">+ 添加随机结果</button>
            </div>
        </div>
        <button @click="addChoice" class="btn-add">+ 添加选项</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ✨ 布局紧凑化样式 ✨ */
.editor-container-full { 
    display: grid;
    grid-template-columns: 320px 1fr; /* 左栏宽度减小 */
    gap: 1rem; 
    align-items: flex-start;
    height: 100%;
    overflow: hidden;
}

.management-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    overflow: hidden;
}

.event-list-card {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.event-list {
    overflow-y: auto;
    flex-grow: 1;
    border: 1px solid #333;
    background: #121212;
    padding: 0.25rem;
    border-radius: 4px;
    margin-bottom: 0.75rem;
}
.event-list-item {
    padding: 0.5rem 0.75rem; /* 减小内边距 */
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #2a2a2a;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem; /* 减小字体 */
}
.event-list-item:hover {
    background-color: #2a2a2a;
}
.event-list-item.active {
    background-color: #4A90E2;
    color: white;
    font-weight: bold;
}

.form-panel { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; /* 减小卡片间距 */
    height: 100%;
    overflow-y: auto;
    padding-right: 0.75rem;
}

.placeholder-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100%;
    color: #666;
    border: 2px dashed #333;
    border-radius: 8px;
    padding: 2rem;
}

.card { background: #1e1e1e; padding: 0.75rem 1.25rem; border-radius: 6px; border: 1px solid #333; }
h3, h4, h5, h6 { margin-top: 0; color: #8cb4ff; }
h3 { font-size: 1.1rem; margin-bottom: 0.75rem;}
h4 { 
    color: #ccc; 
    border-bottom: 1px solid #333; 
    padding-bottom: 0.4rem; 
    margin-bottom: 0.75rem; 
    font-size: 1rem;
}
.form-group { margin-bottom: 0.75rem; }
.form-group label { display: block; color: #aaa; margin-bottom: 0.3rem; font-size: 0.85em; }
input, textarea, select { 
    width: 100%; 
    background: #2a2a2a; 
    border: 1px solid #444; 
    border-radius: 4px; 
    padding: 0.4rem 0.6rem; /* 减小输入框内边距 */
    color: #e0e0e0; 
    font-size: 0.9rem; /* 减小输入框字体 */
    box-sizing: border-box; 
}
textarea { min-height: 60px; resize: vertical; }
.button-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
button { border: none; border-radius: 4px; padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s; }
.btn-add { margin-top: 0.25rem; }
.condition-item { display: flex; gap: 0.5rem; align-items: center; background: #252525; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; }
.choice-header { gap: 0.75rem; margin-bottom: 0.75rem; padding-bottom: 0.75rem;}
.sub-section { padding: 0.75rem; margin: 1rem 0; }
.outcomes-section { border-top: 1px solid #333; margin-top: 1rem; padding-top: 0.75rem; }
.outcome-item { margin-bottom: 0.4rem; }
.results-section { padding: 0.75rem; margin-top: 1rem; }
.result-item { padding: 0.75rem; margin-bottom: 0.75rem; }
.result-header { margin-bottom: 0.5rem; }
.weight-group { margin-bottom: 0; }
.loader-group { display: flex; gap: 0.5rem; }
</style>