<script lang="ts" setup></script>

<template>
  <view h-full flex flex-col>
    <VisitRecordHead />
    <VisitRecordQuery mt-[20rpx] />
    <view mt-[20rpx] h-0 flex-auto overflow-y-auto px-[20rpx] pb-[20rpx]>
      <MainVisitItem />
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
