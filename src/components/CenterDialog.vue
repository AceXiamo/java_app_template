<script lang="ts" setup>
const props = withDefaults(defineProps<{
  visible: boolean
  onClose?: () => void
  title?: string
  width?: string | number
  showHeader?: boolean
  shadowColor?: string
  bgColor?: string
  withPadding?: boolean
}>(), {
  showHeader: true,
  withPadding: true,
  bgColor: '#fff',
})

defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const className = computed(() => props.visible ? 'ani_in' : 'ani_out')
const containerVisible = ref(false)
const widthVal = computed(() => {
  if (!props.width) {
    return '600rpx'
  }
  if (typeof props.width === 'number') {
    return `${props.width}rpx`
  }
  return props.width
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
    v-if="containerVisible"
    absolute inset-0 z-9999 flex flex-col items-center justify-center
    transition-all duration-200
    :class="{
      'bg-black/20': !shadowColor,
    }"
    :style="{ backgroundColor: shadowColor }"
    @tap="$emit('update:visible', false)"
  >
    <view
      flex flex-col rounded-[10rpx]
      :class="[
        className,
        $props.withPadding ? 'p-[30rpx]' : '',
      ]"
      :style="{ width: widthVal, backgroundColor: bgColor }"
      @tap.stop
    >
      <view v-if="showHeader" flex items-center justify-between>
        <text text-[28rpx] font-bold>
          {{ $props.title || '' }}
        </text>
        <view
          i-carbon:close-filled text-[30rpx] text-red-500
          @tap="$emit('update:visible', false)"
        />
      </view>
      <view
        :class="[
          $props.withPadding ? 'mt-[20rpx]' : '',
        ]"
      >
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
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.ani_out {
  animation: ani_out 0.3s forwards;
}

@keyframes ani_out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
