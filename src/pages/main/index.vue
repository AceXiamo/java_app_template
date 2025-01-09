<script setup lang="ts">
import { useMenuStore } from '@/store/menu'
import { useUserStore } from '@/store/user'
import { login } from '@/api/login'

const menu = useMenuStore()
const user = useUserStore()

onShareAppMessage(() => {
  return {
    title: '分享',
    path: '/pages/main/index',
  }
})

onShareTimeline(() => {
  return {
    title: '分享',
    path: '/pages/main/index',
  }
})

onLoad(() => {
  if (!user.user || !user.user.openId) {
    uni.login({
      provider: 'weixin',
      success: async (res: { code: string }) => {
        const { data } = await login({ code: res.code })
        user.saveLoginRes(data)
      },
    })
  }
  if ((!user.currentUser || Object.keys(user.currentUser).length === 0) && user.token)
    user.loadCurrentUser()
})
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <template v-if="user.token">
      <TabBarMain v-if="menu.active === 'home'" h-full />
      <TabBarMy v-if="menu.active === 'my'" h-full />
      <TabBarCustomer v-if="menu.active === 'customer'" h-full />
    </template>
    <template v-else>
      <TabBarLogin h-full />
    </template>
  </view>
</template>

<route lang="json">
{}
</route>
