<script lang="ts" setup>
function back() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="#2E2E2E">
    <view relative h-full flex items-center>
      <view i-material-symbols:arrow-back-ios ml-[20rpx] text-[28rpx] text-white @tap="back" />
      <text pointer-events-none absolute left-0 right-0 text-center text-white>
        我的嘉宾
      </text>
    </view>
  </HeadBar>
</template>
