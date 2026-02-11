# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

"兔子洞模拟器" (Rabbit Hole Sim) 是一款使用 Vue 3 + Vite + Pinia 构建的互动叙事游戏。玩家通过随机事件探索分支故事，做出影响属性并解锁新内容的选择。游戏采用"微怪诞"美学，平凡场景逐渐下沉至超现实和诡异的深渊。

## 开发命令

```bash
npm run dev      # 启动开发服务器 http://localhost:5173
npm run build    # 构建生产版本
npm run preview  # 本地预览生产构建
```

**注意**：本项目未配置 lint 或 test。如需添加，请参考 AGENTS.md 中的设置说明。

## 核心架构

### 数据流

1. **数据加载** (`dataCenter.js`)：使用 Vite 的 `import.meta.glob` 自动发现并加载 `src/data/` 中的所有 JSON 文件和 `src/dlc/` 中的 DLC 文件。合并基础游戏数据与已启用的 DLC 内容。

2. **事件选择** (`eventCenter.js`)：根据条件（属性、标签、物品等）过滤可用事件，应用优先级权重和概率修正器，然后使用加权随机选择算法随机选择一个事件。

3. **状态管理** (`playerStore.js`)：中央 Pinia store，管理所有玩家状态，包括属性（健康、理智、金钱）、世界观（逻辑、灵知、怪诞、解构）、物品栏、标签、状态效果和游戏历史。

4. **条件系统** (`conditionChecker.js`)：使用 `stat_check`、`tag_check`、`inventory_check`、`event_check` 等操作符评估事件/选项可见性的复杂条件。

5. **文本解析** (`textParser.js`)：处理动态文本语法，包括：
   - 随机选择：`{A|B|C}`
   - 变量引用：`{var.x}` 或 `{var.x:default}`
   - 条件文本：`{$condition:true|false}`
   - 世界观高亮：`[[worldview:text]]`

### 关键 Composables

- **`useEventCenter()`**：主事件引擎 - 查找可触发事件，根据玩家世界观自动选择选项，处理结果
- **`useDataCenter()`**：管理游戏数据加载和 DLC 系统集成
- **`useConditionChecker()`**：提供条件评估函数
- **`useGameLoop()`**：编排回合制游戏循环
- **`useInteractiveGame()`**：处理手动选择模式

### 状态架构

玩家状态集中在 `playerStore` 中，包含以下关键部分：

- **核心属性**：health（健康）、sanity（理智）、money（金钱）、turn（回合数）
- **世界观**：logic（逻辑）、gnosis（灵知）、weirdness（怪诞）、irony（解构）（决定玩家性格）
- **集合**：inventory（物品）、talents（天赋）、tags（标签）、statusEffects（状态效果）
- **历史追踪**：triggeredEventIds（已触发事件）、unlockedEventIds（已解锁事件）、madeChoices（已做选择）
- **修正器**：statMultipliers（属性乘数）、tagProbabilityModifiers（标签概率修正器）、eventModifiers（事件修正器）
- **变量**：灵活的键值存储，用于事件特定数据

### DLC 系统

游戏通过 `src/dlc/` 中的 `.dlc.json` 文件支持模块化内容。DLC 可以添加：

- 事件、天赋、结局、状态效果
- 自定义属性（新的玩家属性）
- 所有 DLC 内容自动发现，可在游戏内切换

## 事件系统

事件是 `src/data/events/` 中的 JSON 对象，结构如下：

```json
{
  "id": "unique_id",
  "title": "事件标题",
  "text": "带有 {动态|语法} 的事件描述",
  "tags": ["work", "supernatural"],
  "priority": 5,
  "isUnique": false,
  "conditions": [],
  "choices": [
    {
      "text": "选项文本",
      "worldview": "logic",
      "conditions": [],
      "results": [
        {
          "weight": 1,
          "feedback": "结果描述",
          "outcomes": [
            { "type": "change_stat", "params": { "health": -10 } }
          ]
        }
      ]
    }
  ]
}
```

