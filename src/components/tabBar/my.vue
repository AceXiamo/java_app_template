<script lang="ts" setup>
import ClickButton from '@/components/ClickButton.vue'
import { useUserStore } from '@/store/user'
import { type CustomerVisit, getCustomerVisit } from '@/api/customerVisit'
import { type CustomerVisitLog, getCustomerVisitLogList, saveCustomerVisitLog } from '@/api/customerVisitLog'

const { clearAll } = useUserStore()
const { currentUser } = toRefs(useUserStore())
const user = computed(() => {
  return {
    ...currentUser.value.user,
    userType: currentUser.value.roles?.some(role => role === 'tenant') ? 'tenant' : 'tenant_user',
  }
})

function toUser() {
  uni.navigateTo({
    url: '/pages/my/user',
  })
}

function toVisitRecord() {
  uni.navigateTo({
    url: '/pages/my/visitRecord',
  })
}

function toVisitType() {
  uni.navigateTo({
    url: '/pages/my/visitType',
  })
}

function toOutcomeType() {
  uni.navigateTo({
    url: '/pages/my/outcomeType',
  })
}

function toDept() {
  uni.navigateTo({
    url: '/pages/my/dept',
  })
}

function toCustomVisit() {
  uni.navigateTo({
    url: '/pages/my/customVisit',
  })
}

function toShareEdit() {
  uni.navigateTo({
    url: '/pages/my/shareEdit',
  })
}

const customerVisit = ref<CustomerVisit>({})
const customerVisitVisible = ref(false)
const showAllowVisitDrawer = ref(false)
const customerVisitLog = ref<CustomerVisitLog>({})
const customerVisitLogList = ref<CustomerVisitLog[]>([])

function scanCode() {
  uni.scanCode({
    success: (res) => {
      const prefix = 'custom_visit_'
      const id = res.result.replace(prefix, '')
      uni.showLoading()

      const taskArr = [
        getCustomerVisitLogList({
          pageNum: 1,
          pageSize: 999,
          cvId: Number(id),
        }),
        getCustomerVisit({ id: Number(id) }),
      ]
      Promise.all(taskArr).then(([logList, visit]) => {
        if (visit.code === 200) {
          customerVisit.value = visit.data
          customerVisitVisible.value = true
        }
        else {
          toastRef.value?.error('未查询到访客码')
        }
        customerVisitLogList.value = logList.data.records
      }).finally(() => {
        uni.hideLoading()
      })
    },
    fail: () => {
      uni.hideLoading()
      toastRef.value?.error('扫描失败')
    },
  })
}

function allowVisit() {
  if (!customerVisit.value.id) {
    toastRef.value?.error('请先扫描访客码')
    return
  }
  customerVisitLog.value = {
    cvId: customerVisit.value.id,
    userId: user.value.userId,
    nickname: user.value.nickName,
    customerName: customerVisit.value.customerName,
    customerPhone: customerVisit.value.customerPhone,
    company: customerVisit.value.customerCompany,
  }
  showAllowVisitDrawer.value = true
}

function submitAllowVisit() {
  const fn = async () => {
    uni.showLoading()
    if (customerVisitLog.value.images) {
      await handleImageUpload(customerVisitLog.value.images, customerVisitLog, 'customer_visit_log', 'images')
    }
    saveCustomerVisitLog(customerVisitLog.value).then(() => {
      toastRef.value?.success('操作成功')
      showAllowVisitDrawer.value = false
      customerVisitVisible.value = false
    }).finally(() => {
      uni.hideLoading()
    })
  }
  if (!customerVisitLog.value.recordRemark && !customerVisitLog.value.images) {
    confirmRef.value?.show({
      type: 'warning',
      title: '提示',
      content: '当前未填写备注，是否继续提交？',
      onConfirm: () => {
        fn()
      },
    })
  }
  else {
    fn()
  }
}

function toCustomVisitLog() {
  uni.navigateTo({
    url: '/pages/my/customerVisitLog',
  })
}

