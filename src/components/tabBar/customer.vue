<script lang="ts" setup>
import VerticalPage from '@/components/VerticalPage.vue'
import { useMainStore } from '@/store/main'

const { customerList, customerLoadStatus } = toRefs(useMainStore())
const dataList = computed(() => {
  return customerList.value
})
const loadStatus = computed(() => {
  return customerLoadStatus.value
})
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)" />
    <CustomerHead relative z-[10] />
    <CustomerQuery relative z-[10] />
    <VerticalPage class="relative z-1 mt-[20rpx] h-0 flex flex-auto flex-col px-[20rpx] pb-[20rpx]" :status="loadStatus">
      <view flex flex-col gap-[20rpx]>
        <CustomerItem v-for="item in dataList" :key="item.id" :customer="item" />
      </view>
    </VerticalPage>
  </view>
</template>
