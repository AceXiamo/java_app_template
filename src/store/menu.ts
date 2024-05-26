import { defineStore } from 'pinia'

export type ActiveMenu = 'home' | 'exam' | 'my'

export const useMenuStore = defineStore('menu', () => {
  const active = ref<ActiveMenu>('home')

  return {
    active,
  }
})