**重要**：查看 EVENT_CREATION_GUIDE.md 获取全面的事件创作文档，包括所有条件类型、结果类型和最佳实践。

## 代码风格

### JavaScript

- **不使用分号**（项目约定）
- 优先使用 `const`，仅在需要重新赋值时使用 `let`
- 使用可选链 `?.` 和空值合并 `??`
- 回调函数使用箭头函数

### Vue 组件

- 所有组件使用 `<script setup>` 语法
- Props 使用 `defineProps()` 对象语法定义
- 事件使用 `defineEmits()` 定义
- 文件名：PascalCase（如 `GameView.vue`）
- 模板标签：kebab-case（如 `<choice-display>`）

### 命名规范

- 变量/函数：camelCase
- 常量：SCREAMING_SNAKE_CASE
- Vue 组件：PascalCase
- CSS 类：kebab-case
- JSON ID：snake_case

### 导入顺序

1. Vue 核心
2. Pinia stores
3. Composables
4. 数据文件
5. 工具函数
6. 相对导入

使用 `@` 别名导入 `src/` 目录。

## 关键实现注意事项

### 标签冲突系统

标签可以互斥（在 `src/data/tags.json` 中定义）。通过 `add_tag` 结果添加标签时：

- 默认：如果玩家有冲突标签，选项将被隐藏
- 使用 `replace: true`：在添加新标签前自动移除冲突标签

### 世界观系统

四种世界观决定玩家性格和 AI 选择偏好：

- **logic**：理性、分析性方法
- **gnosis**：神秘、深奥的知识
- **weirdness**：拥抱荒诞和超现实
- **irony**：解构性、元意识视角

主导世界观（最高值）影响自动选择。

### 事件优先级与权重

事件使用加权随机选择，基于：

1. 基础 `priority` 值（默认：1）
2. 标签概率修正器（来自 `tagProbabilityModifiers`）
3. 事件特定修正器（来自 `eventModifiers`）

### 结果处理

90% 的结果应仅为 `change_stat`。特殊结果（add_item、add_tag、add_status_effect）应稀有，以保持对核心属性驱动玩法的关注。

## 文件组织

```
src/
├── assets/          # 全局 CSS (themes.css)、图片
├── components/      # 可复用 Vue 组件
├── composables/     # 共享逻辑 (useXxx.js)
├── data/            # 游戏内容 (JSON)
│   ├── events/      # 事件文件（自动加载）
│   ├── achievements.json
│   ├── talents.json
│   ├── tags.json
│   └── status_effects.json
├── dlc/             # DLC 内容 (*.dlc.json，自动发现)
├── stores/          # Pinia 状态管理
├── utils/           # 工具函数
├── views/           # 页面级组件
├── App.vue          # 根组件，带视图路由
└── main.js          # 应用入口点
```

## UI/UX 注意事项

- UI 文本和注释使用中文
- 深色主题，微妙边框（#050505 背景，#111 边框）
- 字体栈："Source Han Sans SC", "Source Han Sans TC", sans-serif
- 使用 CSS 变量进行主题化（在 themes.css 中定义）
- 所有 Vue 组件使用 scoped 样式

## Git 工作流

- Commit 信息使用英文
- 使用 conventional commits：`type(scope): description`
- 类型：feat、fix、refactor、docs、chore
- 保持提交原子化和专注

## 常见陷阱

1. **不要在未查看 EVENT_CREATION_GUIDE.md 的情况下修改事件 JSON** - 事件系统有许多微妙特性（条件、动态文本、标签冲突）
2. **始终使用条件检查器工具** - 不要手动评估条件；使用 conditionChecker 中的 `isConditionMet()`
3. **尊重标签冲突** - 添加新标签前检查 `tags.json` 的 conflicts 数组
4. **测试动态文本语法** - 文本解析器支持必须验证的复杂语法
5. **DLC 更改需要重新加载数据** - 修改 DLC 文件后，使用 `loadAllData({ force: true })` 强制重新加载
