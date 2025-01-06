<script lang="ts" setup>
import { type OutcomeType, deleteOutcomeType, getOutcomeTypeList, saveOutcomeType } from '@/api/outcomeType'

const outcomeTypeList = ref<OutcomeType[]>([])

function handleDelete(id: number) {
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定删除吗？',
    onConfirm: () => {
      deleteOutcomeType(id).then(() => {
        toastRef.value?.success('删除成功')
        loadData()
      })
    },
  })
}

function handleEdit(item: OutcomeType) {
  inputConfirmRef.value?.show({
    title: '编辑拜访结果类型',
    value: item.name,
    onConfirm: (value) => {
      item.name = value
      saveOutcomeType(item).then(() => {
        toastRef.value?.success('保存成功')
        loadData()
      })
    },
  })
}

function handleAdd() {
  inputConfirmRef.value?.show({
    title: '添加拜访结果类型',
    onConfirm: (value) => {
      saveOutcomeType({ name: value }).then(() => {
        toastRef.value?.success('保存成功')
        loadData()
      })
    },
  })
}
function loadData() {
  getOutcomeTypeList().then((res) => {
    outcomeTypeList.value = res.data
  })
}

onLoad(() => {
  loadData()
})
</script>

<template>
  <view h-full flex flex-col>
    <OutcomeTypeHead />
    <view mt-[20rpx] flex>
      <view px-[20rpx]>
        <ClickButton size="large" type="primary" @click="handleAdd">
          添加
        </ClickButton>
      </view>
    </view>
    <view mx-[20rpx] mt-[20rpx] border-b border-b-gray-300 border-b-dashed />
    <view mt-[20rpx] h-0 flex-auto overflow-y-auto px-[20rpx] pb-[20rpx]>
      <view v-for="item in outcomeTypeList" :key="item.id" flex items-center border-b-[1rpx] border-b-gray-300 border-b-solid p-[20rpx]>
        <text text-[26rpx] text-[#333]>
          {{ item.name }}
        </text>
        <view ml-auto flex items-center gap-[10rpx]>
          <ClickButton size="medium" type="primary" @click="handleEdit(item)">
            编辑
          </ClickButton>
          <ClickButton size="medium" type="danger" @click="handleDelete(item.id)">
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
