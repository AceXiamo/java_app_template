<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()

const colorFromText = stringToColor(props.text)
</script>

<template>
  <text
    rounded-[6rpx] p-[2rpx_16rpx] text-[24rpx] :style="{
      color: colorFromText,
      backgroundColor: `${colorFromText}20`,
    }"
  >
    {{ $props.text }}
  </text>
</template>
