<script lang="ts" setup>
const props = defineProps<{
  icon: string
  size?: number | string
}>()

const sizeFormat = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}rpx`
  }
  return props.size
})

const urlPrefix = 'https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/'

const iconUrl = computed(() => {
  return `${urlPrefix}${props.icon}.png`
})
</script>

<template>
  <view flex>
    <image :src="iconUrl" :style="{ width: sizeFormat, height: sizeFormat }" mode="aspectFit" />
  </view>
</template>
