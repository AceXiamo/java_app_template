<script lang="ts" setup>
const activeType = ref(0)
const type = ['全部', '待付款', '待发货', '已发货', '待评价', '已完成']
</script>

<template>
  <view a-container>
    <PageMyOrderHead />
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
          class="relative w-[25%] flex-none pb-[20rpx] text-center text-[#847855]"
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

      <view p-[30rpx]>
        <view flex flex-col bg-white rounded-[20rpx] shadow-md overflow-hidden>
          <view relative flex gap-[20rpx] bg-white p-[20rpx]>
            <image h-[200rpx] w-[200rpx] src="https://axm.moe/avatar" mode="aspectFill" rounded-[12rpx] />
            <view h-[200rpx] flex flex-col>
              <text text-[28rpx] text-[#3a3a3a]>
                XXX课程
              </text>
              <text mt-[8rpx] text-[24rpx] text-[#afafaf]>
                A套餐
              </text>
              <text mt-auto text-[32rpx] text-[#c4aa5e] font-bold>
                ￥1000
              </text>
            </view>
            <text absolute right-[30rpx] top-[30rpx] text-[24rpx] text-[#afafaf]>
              交易成功
            </text>
          </view>
          <view border-t border-t-[#ededed] border-t-solid />
          <view p-[20rpx] flex>
            <text text-[#888888] text-[24rpx]>订单编号：561654654654654</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
