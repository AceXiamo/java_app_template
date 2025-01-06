<script lang="ts" setup>
defineEmits(['search'])

const searchValue = ref('')

function toAdd() {
  uni.navigateTo({
    url: '/pages/my/editUser',
  })
}
</script>

<template>
  <view class="flex-warp flex items-center gap-[20rpx] px-[20rpx]">
    <view box-border w-[300rpx] rounded-[10rpx] bg-white py-[5rpx] text-[24rpx]>
      <input v-model="searchValue" type="text" class="box-border w-full px-[10rpx]" placeholder="输入用户名以筛选">
    </view>
    <ClickButton size="medium" bg-color="white" font-color="#1A89FA" @click="$emit('search', searchValue)">
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
