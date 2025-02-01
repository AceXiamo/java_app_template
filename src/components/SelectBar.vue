<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  modelValue: any
  disabled?: boolean
  placeholder?: string
  options: {
    value: string | number
    label: string
  }[]
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref<boolean>(false)
function activeHandle(item: any) {
  if (!open.value)
    return
  open.value = false
  emit('update:modelValue', item.value)
  emit('change', item)
}
</script>

<template>
  <view
    class="relative box-border h-full w-full flex items-center gap-[10rpx] border-1 bg-white border-gray-300 rounded-[50rpx] border-solid p-[8rpx_16rpx] text-[25rpx] text-[#333]"
    :style="{
      pointerEvents: props.disabled ? 'none' : 'auto',
    }"
    @click="open = !open"
  >
    <text :class="{ 'text-[#808080] text-[24rpx]': !props.modelValue }" class="truncate">
      {{ props.options.find(v => v.value === props.modelValue)?.label || props.placeholder }}
    </text>
    <view
      class="ml-auto transition-all duration-200"
      :style="{ transform: open ? `rotate(180deg)` : 'rotate(0)' }"
    >
      <view i-heroicons:chevron-down-16-solid text-[30rpx] text-[#33333350] />
    </view>
    <view
      class="absolute left-0 z-10 h-0 w-full translate-y-full overflow-hidden shadow-md transition-all duration-200 -bottom-[10rpx]"
      :style="{ opacity: open ? 1 : 0, height: open ? 'auto' : 0 }"
      @click.stop
    >
      <view
        class="box-border flex flex-col border-1 border-gray-200 rounded-1 border-solid bg-white"
      >
        <view
          v-for="(item, index) in props.options"
          :key="index"
          class="flex px-[16rpx] py-[10rpx] active:text-blue-400"
          :style="{ color: item.value === props.modelValue ? 'rgb(96, 165, 250)' : '#333' }"
          @click="activeHandle(item)"
        >
          <text truncate>
            {{ props.options[index].label }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
