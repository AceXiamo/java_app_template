<script lang="ts" setup>
const title = ref('新增客户')

onLoad((query: any) => {
  const id = query.id
  title.value = id ? '编辑客户' : '新增客户'
})

function back() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view relative h-full flex items-center justify-center>
      <view i-heroicons:chevron-left-20-solid absolute left-[20rpx] text-[40rpx] text-black @click="back" />
      <text text-[30rpx] text-black>
        {{ title }}
      </text>
    </view>
  </HeadBar>
</template>
