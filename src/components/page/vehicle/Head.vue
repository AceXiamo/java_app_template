<script lang="ts" setup>
import HeadBar from '@/components/HeadBar.vue'

// 定义事件
const emit = defineEmits<{
  favorite: []
  share: []
}>()

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 收藏
function handleFavorite() {
  emit('favorite')
}

// 分享
function handleShare() {
  emit('share')
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="relative h-full flex items-center">
      <!-- 返回按钮 -->
      <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
        <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
      </view>

      <!-- 页面标题 -->
      <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
        车辆详情
      </text>

      <!-- 右侧操作按钮 -->
      <view class="absolute right-0 z-10 flex h-full items-center space-x-[16rpx]">
        <!-- 收藏按钮 -->
        <view class="flex h-[64rpx] w-[64rpx] items-center justify-center" @tap="handleFavorite">
          <text class="i-material-symbols-favorite-border text-[32rpx] text-black" />
        </view>
        
        <!-- 分享按钮 -->
        <view class="flex h-[64rpx] w-[64rpx] items-center justify-center" @tap="handleShare">
          <text class="i-material-symbols-share text-[32rpx] text-black" />
        </view>
      </view>
    </view>
  </HeadBar>
</template>