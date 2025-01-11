<script lang="ts" setup>
import type { CustomerVisitLog } from '@/api/customerVisitLog'
import { host } from '@/utils/alioss'

const props = withDefaults(defineProps<{
  item: CustomerVisitLog
}>(), {
  item: () => ({}),
})

const images = computed(() => {
  return (props.item.images?.split(',') || []).map(item => `${host}/${item}`)
})

function previewImage(file: string) {
  uni.previewImage({
    urls: images.value,
    current: file,
  })
}
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view flex flex-col p-[20rpx] shadow-md>
      <view flex items-center gap-[10rpx]>
        <view i-heroicons:user-solid text-[26rpx] text-blue-500 />
        <text text-[28rpx] font-bold>
          {{ item.customerName }}
        </text>
        <text bg="violet-500/20" border border-violet-500 rounded-[10rpx] border-solid px-[10rpx] py-[2rpx] text-[22rpx] text-violet-500>
          {{ item.customerPhone }}
        </text>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view flex flex-col gap-[10rpx]>
        <view class="item" flex items-start gap-[10rpx]>
          <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
            <view i-heroicons:building-office-solid text-[22rpx] text-gray-400 />
            <text>公司:</text>
          </view>
          <text text-[24rpx] text-[#333]>
            {{ item.company }}
          </text>
        </view>
        <view class="item" flex items-start gap-[10rpx]>
          <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
            <view i-heroicons:clock-solid text-[22rpx] text-gray-400 />
            <text>进入时间:</text>
          </view>
          <text text-[24rpx] text-[#333]>
            {{ item.createTime }}
          </text>
        </view>
        <view class="item" flex items-start gap-[10rpx]>
          <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
            <view i-heroicons:user-solid text-[22rpx] text-gray-400 />
            <text>操作人:</text>
          </view>
          <text text-[24rpx] text-[#333]>
            {{ item.nickname }}
          </text>
        </view>
        <view class="item" flex items-start gap-[10rpx]>
          <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
            <view i-heroicons:chat-bubble-left-ellipsis-solid text-[22rpx] text-gray-400 />
            <text>备注:</text>
          </view>
          <text text-[24rpx] text-[#333]>
            {{ item.recordRemark }}
          </text>
        </view>
        <view class="item" flex items-start gap-[10rpx]>
          <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
            <view i-heroicons:photo-solid text-[22rpx] text-gray-400 />
            <text>备注图:</text>
          </view>
          <view v-if="item.images" flex flex-wrap gap-[10rpx]>
            <image
              v-for="(file, index) in images"
              :key="index"
              :src="file"
              mode="aspectFill"
              class="h-[150rpx] w-[150rpx] rounded-[10rpx]"
              @click="previewImage(file)"
            />
          </view>
          <text v-else text-[24rpx] text-[#333]>
            -
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
