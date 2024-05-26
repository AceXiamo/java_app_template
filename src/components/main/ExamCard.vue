<script lang="ts" setup>
</script>

<template>
  <view relative bg-white p-[30rpx]>
    <view absolute bottom-0 right-0 top-0 z-0 w-[50%] bg-cover bg-center opacity="50" style="background-image: url(https://image.qwq.link/images/2024/03/29/top_cover.jpg)">
      <view h-full w-full style="background-image: linear-gradient(to right, white 20%, #ffffff50 70%, transparent);" />
    </view>
    <view relative z-1 flex flex-col gap-[10rpx]>
      <text text-[32rpx] font-bold>
        元神深渊竞速
      </text>
      <view flex items-center>
        <view i-twemoji:alarm-clock text-[24rpx] text-[#999] />
        <text ml-[10rpx] text-[24rpx] text-[#999]>
          比赛时间
        </text>
        <text ml-[20rpx] text-[24rpx] text-[#333]>
          2024-05-24 13:00
        </text>
      </view>
      <view flex items-center>
        <view i-twemoji:world-map text-[24rpx] text-[#999] />
        <text ml-[10rpx] text-[24rpx] text-[#999]>
          比赛地点
        </text>
        <text ml-[20rpx] text-[24rpx] text-[#333]>
          湖南省株洲市天元区
        </text>
      </view>
      <view flex flex-[warp] gap-[10rpx] pt-[10rpx]>
        <main-exam-tag text="篮球" />
        <main-exam-tag text="唱" />
        <main-exam-tag text="跳" />
        <main-exam-tag text="Rap" />
        <main-exam-tag text="元神" />
        <main-exam-tag text="竞速" />
      </view>
      <view my-[15rpx] h-[1px] border-t-[1px] border-t-[#999] border-t-dashed bg-transparent />
      <view flex items-center justify-between>
        <view flex items-center gap-[20rpx]>
          <image src="https://axm.moe/avatar" h-[50rpx] w-[50rpx] rounded-full mode="aspectFill" />
          <text text-[24rpx] text-[#333]>
            AceXiamo
          </text>
        </view>
        <view text-[24rpx] text-[#333]>
          五小时前
        </view>
      </view>
    </view>
  </view>
</template>
