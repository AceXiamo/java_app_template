<script lang="ts" setup>
function toOrder() {
  uni.navigateTo({
    url: '/pages/shop/order',
  })
}
</script>

<template>
  <view a-container>
    <PageShopCartHead />
    <view a-content rounded-[10rpx] bg-[#f7f7f7] px-[30rpx] py-[20rpx]>
      <view flex items-center gap-[20rpx]>
        <view box-border border-[3rpx] border-[#c7cbd8] rounded-full border-solid bg-white p-[10rpx]>
          <view h-[20rpx] w-[20rpx] rounded-full bg-[#c4aa5e] />
        </view>
        <view relative flex flex-auto gap-[20rpx] bg-white p-[8rpx]>
          <image h-[150rpx] w-[150rpx] src="https://axm.moe/avatar" mode="aspectFill" rounded-[4rpx] />
          <view h-[150rpx] flex flex-col>
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
          <view absolute bottom-[10rpx] right-[10rpx] flex items-center gap-[20rpx] rounded-[10rpx] bg-[#f5f5f5] p-[10rpx]>
            <view i-heroicons-minus-20-solid text-[32rpx] text-[#3A3A3A] />
            <input type="number" value="1" class="w-[50rpx] text-center">
            <view i-heroicons-plus-20-solid text-[32rpx] text-[#3A3A3A] />
          </view>
        </view>
      </view>
    </view>
    <view flex items-center border-t border-t-gray-200 border-t-solid bg-white px-[60rpx] pb-[40rpx] pt-[20rpx]>
      <view box-border border-[3rpx] border-[#c7cbd8] rounded-full border-solid bg-white p-[10rpx]>
        <view h-[20rpx] w-[20rpx] rounded-full bg-[#c4aa5e] />
      </view>
      <text ml-[15rpx] text-[28rpx] text-[#3a3a3a]>
        全选
      </text>
      <view ml-[60rpx] flex items-end>
        <text text-[22rpx] text-[#c4aa5e] leading-[22rpx]>
          合计:
        </text>
        <text ml-[10rpx] text-[30rpx] text-[#c4aa5e] font-bold leading-[30rpx]>
          ¥599
        </text>
      </view>
      <view ml-auto w-[210rpx] rounded-[50rpx] bg-[#c4aa5e] py-[20rpx] text-center text-[28rpx] text-white @click="toOrder">
        去结算
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
