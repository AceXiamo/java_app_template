<script lang="ts" setup>
import { useMainStore } from '@/store/main'

const mainStore = useMainStore()
const searchVal = ref('')

function search() {
  mainStore.queryFormOfCustomer.searchValue = searchVal.value
  mainStore.searchCustomerData()
}

function toAdd() {
  uni.navigateTo({
    url: '/pages/customer/edit',
  })
}
</script>

<template>
  <view class="flex-warp flex items-center gap-[20rpx] px-[20rpx]">
    <view box-border w-[300rpx] rounded-[10rpx] bg-white py-[5rpx] text-[24rpx]>
      <input v-model="searchVal" type="text" class="box-border w-full px-[10rpx]" placeholder="输入文字以筛选">
    </view>
    <ClickButton size="medium" bg-color="white" font-color="#1A89FA" @click="search">
      <view i-heroicons:magnifying-glass-16-solid mr-[5rpx] text-[20rpx] />
      <text>
        查询
      </text>
    </ClickButton>
    <ClickButton size="medium" bg-color="white" font-color="#1A89FA" @click="toAdd">
      <view i-heroicons:plus-16-solid mr-[5rpx] text-[20rpx] />
      <text>
        新增
      </text>
    </ClickButton>
  </view>
</template>
