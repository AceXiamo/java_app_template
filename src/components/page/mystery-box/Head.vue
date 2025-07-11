<script setup lang="ts">
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="flex items-center px-[40rpx] py-[16rpx]">
      <view class="flex items-center space-x-[24rpx]">
        <text
          class="i-material-symbols-arrow-back-ios text-[24rpx] text-gray-700 cursor-pointer"
          @tap="goBack"
        />
        <text class="text-[28rpx] text-black font-semibold">百元盲盒</text>
      </view>
    </view>
  </HeadBar>
</template>
