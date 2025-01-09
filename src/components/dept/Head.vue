<script lang="ts" setup>
function back() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view relative h-full flex items-center justify-center>
      <view i-heroicons:chevron-left-20-solid absolute left-[20rpx] text-[40rpx] text-black @click="back" />
      <text text-[30rpx] text-black>
        部门管理
      </text>
    </view>
  </HeadBar>
</template>
