<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'
import type { ActiveMenu } from '@/store/menu'
import { useMenuStore } from '@/store/menu'
import { useOrderStore } from '@/store/order'
import { useProfileStore } from '@/store/profile'

const setting = useSettingStore()
const { active } = toRefs(useMenuStore())
const orderStore = useOrderStore()
const profileStore = useProfileStore()

function load() {
  switch (active.value) {
    case 'home':
      // 首页数据加载（如果有需要的话）
      break
    case 'order':
      // 加载订单数据
      orderStore.reloadOrderList()
      break
    case 'my':
      // 加载个人中心数据
      profileStore.reloadProfileData()
      break
  }
}

const loadWithDebounce = debounce(load, 100)

function menuClick(key: ActiveMenu) {
  if (key === active.value)
    return

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
        i-material-symbols:home
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'home' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[24rpx]"
        :class="active === 'home' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        首页
      </text>
    </view>

    <!-- 订单 Tab -->
    <view
      class="flex flex-col cursor-pointer items-center py-[8rpx]"
      @tap="menuClick('order')"
    >
      <view
        i-material-symbols:list-alt
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'order' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[24rpx]"
        :class="active === 'order' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        订单
      </text>
    </view>

    <!-- 我的 Tab -->
    <view
      class="flex flex-col cursor-pointer items-center py-[8rpx]"
      @tap="menuClick('my')"
    >
      <view
        i-material-symbols:person-outline
        class="mb-[4rpx] text-[40rpx]"
        :class="active === 'my' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      />
      <text
        class="text-[24rpx]"
        :class="active === 'my' ? 'text-[#8b5cf6]' : 'text-gray-400'"
      >
        我的
      </text>
    </view>
  </view>
</template>
