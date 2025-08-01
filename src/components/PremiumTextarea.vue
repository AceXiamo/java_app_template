<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  maxlength?: number
  minHeight?: string
  disabled?: boolean
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容...',
  maxlength: 500,
  minHeight: '200rpx',
  disabled: false,
  label: ''
})

const emit = defineEmits<Emits>()

const isFocused = ref(false)

// 字符数量
const characterCount = computed(() => props.modelValue.length)

// 字符数量百分比
const characterPercentage = computed(() => {
  return (characterCount.value / props.maxlength) * 100
})

// 容器样式类
const containerClasses = computed(() => [
  'relative',
  'bg-white',
  'border-2 rounded-[16rpx]',
  {
    'border-purple-400': isFocused.value && !props.disabled,
    'border-gray-200': !isFocused.value && !props.disabled,
    'border-gray-100 opacity-60': props.disabled,
  }
])

// 文本区域样式
const textareaClasses = computed(() => [
  'w-full bg-transparent resize-none outline-none',
  'text-[28rpx] leading-[40rpx] text-gray-900',
  'placeholder:text-gray-400',
  {
    'cursor-not-allowed': props.disabled,
  }
])

// 处理输入
function handleInput(e: any) {
  const value = e.detail.value
  if (value.length <= props.maxlength) {
    emit('update:modelValue', value)
  }
}

// 处理焦点
function handleFocus() {
  if (props.disabled) return
  isFocused.value = true
  emit('focus')
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}
</script>

<template>
  <view class="relative">
    <!-- 标签 -->
    <view v-if="label" class="mb-[12rpx] flex items-center">
      <text class="text-[32rpx] font-medium text-gray-900">
        {{ label }}
      </text>
    </view>

    <!-- 输入容器 -->
    <view :class="containerClasses">
      <view class="relative p-[24rpx]">
        <!-- 文本输入区域 -->
        <textarea
          :value="modelValue"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :disabled="disabled"
          :class="textareaClasses"
          :style="{ minHeight }"
          :auto-height="true"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </view>
    </view>

    <!-- 字数统计 -->
    <view class="mt-[16rpx] flex items-center justify-between">
      <view class="flex items-center">
        <!-- 输入建议 -->
        <view 
          v-if="isFocused && characterCount < 20"
          class="flex items-center text-[22rpx] text-gray-500"
        >
          <text class="i-material-symbols-lightbulb mr-[6rpx] text-[18rpx] text-yellow-500" />
          <text>详细的评价能帮助其他用户~</text>
        </view>
      </view>
      
      <!-- 字数显示 -->
      <view class="flex items-center">
        <text 
          class="text-[22rpx] font-medium"
          :class="{
            'text-green-600': characterPercentage < 70,
            'text-orange-600': characterPercentage >= 70 && characterPercentage < 90,
            'text-red-600': characterPercentage >= 90
          }"
        >
          {{ characterCount }}/{{ maxlength }}
        </text>
      </view>
    </view>
    
    <!-- 字数限制提示 -->
    <view 
      v-if="characterPercentage > 90"
      class="mt-[8rpx] flex items-center text-[22rpx] text-red-500"
    >
      <text class="i-material-symbols-warning mr-[6rpx] text-[18rpx]" />
      <text>还可输入 {{ maxlength - characterCount }} 个字符</text>
    </view>
  </view>
</template>

<style scoped>
/* 基础样式，无复杂效果 */
</style>