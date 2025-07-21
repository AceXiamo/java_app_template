<script setup lang="ts">
import { useMenuStore } from '@/store/menu'
import { useUserStore } from '@/store/user'

const menu = useMenuStore()
const userStore = useUserStore()

// 页面分享配置
onShareAppMessage(() => {
  return {
    title: '窍启租车 - 智能出行新选择',
    path: '/pages/main/index',
  }
})

onShareTimeline(() => {
  return {
    title: '窍启租车 - 智能出行新选择',
    path: '/pages/main/index',
  }
})

onLoad(async () => {
  // 恢复用户登录状态
  await userStore.restoreUserInfo()
})
</script>

<template>
  <view relative h-full flex flex-col overflow-hidden>
    <!-- 主内容区域 -->
    <view class="flex-1 overflow-hidden">
      <TabBarMain v-if="menu.active === 'home'" class="h-full" />
      <TabBarOrder v-if="menu.active === 'order'" class="h-full" />
      <TabBarDiscover v-if="menu.active === 'discover'" class="h-full" />
      <TabBarMy v-if="menu.active === 'my'" class="h-full" />
    </view>
  </view>
</template>

<route type="home" lang="json">
{}
</route>
