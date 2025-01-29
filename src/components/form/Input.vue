<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'number' | 'textarea'
  showBottomLine?: boolean
}>(), {
  disabled: false,
  type: 'text',
  showBottomLine: true,
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
  <view
    relative flex justify-center gap-[20rpx] py-[20rpx]
    :class="{ 'flex-col': $props.type === 'textarea' }"
  >
    <view flex items-center gap-[5rpx] text-[26rpx]>
      <slot name="icon" />
      <text text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view
      relative box-border flex flex-auto items-center gap-[10rpx] p-[15rpx]
      :class="{ 'bg-[#F0F0F0] rounded-[6rpx]': $props.type === 'textarea' }"
    >
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
          v-model="inputValue" :type="$props.type" :placeholder="placeholder ?? `请输入${$props.label}`" class="flex-auto text-right text-[26rpx]"
          :disabled="$props.disabled"
        >
      </template>
      <slot name="suffix" />
      <view v-if="$props.disabled" absolute inset-0 bg="black/05" rounded-[10rpx] />
    </view>
    <view v-if="$props.showBottomLine && type !== 'textarea'" absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300 />
  </view>
</template>
