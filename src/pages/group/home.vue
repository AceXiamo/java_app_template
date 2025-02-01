<script lang="ts" setup>
const selectValue = ref(0)

function toActivity() {
  uni.navigateTo({
    url: '/pages/group/activity',
  })
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto bg-white>
    <PageGroupHomeHead title="xx俱乐部" />
    <view a-content bg-[#f7f7f7] pb-[200rpx]>
      <image src="https://image.qwq.link/images/2025/01/25/265d992c18c57c862db14dce35f1e027.jpg" h-[450rpx] w-full mode="aspectFill" />
      <view flex flex-col px-[30rpx] pt-[50rpx]>
        <text text-[44rpx] text-[#3a3a3a]>
          xx俱乐部
        </text>
        <text mt-[20rpx] text-[26rpx] text-[#3a3a3a60] leading-[48rpx]>
          欢迎来到我们的俱乐部！这是一个充满活力与激情的社交团体，致力于汇聚各路英才，共同探索生活的无限可能。无论你是运动爱好者、艺术追求者，还是科技迷、旅行达人，这里都有属于你的舞台。我们定期举办丰富多彩的活动，从户外探险到文化交流，从技能工作坊到主题派对，旨在增进友谊，拓宽视野。加入我们，与志同道合的朋友携手前行，在欢笑与成长中创造难忘的回忆。这里不仅是一个俱乐部，更是一个温暖的大家庭，期待你的加入，一起书写精彩篇章！
        </text>
        <text mt-[60rpx] text-[32rpx] text-[#3a3a3a] font-bold>
          活动报名
        </text>
        <view flex items-center justify-between>
          <text mt-[10rpx] text-[22rpx] text-[#909090]>
            快来报名吧，这里有很多活动！
          </text>
          <text ml-auto text-[22rpx] text-[#909090] @click="toActivity">
            更多活动
          </text>
          <view i-heroicons-chevron-right-20-solid text-[#909090] />
        </view>
        <view mt-[30rpx] flex gap-[20rpx]>
          <view flex-1>
            <image h-[500rpx] w-full src="https://image.qwq.link/images/2023/08/03/twitter_1A21253bakmkmk3_20230801-083455_1686294425402847232_photo.jpg" mode="aspectFill" />
          </view>
          <view flex-1>
            <image h-[500rpx] w-full src="https://image.qwq.link/images/2023/08/03/twitter_1A21253bakmkmk3_20230801-083455_1686294425402847232_photo.jpg" mode="aspectFill" />
          </view>
        </view>
        <text mt-[60rpx] text-[32rpx] text-[#3a3a3a] font-bold>
          俱乐部合伙人
        </text>
        <view class="hide-scrollbar" mt-[30rpx] w-full flex gap-[20rpx] overflow-x-auto>
          <view v-for="i in 5" :key="i" w-max flex flex-none flex-col items-center>
            <image h-[180rpx] w-[180rpx] rounded-full src="https://axm.moe/avatar" mode="aspectFill" />
            <text mt-[20rpx] text-[28rpx] text-[#3a3a3a]>
              小明
            </text>
          </view>
        </view>
        <view mt-[60rpx] flex items-center justify-between>
          <text text-[32rpx] text-[#3a3a3a] font-bold>
            林倩如的商品
          </text>
          <SelectBar v-model="selectValue" :options="[{ label: '全部', value: 0 }, { label: '分类一', value: 1 }, { label: '分类二', value: 2 }]" w-[200rpx] />
        </view>
        <view grid grid-cols-2 mt-[30rpx] gap-[20rpx]>
          <view flex flex-col w-full items-center v-for="i in 4" :key="i">
            <view :style="{ backgroundImage: `url(https://axm.moe/avatar)` }" aspect-square w-full bg-cover bg-center rounded-1 />
            <text mt-[20rpx] text-[28rpx] text-[#3a3a3a]>
              商品名称
            </text>
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
