<script setup lang="ts">
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="flex items-center px-[40rpx] py-[16rpx]">
      <view class="flex items-center space-x-[8rpx]">
        <text
          i-material-symbols:arrow-back-ios
          class="text-[24rpx] text-gray-700"
          @tap="goBack"
        />
        <text class="text-[32rpx] text-black font-bold">
          百元盲盒
        </text>
      </view>
    </view>
  </HeadBar>
</template>
