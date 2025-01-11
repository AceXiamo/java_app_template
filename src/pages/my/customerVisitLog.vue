<script lang="ts" setup>
import { type CustomerVisitLog, getCustomerVisitLogList } from '@/api/customerVisitLog'
import VerticalPage from '@/components/VerticalPage.vue'

const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  searchValue: '',
})

const visitLogList = ref<CustomerVisitLog[]>([])
const total = ref(0)
const status = ref<LoadPageDataStatus>('hide')

function loadData() {
  status.value = 'loading'
  getCustomerVisitLogList(queryForm.value).then((res) => {
    visitLogList.value = [
      ...visitLogList.value,
      ...res.data.records,
    ]
    total.value = res.data.total
  }).finally(() => {
    if (visitLogList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

function reloadHandler() {
  status.value = 'loading'
  getCustomerVisitLogList(queryForm.value).then((res) => {
    visitLogList.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    if (visitLogList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

const loadWithDebounce = debounce(loadData, 200)

function scrolltolower() {
  if (status.value === 'nomore')
    return

  queryForm.value.pageNum += 1
  loadWithDebounce()
}

function search(query: any) {
  queryForm.value = {
    ...queryForm.value,
    ...query,
    pageNum: 1,
  }
  reloadHandler()
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
    <CustomerVisitLogHead />
    <CustomerVisitLogQuery mt-[20rpx] @search="search" />
    <VerticalPage
      :status="status"
      class="mt-[20rpx] h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] pb-[20rpx]"
      @scrolltolower="scrolltolower"
    >
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in visitLogList" :key="item.id">
          <CustomerVisitLogItem :item="item" @reload="reload" />
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
