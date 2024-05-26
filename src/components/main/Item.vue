<script lang="ts" setup>
defineProps<{
  title: string
  bgColor: string
}>()
</script>

<template>
  <view relative flex gap-[20rpx] overflow-hidden rounded-md bg-white>
    <view z-2 flex flex-col gap-[20rpx] p-[20rpx]>
      <text whitespace-nowrap text-[28rpx] text-[#333]>
        {{ $props.title }}
      </text>
      <view flex gap-[10rpx]>
        <view
          v-for="index of 3" :key="index" class="h-[20rpx] w-[6rpx] translate-x-[50%] rotate-30 rounded-[6rpx]" :style="{
            backgroundColor: $props.bgColor,
          }"
        />
      </view>
    </view>
    <view absolute inset-0 flex justify-end>
      <view absolute right-0 top-0 z-0 translate-x-[50%] translate-y-[20%] text-[100rpx] opacity="50">
        <slot />
      </view>
      <view absolute inset-0 z-1 style="background-image: linear-gradient(to right, white 70%, transparent);" />
    </view>
  </view>
</template>
