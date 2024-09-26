<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  type: 'primary' | 'warning' | 'danger' | 'default'
  size: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<template>
  <view
    active:opacity="60"

    box-border flex items-center
    :style="{
      backgroundColor: type === 'primary' ? '#1989fa' : type === 'warning' ? '#ff9760' : type === 'danger' ? '#f00' : 'transparent',
      border: type === 'default' ? '1px solid #6b7280' : 'none',
      padding: size === 'small' ? '8rpx 12rpx' : size === 'medium' ? '10rpx 16rpx' : '12rpx 20rpx',
      borderRadius: size === 'small' ? '4rpx' : size === 'medium' ? '6rpx' : '8rpx',
      fontSize: size === 'small' ? '18rpx' : size === 'medium' ? '20rpx' : '22rpx',
      color: type === 'default' ? '#6b7280' : '#fff',
    }"
    @click="handleClick"
  >
    <slot />
  </view>
</template>
