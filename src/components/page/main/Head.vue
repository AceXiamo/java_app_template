<script lang="ts" setup>
import { useLocationStore } from '@/store/location'

const locationStore = useLocationStore()

// 处理城市点击事件
function handleCityClick() {
  // 发送全局事件通知父组件显示城市抽屉
  uni.$emit('showCityDrawer')
}
</script>

<template>
  <HeadBar bg-color="linear-gradient(to right, #faf5ff, #f0f9ff)">
    <view relative h-full flex items-center>
      <!-- 左侧城市定位 -->
      <view ml-[32rpx] flex items-center @tap="handleCityClick">
        <view
          i-material-symbols:location-on
          class="text-[32rpx] text-[#8b5cf6]"
        />
        <text class="ml-[8rpx] text-[28rpx] text-black font-medium">
          {{ locationStore.displayCity }}
        </text>
        <view 
          i-material-symbols:keyboard-arrow-down
          class="ml-[8rpx] text-[24rpx] text-[#8b5cf6] opacity-70"
        />
      </view>
    </view>
  </HeadBar>
</template>
