<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'number' | 'textarea'
}>(), {
  disabled: false,
  type: 'text',
})

const emits = defineEmits(['update:modelValue'])

const inputValue = ref<string>(props.modelValue ?? '')

watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value)
    inputValue.value = newValue ?? ''
}, { immediate: true })

watch(inputValue, (newValue) => {
  if (newValue !== props.modelValue)
    emits('update:modelValue', newValue)
})
</script>

<template>
  <view flex flex-col justify-center gap-[20rpx]>
    <view ml-[20rpx] flex items-center gap-[10rpx] text-[26rpx]>
      <slot name="icon">
        <view i-heroicons:user-16-solid text-emerald-500 />
      </slot>
      <text text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view relative box-border w-full flex items-center gap-[10rpx] border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
      <template v-if="$props.type === 'textarea'">
        <textarea
          v-model="inputValue"
          :placeholder="placeholder ?? `请输入${$props.label}`"
          class="h-[100rpx] flex-auto text-[26rpx]"
          :disabled="$props.disabled"
        />
      </template>
      <template v-else>
        <input
          v-model="inputValue" :type="$props.type" :placeholder="placeholder ?? `请输入${$props.label}`" class="flex-auto text-[26rpx]"
          :disabled="$props.disabled"
        >
      </template>
      <slot name="suffix" />
      <view v-if="$props.disabled" absolute inset-0 bg="black/05" rounded-[10rpx] />
    </view>
  </view>
</template>
