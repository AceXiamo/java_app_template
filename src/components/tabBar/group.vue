<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const tabs = ['所有主题', '女性主题', '投资主题', '其他']

const cardList = ref([
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    date: '07.13南山',
  },
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    date: '07.13南山',
  },
])

function toGroupHome() {
  uni.navigateTo({
    url: '/pages/group/home',
  })
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <PageGroupHead />
    <view h-0 flex-1 overflow-y-auto>
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
      <view class="hide-scrollbar mt-[35rpx] flex overflow-x-auto border-b border-gray-100 px-[30rpx]">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="relative w-[33%] flex-none pb-[20rpx] text-center text-[#847855]"
          :class="{ '!text-[#091722] font-bold': activeTab === index }"
          @tap="activeTab = index"
        >
          <text class="text-[28rpx]">
            {{ tab }}
          </text>
          <view
            class="absolute bottom-0 left-0 right-0 mx-auto h-[4rpx] w-[40rpx] translate-y-[calc(-100%+10rpx)] rounded-[10rpx] bg-[#3A3A3A] opacity-0"
            :class="{ '!opacity-100 !-translate-y-full': activeTab === index }"
            transition="all 0.3s"
          />
        </view>
      </view>

      <!-- 卡片网格 -->
      <view class="grid grid-cols-2 gap-4 px-4 py-4">
        <view
          v-for="(item, index) in cardList"
          :key="index"
          class="flex flex-col overflow-hidden border border-[#EBECED] rounded-lg border-solid"
          @tap="toGroupHome"
        >
          <image
            :src="item.image"
            mode="aspectFill"
            class="aspect-square h-[380rpx] w-full"
          />
          <view class="border-t border-t-[#EBECED] border-t-solid p-2">
            <text class="text-sm text-gray-600">
              {{ item.date }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
