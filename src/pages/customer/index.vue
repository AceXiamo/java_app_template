<script lang="ts" setup>
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)" />
    <CustomerHead relative z-[10] />
    <CustomerQuery relative z-[10] />
    <view z-1 mt-[20rpx] h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[20rpx]>
      <CustomerItem v-for="item in 10" :key="item" />
    </view>
  </view>
</template>

<route lang="json">
  {}
</route>
