<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'
import type { ActiveMenu } from '@/store/menu'
import { useMenuStore } from '@/store/menu'

uni.hideTabBar()
const setting = useSettingStore()
const { active } = toRefs(useMenuStore())

function menuClick(key: ActiveMenu) {
  active.value = key
  switch (key) {
    case 'home':
      uni.switchTab({
        url: '/pages/main/index',
      })
      break
    case 'exam':
      uni.switchTab({
        url: '/pages/exam/index',
      })
      break
    case 'my':
      uni.switchTab({
        url: '/pages/my/index',
      })
      break
  }
}
</script>

<template>
  <view
    :style="{
      paddingBottom: setting.isAppleAndHasLine ? 'calc(env(safe-area-inset-bottom) + 10rpx)' : '20rpx',
    }"
    flex justify-between bg-white px-[100rpx] pt-[20rpx]
  >
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('home')">
      <template v-if="active === 'home'">
        <view i-heroicons:home-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:home text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        首页
      </text>
    </view>
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('exam')">
      <template v-if="active === 'exam'">
        <view i-heroicons:trophy-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:trophy text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        举办比赛
      </text>
    </view>
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('my')">
      <template v-if="active === 'my'">
        <view i-heroicons:star-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:star text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        我的
      </text>
    </view>
  </view>
</template>
