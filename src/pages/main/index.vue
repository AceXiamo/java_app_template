<script setup lang="ts">

</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)" />
    <MainHead sticky top-0 z-[10] />
    <view z-1 h-0 flex-auto overflow-y-auto>
      <view mx-[20rpx] mt-[20rpx] flex gap-[20rpx]>
        <view flex items-center gap-[10rpx]>
          <view h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full active:opacity-60>
            <view i-heroicons:chevron-left-16-solid text-[30rpx] text-white />
          </view>
          <view h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full active:opacity-60>
            <view i-heroicons:chevron-right-16-solid text-[30rpx] text-white />
          </view>
        </view>
        <view flex gap-[10rpx]>
          <text text-[36rpx] text-white font-bold>
            {{ yearAndMonth.split('-')[1] }}
          </text>
          <text text-[26rpx] text="white/70" font-bold>
            {{ yearAndMonth.split('-')[0] }}
          </text>
        </view>
      </view>
      <view m-[20rpx] box-border flex flex-col>
        <view grid grid-cols-7 gap-[5rpx]>
          <view v-for="item in week" :key="item" flex-1 rounded-[15rpx] bg="white/30" py-[10rpx] text-center text-[24rpx] text-gray-200 font-bold>
            {{ item }}
          </view>
          <view v-for="item in month" :key="item">
            <view
              relative box-border min-h-[80rpx] flex flex-1 flex-col items-center justify-center rounded-[15rpx] py-[10rpx]
              :style="{
                opacity: item.isThisMonth ? 1 : 0.3,
                backgroundColor: item.fullDay === activeDay ? '#ecfdf5' : '#00000025',
              }"
            >
              <view v-if="item.fullDay === today" absolute right-[10rpx] top-[10rpx] h-[10rpx] w-[10rpx] rounded-full bg-emerald-400 />
              <view v-if="item.day === '20'" flex items-center gap-[4rpx]>
                <view i-heroicons:bell-alert-16-solid text-[18rpx] text-red-300 />
                <text text-[20rpx] text-white>
                  x
                </text>
                <text text-[20rpx] text-white>
                  3
                </text>
              </view>
              <text
                mt-auto text-[20rpx] :style="{
                  color: item.fullDay === activeDay ? '#34D399' : '#fff',
                }"
              >
                {{ item.day }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view
        mt-[30rpx] flex items-center gap-[10rpx] px-[20rpx]
      >
        <view i-heroicons:document-duplicate-solid text-[32rpx] text-purple-400 />
        <text text-[32rpx] font-bold>
          拜访任务
        </text>
      </view>
      <view mx-[20rpx] mt-[20rpx] flex flex-col gap-[10rpx]>
        <view flex flex-col gap-[20rpx] pb-[20rpx]>
          <MainVisitItem v-for="item in 10" :key="item" />
        </view>
      </view>
    </view>
  </view>
</template>

<route type="home" lang="json">
{
}
</route>
