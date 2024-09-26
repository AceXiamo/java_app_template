import { defineStore } from 'pinia'

export type ActiveMenu = 'home' | 'customer' | 'my'

export const useMenuStore = defineStore('menu', () => {
  const active = ref<ActiveMenu>('home')

  return {
    active,
  }
})
