<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'
import type { ActiveMenu } from '@/store/menu'
import { useMenuStore } from '@/store/menu'

const setting = useSettingStore()
const { active } = toRefs(useMenuStore())

function load() {
  switch (active.value) {
    case 'home':
      break
    case 'group':
      break
    case 'shop':
      break
    case 'member':
      break
    case 'my':
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
      paddingBottom: setting.isAppleAndHasLine ? 'calc(env(safe-area-inset-bottom) + 10rpx)' : '20rpx',
    }"
    flex justify-between border-t border-t-[#f3f3f3] border-t-solid bg-white px-[60rpx] pt-[20rpx]
  >
    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('home')">
      <view relative h-[40rpx] w-[40rpx] flex items-center justify-center>
        <AIcon v-show="active === 'home'" icon="tab_home_active" :size="40" absolute inset-0 />
        <AIcon v-show="active !== 'home'" icon="tab_home" :size="40" absolute inset-0 />
      </view>
      <text text-[22rpx]>
        首页
      </text>
    </view>

    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('group')">
      <view relative h-[40rpx] w-[40rpx] flex items-center justify-center>
        <AIcon v-show="active === 'group'" icon="tab_group_active" :size="40" absolute inset-0 />
        <AIcon v-show="active !== 'group'" icon="tab_group" :size="40" absolute inset-0 />
      </view>
      <text text-[22rpx]>
        俱乐部
      </text>
    </view>

    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('shop')">
      <view relative h-[40rpx] w-[40rpx] flex items-center justify-center>
        <AIcon v-show="active === 'shop'" icon="tab_shop_active" :size="40" absolute inset-0 />
        <AIcon v-show="active !== 'shop'" icon="tab_shop" :size="40" absolute inset-0 />
      </view>
      <text text-[22rpx]>
        商城
      </text>
    </view>

    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('member')">
      <view relative h-[40rpx] w-[40rpx] flex items-center justify-center>
        <AIcon v-show="active === 'member'" icon="tab_member_active" :size="40" absolute inset-0 />
        <AIcon v-show="active !== 'member'" icon="tab_member" :size="40" absolute inset-0 />
      </view>
      <text text-[22rpx]>
        成员
      </text>
    </view>

    <view flex flex-col items-center gap-[10rpx] @tap="menuClick('my')">
      <view relative h-[40rpx] w-[40rpx] flex items-center justify-center>
        <AIcon v-show="active === 'my'" icon="tab_my_active" :size="40" absolute inset-0 />
        <AIcon v-show="active !== 'my'" icon="tab_my" :size="40" absolute inset-0 />
      </view>
      <text text-[22rpx]>
        我的
      </text>
    </view>
  </view>
</template>
