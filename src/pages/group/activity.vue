<script lang="ts" setup>
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
</script>

<template>
  <view a-container>
    <PageMainActivityHead />
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

      <view class="grid grid-cols-2 gap-4 px-4 py-4">
        <view
          v-for="(item, index) in cardList"
          :key="index"
          class="flex flex-col overflow-hidden border border-[#EBECED] rounded-lg border-solid"
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

<route lang="yaml">
  layout: home
</route>
