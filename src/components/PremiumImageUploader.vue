<script setup lang="ts">
import { ref, computed } from 'vue'

interface ImageItem {
  path: string
  url: string
  id?: string
}

interface Props {
  images: ImageItem[]
  maxCount?: number
  disabled?: boolean
}

interface Emits {
  (e: 'add-images', images: ImageItem[]): void
  (e: 'remove-image', index: number): void
  (e: 'preview-image', index: number): void
  (e: 'reorder-images', images: ImageItem[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 6,
  disabled: false
})

const emit = defineEmits<Emits>()

const isUploading = ref(false)
const deleteConfirmIndex = ref(-1)

// 是否可以添加更多图片
const canAddMore = computed(() => {
  return props.images.length < props.maxCount && !props.disabled
})

// 添加按钮样式
const addButtonClasses = computed(() => [
  'aspect-square flex flex-col items-center justify-center',
  'border-2 border-dashed rounded-[12rpx]',
  'bg-gray-50',
  {
    'border-purple-300 bg-purple-50': canAddMore.value,
    'border-gray-200 opacity-50': !canAddMore.value,
  }
])

// 选择图片
function chooseImages() {
  if (!canAddMore.value || isUploading.value) return
  
  const remainingCount = props.maxCount - props.images.length
  
  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const newImages = res.tempFilePaths.map((path, index) => ({
        path,
        url: path,
        id: `${Date.now()}_${index}`
      }))
      emit('add-images', newImages)
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
}

// 预览图片
function previewImage(index: number) {
  emit('preview-image', index)
}

// 显示删除确认
function showDeleteConfirm(index: number, event: Event) {
  event.stopPropagation()
  deleteConfirmIndex.value = index
  
  // 添加触感反馈
  uni.vibrateShort()
  
  // 2秒后自动取消确认状态
  setTimeout(() => {
    if (deleteConfirmIndex.value === index) {
      deleteConfirmIndex.value = -1
    }
  }, 2000)
}

// 确认删除
function confirmDelete(index: number, event: Event) {
  event.stopPropagation()
  emit('remove-image', index)
  deleteConfirmIndex.value = -1
  
  // 添加触感反馈
  uni.vibrateShort()
}

// 取消删除
function cancelDelete(event: Event) {
  event.stopPropagation()
  deleteConfirmIndex.value = -1
}
</script>

<template>
  <view class="relative">
    <view class="grid grid-cols-3 gap-[12rpx]">
      <!-- 图片列表 -->
      <view
        v-for="(image, index) in images"
        :key="image.id || index"
        class="relative aspect-square"
      >
        <!-- 图片容器 -->
        <view 
          class="relative h-full w-full overflow-hidden rounded-[12rpx] bg-gray-100"
          :class="{ 'ring-2 ring-purple-400': deleteConfirmIndex === index }"
          @tap="previewImage(index)"
        >
          <!-- 图片 -->
          <image
            :src="image.url"
            class="h-full w-full"
            mode="aspectFill"
            :lazy-load="true"
          />
          
          <!-- 序号指示器 -->
          <view class="absolute right-[8rpx] top-[8rpx] flex h-[32rpx] w-[32rpx] items-center justify-center rounded-full bg-purple-500">
            <text class="text-[18rpx] text-white font-bold">{{ index + 1 }}</text>
          </view>
        </view>
        
        <!-- 删除按钮 -->
        <view
          v-if="!disabled"
          class="absolute -right-[8rpx] -top-[8rpx]"
          @tap="deleteConfirmIndex === index ? confirmDelete(index, $event) : showDeleteConfirm(index, $event)"
        >
          <view 
            v-if="deleteConfirmIndex === index"
            class="flex h-[48rpx] w-[48rpx] items-center justify-center rounded-full bg-red-500 shadow-lg"
          >
            <text class="i-material-symbols-check text-[20rpx] text-white font-bold" />
          </view>
          <view 
            v-else
            class="flex h-[40rpx] w-[40rpx] items-center justify-center rounded-full bg-red-500 shadow-md"
          >
            <text class="i-material-symbols-close text-[18rpx] text-white" />
          </view>
        </view>
        
        <!-- 删除确认提示 -->
        <view 
          v-if="deleteConfirmIndex === index"
          class="absolute -bottom-[60rpx] left-1/2 transform -translate-x-1/2 bg-black/80 rounded-full px-[16rpx] py-[8rpx]"
        >
          <text class="text-[20rpx] text-white">点击确认删除</text>
          <view class="absolute -top-[8rpx] left-1/2 transform -translate-x-1/2 w-0 h-0" style="border-left: 8rpx solid transparent; border-right: 8rpx solid transparent; border-bottom: 8rpx solid rgba(0,0,0,0.8);" />
        </view>
      </view>
      
      <!-- 添加图片按钮 -->
      <view
        v-if="canAddMore"
        :class="addButtonClasses"
        @tap="chooseImages"
      >
        <view class="relative">
          <!-- 添加图标 -->
          <view 
            class="flex h-[80rpx] w-[80rpx] items-center justify-center rounded-full"
            :class="isUploading ? 'bg-purple-200' : 'bg-purple-100'"
          >
            <text 
              v-if="!isUploading"
              class="i-material-symbols-add text-[36rpx] text-purple-600"
            />
            <text 
              v-else
              class="i-material-symbols-sync text-[36rpx] text-purple-600"
            />
          </view>
        </view>
        
        <text class="mt-[12rpx] text-[22rpx] text-purple-600 font-medium">
          {{ isUploading ? '上传中...' : '添加图片' }}
        </text>
        <text class="mt-[2rpx] text-[18rpx] text-gray-500">
          {{ images.length }}/{{ maxCount }}
        </text>
      </view>
      
      <!-- 已满提示 -->
      <view
        v-else-if="images.length >= maxCount"
        class="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[12rpx] bg-gray-50"
      >
        <view class="flex h-[80rpx] w-[80rpx] items-center justify-center rounded-full bg-gray-200">
          <text class="i-material-symbols-check text-[36rpx] text-gray-400" />
        </view>
        <text class="mt-[12rpx] text-[22rpx] text-gray-400 font-medium">已满</text>
        <text class="mt-[2rpx] text-[18rpx] text-gray-400">{{ maxCount }}/{{ maxCount }}</text>
      </view>
    </view>
    
    <!-- 底部提示 -->
    <view v-if="images.length > 0" class="mt-[16rpx] flex items-center justify-between">
      <view class="flex items-center text-[20rpx] text-gray-500">
        <text class="i-material-symbols-info mr-[4rpx] text-[16rpx]" />
        <text>点击图片可预览</text>
      </view>
      
      <view v-if="images.length > 1" class="flex items-center text-[20rpx] text-purple-600">
        <text class="i-material-symbols-photo-library mr-[4rpx] text-[16rpx]" />
        <text>{{ images.length }}张图片</text>
      </view>
    </view>
    
    <!-- 删除确认遮罩 -->
    <view
      v-if="deleteConfirmIndex !== -1"
      class="fixed inset-0 bg-black/20 z-50"
      @tap="cancelDelete"
    />
  </view>
</template>

<style scoped>
/* 基础样式，无动画效果 */
</style>