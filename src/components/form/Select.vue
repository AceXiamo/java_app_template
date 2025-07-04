<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  options: { label: string, value: any }[]
  showBottomLine?: boolean
}>(), {
  disabled: false,
  options: () => [],
  showBottomLine: true,
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
  <view relative flex justify-center gap-[20rpx] py-[20rpx]>
    <view flex items-center gap-[5rpx] text-[26rpx]>
      <slot name="icon" />
      <text text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view relative box-border flex flex-auto items-center gap-[10rpx] p-[15rpx]>
      <picker
        :value="options.findIndex(opt => opt.value === selectedValue)"
        :range="options"
        range-key="label"
        w-full
        @change="handleChange"
      >
        <input
          :value="selectedLabel"
          type="text"
          :placeholder="placeholder ?? `请选择${$props.label}`"
          class="flex-auto text-right text-[26rpx]"
          disabled
        >
      </picker>
      <slot name="suffix" />
      <view v-if="$props.disabled" bg="black/05" absolute inset-0 rounded-[10rpx] />
    </view>
    <view v-if="$props.showBottomLine" absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300 />
  </view>
</template>

<style lang="less" scoped></style>
