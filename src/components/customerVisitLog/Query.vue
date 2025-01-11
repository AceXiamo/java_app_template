<script lang="ts" setup>
defineEmits(['search'])

const queryForm = ref({
  searchValue: '',
})
</script>

<template>
  <view class="flex-warp flex items-center gap-[20rpx] px-[20rpx]">
    <view box-border w-[350rpx] rounded-[10rpx] bg-white py-[5rpx] text-[24rpx]>
      <input
        v-model="queryForm.searchValue"
        type="text"
        class="box-border w-full px-[10rpx]"
        placeholder="输入客户名称/电话/公司搜索"
      >
    </view>
    <ClickButton
      size="medium"
      bg-color="white"
      font-color="#1A89FA"
      @click="$emit('search', queryForm)"
    >
      <view i-heroicons:magnifying-glass-16-solid mr-[5rpx] text-[20rpx] />
      <text>查询</text>
    </ClickButton>
  </view>
</template>
