<script lang="ts" setup>
const activeTab = ref(0)
const tabs = ['活动介绍', '注意事项', '往期活动评价']
const showShareDialog = ref(false)
</script>

<template>
  <view a-container>
    <PageActivityHomeHead title="xxx活动" />
    <view a-content flex flex-col px-[30rpx] py-[40rpx]>
      <text text-[36rpx] text-[#232323]>
        游艇出海活动
      </text>
      <text mt-[30rpx] text-[28rpx] text-[#4d4d4d]>
        活动时间：2024年6月22日
      </text>
      <text mt-[20rpx] text-[28rpx] text-[#4d4d4d]>
        活动地点：深圳市盐田区大梅沙游艇俱乐部
      </text>
      <view mt-[40rpx] border-t border-t-gray-200 border-t-solid />
      <view relative mt-[40rpx] flex pb-[25rpx]>
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          relative w-[33.3%] flex items-center justify-center
          @tap="activeTab = index"
        >
          <text text-[28rpx] text-[#4d4d4d] @tap="activeTab = index">
            {{ tab }}
          </text>
        </view>
        <view
          absolute bottom-0 left-0 h-[4rpx] w-[33.3%] translate-x-[calc(100%*0)] bg-[#c5a95d]
          :style="{ transform: `translateX(${activeTab * 100}%)` }"
          transition="all 0.3s"
        />
      </view>
      <view mt-[20rpx]>
        <image src="https://image.qwq.link/images/2023/08/15/twitter_8528co28_20230814-110453_1691043206899888128_photo.jpg" mode="aspectFill" class="h-[300rpx] w-full" />
      </view>
    </view>
    <view flex items-center bg-white px-[30rpx] pb-[50rpx] pt-[20rpx]>
      <text text-[28rpx] text-[#232323]>
        已有50人报名
      </text>
      <view ml-auto h-[80rpx] w-[210rpx] flex items-center justify-center rounded-[50rpx] bg-[#c5a95d] @click="showShareDialog = true">
        <text text-[28rpx] text-white font-bold>
          分享
        </text>
      </view>
      <view ml-[20rpx] h-[80rpx] w-[210rpx] flex items-center justify-center rounded-[50rpx] bg-[#c5a95d]>
        <text text-[28rpx] text-white font-bold>
          立即报名
        </text>
      </view>
    </view>
    <CenterDialog v-model:visible="showShareDialog" :with-padding="false" :show-header="false" bg-color="transparent">
      <view flex flex-col @click="showShareDialog = false">
        <view flex flex-col bg-white p-[30rpx] @click.stop>
          <view flex gap-[10rpx]>
            <text text-[28rpx] text-[#2b2f4c]>
              分享后预计可赚
            </text>
            <text text-[28rpx] text-[#C4AA5E]>
              ¥194 - ¥383
            </text>
          </view>
          <text mt-[10rpx] text-[26rpx] text-[#7a7a7a]>
            佣金可在“分销员中心”里查看
          </text>
          <image src="https://image.qwq.link/images/2023/08/15/twitter_8528co28_20230814-110453_1691043206899888128_photo.jpg" mt-[30rpx] mode="aspectFill" class="h-[640rpx] w-full" />
          <view mt-[40rpx] flex>
            <view flex flex-1 flex-col items-center>
              <AIcon icon="wechat_color" :size="45" />
              <text mt-[10rpx] text-[22rpx] text-[#3A3A3A]>
                分享给好友
              </text>
            </view>
            <view flex flex-1 flex-col items-center>
              <AIcon icon="download" :size="45" />
              <text mt-[10rpx] text-[22rpx] text-[#3A3A3A]>
                保存海报
              </text>
            </view>
            <view flex flex-1 flex-col items-center>
              <AIcon icon="qrcode" :size="45" />
              <text mt-[10rpx] text-[22rpx] text-[#3A3A3A]>
                保存二维码
              </text>
            </view>
          </view>
        </view>
        <view mx-auto mt-[50rpx] h-[80rpx] w-[80rpx] flex items-center justify-center rounded-full bg-[#bababa]>
          <view i-heroicons-x-mark class="h-[35rpx] w-[35rpx] text-white" />
        </view>
      </view>
    </CenterDialog>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
