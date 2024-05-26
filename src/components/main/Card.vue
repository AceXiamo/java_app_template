<script lang="ts" setup>
withDefaults(defineProps<{
  title: string
  icon: string
}>(), {
  title: '篮球',
  icon: '🏀',
})
</script>

<template>
  <view rounded-md p-[15rpx_30rpx]>
    <view flex flex-col items-center justify-center>
      <text text-[50rpx]>
        {{ $props.icon }}
      </text>
      <text mt-[10rpx] whitespace-nowrap text-[26rpx] text-[#333] font-bold>
        {{ $props.title }}
      </text>
    </view>
  </view>
</template>
