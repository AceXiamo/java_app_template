<script setup lang="ts">
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="flex items-center justify-between px-[40rpx] py-[16rpx]">
      <view class="flex items-center space-x-[12rpx]">
        <text
          class="i-material-symbols:arrow-back-ios text-[32rpx] text-[#1F2937]"
          @tap="goBack"
        />
        <text class="text-[32rpx] text-[#0F172A] font-bold">
          用车榜单
        </text>
      </view>
    </view>
  </HeadBar>
</template>
