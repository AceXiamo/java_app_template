<script lang="ts" setup>
function toCart() {
  uni.navigateTo({
    url: '/pages/shop/cart',
  })
}
</script>

<template>
  <view a-container>
    <PageShopHomeHead />
    <view a-content pb-[200rpx]>
      <Banner
        :images="[
          'https://image.qwq.link/images/2025/01/25/265d992c18c57c862db14dce35f1e027.jpg',
          'https://image.qwq.link/images/2025/01/25/twitter_Gracilegracile_jp_20250122-142749_1882072683086815710_photo.jpg',
        ]"
        :height="700"
      />
      <view flex flex-col px-[30rpx] py-[50rpx]>
        <text text-[44rpx] text-[#3a3a3a]>
          XX课程
        </text>
        <text mt-[10rpx] text-[26rpx] text-[#3a3a3a] leading-[48rpx]>
          很棒的学习体验！期待你的参与！
        </text>
        <text mt-[20rpx] text-[30rpx] font-bold>
          ¥599-2999元
        </text>
        <view mt-[20rpx] flex items-center justify-between rounded-[8rpx] bg-[#efefef] px-[30rpx] py-[10rpx]>
          <text text-[28rpx] text-[#3a3a3a]>
            运费
          </text>
          <text text-[28rpx] text-[#3a3a3a]>
            免运费
          </text>
        </view>
        <view mt-[20rpx] flex items-center justify-between rounded-[8rpx] bg-[#efefef] px-[30rpx] py-[10rpx]>
          <text text-[28rpx] text-[#3a3a3a]>
            选择
          </text>
          <text text-[28rpx] text-[#3a3a3a]>
            XXX套餐
          </text>
        </view>
      </view>
      <image src="https://image.qwq.link/images/2025/01/25/265d992c18c57c862db14dce35f1e027.jpg" h-[600rpx] w-full mode="aspectFill" />
    </view>
    <view fixed bottom-0 left-0 right-0 flex items-center bg-[#fff] px-[50rpx] pb-[50rpx] pt-[20rpx] shadow-lg>
      <view flex flex-col items-center gap-[5rpx]>
        <AIcon icon="shop_bag" :size="40" />
        <text text-[20rpx] text-[#3a3a3a]>
          商城
        </text>
      </view>
      <view ml-[50rpx] flex flex-col items-center gap-[5rpx] @click="toCart">
        <AIcon icon="cart" :size="40" />
        <text text-[20rpx] text-[#3a3a3a]>
          购物车
        </text>
      </view>
      <view ml-auto w-[200rpx] flex items-center justify-center rounded-[50rpx] bg-[#c6a95d] py-[20rpx] text-center>
        <text text-[24rpx] text-[#fff] font-bold>
          加入购物车
        </text>
      </view>
      <view ml-[20rpx] w-[200rpx] flex items-center justify-center rounded-[50rpx] bg-[#c6a95d] py-[20rpx] text-center>
        <text text-[24rpx] text-[#fff] font-bold>
          立即购买
        </text>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
