<script lang="ts" setup>
function back() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="#2E2E2E">
    <view relative h-full flex items-center>
      <view i-heroicons-chevron-left-20-solid ml-[20rpx] text-white @tap="back" />
      <text pointer-events-none absolute left-0 right-0 text-center text-white>
        活动列表
      </text>
    </view>
  </HeadBar>
</template>
