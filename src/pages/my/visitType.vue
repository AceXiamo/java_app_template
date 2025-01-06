<script lang="ts" setup>
import { type VisitType, deleteVisitType, getVisitTypeList, saveVisitType } from '@/api/visitType'

const visitTypeList = ref<VisitType[]>([])

function handleDelete(id: number) {
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定删除吗？',
    onConfirm: () => {
      deleteVisitType(id).then(() => {
        toastRef.value?.success('删除成功')
        loadData()
      })
    },
  })
}

function handleEdit(item: VisitType) {
  inputConfirmRef.value?.show({
    title: '编辑拜访类型',
    value: item.name,
    onConfirm: (value) => {
      uni.showLoading()
      item.name = value
      saveVisitType(item).then(() => {
        toastRef.value?.success('保存成功')
        loadData()
      }).finally(() => {
        uni.hideLoading()
      })
    },
  })
}

function handleAdd() {
  inputConfirmRef.value?.show({
    title: '添加拜访类型',
    onConfirm: (value) => {
      saveVisitType({ name: value }).then(() => {
        toastRef.value?.success('保存成功')
        loadData()
      })
    },
  })
}

function loadData() {
  uni.showLoading()
  getVisitTypeList().then((res) => {
    visitTypeList.value = res.data
  }).finally(() => {
    uni.hideLoading()
  })
}

onLoad(() => {
  loadData()
})
</script>

<template>
  <view h-full flex flex-col>
    <VisitTypeHead />
    <view mt-[20rpx] flex>
      <view px-[20rpx]>
        <ClickButton size="large" type="primary" @click="handleAdd">
          添加
        </ClickButton>
      </view>
    </view>
    <view mx-[20rpx] mt-[20rpx] border-b border-b-gray-300 border-b-dashed />
    <view mt-[20rpx] h-0 flex flex-auto flex-col px-[20rpx] pb-[20rpx]>
      <view v-for="item in visitTypeList" :key="item.id" flex items-center border-b-[1rpx] border-b-gray-300 border-b-solid p-[20rpx]>
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
