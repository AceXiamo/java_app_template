<script lang="ts" setup>
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
})

const emits = defineEmits(['update:modelValue'])
const startDate = ref<string>('2000-01-01')
const endDate = ref<string>('2099-01-01')
const inputValue = ref<string>(dayjs(props.modelValue).format('YYYY-MM-DD'))

watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value)
    inputValue.value = newValue ?? ''
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
  <view flex flex-col justify-center gap-[20rpx]>
    <view ml-[20rpx]>
      <view i-heroicons:user-16-solid text-[26rpx] text-emerald-500 />
      <text text-[26rpx] text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view relative box-border w-full flex items-center gap-[10rpx] border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
      <picker mode="date" :value="inputValue" :start="startDate" :end="endDate" @change="bindDateChange">
        <input
          v-model="inputValue" type="text" :placeholder="placeholder ?? `请输入${$props.label}`" class="flex-auto text-[26rpx]"
          :disabled="true"
        >
      </picker>
      <slot name="suffix" />
      <view v-if="$props.disabled" absolute inset-0 bg="black/05" rounded-[10rpx] />
    </view>
  </view>
</template>
