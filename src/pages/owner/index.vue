<script setup lang="ts">
import { useOwnerStore } from '@/store/owner'

const ownerStore = useOwnerStore()

// 页面分享配置
onShareAppMessage(() => {
  return {
    title: '车主中心 - 管理我的车辆',
    path: '/pages/owner/index',
  }
})

onShareTimeline(() => {
  return {
    title: '车主中心 - 管理我的车辆',
    path: '/pages/owner/index',
  }
})

onLoad(() => {
  // 加载车主数据
  ownerStore.loadOwnerData()
})
</script>

<template>
  <view relative h-full flex flex-col overflow-hidden>
    <!-- 主内容区域 -->
    <view class="flex-1 overflow-hidden">
      <TabBarOwnerHome v-if="ownerStore.active === 'home'" class="h-full" />
      <TabBarOwnerOrders v-if="ownerStore.active === 'orders'" class="h-full" />
      <TabBarOwnerRevenue v-if="ownerStore.active === 'revenue'" class="h-full" />
      <TabBarOwnerSettings v-if="ownerStore.active === 'settings'" class="h-full" />
    </view>
  </view>
</template>

<route lang="json">
{
  "layout": "owner"
}
</route>
