import { ref } from 'vue'

const showTestEvents = ref(false)

export function useDevConfig() {
  return {
    showTestEvents
  }
}
