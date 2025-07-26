<script lang="ts" setup>
const props = defineProps<{
  visible: boolean
  onClose?: () => void
  title?: string
  height?: string | number
}>()
defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()
const className = computed(() => props.visible ? 'ani_in' : 'ani_out')
const containerVisible = ref(false)
const heightVal = computed(() => {
  if (!props.height) {
    return '500rpx'
  }
  if (typeof props.height === 'number') {
    return `${props.height}rpx`
  }
  return props.height
})

watch(() => props.visible, (v) => {
  if (!v) {
    setTimeout(() => {
      containerVisible.value = false
    }, 300)
  }
  else { containerVisible.value = v }
})
</script>

<template>
  <view
    v-if="containerVisible" absolute inset-0 bg="black/20" z-9999 flex flex-col justify-end transition-all duration-200 @tap="$emit('update:visible', false)"
  >
    <view flex flex-col rounded-t-[32rpx] bg-white p-[30rpx] :class="className" :style="{ minHeight: heightVal }" @tap.stop>
      <view relative flex items-center justify-center>
        <text text-[32rpx] font-bold>
          {{ $props.title || '' }}
        </text>
        <text class="i-material-symbols-close absolute right-0 text-[40rpx] text-gray-500 active:scale-90" @tap="$emit('update:visible', false)" />
      </view>
      <view>
        <slot />
      </view>
    </view>
  </view>
</template>

<style scoped>
.ani_in {
  animation: ani_in 0.3s forwards;
}

@keyframes ani_in {
  from {
    transform: translateY(50%);
  }
  to {
    transform: translateY(0);
  }
}

.ani_out {
  animation: ani_out 0.3s forwards;
}

@keyframes ani_out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(50%);
    opacity: 0;
  }
}
</style>
