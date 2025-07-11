<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue'

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="flex items-center justify-between px-[40rpx] py-[16rpx]">
      <view class="flex items-center space-x-[24rpx]">
        <text
          class="i-material-symbols-arrow-back-ios cursor-pointer text-[24rpx] text-gray-700"
          @tap="goBack"
        />
        <text class="text-[28rpx] text-black font-semibold">
          车主认证
        </text>
      </view>
    </view>
  </HeadBar>
</template>
