<script lang="ts" setup>
import { type ListQuery, type Visits, getVisitsList } from '@/api/visits'
import MainVisitItem from '@/components/main/VisitItem.vue'

const query = ref<ListQuery>({
  pageNum: 1,
  pageSize: 10,
})
const list = ref<Visits[]>([])
const total = ref(0)
const status = ref<LoadPageDataStatus>('hide')

function loadData() {
  status.value = 'loading'
  getVisitsList(query.value).then((res) => {
    list.value = [
      ...list.value,
      ...res.data.records,
    ]
    total.value = res.data.total || 0
  }).finally(() => {
    if (list.value.length <= query.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

function reloadHandler() {
  status.value = 'loading'
  getVisitsList(query.value).then((res) => {
    list.value = res.data.records || []
    total.value = res.data.total || 0
  }).finally(() => {
    if (list.value.length <= query.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

const loadWithDebounce = debounce(loadData, 200)

function scrolltolower() {
  if (status.value === 'nomore')
    return

  query.value.pageNum! += 1
  loadWithDebounce()
}

function search(val: string) {
  query.value.pageNum = 1
  query.value.searchValue = val
  reloadHandler()
}

function reload() {
  query.value.pageNum = 1
  reloadHandler()
}

onShow(() => {
  reload()
})
</script>

<template>
  <view h-full flex flex-col>
    <VisitRecordHead />
    <VisitRecordQuery mt-[20rpx] @search="search" />
    <VerticalPage :status="status" class="mt-[20rpx] h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] pb-[20rpx]" @scrolltolower="scrolltolower">
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in list" :key="item.id">
          <MainVisitItem :item="item" @reload="reload" />
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
