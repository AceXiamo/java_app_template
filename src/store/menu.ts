import { defineStore } from 'pinia'

// 租车应用的主要导航
export type ActiveMenu = 'home' | 'order' | 'discover' | 'my'

export const useMenuStore = defineStore('menu', () => {
  const active = ref<ActiveMenu>('home')

  // 设置当前激活的菜单
  function setActive(menu: ActiveMenu) {
    active.value = menu
  }

  return {
    active,
    setActive,
  }
})
