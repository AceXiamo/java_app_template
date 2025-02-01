<script lang="ts" setup></script>

<template>
  <view a-container>
    <PageMyPointHead />
    <view a-content bg-[#F7F7F7]>
      <view relative px-[30rpx] pt-[30rpx]>
        <view h="[calc(50%+15rpx)]" absolute left-0 top-0 z-1 w-full bg-[#2e2e2e] />
        <view relative z-2 h-[230rpx] flex rounded-md class="bg-[url(https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/point_image.png)] bg-cover bg-center">
          <view flex flex-1 flex-col items-center justify-center gap-[20rpx]>
            <text text-[30rpx] text-[#3a3a3a]>
              可结算积分
            </text>
            <text text-[36rpx] text-[#3a3a3a] font-bold>
              1000
            </text>
          </view>
          <view flex flex-1 flex-col items-center justify-center gap-[20rpx]>
            <text text-[30rpx] text-[#3a3a3a]>
              总获得积分
            </text>
            <text text-[36rpx] text-[#3a3a3a] font-bold>
              1000
            </text>
          </view>
        </view>
      </view>
      <view p-[30rpx]>
        <view flex flex-col rounded-lg bg-white p-[30rpx]>
          <text text-[28rpx] text-[#3a3a3a]>
            积分变动详情
          </text>
          <view mt-[30rpx] flex items-center gap-[40rpx]>
            <view flex flex-1 items-center justify-center gap-[10rpx] rounded-md bg-[#f5f5f5] p-[20rpx]>
              <text w-0 flex-auto truncate text-[28rpx] text-[#9A9A9A]>
                开始时间
              </text>
              <view i-carbon-calendar text-[28rpx] text-[#9a9a9a] />
            </view>
            <text text-[28rpx] text-[#AAAAAA]>
              -
            </text>
            <view flex flex-1 items-center justify-center gap-[10rpx] rounded-md bg-[#f5f5f5] p-[20rpx]>
              <text w-0 flex-auto truncate text-[28rpx] text-[#9A9A9A]>
                结束时间
              </text>
              <view i-carbon-calendar text-[28rpx] text-[#9a9a9a] />
            </view>
          </view>
          <view mt-[30rpx] flex items-center text-[28rpx]>
            <text flex-1>
              日期
            </text>
            <text flex-1>
              数量
            </text>
            <text flex-1>
              备注
            </text>
          </view>
          <view mt-[20rpx] border-t border-t-[#f2f2f2] border-t-solid />
          <view mt-[20rpx] flex flex-col>
            <view flex items-center text-[26rpx] text-[#3a3a3a]>
              <text flex-1 w-0 truncate>
                2025-01-01
              </text>
              <text flex-1 w-0 truncate>
                100
              </text>
              <text flex-1 w-0 truncate text-[#9A9A9A]>
                备注
              </text>
            </view>
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