function logout() {
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定退出登录吗？',
    onConfirm: () => {
      clearAll()
    },
  })
}
</script>

<template>
  <view
    relative h-full flex flex-col overflow-y-auto :style="{
      ...(customerVisitVisible && {
        overflow: 'hidden',
      }),
    }"
  >
    <view absolute left-0 right-0 top-0 z-0 h-[400px] bg-white style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)" />
    <MyHeadBar sticky top-0 z-[10] bg-color="transparent" />
    <view z-1 flex-none pb-[40rpx]>
      <view mx-[40rpx] flex items-start gap-[20rpx]>
        <!-- <image src="https://axm.moe/avatar" mode="aspectFill" h-[120rpx] w-[120rpx] rounded-full /> -->
        <view flex flex-col gap-[10rpx]>
          <text text-[34rpx] text-white font-bold>
            {{ user.nickName }}
          </text>
          <template v-if="user.userType === 'tenant'">
            <view w-max rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[24rpx] text-white>
              管理员
            </view>
          </template>
          <template v-else>
            <view w-max rounded-[10rpx] bg-blue-500 px-[10rpx] py-[5rpx] text-[24rpx] text-white>
              成员
            </view>
          </template>
        </view>
      </view>

      <view v-if="user.userType === 'tenant' || hasManage(user, 'tenant_user_manage')" mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:identification-card text-[28rpx] text-orange-500 />
          <text text-[30rpx] text-[#333] font-bold>
            团队成员
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx] @click="toDept">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:office-building text-[40rpx] />
            </view>
            <text text-[26rpx]>
              部门
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx] @click="toUser">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-logos:microsoft-teams text-[40rpx] />
            </view>
            <text text-[26rpx]>
              人员
            </text>
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:newspaper text-[28rpx] />
          <text text-[30rpx] text-[#333] font-bold>
            拜访客户
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx]>
          <view flex flex-col items-center gap-[15rpx] @click="toVisitRecord">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:page-facing-up text-[35rpx] />
            </view>
            <text text-[26rpx]>
              拜访记录
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx] @click="toVisitType">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:page-with-curl text-[35rpx] />
            </view>
            <text text-[26rpx]>
              拜访类型
            </text>
          </view>
          <view flex flex-col items-center gap-[15rpx] @click="toOutcomeType">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:memo text-[35rpx] />
            </view>
            <text text-[26rpx]>
              结果类型
            </text>
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex flex-col rounded-md bg-white p-[30rpx]>
        <view flex items-center gap-[15rpx]>
          <view i-twemoji:house-with-garden text-[28rpx] />
          <text text-[30rpx] text-[#333] font-bold>
            客户来访
          </text>
        </view>
        <view grid grid-cols-3 mt-[40rpx] gap-y-[20rpx]>
          <view flex flex-col items-center gap-[15rpx] @click="toCustomVisit">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:notebook-with-decorative-cover text-[35rpx] />
            </view>
            <text text-[26rpx]>
              申请记录
            </text>
          </view>
          <view v-if="hasManage(user, 'customer_check')" flex flex-col items-center gap-[15rpx] @click="scanCode">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:shield text-[35rpx] />
            </view>
            <text text-[26rpx]>
              访客码扫描
            </text>
          </view>
          <view v-if="hasManage(user, 'customer_visit_log')" flex flex-col items-center gap-[15rpx] @click="toCustomVisitLog">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:bookmark-tabs text-[35rpx] />
            </view>
            <text text-[26rpx]>
              到访记录
            </text>
          </view>
          <view v-if="hasManage(user, 'visit_share_page')" flex flex-col items-center gap-[15rpx] @click="toShareEdit">
            <view grid h-[80rpx] w-[80rpx] place-content-center rounded-md>
              <view i-twemoji:receipt text-[35rpx] />
            </view>
            <text text-[26rpx]>
              申请页编辑
            </text>
          </view>
        </view>
      </view>

      <view mx-[40rpx] mt-[40rpx] flex justify-end>
        <ClickButton size="large" type="danger" label="退出登录" @click="logout" />
      </view>
    </view>

    <CenterDialog title="扫描结果" :visible="customerVisitVisible" @update:visible="customerVisitVisible = $event" @close="customerVisitVisible = false">
      <view flex flex-col gap-[20rpx]>
        <view border border-gray-300 rounded-md border-dashed>
          <CustomVisitItem :item="customerVisit" :is-view="true" />
        </view>
        <view flex flex-col gap-[20rpx]>
          <template v-if="customerVisit.recordStatus === 0">
            <view flex items-center>
              <text text-[24rpx] text-red-500 font-bold>
                注:
              </text>
              <text ml-[20rpx] text-[24rpx] text-gray-500 font-bold>
                该记录还在审核中，请核实后再进行操作
              </text>
            </view>
          </template>
          <template v-else-if="customerVisit.recordStatus === 2">
            <view flex items-center>
              <text text-[24rpx] text-red-500 font-bold>
                注:
              </text>
              <text ml-[20rpx] text-[24rpx] text-gray-500 font-bold>
                该记录已被标记完成，请核实后再进行操作
              </text>
            </view>
          </template>
          <template v-else-if="customerVisit.recordStatus === 3">
            <view flex items-center>
              <text text-[24rpx] text-red-500 font-bold>
                注:
              </text>
              <text ml-[20rpx] text-[24rpx] text-gray-500 font-bold>
                该记录已驳回，不可操作
              </text>
            </view>
          </template>
          <template v-if="customerVisit.recordStatus === 1 || customerVisit.recordStatus === 2">
            <view flex items-center>
              <view rounded-md bg-blue-500 px-[10rpx] py-[5rpx] text-[24rpx] text-white>
                <view i-twemoji:person-with-blond-hair text-[20rpx] />
                <text>受访人</text>
              </view>
              <text ml-[20rpx] text-[24rpx] text-[#333] font-bold>
                {{ customerVisit.nickname }}
              </text>
              <text ml-[10rpx] text-[24rpx] text-gray-500>
                {{ customerVisit.phonenumber }}
              </text>
            </view>
          </template>
        </view>
        <view flex flex-col gap-[20rpx]>
          <view flex items-center gap-[10rpx]>
            <view i-twemoji:memo text-[20rpx] />
            <text text-[24rpx] text-gray-500 font-bold>
              到访记录
            </text>
          </view>
          <view flex flex-1 flex-col gap-[10rpx] border border-gray-300 rounded-md border-dashed p-[20rpx]>
            <view v-for="item in customerVisitLogList" :key="item.id" flex items-center gap-[10rpx]>
              <view h-[25rpx] w-[25rpx] flex items-center justify-center rounded-full bg-gray-200>
                <view h-[10rpx] w-[10rpx] rounded-full bg-blue-500 />
              </view>
              <text text-[24rpx] text-gray-500 font-bold>
                {{ item.createTime }}
              </text>
            </view>
          </view>
        </view>
        <view v-if="customerVisit.recordStatus !== 3" flex justify-end>
          <ClickButton size="large" type="primary" label="准入并记录" @click="allowVisit" />
        </view>
      </view>
    </CenterDialog>

    <BottomDrawer :visible="showAllowVisitDrawer" height="600rpx" @update:visible="showAllowVisitDrawer = $event" @close="showAllowVisitDrawer = false">
      <view h-full flex flex-col gap-[20rpx]>
        <FormInput v-model="customerVisitLog.recordRemark" label="备注">
          <template #icon>
            <view i-heroicons:document-text-solid text-emerald-500 />
          </template>
        </FormInput>
        <FormImage v-model="customerVisitLog.images" label="图片" :limit="3" />
        <view mt-auto flex justify-end>
          <ClickButton size="large" type="primary" label="提交" @click="submitAllowVisit" />
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="json">
  {}
</route>
