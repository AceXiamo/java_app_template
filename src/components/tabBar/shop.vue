<script lang="ts" setup>
const activeTab = ref(0)
const tabs = ['所有主题', '女性主题', '投资主题', '其他']

const courseList = ref([
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    title: 'XXX课程',
    description: '很棒的学习体验！期待你的参与！',
    price: '599',
  },
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    title: 'XXX课程',
    description: '很棒的学习体验！期待你的参与！',
    price: '599',
  },
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    title: 'XXX课程',
    description: '很棒的学习体验！期待你的参与！',
    price: '599',
  },
  {
    image: 'https://image.qwq.link/images/2023/08/15/twitter_MP26player_20230813-004333_1690524454458454016_photo.jpg',
    title: 'XXX课程',
    description: '很棒的学习体验！期待你的参与！',
    price: '599',
  },
])

const activeType = ref(0)
const type = ['全部', '分类一', '分类二', '分类三']

function toShopHome() {
  uni.navigateTo({
    url: '/pages/shop/home',
  })
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto bg-[#F7F7F7]>
    <PageShopHead />
    <view class="h-0 flex-auto overflow-y-auto">
      <view class="bg-white px-[30rpx] pt-[30rpx]">
        <view class="flex items-center border border-[#DADADA] rounded-full border-solid px-[20rpx] py-[12rpx]">
          <view i-heroicons-magnifying-glass-20-solid text-lg text-gray-400 />
          <input
            type="text"
            placeholder="请输入搜索关键词"
            class="ml-2 flex-1 text-[26rpx]"
          >
        </view>

        <!-- 主题标签栏 -->
        <view class="hide-scrollbar mt-[35rpx] mt-[35rpx] flex overflow-x-auto border-b border-gray-100 px-[30rpx]">
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
      </view>

      <view class="flex gap-[20rpx] px-[30rpx] pt-[30rpx] overflow-x-auto hide-scrollbar">
        <view
          v-for="(item, index) in type"
          :key="index"
          class="flex flex-none rounded-full bg-white text-[#9D9D9D] px-[20rpx] py-[10rpx]"
          :class="{ '!text-black': activeType === index }"
          @tap="activeType = index"
        >
          <text class="text-[22rpx]">
            {{ item }}
          </text>
        </view>
      </view>

      <view flex flex-col gap-[20rpx] p-[30rpx]>
        <view
          v-for="(course, index) in courseList"
          :key="index"
          class="course-item flex rounded-lg bg-white"
          @click="toShopHome"
        >
          <view p-[6rpx]>
            <image
              :src="course.image"
              mode="aspectFill"
              class="h-[190rpx] w-[190rpx] rounded-[4rpx]"
            />
          </view>
          <view class="relative flex flex-1 flex-col px-[20rpx] py-[14rpx]">
            <text class="text-[28rpx] text-[#3A3A3A] font-medium">
              {{ course.title }}
            </text>
            <text class="mt-[10rpx] text-[22rpx] text-[#AFAFAF]">
              {{ course.description }}
            </text>
            <view class="mt-auto flex items-center justify-between">
              <text class="text-[32rpx] text-[#C4AA5E] font-bold">
                ¥ {{ course.price }}
              </text>
              <AIcon icon="shop_cart" :size="45" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
