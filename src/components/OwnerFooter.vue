<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'
import type { OwnerActiveMenu } from '@/store/owner'
import { useOwnerStore } from '@/store/owner'

const setting = useSettingStore()
const { active } = toRefs(useOwnerStore())
const ownerStore = useOwnerStore()

function load() {
  switch (active.value) {
    case 'home':
      // 首页数据加载
      ownerStore.loadOwnerData()
      break
    case 'orders':
      // 加载订单数据
      break
    case 'revenue':
      // 加载收益数据
      break
  }
}

const loadWithDebounce = debounce(load, 100)

function menuClick(key: OwnerActiveMenu) {
  if (key === active.value)
    return

  // 切换store中的active状态
  active.value = key
  loadWithDebounce()
}

onMounted(() => {
  loadWithDebounce()
})

onShow(() => {
  loadWithDebounce()
})
</script>

<template>
  <view
    :style="{
      paddingBottom: setting.isAppleAndHasLine ? 'calc(env(safe-area-inset-bottom) + 8rpx)' : '8rpx',
    }"
    class="border-t border-gray-100 bg-white"
    flex items-center justify-around py-[8rpx]
  >
    <!-- 首页 Tab -->
    <view
      class="flex flex-col cursor-pointer items-center py-[8rpx]"
      @tap="menuClick('home')"
    >
      <view
        i-lets-icons:home-duotone
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'home' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[20rpx]"
        :class="active === 'home' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        首页
      </text>
    </view>

    <!-- 订单 Tab -->
    <view
      class="flex flex-col cursor-pointer items-center py-[8rpx]"
      @tap="menuClick('orders')"
    >
      <view
        i-lets-icons:order-duotone
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'orders' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[20rpx]"
        :class="active === 'orders' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        订单
      </text>
    </view>

    <!-- 收益 Tab -->
    <view
      class="flex flex-col cursor-pointer items-center py-[8rpx]"
      @tap="menuClick('revenue')"
    >
      <view
        i-lets-icons:wallet-duotone
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'revenue' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[20rpx]"
        :class="active === 'revenue' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        收益
      </text>
    </view>

  </view>
</template>