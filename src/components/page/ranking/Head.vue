<script setup lang="ts">
function goBack() {
  uni.navigateBack()
}

function refreshData() {
  // 触发页面数据刷新
  uni.$emit('rankingRefresh')
  uni.showToast({
    title: '正在刷新...',
    icon: 'loading',
    duration: 1000,
  })
}

function shareRanking() {
  uni.showActionSheet({
    itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showToast({
          title: '分享给朋友',
          icon: 'success',
        })
      }
      else if (res.tapIndex === 1) {
        uni.showToast({
          title: '分享到朋友圈',
          icon: 'success',
        })
      }
      else if (res.tapIndex === 2) {
        uni.setClipboardData({
          data: '窍启租车用车榜单',
          success: () => {
            uni.showToast({
              title: '链接已复制',
              icon: 'success',
            })
          },
        })
      }
    },
  })
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="flex items-center justify-between px-[40rpx] py-[16rpx]">
      <view class="flex items-center space-x-[24rpx]">
        <text
          class="i-material-symbols-arrow-back-ios cursor-pointer text-[24rpx] text-gray-700"
          @tap="goBack"
        />
        <text class="text-[28rpx] text-black font-semibold">
          用车榜单
        </text>
      </view>
      <view class="flex items-center space-x-[32rpx]">
        <text
          class="i-material-symbols-refresh cursor-pointer text-[24rpx] text-gray-700"
          @tap="refreshData"
        />
        <text
          class="i-material-symbols-share cursor-pointer text-[24rpx] text-gray-700"
          @tap="shareRanking"
        />
      </view>
    </view>
  </HeadBar>
</template>
