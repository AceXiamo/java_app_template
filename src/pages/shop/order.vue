<script lang="ts" setup></script>

<template>
  <view a-container>
    <PageShopOrderHead />
    <view a-content bg-[#f7f7f7] p-[30rpx]>
      <view flex flex-col gap-[20rpx] rounded-[15rpx] bg-white p-[30rpx]>
        <text text-[28rpx] text-[#0d192d]>
          广东省深圳市南山区
        </text>
        <text text-[28rpx] text-[#0d192d]>
          高新技术产业园xxx
        </text>
        <text text-[28rpx] text-[#0d192d]>
          关博文 13888888888
        </text>
        <view flex items-center justify-between>
          <text text-[28rpx] text-[#0d192d]>
            配送方式
          </text>
          <text text-[28rpx] text-[#0d192d]>
            免运费
          </text>
        </view>
      </view>
      <view relative mt-[20rpx] flex gap-[20rpx] bg-white p-[8rpx]>
        <image h-[200rpx] w-[200rpx] src="https://axm.moe/avatar" mode="aspectFill" rounded-[4rpx] />
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
        <view absolute bottom-[10rpx] right-[10rpx] flex items-center gap-[20rpx] rounded-[10rpx] bg-[#f5f5f5] p-[10rpx]>
          <view i-heroicons-minus-20-solid text-[32rpx] text-[#3A3A3A] />
          <input type="number" value="1" class="w-[50rpx] text-center">
          <view i-heroicons-plus-20-solid text-[32rpx] text-[#3A3A3A] />
        </view>
      </view>
      <view mt-[20rpx] flex flex-col rounded-[15rpx] bg-white p-[30rpx]>
        <view flex items-center justify-between>
          <text text-[28rpx] text-[#0d192d]>
            商品总价
          </text>
          <text text-[28rpx] text-[#0d192d]>
            ￥1000.00
          </text>
        </view>
        <view mt-[30rpx] flex items-center justify-between>
          <text text-[28rpx] text-[#0d192d]>
            积分抵扣
          </text>
          <text text-[28rpx] text-[#0d192d]>
            -￥100.00
          </text>
        </view>
        <view mt-[30rpx] border-t-[1rpx] border-t-[#c7cbd8] border-t-solid />
        <view mt-[30rpx] flex items-center justify-between>
          <text text-[28rpx] text-[#0d192d]>
            合计
          </text>
          <text text-[28rpx] text-[#C4AA5E] font-bold>
            ￥900.00
          </text>
        </view>
      </view>
      <view mt-[20rpx] flex flex-col gap-[20rpx] rounded-[15rpx] bg-white p-[30rpx]>
        <text text-[28rpx] text-[#3a3a3a]>
          买家备注
        </text>
        <textarea placeholder="请输入备注" class="h-[150rpx] w-full rounded-[10rpx] bg-[#F0F0F0] p-[20rpx] text-[24rpx] box-border" />
      </view>
    </view>
    <view flex items-center border-t border-t-gray-200 border-t-solid bg-white px-[60rpx] pb-[40rpx] pt-[20rpx]>
      <view flex items-end>
        <text text-[22rpx] text-[#c4aa5e] leading-[22rpx]>
          应付:
        </text>
        <text ml-[10rpx] text-[30rpx] text-[#c4aa5e] font-bold leading-[30rpx]>
          ¥599
        </text>
      </view>
      <view ml-auto w-[210rpx] rounded-[50rpx] bg-[#c4aa5e] py-[20rpx] text-center text-[28rpx] text-white>
        提交订单
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
