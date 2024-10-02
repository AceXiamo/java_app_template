<script lang="ts" setup></script>

<template>
  <view h-full flex flex-col>
    <UserHead />
    <UserQuery mt-[20rpx] />
    <view mt-[20rpx] h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[20rpx]>
      <UserItem />
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
