<script lang="ts" setup>
import type { TenantDept } from '@/api/dept'
import { getDeptList } from '@/api/dept'
import VerticalPage from '@/components/VerticalPage.vue'

const queryForm = ref({
  userName: '',
  pageNum: 1,
  pageSize: 10,
})
const deptList = ref<TenantDept[]>([])
const total = ref(0)
const status = ref<LoadPageDataStatus>('hide')

function loadData() {
  status.value = 'loading'
  getDeptList(queryForm.value).then((res) => {
    deptList.value = [
      ...deptList.value,
      ...res.data.records,
    ]
    total.value = res.data.total
  }).finally(() => {
    if (deptList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

function reloadHandler() {
  status.value = 'loading'
  getDeptList(queryForm.value).then((res) => {
    deptList.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    if (deptList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

const loadWithDebounce = debounce(loadData, 200)

function search(val: string) {
  queryForm.value.pageNum = 1
  queryForm.value.userName = val
  reloadHandler()
}

function scrolltolower() {
  if (status.value === 'nomore')
    return

  queryForm.value.pageNum += 1
  loadWithDebounce()
}

function reload() {
  queryForm.value.pageNum = 1
  reloadHandler()
}

onShow(() => {
  queryForm.value.pageNum = 1
  reloadHandler()
})
</script>

<template>
  <view h-full flex flex-col>
    <DeptHead />
    <DeptQuery mt-[20rpx] @search="search" @reload="reload" />
    <VerticalPage :status="status" class="mt-[20rpx] h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] pb-[20rpx]" @scrolltolower="scrolltolower">
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in deptList" :key="item.id">
          <DeptItem :item="item" @reload="reload" />
        </template>
      </view>
    </VerticalPage>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
