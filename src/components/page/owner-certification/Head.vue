<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue'

function goBack() {
  uni.navigateBack()
}

function goToRecords() {
  uni.navigateTo({
    url: '/pages/vehicle-affiliation-records/index'
  })
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
        车辆挂靠申请
      </text>

      <!-- 填写记录按钮 -->
      <view class="absolute right-0 z-10 h-full flex items-center pr-[24rpx]">
        <view 
          class="flex items-center space-x-[8rpx] bg-purple-50 rounded-full px-[20rpx] py-[12rpx] active:scale-95 transition-transform"
          @tap="goToRecords"
        >
          <text class="i-material-symbols-history text-[24rpx] text-purple-600" />
          <text class="text-[24rpx] text-purple-600 font-medium">记录</text>
        </view>
      </view>
    </view>
  </HeadBar>
</template>
