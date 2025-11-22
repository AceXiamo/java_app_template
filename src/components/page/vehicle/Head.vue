<script lang="ts" setup>
import HeadBar from '@/components/HeadBar.vue'

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="ml-[24rpx] relative h-full flex items-center">
      <view
        i-material-symbols:arrow-back-ios
        class="text-[24rpx] text-gray-700"
        @tap="goBack"
      />

      <!-- 页面标题 -->
      <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold pointer-events-none">
        车辆详情
      </text>
    </view>
  </HeadBar>
</template>
