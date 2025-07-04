<script lang="ts" setup>
</script>

<template>
  <HeadBar bg-color="linear-gradient(to right, #faf5ff, #f0f9ff)">
    <view relative h-full flex items-center>
      <!-- 左侧城市定位 -->
      <view ml-[32rpx] flex items-center>
        <view
          i-material-symbols:location-on
          class="text-[32rpx] text-[#8b5cf6]"
        />
        <text ml-[8rpx] text-[28rpx] text-black font-medium>
          上海
        </text>
        <view
          i-material-symbols:keyboard-arrow-down
          class="ml-[4rpx] text-[24rpx] text-gray-600"
        />
      </view>
    </view>
  </HeadBar>
</template>
