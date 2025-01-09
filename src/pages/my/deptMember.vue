<script lang="ts" setup>
import { type DeptUserRef, del, getDeptUserRefList } from '@/api/deptUserRef'

const queryForm = ref({
  deptId: '',
  pageNum: 1,
  pageSize: 10,
})
const deptList = ref<DeptUserRef[]>([])
const status = ref<LoadPageDataStatus>('hide')
const total = ref(0)

function loadData() {
  status.value = 'loading'
  getDeptUserRefList(queryForm.value).then((res) => {
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

const loadWithDebounce = debounce(loadData, 200)

function scrolltolower() {
  if (status.value === 'nomore')
    return

  queryForm.value.pageNum += 1
  loadWithDebounce()
}

function reloadHandler() {
  status.value = 'loading'
  getDeptUserRefList(queryForm.value).then((res) => {
    deptList.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    if (deptList.value.length <= queryForm.value.pageSize!)
      status.value = 'nomore'
    else
      status.value = 'hide'
  })
}

// function reload() {
//   queryForm.value.pageNum = 1
//   reloadHandler()
// }

function handleDel(duId: number) {
  del({ id: duId }).then(() => {
    reloadHandler()
  })
}

const editMemberRoleForm = ref({})
const bottomDrawVisible = ref(false)
function editMemberRole(item: DeptUserRef) {
  editMemberRoleForm.value = item
  bottomDrawVisible.value = true
}

// onLoad((options) => {
//   // queryForm.value.deptId = (options as any).deptId
//   queryForm.value.deptId = '5'
//   queryForm.value.pageNum = 1
//   reloadHandler()
// })
</script>

<template>
  <view h-full flex flex-col>
    <DeptMemberHead />
    <VerticalPage :status="status" class="mt-[20rpx] h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] pb-[20rpx]" @scrolltolower="scrolltolower">
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in deptList" :key="item.id">
          <view flex items-center gap-[10rpx] border border-gray-300 rounded-md border-dashed bg-white p-[20rpx]>
            <view flex flex-auto items-center gap-[10rpx]>
              <text text-[26rpx]>
                {{ item.nickname }}
              </text>
              <template v-if="item.hasManage === 1">
                <view w-max flex items-center gap-[10rpx] rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
                  <view i-heroicons:wrench-screwdriver-solid text-[20rpx] text-white />
                  <text>
                    部门管理员
                  </text>
                </view>
              </template>
              <template v-else>
                <view w-max flex items-center gap-[10rpx] rounded-[10rpx] bg-gray-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
                  <view i-heroicons:user text-[20rpx] text-white />
                  <text>
                    普通成员
                  </text>
                </view>
              </template>
            </view>
            <view flex items-center gap-[10rpx]>
              <ClickButton label="变更角色" type="primary" size="small" @click="editMemberRole(item)" />
              <ClickButton label="解除绑定" type="danger" size="small" @click="handleDel(item.duId!)" />
            </view>
          </view>
        </template>
      </view>
    </VerticalPage>
    <BottomDrawer :visible="bottomDrawVisible" title="变更角色" @update:visible="bottomDrawVisible = $event" @close="bottomDrawVisible = false">
      <view>
        <view>
          <text>
            变更角色
          </text>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route type="home" lang="json">
  {
    "layout": "home"
  }
</route>
