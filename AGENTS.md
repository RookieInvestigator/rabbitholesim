# Rabbit Hole Sim 开发指南

## 项目概述

Vue 3 + Vite + Pinia 单页应用。游戏采用互动叙事引擎，玩家探索随机事件，选项影响属性并解锁内容。所有游戏内容存储在 `src/data/events/` 下的 JSON 文件中。

## 构建命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 本地预览生产构建
```

本项目目前未配置 lint 和 test 命令。如需添加：
- 使用 `eslint` 进行代码检查，`npm install -D eslint eslint-plugin-vue`
- 使用 `vitest` 进行单元测试，`npm install -D vitest @vue/test-utils`

## 代码风格规范

### 通用原则

- 编写可读性强、自描述的代码
- 保持函数简洁专注（尽可能少于 50 行）
- 使用描述性命名
- 避免魔法数字，使用常量或配置值
- 显式处理边缘情况

### JavaScript 规范

- 语句末尾**不使用分号**（项目约定）
- 优先使用 `const`，仅在需要重新赋值时使用 `let`
- 回调函数和短函数使用箭头函数
- 优先使用 `forEach`、`map`、`filter`、`reduce`
- 使用可选链 `?.` 和空值合并 `??` 确保属性访问安全

### Vue 组件

- 所有新组件使用 `<script setup>` 语法
- 使用对象语法通过 `defineProps()` 定义 props
- 使用 `defineEmits()` 定义组件事件
- 使用 `ref` 和 `reactive` 定义响应式状态
- 使用 `computed` 定义计算属性
- 使用 composables (`useXxx`) 在组件间共享逻辑
- 文件名：PascalCase（如 `GameView.vue`）
- 模板标签：kebab-case（如 `<choice-display>`）

### Pinia 状态管理

- 文件名：PascalCase + Store（如 `playerStore.js`）
- Store ID：小写 + 连字符（如 `'player'`）
- State：使用返回初始状态对象的函数
- Getters：纯函数，派生状态
- Actions：修改状态或执行副作用的方法

### Composables

- 文件名：`useXxx.js` 或 `eventCenter.js`（事件处理中心）
- 导出：`export function useXxx()`
- 返回暴露函数和 ref 的对象

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `playerStore`, `eventModifiers` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_HEALTH`, `DEFAULT_MONEY` |
| 函数 | camelCase | `findEventById`, `isConditionMet` |
| Vue组件 | PascalCase | `GameView`, `ChoiceDisplay` |
| CSS类 | kebab-case | `choice-node`, `worldview-tag` |
| JSON ID | snake_case | `high_stat_event`, `in_debt` |

### 导入规范

```javascript
// Vue 核心库
import { ref, computed, onMounted } from 'vue'

// Pinia stores
import { usePlayerStore } from '@/stores/playerStore'

// Composables
import { useEventCenter } from '@/composables/eventCenter'

// 数据文件（使用 @ 别名）
import allEvents from '@/data/events/main_story.json'
import tagData from '@/data/tags.json'

// 工具函数
import { v4 as uuidv4 } from 'uuid'
```

- 使用 `@` 别名导入 `src/` 目录下的模块
- 导入分组：Vue → Pinia → Composables → 数据/工具 → 相对路径
- 组内按字母顺序排序

### 文件组织

```
src/
├── assets/          # 全局 CSS、图片
├── components/      # 可复用 Vue 组件
├── composables/     # 共享逻辑 (useXxx.js)
├── data/            # 游戏内容 (JSON 文件)
│   ├── events/
│   ├── achievements.json
│   ├── talents.json
│   └── status_effects.json
├── stores/          # Pinia 状态管理
├── utils/           # 工具函数
├── views/           # 页面级组件
├── App.vue
└── main.js
```

### CSS 样式规范

- Vue 组件使用 scoped 样式（`<style scoped>`）
- 主题色使用 CSS 变量
- 遵循现有配色：深色背景（#050505）、微妙边框（#111）
- 使用 Flexbox 和 CSS Grid 布局
- 保持样式模块化和组件专用
- 字体："Source Han Sans SC", "Source Han Sans TC", sans-serif

### 错误处理

- 函数入口处验证输入参数
- 错误情况使用提前返回
- 记录有上下文的错误信息
- Promise  rejection 使用 try/catch 处理
- Store 失败应使用 `handleStatDeath()` 处理游戏结束场景
- UI 组件应优雅处理缺失数据

### Git 工作流

- Commit 信息使用英文
- 使用 conventional commits 格式：`type(scope): description`
- 类型：`feat`, `fix`, `refactor`, `docs`, `chore`
- 保持提交原子化和专注

### 附加说明

- 项目 UI 和注释使用中文
- 游戏引擎支持多种世界观：logic、gnosis、weirdness、irony
- 事件系统使用加权随机选择
- 追踪玩家选择以保持叙事一致性
- DLC 系统支持模块化内容加载
