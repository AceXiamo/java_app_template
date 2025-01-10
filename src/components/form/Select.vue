<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  options: { label: string, value: any }[]
}>(), {
  disabled: false,
  options: () => [],
})

const emits = defineEmits(['update:modelValue'])
const selectedValue = ref<any>(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  if (newValue !== selectedValue.value)
    selectedValue.value = newValue ?? ''
}, { immediate: true })

function handleChange(e: { detail: { value: number } }) {
  const selected = props.options[e.detail.value]
  selectedValue.value = selected.value
  emits('update:modelValue', selected.value)
}

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === selectedValue.value)
  return option?.label ?? ''
})
</script>

<template>
  <view flex flex-col justify-center gap-[20rpx]>
    <view ml-[20rpx] flex items-center gap-[10rpx]>
      <view i-heroicons:list-bullet-16-solid text-[26rpx] text-emerald-500 />
      <text text-[26rpx] text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view relative box-border w-full flex items-center gap-[10rpx] border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
      <picker
        :value="options.findIndex(opt => opt.value === selectedValue)"
        :range="options"
        range-key="label"
        @change="handleChange"
      >
        <input
          :value="selectedLabel"
          type="text"
          :placeholder="placeholder ?? `请选择${$props.label}`"
          class="flex-auto text-[26rpx]"
          disabled
        >
      </picker>
      <slot name="suffix" />
      <view v-if="$props.disabled" bg="black/05" absolute inset-0 rounded-[10rpx] />
    </view>
  </view>
</template>

<style lang="less" scoped></style>
