<script lang="ts" setup>
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  label?: string
  hideIcon?: boolean
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  mode?: 'date' | 'time'
  showBottomLine?: boolean
}>(), {
  disabled: false,
  mode: 'date',
  showBottomLine: true,
})

const emits = defineEmits(['update:modelValue'])
const startDate = ref<string>('2000-01-01')
const endDate = ref<string>('2099-01-01')

const formatMap = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  datetime: 'YYYY-MM-DD HH:mm:ss',
}

const inputValue = ref<string>(dayjs(props.modelValue).format(formatMap[props.mode]))

watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value)
    inputValue.value = newValue ? dayjs(newValue).format(formatMap[props.mode]) : ''
}, { immediate: true })

watch(inputValue, (newValue) => {
  if (newValue !== props.modelValue)
    emits('update:modelValue', newValue)
})

function bindDateChange(e: { detail: { value: string } }) {
  inputValue.value = e.detail.value
}
</script>

<template>
  <view relative flex justify-center gap-[20rpx] py-[20rpx]>
    <view flex items-center gap-[5rpx]>
      <slot name="icon" />
      <text text-[26rpx] text-[#333]>
        {{ $props.label }}
      </text>
      <text :style="{ opacity: $props.required ? 1 : 0 }" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view relative box-border flex flex-auto items-center gap-[10rpx] p-[15rpx]>
      <picker :mode="mode" :value="inputValue" :start="startDate" :end="endDate" w-full @change="bindDateChange">
        <input
          v-model="inputValue" type="text" :placeholder="placeholder || `请输入${$props.label}`" class="flex-auto text-right text-[26rpx]"
          :disabled="true"
        >
      </picker>
      <slot name="suffix" />
      <view v-if="$props.disabled" absolute inset-0 bg="black/05" rounded-[10rpx] />
    </view>
    <view v-if="$props.showBottomLine" absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300 />
  </view>
</template>
