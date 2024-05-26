<script setup lang="ts">
const showExamTypes = ref(false)
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #f97316 70%, #F5F5F5)" />
    <MainHead sticky top-0 z-[10] />
    <view z-1 flex-none>
      <view m-[20rpx] flex items-center gap-[10rpx]>
        <view i-heroicons:swatch-20-solid text-[40rpx] text-white />
        <text text-[36rpx] text-white font-bold>
          赛事分类
        </text>
      </view>
      <view relative m-[20rpx] h-max flex gap-[20rpx] overflow-auto rounded-md bg-white p-[10rpx]>
        <!-- left shadow -->
        <MainCard title="篮球" icon="🏀" />
        <MainCard title="足球" icon="⚽️" />
        <MainCard title="网球" icon="🎾" />
        <MainCard title="羽毛球" icon="🏸" />
        <MainCard title="乒乓球" icon="🏓" />
        <MainCard title="棒球" icon="⚾" />
        <MainCard title="游泳" icon="🏊" />
        <MainCard title="跑步" icon="🏃" />
        <MainCard title="电竞" icon="🎮" />
        <MainCard title="棋牌" icon="🎲" />
        <!-- right shadow -->
      </view>
      <view mx-[20rpx] mt-[20rpx] rounded-md bg-[#00000020] py-[20rpx] text-center text-white @tap="showExamTypes = true">
        <text mr-[10rpx] text-[28rpx]>
          全部赛事项目
        </text>
        <view i-heroicons:chevron-down-16-solid text-[28rpx] />
      </view>
      <!-- split line -->
      <view mx-auto mt-[20rpx] h-[4px] w-[80rpx] rounded-4rpx bg-[#00000020] />
      <view grid grid-cols-3 mx-[20rpx] mt-[20rpx] gap-[20rpx]>
        <MainItem title="我的队伍" bg-color="#F9721650">
          <view i-twemoji:tent />
        </MainItem>
        <MainItem title="我的比赛" bg-color="#10b98150">
          <view i-twemoji:fire />
        </MainItem>
        <MainItem title="创建队伍" bg-color="#8b5cf650">
          <view i-twemoji:crossed-swords />
        </MainItem>
      </view>
      <view mx-[20rpx] mt-[20rpx] h-[82rpx] flex>
        <MainQueryBar />
      </view>
      <view mx-[20rpx] flex flex-col gap-[20rpx]>
        <MainExamCard
          v-for="index of 5" :key="index" overflow-hidden rounded-[20rpx] :style="{
            ...(index === 1 && {
              borderTopLeftRadius: '0',
            }),
          }"
        />
      </view>
      <view h-[20rpx] />
    </view>
  </view>
  <BottomDrawer :visible="showExamTypes" @update:visible="(val) => showExamTypes = val" />
</template>

<route lang="json">
{
}
</route>
