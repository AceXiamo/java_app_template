import { defineStore } from 'pinia'

export type ActiveMenu = 'home' | 'group' | 'shop' | 'member' | 'my'

export const useMenuStore = defineStore('menu', () => {
  const active = ref<ActiveMenu>('home')

  return {
    active,
  }
})
