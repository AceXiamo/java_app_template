<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'
import type { ActiveMenu } from '@/store/menu'
import { useMenuStore } from '@/store/menu'

const setting = useSettingStore()
const { active } = toRefs(useMenuStore())

function menuClick(key: ActiveMenu) {
  active.value = key
  // switch (key) {
  //   case 'home':
  //     uni.redirectTo({
  //       url: '/pages/main/index',
  //     })
  //     break
  //   case 'customer':
  //     uni.redirectTo({
  //       url: '/pages/customer/index',
  //     })
  //     break
  //   case 'my':
  //     uni.redirectTo({
  //       url: '/pages/my/index',
  //     })
  //     break
  // }
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
        <view i-heroicons:calendar-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:calendar text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        日程
      </text>
    </view>
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('customer')">
      <template v-if="active === 'customer'">
        <view i-heroicons:users-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:users text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        客户
      </text>
    </view>
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('my')">
      <template v-if="active === 'my'">
        <view i-heroicons:rectangle-group-solid text-[40rpx] text-[#7ab6e0] />
      </template>
      <template v-else>
        <view i-heroicons:rectangle-group text-[40rpx] text-[#999] />
      </template>
      <text text-[24rpx]>
        管理
      </text>
    </view>
  </view>
</template>
