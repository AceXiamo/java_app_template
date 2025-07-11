<script lang="ts" setup>
// 返回首页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view relative h-full flex items-center>
      <!-- 左侧返回和标题 -->
      <view ml-[24rpx] flex items-center>
        <view
          i-material-symbols:arrow-back-ios
          class="text-[24rpx] text-gray-700"
          @tap="goBack"
        />
        <text ml-[16rpx] text-[28rpx] text-black font-semibold>
          超值月租
        </text>
      </view>
    </view>
  </HeadBar>
</template> 
 