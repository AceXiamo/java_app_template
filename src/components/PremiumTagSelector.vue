<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tags: string[]
  selectedTags: string[]
  maxCount?: number
  disabled?: boolean
}

interface Emits {
  (e: 'toggle-tag', tag: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 5,
  disabled: false
})

const emit = defineEmits<Emits>()

// 选中标签数量
const selectedCount = computed(() => props.selectedTags.length)

// 是否可以选择更多标签
const canSelectMore = computed(() => selectedCount.value < props.maxCount)

// 检查标签是否被选中
function isTagSelected(tag: string) {
  return props.selectedTags.includes(tag)
}

// 获取标签样式类
function getTagClasses(tag: string) {
  const isSelected = isTagSelected(tag)
  const canSelect = canSelectMore.value || isSelected
  
  return [
    'relative overflow-hidden rounded-full px-[20rpx] py-[8rpx] text-[22rpx] font-medium',
    'border-2',
    {
      // 选中状态
      'border-purple-500 bg-purple-50 text-purple-700': 
        isSelected && !props.disabled,
      
      // 未选中但可选择
      'border-gray-300 bg-white text-gray-600': 
        !isSelected && canSelect && !props.disabled,
      
      // 不可选择（已达上限）
      'border-gray-200 bg-gray-50 text-gray-400 opacity-60': 
        !isSelected && !canSelect && !props.disabled,
      
      // 禁用状态
      'border-gray-200 bg-gray-100 text-gray-300 opacity-50': 
        props.disabled,
    }
  ]
}

// 处理标签点击
function handleTagClick(tag: string) {
  if (props.disabled) return
  
  const isSelected = isTagSelected(tag)
  const canToggle = isSelected || canSelectMore.value
  
  if (!canToggle) {
    // 显示提示并震动
    uni.vibrateShort()
    uni.showToast({ 
      title: `最多选择${props.maxCount}个标签`, 
      icon: 'none',
      duration: 1500
    })
    return
  }
  
  // 触感反馈
  uni.vibrateShort()
  
  // 发射事件
  emit('toggle-tag', tag)
}
</script>

<template>
  <view class="relative">
    <!-- 标签计数器 -->
    <view class="mb-[12rpx] flex items-center justify-between">
      <view class="flex items-center">
        <text class="text-[24rpx] font-medium text-gray-800">选择标签</text>
        <view 
          v-if="selectedCount > 0"
          class="ml-[8rpx] flex h-[24rpx] w-[24rpx] items-center justify-center rounded-full bg-purple-500"
        >
          <text class="text-[14rpx] text-white font-bold">{{ selectedCount }}</text>
        </view>
      </view>
      
      <!-- 进度指示器 -->
      <view class="flex items-center">
        <text class="mr-[6rpx] text-[20rpx] text-gray-500">
          {{ selectedCount }}/{{ maxCount }}
        </text>
        <view class="h-[6rpx] w-[60rpx] rounded-full bg-gray-200 overflow-hidden">
          <view 
            class="h-full bg-purple-500"
            :style="{ width: `${(selectedCount / maxCount) * 100}%` }"
          />
        </view>
      </view>
    </view>
    
    <!-- 标签网格 -->
    <view class="flex flex-wrap gap-[12rpx]">
      <view
        v-for="tag in tags"
        :key="tag"
        :class="getTagClasses(tag)"
        @tap="handleTagClick(tag)"
      >
        <!-- 标签文本 -->
        <text class="relative z-10">{{ tag }}</text>
        
        <!-- 选中指示器 -->
        <view 
          v-if="isTagSelected(tag)"
          class="absolute right-[12rpx] top-1/2 transform -translate-y-1/2 z-10"
        >
          <view class="flex h-[20rpx] w-[20rpx] items-center justify-center rounded-full bg-purple-500">
            <text class="i-material-symbols-check text-[12rpx] text-white" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部提示信息 -->
    <view v-if="selectedCount > 0" class="mt-[16rpx]">
      <view class="rounded-[8rpx] bg-purple-50 p-[12rpx]">
        <view class="flex items-center">
          <text class="i-material-symbols-auto-awesome mr-[6rpx] text-[16rpx] text-purple-600" />
          <text class="text-[20rpx] text-purple-800 font-medium">已选择标签</text>
        </view>
        <view class="mt-[6rpx] flex flex-wrap gap-[6rpx]">
          <view
            v-for="selectedTag in selectedTags"
            :key="selectedTag"
            class="rounded-full bg-purple-200 px-[8rpx] py-[2rpx]"
          >
            <text class="text-[18rpx] text-purple-700">{{ selectedTag }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 满额提示 -->
    <view 
      v-if="!canSelectMore && !disabled"
      class="mt-[12rpx] flex items-center text-[20rpx] text-orange-600"
    >
      <text class="i-material-symbols-info mr-[4rpx] text-[16rpx]" />
      <text>已达到标签选择上限，点击已选标签可取消</text>
    </view>
    
    <!-- 推荐标签提示 -->
    <view 
      v-if="selectedCount === 0 && !disabled"
      class="mt-[12rpx] flex items-center text-[20rpx] text-gray-500"
    >
      <text class="i-material-symbols-lightbulb mr-[4rpx] text-[16rpx] text-yellow-500" />
      <text>选择合适的标签能让评价更有参考价值</text>
    </view>
  </view>
</template>

<style scoped>
/* 基础样式，无动画效果 */
</style>