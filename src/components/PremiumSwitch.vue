<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  label?: string
  description?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'medium',
  label: '',
  description: ''
})

const emit = defineEmits<Emits>()

// 尺寸配置
const sizeConfig = computed(() => {
  const configs = {
    small: {
      track: { width: '60rpx', height: '32rpx', padding: '4rpx' },
      thumb: { size: '24rpx' },
      text: '22rpx'
    },
    medium: {
      track: { width: '80rpx', height: '44rpx', padding: '6rpx' },
      thumb: { size: '32rpx' },
      text: '24rpx'
    },
    large: {
      track: { width: '100rpx', height: '56rpx', padding: '8rpx' },
      thumb: { size: '40rpx' },
      text: '28rpx'
    }
  }
  return configs[props.size]
})

// 轨道样式
const trackClasses = computed(() => [
  'relative rounded-full',
  {
    'bg-purple-500': props.modelValue && !props.disabled,
    'bg-gray-300': !props.modelValue && !props.disabled,
    'bg-gray-200 opacity-50': props.disabled,
  }
])

// 滑块样式
const thumbClasses = computed(() => [
  'absolute top-1/2 transform -translate-y-1/2 rounded-full',
  'bg-white shadow-lg',
  'flex items-center justify-center',
  {
    'shadow-purple-300': props.modelValue && !props.disabled,
    'shadow-gray-400': !props.modelValue && !props.disabled,
    'shadow-gray-300': props.disabled,
  }
])

// 滑块位置
const thumbPosition = computed(() => {
  const trackWidth = parseInt(sizeConfig.value.track.width)
  const thumbSize = parseInt(sizeConfig.value.thumb.size)
  const padding = parseInt(sizeConfig.value.track.padding)
  
  const leftPos = padding
  const rightPos = trackWidth - thumbSize - padding
  
  return props.modelValue ? `${rightPos}rpx` : `${leftPos}rpx`
})

// 处理点击
function handleClick() {
  if (props.disabled) return
  
  // 触感反馈
  uni.vibrateShort()
  
  // 更新值
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <view class="relative">
    <view 
      v-if="label || description"
      class="mb-[8rpx]"
    >
      <text 
        v-if="label"
        class="block font-medium text-gray-900"
        :style="{ fontSize: sizeConfig.text }"
      >
        {{ label }}
      </text>
      <text 
        v-if="description"
        class="mt-[2rpx] block text-gray-600"
        :style="{ fontSize: `calc(${sizeConfig.text} - 4rpx)` }"
      >
        {{ description }}
      </text>
    </view>
    
    <view class="relative inline-block">
      <!-- 开关轨道 -->
      <view
        :class="trackClasses"
        :style="{
          width: sizeConfig.track.width,
          height: sizeConfig.track.height,
          padding: sizeConfig.track.padding
        }"
        @tap="handleClick"
      >
        <!-- 滑块 -->
        <view
          :class="thumbClasses"
          :style="{
            width: sizeConfig.thumb.size,
            height: sizeConfig.thumb.size,
            left: thumbPosition
          }"
        >
          <!-- 滑块内部图标 -->
          <text 
            v-if="modelValue && !disabled"
            class="i-material-symbols-check text-purple-600"
            :style="{ fontSize: `calc(${sizeConfig.thumb.size} * 0.6)` }"
          />
          <text 
            v-else-if="!modelValue && !disabled"
            class="i-material-symbols-close text-gray-400"
            :style="{ fontSize: `calc(${sizeConfig.thumb.size} * 0.6)` }"
          />
        </view>
      </view>
    </view>
    
    <!-- 状态指示文字 -->
    <view 
      v-if="!label && !description"
      class="mt-[8rpx] text-center"
    >
      <text 
        class="font-medium"
        :class="modelValue ? 'text-purple-600' : 'text-gray-500'"
        :style="{ fontSize: `calc(${sizeConfig.text} - 2rpx)` }"
      >
        {{ modelValue ? '已开启' : '已关闭' }}
      </text>
    </view>
  </view>
</template>

<style scoped>
/* 基础样式，无动画效果 */
</style>