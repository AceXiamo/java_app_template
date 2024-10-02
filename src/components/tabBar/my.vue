<script lang="ts" setup>
function toUser() {
  uni.navigateTo({
    url: '/pages/my/user',
  })
}

function toVisitRecord() {
  uni.navigateTo({
    url: '/pages/my/visitRecord',
  })
}

function toVisitType() {
  uni.navigateTo({
    url: '/pages/my/visitType',
  })
}

function toOutcomeType() {
  uni.navigateTo({
    url: '/pages/my/outcomeType',
  })
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)" />
    <MyHeadBar sticky top-0 z-[10] bg-color="transparent" />
    <view z-1 flex-none>
      <view mx-[40rpx] flex items-start gap-[20rpx]>
        <image src="https://axm.moe/avatar" mode="aspectFill" h-[120rpx] w-[120rpx] rounded-full />
        <view flex flex-col gap-[10rpx]>
          <text text-[34rpx] text-white font-bold>
            AceXiamo
          </text>
          <view w-max rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[24rpx] text-white>
            管理员
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:identification-card text-[28rpx] text-orange-500 />
          <text text-[30rpx] text-[#333] font-bold>
            人员
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx] @click="toUser">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-logos:microsoft-teams text-[40rpx] />
            </view>
            <text text-[26rpx]>
              团队成员
            </text>
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:newspaper text-[28rpx] />
          <text text-[30rpx] text-[#333] font-bold>
            拜访
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx] @click="toVisitRecord">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:page-facing-up text-[35rpx] />
            </view>
            <text text-[26rpx]>
              拜访记录
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx] @click="toVisitType">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:wrench text-[35rpx] />
            </view>
            <text text-[26rpx]>
              拜访类型
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx] @click="toOutcomeType">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:pushpin text-[35rpx] />
            </view>
            <text text-[26rpx]>
              结果类型
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {}
</route>
