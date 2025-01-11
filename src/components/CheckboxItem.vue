<script lang="ts" setup>
const props = defineProps<{
  checked?: boolean
  disabled?: boolean
  label?: string
}>()

const emit = defineEmits(['update:checked'])

function toggle() {
  if (props.disabled)
    return
  emit('update:checked', !props.checked)
}
</script>

<template>
  <view
    flex items-center gap-[10rpx]
    :class="disabled ? 'opacity-50' : 'active:opacity-60'"
    @tap="toggle"
  >
    <view
      h-[32rpx] w-[32rpx] flex items-center justify-center border-2 rounded-[6rpx] border-solid transition-all duration-200
      :class="[
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      <view
        v-if="checked"
        i-heroicons:check-16-solid
        text-[24rpx] text-white
      />
    </view>
    <text v-if="label" text-[26rpx] text-[#333]>
      {{ label }}
    </text>
    <slot />
  </view>
</template>
