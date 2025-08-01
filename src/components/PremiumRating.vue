<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  size?: number
  spacing?: number
  allowHalf?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  spacing: 8,
  allowHalf: false,
  disabled: false
})

const emit = defineEmits<Emits>()

// 处理点击评分
function handleStarClick(starIndex: number) {
  if (props.disabled) return
  
  const newRating = starIndex + 1
  emit('change', newRating)
}

// 获取星星的填充状态
function getStarFillState(starIndex: number) {
  const rating = props.value
  const starValue = starIndex + 1
  
  if (rating >= starValue) {
    return 'full'
  } else if (props.allowHalf && rating >= starValue - 0.5) {
    return 'half'
  } else {
    return 'empty'
  }
}

// 动态样式
const starSize = computed(() => `${props.size}rpx`)
const starSpacing = computed(() => `${props.spacing}rpx`)
</script>

<template>
  <view 
    class="inline-flex items-center"
    :style="{ gap: starSpacing }"
  >
    <view
      v-for="starIndex in 5"
      :key="starIndex"
      class="relative"
      :class="{
        'opacity-60': disabled
      }"
      :style="{ width: starSize, height: starSize }"
      @tap="handleStarClick(starIndex - 1)"
    >
      <!-- 星星背景 -->
      <view 
        class="absolute inset-0 flex items-center justify-center"
        :style="{ fontSize: starSize }"
      >
        <text class="i-material-symbols-star text-gray-200" />
      </view>
      
      <!-- 星星填充 -->
      <view 
        v-if="getStarFillState(starIndex - 1) !== 'empty'"
        class="absolute inset-0 flex items-center justify-center"
        :style="{ fontSize: starSize }"
      >
        <text 
          class="i-material-symbols-star text-yellow-500"
        />
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 基础样式，无动画效果 */
</style>