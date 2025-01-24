<script setup lang="ts">
import { useMenuStore } from '@/store/menu'

const menu = useMenuStore()

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
})
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <TabBarMain v-if="menu.active === 'home'" h-full />
    <TabBarMy v-if="menu.active === 'my'" h-full />
  </view>
</template>

<route type="home" lang="json">
{}
</route>
