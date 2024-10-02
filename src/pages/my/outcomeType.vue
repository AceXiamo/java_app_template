<script lang="ts" setup>
function handleDelete() {
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定删除吗？',
    onConfirm: () => {
      logger.success('删除成功')
    },
  })
}

function handleEdit() {
  inputConfirmRef.value?.show({
    title: '编辑拜访结果类型',
    value: '拜访类型',
    onConfirm: (value) => {
      console.log(value)
    },
  })
}
</script>

<template>
  <view h-full flex flex-col>
    <OutcomeTypeHead />
    <view mt-[20rpx] flex>
      <view px-[20rpx]>
        <ClickButton size="large" type="primary">
          添加
        </ClickButton>
      </view>
    </view>
    <view mx-[20rpx] mt-[20rpx] border-b border-b-gray-300 border-b-dashed />
    <view mt-[20rpx] h-0 flex-auto overflow-y-auto px-[20rpx] pb-[20rpx]>
      <view v-for="item in 10" :key="item" flex items-center border-b-[1rpx] border-b-gray-300 border-b-solid p-[20rpx]>
        <text text-[26rpx] text-[#333]>
          拜访类型
        </text>
        <view ml-auto flex items-center gap-[10rpx]>
          <ClickButton size="medium" type="primary" @click="handleEdit">
            编辑
          </ClickButton>
          <ClickButton size="medium" type="danger" @click="handleDelete">
            删除
          </ClickButton>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
