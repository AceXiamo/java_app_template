<script lang="ts" setup></script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #f97316 70%, #F5F5F5)" />
    <MyHeadBar sticky top-0 z-[10] bg-color="transparent" />
    <view z-1 flex-none>
      <!-- <view relative mx-[20rpx] mt-[70rpx] rounded-md px-[20rpx] pb-[20rpx] pt-[90rpx] h-[200rpx]>
        <view absolute top-0 left-[40rpx] -translate-y-[50%] flex items-start gap-[20rpx]>
          <image src="https://axm.moe/avatar" mode="aspectFill" h-[140rpx] w-[140rpx] rounded-full />
          <text text-[34rpx] text-white font-bold translate-y-[20rpx]>AceXiamo</text>
        </view>
      </view> -->

      <view mx-[40rpx] flex items-start gap-[20rpx]>
        <image src="https://axm.moe/avatar" mode="aspectFill" h-[120rpx] w-[120rpx] rounded-full />
        <text translate-y-[20rpx] text-[34rpx] text-white font-bold>
          AceXiamo
        </text>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:sailboat text-[28rpx] text-orange-500 />
          <text text-[30rpx] text-[#333] font-bold>
            我是举办方
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx]>
            <!-- <view grid h-[110rpx] w-[110rpx] place-content-center bg="#FFE51E/30" rounded-md> -->
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:man-bouncing-ball-medium-light-skin-tone text-[45rpx] />
            </view>
            <text text-[26rpx]>
              我的赛事
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx]>
            <!-- <view grid h-[110rpx] w-[110rpx] place-content-center bg="#F4900C/30" rounded-md> -->
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:hammer-and-wrench text-[35rpx] />
            </view>
            <text text-[26rpx]>
              赛事工具
            </text>
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <!-- <view i-heroicons:identification-solid text-[32rpx] text-orange-500 /> -->
          <view i-twemoji:soccer-ball text-[28rpx] />
          <text text-[30rpx] text-[#333] font-bold>
            我是运动员
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx]>
            <!-- <view grid h-[110rpx] w-[110rpx] place-content-center bg="#55ACEE/30" rounded-md> -->
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:open-file-folder text-[35rpx] />
            </view>
            <text text-[26rpx]>
              我的档案
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx]>
            <!-- <view grid h-[110rpx] w-[110rpx] place-content-center bg="#FFCC4D/30" rounded-md> -->
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:trident-emblem text-[35rpx] />
            </view>
            <text text-[26rpx]>
              我的战队
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx]>
            <!-- <view grid h-[110rpx] w-[110rpx] place-content-center bg="#9AAAB4/30" rounded-md> -->
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:crossed-swords text-[35rpx] />
            </view>
            <text text-[26rpx]>
              我的参赛
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route type="home" lang="json">
  {}
</route>
