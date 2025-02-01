<script lang="ts" setup>
const activeType = ref(0)
const type = ['嘉宾', '过期嘉宾', '会员']
</script>

<template>
  <view a-container>
    <PageMyMemberHead />
    <view a-content>
      <!-- 搜索框 -->
      <view class="px-[30rpx] pt-[30rpx]">
        <view class="flex items-center border border-[#DADADA] rounded-full border-solid px-[20rpx] py-[12rpx]">
          <view i-heroicons-magnifying-glass-20-solid text-lg text-gray-400 />
          <input
            type="text"
            placeholder="请输入搜索关键词"
            class="ml-2 flex-1 text-[26rpx]"
          >
        </view>
      </view>

      <!-- 主题标签栏 -->
      <view class="hide-scrollbar mt-[35rpx] mt-[35rpx] flex overflow-x-auto border-b border-gray-100 px-[30rpx]">
        <view
          v-for="(tab, index) in type"
          :key="index"
          class="relative w-[33.3%] flex-none pb-[20rpx] text-center text-[#847855]"
          :class="{ '!text-[#091722] font-bold': activeType === index }"
          @tap="activeType = index"
        >
          <text class="text-[28rpx]">
            {{ tab }}
          </text>
          <view
            class="absolute bottom-0 left-0 right-0 mx-auto h-[4rpx] w-[40rpx] translate-y-[calc(-100%+10rpx)] rounded-[10rpx] bg-[#3A3A3A] opacity-0"
            :class="{ '!opacity-100 !-translate-y-full': activeType === index }"
            transition="all 0.3s"
          />
        </view>
      </view>

      <view flex flex-col gap-[30rpx] p-[30rpx]>
        <view flex gap-[30rpx] rounded-lg p-[30rpx] shadow-md style="box-shadow: 0 0 8rpx #00000050;">
          <image src="https://axm.moe/avatar" class="h-[180rpx] w-[180rpx] rounded-lg" mode="aspectFill" />
          <view flex flex-1 flex-col>
            <text class="text-[36rpx] text-[#3A3A3A] font-medium">
              AceXiamo
            </text>
            <view mt-[10rpx] flex gap-[10rpx] text-[28rpx] text-[#3a3a3a]>
              <text>Future Radio</text>
              <text>CEO</text>
            </view>
            <text mt-auto text-[24rpx] text-gray-500>
              嘉宾剩余有效天数：8天
            </text>
          </view>
        </view>
      </view>

      <view mx-[30rpx] mt-[50rpx] flex justify-center rounded-[50rpx] bg-[#c6a95d] px-[30rpx] py-[20rpx] text-white>
        <text text-[28rpx]>
          邀约入会
        </text>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
