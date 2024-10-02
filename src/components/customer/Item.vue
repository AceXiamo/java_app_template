<script lang="ts" setup>
function handleDelete() {
  confirmRef.value?.show({
    type: 'warning',
    title: '删除客户',
    content: '确定删除该客户吗？',
    onConfirm: () => {
      logger.success('删除成功')
    },
  })
}

function toEdit() {
  uni.navigateTo({
    url: '/pages/customer/edit?id=1',
  })
}
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view item-center flex p-[20rpx] shadow-md>
      <view i-heroicons:user-circle-16-solid mr-[10rpx] text-[30rpx] text-blue-500 />
      <text text-[28rpx] font-bold>
        张三
      </text>
      <view ml-auto flex items-center gap-[10rpx]>
        <ClickButton size="medium" type="primary" @click="toEdit">
          编辑
        </ClickButton>
        <ClickButton size="medium" type="danger" @click="handleDelete">
          删除
        </ClickButton>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
          <text>客户电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          12312341234
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-carbon:location-filled text-[22rpx] text-gray-400 />
          <text>客户地址:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          湖南省长沙市岳麓区枫林三路
        </text>
      </view>
    </view>
  </view>
</template>
