<script setup lang="ts">
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <PageMainHead />
    <view h-0 flex-1 overflow-y-auto>
      <Banner
        :images="[
          'https://image.qwq.link/images/2025/01/25/265d992c18c57c862db14dce35f1e027.jpg',
          'https://image.qwq.link/images/2025/01/25/twitter_Gracilegracile_jp_20250122-142749_1882072683086815710_photo.jpg',
        ]"
      />
      <view mx-[30rpx] mt-[60rpx] flex flex-col>
        <view grid grid-cols-2 gap-[26rpx]>
          <view flex items-center justify-between border border-#e5e5e5 rounded-[13px] border-solid bg-cover bg-center px-[22rpx] py-[30rpx] style="background-image: url('https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/homepage_background.png')">
            <view flex flex-col>
              <text text-[36rpx] text-[#3A3A3A]>
                活动报名
              </text>
              <text mt-[10rpx] text-[22rpx] text-[#909090]>
                更多活动
              </text>
            </view>
            <AIcon icon="activity_sign" :size="100" />
          </view>
          <view flex items-center justify-between border border-#e5e5e5 rounded-[13px] border-solid bg-cover bg-center px-[22rpx] py-[30rpx] style="background-image: url('https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/homepage_background.png')">
            <view flex flex-col>
              <text text-[36rpx] text-[#3A3A3A]>
                活动发起
              </text>
              <text mt-[10rpx] text-[22rpx] text-[#909090]>
                发布活动内容
              </text>
            </view>
            <AIcon icon="activity_initiate" :size="100" />
          </view>
        </view>

        <image w-full rounded-[13px] mt-[60rpx] src="https://image.qwq.link/images/2025/01/25/twitter_Gracilegracile_jp_20250122-142749_1882072683086815710_photo.jpg" mode="widthFix" />
        
        <view flex flex-col mt-[60rpx]>
          <text text-[36rpx] text-[#3A3A3A]>
            首推活动
          </text>
          <text text-[22rpx] text-[#909090] mt-[10rpx]>
            快来报名吧，这里有很多活动！
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
