<script lang="ts" setup>
const activeType = ref(0)
const type = ['全部', '未开始', '已结束']

const showViewEvaluate = ref(false)
const showgEvaluateDrawer = ref(false)
</script>

<template>
  <view a-container>
    <PageMyActivityHead />
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

      <!-- 主题标签栏 -->
      <view class="hide-scrollbar mt-[35rpx] mt-[35rpx] flex overflow-x-auto border-b border-gray-100 px-[30rpx]">
        <view
          v-for="(tab, index) in type"
          :key="index"
          class="relative w-[33.3%] flex-none pb-[20rpx] text-center text-[#847855]"
          :class="{ '!text-[#091722] font-bold': activeType === index }"
          @tap="activeType = index"
        >
          <text class="text-[28rpx]">
            {{ tab }}
          </text>
          <view
            class="absolute bottom-0 left-0 right-0 mx-auto h-[4rpx] w-[40rpx] translate-y-[calc(-100%+10rpx)] rounded-[10rpx] bg-[#3A3A3A] opacity-0"
            :class="{ '!opacity-100 !-translate-y-full': activeType === index }"
            transition="all 0.3s"
          />
        </view>
      </view>

      <view flex flex-col gap-[20rpx] p-[30rpx]>
        <view flex>
          <image src="https://image.qwq.link/images/2023/08/15/twitter_8528co28_20230814-110453_1691043206899888128_photo.jpg" h-[320rpx] w-[240rpx] rounded-[10rpx] mode="aspectFill" />
          <view flex flex-auto flex-col py-[10rpx] pl-[20rpx]>
            <view flex items-start gap-[20rpx]>
              <text w-0 flex-auto text-[28rpx]>
                大梅沙节假日通用游艇出海活动
              </text>
              <view flex items-center leading-[40rpx]>
                <text text-[24rpx] text-[#777777]>
                  更多
                </text>
                <view i-heroicons-chevron-right-20-solid text-[24rpx] text-[#777777] />
              </view>
            </view>
            <text mt-[20rpx] text-[24rpx] text-[#3a3a3a]>
              2024年10月11日 15:00
            </text>
            <view mt-[20rpx] flex gap-[10rpx]>
              <text border border-[#9d9d9d40] rounded-[25rpx] border-solid px-[12rpx] py-[2rpx] text-[24rpx] text-[#9d9d9d]>
                单人票
              </text>
            </view>
            <view mt-auto flex gap-[30rpx]>
              <view flex flex-1 justify-center rounded-[50rpx] bg-[#c6a95d] px-[20rpx] py-[10rpx]>
                <text text-[28rpx] text-white>
                  分享赚钱
                </text>
              </view>
              <view flex flex-1 justify-center rounded-[50rpx] bg-[#c6a95d] px-[20rpx] py-[10rpx]>
                <text text-[28rpx] text-white>
                  验票码
                </text>
              </view>
            </view>
          </view>
        </view>
        <view flex>
          <image src="https://image.qwq.link/images/2023/08/15/twitter_8528co28_20230814-110453_1691043206899888128_photo.jpg" h-[320rpx] w-[240rpx] rounded-[10rpx] mode="aspectFill" />
          <view flex flex-auto flex-col py-[10rpx] pl-[20rpx]>
            <view flex items-start gap-[20rpx]>
              <text w-0 flex-auto text-[28rpx]>
                大梅沙节假日通用游艇出海活动
              </text>
              <view flex items-center leading-[40rpx]>
                <text text-[24rpx] text-[#777777]>
                  更多
                </text>
                <view i-heroicons-chevron-right-20-solid text-[24rpx] text-[#777777] />
              </view>
            </view>
            <text mt-[20rpx] text-[24rpx] text-[#3a3a3a]>
              2024年10月11日 15:00
            </text>
            <view mt-[20rpx] flex gap-[10rpx]>
              <text border border-[#9d9d9d40] rounded-[25rpx] border-solid px-[12rpx] py-[2rpx] text-[24rpx] text-[#9d9d9d]>
                单人票
              </text>
            </view>
            <view mt-auto flex gap-[30rpx]>
              <view flex flex-1 justify-center rounded-[50rpx] bg-[#c6a95d] px-[20rpx] py-[10rpx] @click="showViewEvaluate = true">
                <text text-[28rpx] text-white>
                  查看评价
                </text>
              </view>
              <view
                flex flex-1 justify-center rounded-[50rpx] bg-[#c6a95d] px-[20rpx] py-[10rpx] @click="showgEvaluateDrawer = true"
              >
                <text text-[28rpx] text-white>
                  提交评价
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <BottomDrawer v-model:visible="showgEvaluateDrawer" title="评价">
      <view flex flex-col>
        <text text-[28rpx] text-[#3a3a3a]>
          活动：游艇出海活动
        </text>
        <ARating mt-[20rpx] :max-stars="5" :model-value="4" />
        <FormInput label="活动评价" placeholder="请输入评价" type="textarea" :show-bottom-line="false" />
        <FormImage label="活动图片" :limit="3" layout="vertical" :show-bottom-line="false" />
        <view mt-[50rpx] border-t border-t-gray-200 border-t-solid px-[30rpx] pb-[50rpx] pt-[20rpx]>
          <view w-full flex justify-center rounded-[50rpx] bg-[#c6a95d] py-[20rpx]>
            <text text-[28rpx] text-white>
              提交
            </text>
          </view>
        </view>
      </view>
    </BottomDrawer>
    <BottomDrawer v-model:visible="showViewEvaluate" title="评价">
      <view flex flex-col pb-[50rpx]>
        <text text-[28rpx] text-[#3a3a3a]>
          活动：游艇出海活动
        </text>
        <ARating mt-[20rpx] :max-stars="5" :model-value="4" :editable="false" />
        <text mt-[50rpx] text-[28rpx] text-[#5b5b5b]>
          活动评价
        </text>
        <text mt-[20rpx] text-[26rpx] text-[#3a3a3a]>
          这活动非常棒，希望下次再来
        </text>
        <text mt-[30rpx] text-[28rpx] text-[#5b5b5b]>
          活动图片
        </text>
        <view grid grid-cols-3 mt-[20rpx] gap-[20rpx]>
          <view class="aspect-square w-full bg-[url(https://axm.moe/avatar)] bg-cover bg-center rounded-[10rpx]" />
          <view class="aspect-square w-full bg-[url(https://axm.moe/avatar)] bg-cover bg-center rounded-[10rpx]" />
          <view class="aspect-square w-full bg-[url(https://axm.moe/avatar)] bg-cover bg-center rounded-[10rpx]" />
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
