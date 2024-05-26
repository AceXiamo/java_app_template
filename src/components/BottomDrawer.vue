<script lang="ts" setup>
const props = defineProps<{
  visible: boolean
  onClose?: () => void
  title?: string
}>()
defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()
const className = computed(() => props.visible ? 'ani_in' : 'ani_out')
const containerVisible = ref(false)

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
    <view min-h-[500rpx] flex flex-col bg-white p-[30rpx] :class="className" @tap.stop>
      <view flex justify-between>
        <text text-[32rpx] font-bold>
          {{ $props.title || '' }}
        </text>
        <view i-carbon:close-filled text-[40rpx] text-red-500 @tap="$emit('update:visible', false)" />
      </view>
      <view h-0 flex-auto>
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
