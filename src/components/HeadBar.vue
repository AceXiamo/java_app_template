<script lang="ts" setup>
import { useSettingStore } from '@/store/setting'

withDefaults(defineProps<{
  bgColor: string
}>(), {
  bgColor: 'white',
})

const setting = useSettingStore()
</script>

<template>
  <view class="relative flex flex-col pb-20rpx" :style="{ backgroundColor: $props.bgColor }">
    <view :style="{ height: `${setting.topH}rpx` }" />
    <view :style="{ height: `${setting.capsuleH}rpx` }">
      <slot />
    </view>
  </view>
</template>
