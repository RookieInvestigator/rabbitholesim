import tagData from '@/data/tags.json'

const { conflicts } = tagData

const conflictMap = {}

function buildConflictMap() {
  if (conflicts && Array.isArray(conflicts)) {
    conflicts.forEach(group => {
      group.forEach(tag => {
        conflictMap[tag] = group.filter(t => t !== tag)
      })
    })
  }
}

buildConflictMap()

export function getConflictingTags(tagId) {
  return conflictMap[tagId] || []
}

export function hasConflict(newTag, existingTags) {
  const conflicts = getConflictingTags(newTag)
  return existingTags.some(t => conflicts.includes(t))
}

export function getConflictInfo(newTag, existingTags) {
  const conflicts = getConflictingTags(newTag)
  const existingConflicts = existingTags.filter(t => conflicts.includes(t))
  return {
    newTag,
    conflicts,
    existingConflicts
  }
}

export function getTagGroups() {
  return conflicts || []
}

export function areMutuallyExclusive(tag1, tag2) {
  const conflicts = getConflictingTags(tag1)
  return conflicts.includes(tag2)
}

export function getAllOutcomes(choice) {
  if (choice.outcomes) return choice.outcomes;
  if (choice.results && Array.isArray(choice.results)) {
    return choice.results.flatMap(r => r.outcomes || []);
  }
  return [];
}

export function choiceAddsConflictingTag(choice, playerTags) {
  const allOutcomes = getAllOutcomes(choice);
  if (!allOutcomes || !Array.isArray(allOutcomes)) return false;
  const tagIds = Array.isArray(playerTags) ? playerTags : [];
  return allOutcomes.some(outcome => {
    if (outcome.type === 'add_tag' && outcome.params && outcome.params.tag) {
      if (outcome.params.replace) return false;
      const newTagConflicts = getConflictingTags(outcome.params.tag);
      return tagIds.some(id => newTagConflicts.includes(id));
    }
    return false;
  });
}
