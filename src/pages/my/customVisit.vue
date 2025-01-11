<script lang="ts" setup>
import { type CustomerVisit, getCustomerVisitList, saveCustomerVisit } from '@/api/customerVisit'
import VerticalPage from '@/components/VerticalPage.vue'
import { type UserWithTenantDept, listUserForTenantDept } from '@/api/deptUserRef'

const queryForm = ref({
  deptId: -1,
  pageNum: 1,
  recordStatus: -1,
  pageSize: 10,
  searchValue: '',
})

const visitList = ref<CustomerVisit[]>([])
const total = ref(0)
const status = ref<LoadPageDataStatus>('hide')

function loadData() {
  status.value = 'loading'
  getCustomerVisitList(queryForm.value).then((res) => {
    visitList.value = [
      ...visitList.value,
      ...res.data.records,
    ]
    total.value = res.data.total
  }).finally(() => {
    if (visitList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

function reloadHandler() {
  status.value = 'loading'
  getCustomerVisitList(queryForm.value).then((res) => {
    visitList.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    if (visitList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

const loadWithDebounce = debounce(loadData, 200)

function search(val: any) {
  queryForm.value.pageNum = 1
  queryForm.value.deptId = val.deptId
  queryForm.value.searchValue = val.searchValue
  queryForm.value.recordStatus = val.recordStatus
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

const activeUser = ref<UserWithTenantDept | null>(null)
const currentVisit = ref<CustomerVisit | null>(null)
const bottomDrawerVisible = ref(false)
const userList = ref<UserWithTenantDept[]>([])
const filterText = ref('')
const filterUserList = computed(() => {
  return userList.value.filter(v => v.nickName?.includes(filterText.value) || v.phonenumber?.includes(filterText.value))
})

function loadUser() {
  listUserForTenantDept({
    deptId: 6,
  }).then((res) => {
    userList.value = res.data
  })
}

function assignTo(item: CustomerVisit) {
  currentVisit.value = { ...item }
  bottomDrawerVisible.value = true
  loadUser()
}

function submitAssign() {
  currentVisit.value!.userId = activeUser.value!.userId
  currentVisit.value!.nickname = activeUser.value!.nickName
  currentVisit.value!.phonenumber = activeUser.value!.phonenumber
  currentVisit.value!.recordStatus = 1
  saveCustomerVisit(currentVisit.value!).then(() => {
    toastRef.value?.success('指派成功')
    bottomDrawerVisible.value = false
    reloadHandler()
  })
}

onShow(() => {
  queryForm.value.pageNum = 1
  reloadHandler()
})
</script>

<template>
  <view h-full flex flex-col>
    <CustomVisitHead />
    <CustomVisitQuery mt-[20rpx] @search="search" />
    <VerticalPage
      :status="status"
      class="mt-[20rpx] h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] pb-[20rpx]"
      @scrolltolower="scrolltolower"
    >
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in visitList" :key="item.id">
          <CustomVisitItem :item="item" @reload="reload" @assign-to="assignTo" />
        </template>
      </view>
    </VerticalPage>
    <BottomDrawer :visible="bottomDrawerVisible" height="600rpx" title="指派" @update:visible="bottomDrawerVisible = $event" @close="bottomDrawerVisible = false">
      <view box-border h-full flex flex-col gap-[20rpx] py-[20rpx]>
        <view box-border w-[300rpx] rounded-[10rpx] bg-gray-100 py-[5rpx] text-[24rpx]>
          <input v-model="filterText" type="text" class="box-border w-full px-[10rpx]" placeholder="输入内容以筛选">
        </view>
        <view h-0 flex flex-auto flex-col snap-y snap-mandatory gap-[20rpx] overflow-y-auto>
          <view v-for="item in filterUserList" :key="item.userId" flex snap-start items-center rounded-[10rpx] bg-gray-100 p-[10rpx] @click="activeUser = item">
            <template v-if="item.userId === activeUser?.userId">
              <view h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-emerald-500>
                <view i-heroicons:check-16-solid text-[16rpx] text-white />
              </view>
            </template>
            <template v-else>
              <view h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-gray-400>
                <view i-heroicons:check-16-solid text-[16rpx] text-white />
              </view>
            </template>
            <text ml-[20rpx] w-[200rpx] text-[26rpx] text-[#333]>
              {{ item.nickName }}
            </text>
            <text ml-[10rpx] text-[26rpx] text-[#333]>
              {{ item.phonenumber }}
            </text>
          </view>
        </view>
        <view flex justify-end gap-[20rpx]>
          <ClickButton label="提交" type="primary" @click="submitAssign" />
          <ClickButton label="取消" type="default" @click="bottomDrawerVisible = false" />
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
