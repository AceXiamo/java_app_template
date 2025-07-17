<script lang="ts" setup>
import HeadBar from '@/components/HeadBar.vue'

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="relative h-full flex items-center">
      <!-- 返回按钮 -->
      <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
        <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-gray-50 transition-colors active:bg-gray-100">
          <text class="i-material-symbols-arrow-back text-[28rpx] text-gray-700" />
        </view>
      </view>

      <!-- 页面标题 -->
      <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
        车辆详情
      </text>
    </view>
  </HeadBar>
</template>
