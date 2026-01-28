/**
 * 文本解析器 - 支持随机选择、变量引用和条件文本
 */

/**
 * 解析随机选择语法 {A|B|C}
 * 排除 {$...} 条件文本
 * @param {string} text - 原始文本
 * @returns {string} - 解析后的文本
 */
export function parseRandomText(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\{(?!\$)([^}]+)\}/g, (match, content) => {
    const options = content.split('|').map(s => s.trim());
    if (options.length <= 1) return match;
    return options[Math.floor(Math.random() * options.length)];
  });
}

/**
 * 解析变量引用 {var.x} 或 {var.x:default}
 * @param {string} text - 原始文本
 * @param {object} context - 包含 player 状态
 * @returns {string} - 解析后的文本
 */
export function parseVariableText(text, context = {}) {
  if (!text || typeof text !== 'string') return text;
  const { player } = context;
  if (!player || !player.variables) return text;
  return text.replace(/\{var\.([\w\u4e00-\u9fa5]+)(?::([^}]*))?\}/g, (match, key, defaultVal) => {
    if (player.variables[key] !== undefined) {
      return String(player.variables[key]);
    }
    return defaultVal !== undefined ? defaultVal : '0';
  });
}

/**
 * 解析转义字符
 * @param {string} text - 原始文本
 * @returns {string} - 解析后的文本
 */
export function parseEscapeChars(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\\\/g, '\\');
}

/**
 * 解析条件文本语法 {$条件:真|假}
 * @param {string} text - 原始文本
 * @param {object} context - 包含 player 状态
 * @returns {string} - 解析后的文本
 */
export function parseConditionalText(text, context = {}) {
  if (!text || typeof text !== 'string') return text;
  const regex = /\{\$([^:}]+):([^}|]+)\|([^}]+)\}/g;
  return text.replace(regex, (match, condition, trueText, falseText) => {
    console.log('条件文本匹配:', { match, condition, trueText, falseText });
    const isMet = checkSimpleCondition(condition.trim(), context);
    console.log('条件结果:', isMet);
    return isMet ? trueText.trim() : falseText.trim();
  });
}

function checkSimpleCondition(condition, context) {
  const { player } = context;
  if (!player) return false;

  const m = condition.match(/^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
  if (!m) return false;

  const [, left, op, right] = m;
  const leftVal = parseStatValue(left.trim(), player);
  const rightVal = parseValue(right.trim(), player);

  switch (op) {
    case '>=': return leftVal >= rightVal;
    case '<=': return leftVal <= rightVal;
    case '==': return leftVal === rightVal;
    case '!=': return leftVal !== rightVal;
    case '>': return leftVal > rightVal;
    case '<': return leftVal < rightVal;
    default: return false;
  }
}

function parseStatValue(statName, player) {
  if (player.variables?.[statName] !== undefined) {
    return Number(player.variables[statName]) || 0;
  }
  if (player[statName] !== undefined) return Number(player[statName]) || 0;
  return 0;
}

function parseValue(str, player) {
  const trimmed = str.trim();
  if (trimmed.startsWith('tag:')) {
    const tag = trimmed.slice(4);
    return player.tags?.includes(tag) ? 1 : 0;
  }
  if (trimmed.startsWith('status:')) {
    const status = trimmed.slice(7);
    return player.statusEffects?.some(e => e.id === status) ? 1 : 0;
  }
  return Number(trimmed) || 0;
}

/**
 * 完整解析文本（条件文本 + 随机选择 + 变量引用 + 转义字符）
 * @param {string} text - 原始文本
 * @param {object} context - 包含 player 等上下文
 * @returns {string} - 解析后的文本
 */
export function parseText(text, context = {}) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  result = parseConditionalText(result, context);
  result = parseRandomText(result);
  result = parseVariableText(result, context);
  result = parseEscapeChars(result);
  return result;
}

/**
 * 从文本中提取随机选择的选项
 * @param {string} text - 原始文本
 * @returns {object} - { allOptions: string[], optionsPerGroup: object }
 */
export function extractRandomOptions(text) {
  if (!text || typeof text !== 'string') return { allOptions: [], optionsPerGroup: {} };

  const allOptions = [];
  const optionsPerGroup = {};
  let groupIndex = 0;

  const regex = /\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const content = match[1];
    const options = content.split('|').map(s => s.trim());

    if (options.length > 1) {
      const groupKey = `__random_${groupIndex}__`;
      optionsPerGroup[groupKey] = options;
      allOptions.push(...options);
      groupIndex++;
    }
  }

  return { allOptions, optionsPerGroup };
}
