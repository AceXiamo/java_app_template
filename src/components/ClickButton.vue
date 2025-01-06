<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  type: 'primary' | 'warning' | 'danger' | 'default' | 'success'
  size: 'small' | 'medium' | 'large'
  bgColor?: string
  fontColor?: string
  label?: string
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
      backgroundColor: bgColor ?? (type === 'primary' ? '#1989fa' : type === 'warning' ? '#ff9760' : type === 'danger' ? '#ef4444' : type === 'success' ? '#16a34a' : 'transparent'),
      border: type === 'default' ? '1px solid #6b7280' : '1px solid transparent',
      padding: size === 'small' ? '8rpx 12rpx' : size === 'medium' ? '10rpx 16rpx' : '12rpx 20rpx',
      borderRadius: size === 'small' ? '4rpx' : size === 'medium' ? '6rpx' : '8rpx',
      fontSize: size === 'small' ? '18rpx' : size === 'medium' ? '20rpx' : '22rpx',
      color: fontColor ?? (type === 'default' ? '#6b7280' : '#fff'),
    }"
    @click="handleClick"
  >
    <template v-if="label">
      {{ label }}
    </template>
    <slot v-else />
  </view>
</template>
