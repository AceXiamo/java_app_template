<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { useOwnerStore } from '@/store/owner'
import { type OwnerRevenueQueryParams, getOwnerRevenueRecords } from '@/api/owner-revenue'
import { applyWithdrawal, getOwnerWithdrawalMethods, getWithdrawalRecords } from '@/api/owner-withdrawal'

// 使用 owner store
const ownerStore = useOwnerStore()
const { revenueData } = storeToRefs(ownerStore)

// 设置当前页面
ownerStore.setActive('revenue')

// 滚动状态
const isTabSticky = ref(false)

// 收益详情数据 - 从API获取
const detailsData = reactive({
  revenueDetails: [] as any[],
  withdrawalRecords: [] as any[],
})

// 加载状态
const revenueLoading = ref(false)
const withdrawalLoading = ref(false)

// 下拉刷新状态
const refreshing = ref(false)

// 当前显示模式
const currentTab = ref('revenue') // revenue | withdrawal

// 分页相关
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  hasMore: true,
})

// 加载更多状态
const loadingMore = ref(false)

// 提现弹窗相关
const withdrawalDrawerVisible = ref(false)
const withdrawalAmount = ref('')
const selectedWithdrawalMethod = ref<any>(null)

// 提现方式数据 - 从API获取
const withdrawalMethods = ref<any[]>([])

// 页面显示时加载数据（Tab切换由 OwnerFooter 统一管理）
onShow(async () => {
  await Promise.all([
    loadRevenueDetails(),
    loadWithdrawalMethods(),
    loadWithdrawalRecords(),
    ownerStore.loadOwnerData(), // 确保收益数据是最新的
  ])
})

// 首次加载时也执行一次
onMounted(async () => {
  await Promise.all([
    loadRevenueDetails(),
    loadWithdrawalMethods(),
    loadWithdrawalRecords(),
  ])
})

// 加载收益明细
async function loadRevenueDetails(reset = true) {
  try {
    if (reset) {
      revenueLoading.value = true
      pagination.current = 1
    }
    else {
      loadingMore.value = true
    }

    const params: OwnerRevenueQueryParams = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }

    const response = await getOwnerRevenueRecords(params)
    if (response.code === 200 && response.data) {
      const newRecords = response.data.records || []

      if (reset) {
        detailsData.revenueDetails = newRecords
      }
      else {
        detailsData.revenueDetails.push(...newRecords)
      }

      // 更新分页信息
      pagination.total = Number(response.data.total) || 0
      pagination.hasMore = newRecords.length === pagination.pageSize
    }
  }
  catch (error) {
    console.error('加载收益明细失败', error)
    uni.showToast({
      title: '加载收益明细失败',
      icon: 'none',
    })
  }
  finally {
    if (reset) {
      revenueLoading.value = false
    }
    else {
      loadingMore.value = false
    }
  }
}

// 加载更多收益记录
async function loadMoreRevenue() {
  if (!pagination.hasMore || loadingMore.value)
    return

  pagination.current += 1
  await loadRevenueDetails(false)
}

// 下拉刷新
async function handleRefresh() {
  try {
    refreshing.value = true

    // 同时刷新所有数据
    await Promise.all([
      loadRevenueDetails(),
      loadWithdrawalMethods(),
      loadWithdrawalRecords(),
      ownerStore.refreshRevenueData(),
    ])

    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500,
    })
  }
  catch (error) {
    console.error('刷新失败', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
    })
  }
  finally {
    refreshing.value = false
  }
}

// 加载提现方式
async function loadWithdrawalMethods() {
  try {
    const response = await getOwnerWithdrawalMethods()
    if (response.code === 200 && response.data) {
      withdrawalMethods.value = response.data.map(method => ({
        ...method,
        // 为了兼容模板中的字段
        id: method.methodId,
        type: method.methodType,
        name: method.methodName,
        account: method.accountInfo,
        icon: method.methodType === 'bank' ? 'i-material-symbols-account-balance' : '',
        iconUrl: method.methodType === 'wechat'
          ? 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/wechat.png'
          : method.methodType === 'alipay' ? 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/alipay.png' : '',
      }))

      // 自动选中默认提现方式
      const defaultMethod = withdrawalMethods.value.find(method => method.isDefault)
      if (defaultMethod && !selectedWithdrawalMethod.value) {
        selectedWithdrawalMethod.value = defaultMethod
      }
    }
  }
  catch (error) {
    console.error('加载提现方式失败', error)
  }
}

// 导航方法
function goToWithdraw() {
  // 重置提现金额
  withdrawalAmount.value = ''

  // 确保选中默认提现方式
  if (!selectedWithdrawalMethod.value && withdrawalMethods.value.length > 0) {
    const defaultMethod = withdrawalMethods.value.find(method => method.isDefault)
    if (defaultMethod) {
      selectedWithdrawalMethod.value = defaultMethod
    }
  }

  withdrawalDrawerVisible.value = true
}

function goToWithdrawalMethods() {
  uni.navigateTo({ url: '/pages/owner/withdrawal-methods' })
}

function goToWithdrawalRecords() {
  currentTab.value = 'withdrawal'
}

function goToRevenueDetails() {
  currentTab.value = 'revenue'
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    settled: 'text-green-600 bg-green-100',
    pending: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getWithdrawalStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    completed: 'text-green-600 bg-green-100',
    processing: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100',
    pending: 'text-blue-600 bg-blue-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    settled: '已结算',
    pending: '待结算',
    failed: '结算失败',
  }
  return statusMap[status] || status
}

function getWithdrawalStatusText(status: string) {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败',
    pending: '待处理',
  }
  return statusMap[status] || status
}

// 获取提现方式标签
function getWithdrawalMethodLabel(record: any) {
  const methodType = record.methodType || record.withdrawalType
  switch (methodType) {
    case 'bank':
      return '到账银行'
    case 'wechat':
      return '微信账号'
    case 'alipay':
      return '支付宝账号'
    default:
      return '提现账户'
  }
}

// 获取账户信息
function getWithdrawalAccountInfo(record: any) {
  const methodType = record.methodType || record.withdrawalType
  switch (methodType) {
    case 'bank':
      return `${record.methodName || record.bankName || ''} ${record.accountInfo || record.bankAccount || ''}`
    case 'wechat':
      return record.accountInfo || record.wechatAccount || '微信账号'
    case 'alipay':
      return record.accountInfo || record.alipayAccount || '支付宝账号'
    default:
      return record.accountInfo || '未知账户'
  }
}

// 提现相关功能
function selectWithdrawalMethod(method: any) {
  selectedWithdrawalMethod.value = method
}

async function submitWithdrawal() {
  if (!withdrawalAmount.value) {
    uni.showToast({ title: '请输入提现金额', icon: 'none' })
    return
  }

  const amount = Number.parseFloat(withdrawalAmount.value)
  if (amount <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return
  }

  if (amount > revenueData.value.balance) {
    uni.showToast({ title: '提现金额不能超过可用余额', icon: 'none' })
    return
  }

  if (!selectedWithdrawalMethod.value) {
    uni.showToast({ title: '请选择提现方式', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })

    // 调用真实的提现申请API
    const response = await applyWithdrawal({
      amount,
      methodId: selectedWithdrawalMethod.value.id,
    })

    uni.hideLoading()

    if (response.code === 200) {
      // 提现申请成功
      const result = response.data
      uni.showToast({
        title: '提现申请已提交',
        icon: 'success',
        duration: 2000,
      })

      // 显示申请结果详情
      setTimeout(() => {
        uni.showModal({
          title: '提现申请成功',
          content: `申请单号：${result.withdrawalNo}\n实际到账：¥${result.actualAmount}\n手续费：¥${result.fee}\n预计到账时间：${new Date(result.estimatedArrivalTime).toLocaleString()}`,
          showCancel: false,
          confirmText: '确定',
        })
      }, 500)

      withdrawalDrawerVisible.value = false

      // 重置表单状态
      withdrawalAmount.value = ''

      // 重新选中默认提现方式
      const defaultMethod = withdrawalMethods.value.find(method => method.isDefault)
      selectedWithdrawalMethod.value = defaultMethod || null

      // 刷新余额数据和提现记录
      await Promise.all([
        ownerStore.refreshRevenueData(),
        loadWithdrawalRecords(),
      ])
    }
    else {
      // 提现申请失败
      uni.showToast({
        title: response.msg || '提现申请失败',
        icon: 'none',
        duration: 3000,
      })
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('提现申请失败:', error)
    uni.showToast({
      title: '网络异常，请重试',
      icon: 'none',
      duration: 3000,
    })
  }
}

// 滚动监听
function onScroll(e: any) {
  const scrollTop = e.detail.scrollTop
  // 当滚动超过 300rpx 时（大概是卡片区域的高度），Tab 开始置顶显示背景
  isTabSticky.value = scrollTop > 300
}

// 加载提现记录
async function loadWithdrawalRecords() {
  try {
    withdrawalLoading.value = true

    const response = await getWithdrawalRecords()
    if (response.code === 200 && response.data) {
      detailsData.withdrawalRecords = response.data.map(record => ({
        ...record,
        // 为了兼容模板中的字段
        id: record.withdrawalId,
        // 确保提现方式信息字段映射正确
        methodType: record.methodType || record.withdrawalType,
        methodName: record.methodName,
        accountInfo: record.accountInfo,
      }))
    }
  }
  catch (error) {
    console.error('加载提现记录失败', error)
    uni.showToast({
      title: '加载提现记录失败',
      icon: 'none',
    })
  }
  finally {
    withdrawalLoading.value = false
  }
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航栏 -->
    <HeadBar
      bg-color="transparent"
    >
      <view class="relative h-full flex items-center">
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          收益管理
        </text>
      </view>
    </HeadBar>

    <!-- 滚动内容区域 -->
    <scroll-view
      scroll-y
      class="h-0 w-full flex-1"
      refresher-enabled
      :refresher-triggered="refreshing"
      lower-threshold="100"
      @scroll="onScroll"
      @refresherrefresh="handleRefresh"
      @scrolltolower="loadMoreRevenue"
    >
      <view class="px-[32rpx] pt-[32rpx]">
        <!-- 可提现余额卡片 -->
        <view class="relative mb-[32rpx]">
          <!-- AI生成的背景图 -->
          <image
            src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/revenue_card_bg.png"
            class="absolute left-0 top-0 h-full w-full rounded-xl"
            mode="aspectFill"
            style="z-index: 0;"
          />

          <!-- 卡片内容 -->
          <view class="relative z-10 min-h-[160rpx] border border-white/30 rounded-xl bg-white/20 p-[32rpx] shadow-lg">
            <text class="mb-[8rpx] block text-[24rpx] text-white opacity-90">
              可提现余额
            </text>
            <text class="mb-[24rpx] block text-[48rpx] text-white font-bold">
              ¥{{ revenueData.balance.toFixed(2) }}
            </text>

            <view class="space-y-[16rpx]">
              <!-- 提现方式设置 -->
              <view class="flex items-center justify-between">
                <text class="text-[20rpx] text-white opacity-80">
                  提现方式
                </text>
                <view
                  class="flex items-center border border-white/40 rounded-full bg-white/20 px-[16rpx] py-[8rpx] backdrop-blur-sm transition-all duration-200 active:scale-95 space-x-[8rpx]"
                  @tap="goToWithdrawalMethods"
                >
                  <text class="i-material-symbols-settings text-[20rpx] text-white" />
                  <text class="text-[20rpx] text-white">
                    设置
                  </text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="flex items-center justify-end space-x-[16rpx]">
                <view
                  class="border border-white/40 rounded-full bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm transition-all duration-200 active:scale-95"
                  @tap="goToWithdrawalRecords"
                >
                  <text class="text-[24rpx] text-white font-medium">
                    提现记录
                  </text>
                </view>
                <view
                  class="rounded-full bg-white px-[24rpx] py-[12rpx] transition-all duration-200 active:scale-95"
                  @tap="goToWithdraw"
                >
                  <text class="text-[24rpx] text-purple-600 font-medium">
                    立即提现
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 收益趋势卡片 -->
        <view class="mb-[32rpx] border border-white/20 rounded-xl bg-white/90 p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center justify-between">
            <text class="text-[28rpx] text-gray-800 font-semibold">
              收益趋势
            </text>
            <text class="i-material-symbols-trending-up text-[28rpx] text-green-600" />
          </view>

          <view class="grid grid-cols-4 gap-[16rpx]">
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-purple-600 font-bold">
                ¥{{ revenueData.revenue.today }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                今日
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-blue-600 font-bold">
                ¥{{ revenueData.revenue.thisWeek }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                本周
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-green-600 font-bold">
                ¥{{ revenueData.revenue.thisMonth.toLocaleString() }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                本月
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-orange-600 font-bold">
                ¥{{ revenueData.revenue.total.toLocaleString() }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                总计
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 标签切换 - sticky固定 -->
      <view
        class="sticky z-10 px-[32rpx] py-[16rpx] transition-all duration-300 -top-[1rpx]"
        :class="isTabSticky ? 'bg-gray-50 backdrop-blur-sm border-b border-gray-100 shadow-sm' : 'bg-transparent'"
      >
        <view class="flex items-center rounded-[10rpx] bg-gray-50 p-[8rpx]">
          <view
            class="flex-1 rounded-[16rpx] py-[16rpx] text-center transition-all duration-300"
            :class="currentTab === 'revenue' ? 'bg-white shadow-sm' : ''"
            @tap="goToRevenueDetails"
          >
            <text
              class="text-[26rpx] font-medium"
              :class="currentTab === 'revenue' ? 'text-purple-600' : 'text-gray-400'"
            >
              收益明细
            </text>
          </view>
          <view
            class="flex-1 rounded-[16rpx] py-[16rpx] text-center transition-all duration-300"
            :class="currentTab === 'withdrawal' ? 'bg-white shadow-sm' : ''"
            @tap="goToWithdrawalRecords"
          >
            <text
              class="text-[26rpx] font-medium"
              :class="currentTab === 'withdrawal' ? 'text-purple-600' : 'text-gray-400'"
            >
              提现记录
            </text>
          </view>
        </view>
      </view>

      <!-- 收益明细 -->
      <view v-if="currentTab === 'revenue'" class="px-[32rpx] pb-[48rpx] pt-[24rpx] space-y-[24rpx]">
        <!-- 加载状态 -->
        <view v-if="revenueLoading" class="flex items-center justify-center py-[80rpx]">
          <text class="text-[24rpx] text-gray-500">
            加载中...
          </text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!detailsData.revenueDetails.length" class="flex flex-col items-center justify-center py-[120rpx]">
          <text class="i-material-symbols-receipt-long mb-[16rpx] text-[80rpx] text-gray-300" />
          <text class="mb-[8rpx] text-[28rpx] text-gray-400 font-medium">
            暂无收益记录
          </text>
          <text class="text-[22rpx] text-gray-400">
            完成订单后收益将在此显示
          </text>
        </view>

        <!-- 收益列表 -->
        <view
          v-for="item in detailsData.revenueDetails"
          v-else
          :key="item.revenueId"
          class="overflow-hidden rounded-[20rpx] bg-white shadow-sm"
        >
          <!-- 头部：日期和状态 -->
          <view class="border-b border-white/10 from-green-50/50 to-emerald-50/50 bg-gradient-to-r px-[24rpx] py-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-gray-800 font-medium">
                {{ item.settlementDate || item.date }}
              </text>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getStatusStyle(item.status)"
              >
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>

          <!-- 主体：车辆和收益信息 -->
          <view class="p-[24rpx]">
            <!-- 车辆信息区域 -->
            <view class="mb-[20rpx] flex">
              <view class="h-[100rpx] w-[140rpx] flex-shrink-0">
                <!-- 暂时使用默认图片，实际车辆图片需要后端提供 -->
                <view class="h-full w-full flex items-center justify-center rounded-[12rpx] from-blue-100 to-purple-100 bg-gradient-to-br">
                  <text class="i-material-symbols-directions-car text-[40rpx] text-blue-600" />
                </view>
              </view>
              <view class="ml-[20rpx] min-w-0 flex flex-1 flex-col justify-center">
                <text class="truncate text-[26rpx] text-black font-bold">
                  {{ item.vehicleName }}
                </text>
                <view class="mt-[8rpx] flex items-center gap-x-[12rpx]">
                  <text class="rounded-[6rpx] bg-blue-50 px-[8rpx] py-[2rpx] text-[20rpx] text-blue-700 font-medium">
                    {{ item.licensePlate }}
                  </text>
                </view>
                <view class="mt-[6rpx] flex items-center">
                  <text class="i-material-symbols-person mr-[4rpx] text-[18rpx] text-gray-500" />
                  <text class="text-[22rpx] text-gray-600">
                    {{ item.userNickname }}
                  </text>
                  <text v-if="item.userPhone" class="ml-[8rpx] text-[20rpx] text-gray-400">
                    {{ item.userPhone }}
                  </text>
                </view>
              </view>
              <!-- 收益金额 -->
              <view class="ml-[16rpx] min-w-[80rpx] flex flex-col items-end justify-between text-right">
                <text class="text-[32rpx] text-green-600 font-bold">
                  ¥{{ item.finalRevenueAmount.toFixed(2) }}
                </text>
                <text class="mt-[4rpx] block text-[20rpx] text-gray-400">
                  {{ (item.platformCommissionRate * 100).toFixed(1) }}% 平台抽成
                </text>
              </view>
            </view>

            <!-- 订单详情 -->
            <view class="mb-[16rpx] rounded-[14rpx] bg-gray-50 p-[16rpx]">
              <view class="mb-[8rpx] flex items-center">
                <text class="i-material-symbols-receipt mr-[8rpx] text-[20rpx] text-green-600" />
                <text class="text-[22rpx] text-gray-600">
                  订单号：{{ item.orderNo }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  订单总额：¥{{ item.orderTotalAmount.toFixed(2) }}
                </text>
                <text class="rounded-full bg-purple-100 px-[12rpx] py-[4rpx] text-[18rpx] text-purple-600">
                  {{ item.packageType }}
                </text>
              </view>
            </view>

            <!-- 收益详细拆分 -->
            <view class="rounded-[14rpx] bg-blue-50/50 p-[16rpx] space-y-[8rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  车主收益：
                </text>
                <text class="text-[22rpx] text-green-600 font-medium">
                  ¥{{ item.ownerRevenueAmount.toFixed(2) }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  平台抽成：
                </text>
                <text class="text-[22rpx] text-orange-600 font-medium">
                  ¥{{ item.platformCommissionAmount.toFixed(2) }}
                </text>
              </view>
              <view v-if="item.serviceFee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  服务费：
                </text>
                <text class="text-[22rpx] text-red-600 font-medium">
                  -¥{{ item.serviceFee.toFixed(2) }}
                </text>
              </view>
              <view v-if="item.bonusAmount > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  奖励金额：
                </text>
                <text class="text-[22rpx] text-blue-600 font-medium">
                  +¥{{ item.bonusAmount.toFixed(2) }}
                </text>
              </view>
              <view class="flex items-center justify-between border-t border-gray-200 pt-[8rpx]">
                <text class="text-[24rpx] text-gray-800 font-semibold">
                  最终收益：
                </text>
                <text class="text-[24rpx] text-green-600 font-bold">
                  ¥{{ item.finalRevenueAmount.toFixed(2) }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多状态 -->
        <view v-if="currentTab === 'revenue' && detailsData.revenueDetails.length > 0" class="flex items-center justify-center py-[32rpx]">
          <view v-if="loadingMore" class="flex items-center space-x-[8rpx]">
            <text class="text-[24rpx] text-gray-500">
              加载中...
            </text>
          </view>
          <text v-else-if="!pagination.hasMore" class="text-[22rpx] text-gray-400">
            没有更多数据了
          </text>
        </view>
      </view>

      <!-- 提现记录 -->
      <view v-else class="px-[32rpx] pb-[48rpx] pt-[24rpx] space-y-[24rpx]">
        <!-- 加载状态 -->
        <view v-if="withdrawalLoading" class="flex items-center justify-center py-[80rpx]">
          <text class="text-[24rpx] text-gray-500">
            加载中...
          </text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!detailsData.withdrawalRecords.length" class="flex flex-col items-center justify-center py-[120rpx]">
          <text class="i-material-symbols-account-balance-wallet mb-[16rpx] text-[80rpx] text-gray-300" />
          <text class="mb-[8rpx] text-[28rpx] text-gray-400 font-medium">
            暂无提现记录
          </text>
          <text class="text-[22rpx] text-gray-400">
            提现申请后记录将在此显示
          </text>
        </view>

        <!-- 提现列表 -->
        <view
          v-for="record in detailsData.withdrawalRecords"
          v-else
          :key="record.id"
          class="overflow-hidden rounded-[20rpx] bg-white shadow-sm"
        >
          <!-- 提现单号和状态 -->
          <view class="border-b border-gray-100 bg-gray-50/50 px-[24rpx] py-[16rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[12rpx]">
                <text class="text-[24rpx] text-gray-600">
                  {{ record.withdrawalNo }}
                </text>
                <!-- 🆕 自动分账标识 -->
                <text
                  v-if="record.withdrawalType === 'auto_profit_sharing'"
                  class="rounded-full bg-purple-100 px-[12rpx] py-[4rpx] text-[18rpx] text-purple-600"
                >
                  自动分账
                </text>
              </view>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getWithdrawalStatusStyle(record.status)"
              >
                {{ getWithdrawalStatusText(record.status) }}
              </text>
            </view>
          </view>

          <!-- 提现详情 -->
          <view class="p-[24rpx] space-y-[16rpx]">
            <!-- 金额信息 -->
            <view class="rounded-lg p-[16rpx]" :class="record.withdrawalType === 'auto_profit_sharing' ? 'bg-purple-50/50' : 'bg-blue-50/50'">
              <view class="mb-[8rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  {{ record.withdrawalType === 'auto_profit_sharing' ? '分账金额' : '提现金额' }}
                </text>
                <text class="text-[28rpx] font-semibold" :class="record.withdrawalType === 'auto_profit_sharing' ? 'text-purple-600' : 'text-blue-600'">
                  ¥{{ record.amount.toFixed(2) }}
                </text>
              </view>
              <!-- 手续费 (仅手动提现显示) -->
              <view v-if="record.withdrawalType !== 'auto_profit_sharing' && record.fee > 0" class="mb-[8rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  手续费
                </text>
                <text class="text-[24rpx] text-orange-600">
                  -¥{{ record.fee.toFixed(2) }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  实际到账
                </text>
                <text class="text-[32rpx] text-green-600 font-bold">
                  ¥{{ record.actualAmount.toFixed(2) }}
                </text>
              </view>
              <!-- 🆕 自动分账附加信息 -->
              <view v-if="record.withdrawalType === 'auto_profit_sharing'" class="mt-[12rpx] border-t border-purple-100 pt-[12rpx]">
                <view class="flex items-center space-x-[8rpx]">
                  <text class="i-material-symbols-check-circle text-[18rpx] text-purple-600" />
                  <text class="text-[20rpx] text-purple-600">
                    系统自动分账，无手续费
                  </text>
                </view>
              </view>
            </view>

            <!-- 提现方式信息 (手动提现才显示) -->
            <view
              v-if="record.withdrawalType !== 'auto_profit_sharing'"
              class="flex items-center justify-between"
            >
              <text class="text-[24rpx] text-gray-600">
                {{ getWithdrawalMethodLabel(record) }}
              </text>
              <text class="text-[26rpx] text-gray-800">
                {{ getWithdrawalAccountInfo(record) }}
              </text>
            </view>

            <!-- 🆕 自动分账说明 (仅自动分账显示) -->
            <view
              v-if="record.withdrawalType === 'auto_profit_sharing' && record.remark"
              class="rounded-lg bg-purple-50 p-[16rpx]"
            >
              <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
                <text class="i-material-symbols-info text-[20rpx] text-purple-600" />
                <text class="text-[22rpx] text-purple-800 font-medium">
                  分账说明
                </text>
              </view>
              <text class="text-[20rpx] text-purple-700 leading-relaxed">
                {{ record.remark }}
              </text>
            </view>

            <!-- 时间信息 -->
            <view class="space-y-[8rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  {{ record.withdrawalType === 'auto_profit_sharing' ? '分账时间' : '申请时间' }}
                </text>
                <text class="text-[24rpx] text-gray-600">
                  {{ record.applyTime }}
                </text>
              </view>
              <view v-if="record.completeTime" class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  完成时间
                </text>
                <text class="text-[24rpx] text-gray-600">
                  {{ record.completeTime }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 提现弹窗 -->
    <BottomDrawer
      v-model:visible="withdrawalDrawerVisible"
      title="立即提现"
      height="700rpx"
    >
      <view class="pt-[30rpx] space-y-[32rpx]">
        <!-- 可提现金额显示 -->
        <view class="rounded-[16rpx] from-purple-50 to-blue-50 bg-gradient-to-r p-[24rpx]">
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              可提现余额
            </text>
            <text class="text-[32rpx] text-purple-600 font-bold">
              ¥{{ revenueData.balance.toFixed(2) }}
            </text>
          </view>
          <text class="text-[20rpx] text-gray-500">
            提现金额将扣除相应手续费
          </text>
        </view>

        <!-- 提现金额输入 -->
        <view>
          <text class="mb-[16rpx] block text-[26rpx] font-semibold">
            提现金额
          </text>
          <view class="relative flex items-center">
            <input
              v-model="withdrawalAmount"
              class="relative z-1 w-full border border-gray-300 rounded-[12rpx] bg-gray-50 px-[24rpx] py-[20rpx] text-[28rpx] placeholder:text-gray-400"
              placeholder="请输入提现金额"
              type="digit"
            >
            <view
              class="absolute right-[16rpx] z-2 transform border border-purple-600 rounded-[8rpx] bg-purple-50 px-[16rpx] py-[8rpx] text-[20rpx] text-purple-600 -translate-y-1/2"
              @tap="withdrawalAmount = revenueData.balance.toFixed(2)"
            >
              全部
            </view>
          </view>
        </view>

        <!-- 提现方式选择 -->
        <view>
          <view class="mb-[16rpx] flex items-center justify-between">
            <text class="text-[26rpx] font-semibold">
              提现方式
            </text>
            <view
              class="flex items-center border border-purple-600 rounded-[8rpx] bg-purple-50 px-[12rpx] py-[6rpx] text-[20rpx] text-purple-600 space-x-[8rpx]"
              @tap="goToWithdrawalMethods"
            >
              <text class="i-material-symbols-add text-[16rpx]" />
              <text>添加</text>
            </view>
          </view>

          <view class="space-y-[12rpx]">
            <view
              v-for="method in withdrawalMethods"
              :key="method.id"
              class="border rounded-[12rpx] bg-white p-[20rpx] transition-all duration-200"
              :class="selectedWithdrawalMethod?.id === method.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200'"
              @tap="selectWithdrawalMethod(method)"
            >
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[16rpx]">
                  <image
                    v-if="method.iconUrl"
                    :src="method.iconUrl"
                    class="h-[32rpx] w-[32rpx]"
                    mode="aspectFit"
                  />
                  <text
                    v-else
                    class="text-[32rpx]"
                    :class="method.icon"
                    :style="{ color: method.type === 'bank' ? '#1976d2' : method.type === 'wechat' ? '#4caf50' : '#ff9800' }"
                  />
                  <view>
                    <text class="block text-[24rpx] font-medium">
                      {{ method.name }}
                    </text>
                    <text class="text-[20rpx] text-gray-500">
                      {{ method.account }}
                    </text>
                  </view>
                </view>
                <view class="flex items-center space-x-[8rpx]">
                  <text v-if="method.isDefault" class="rounded-full bg-orange-100 px-[8rpx] py-[2rpx] text-[18rpx] text-orange-600">
                    默认
                  </text>
                  <view
                    class="h-[20rpx] w-[20rpx] border-2 rounded-full"
                    :class="selectedWithdrawalMethod?.id === method.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'"
                  >
                    <view
                      v-if="selectedWithdrawalMethod?.id === method.id"
                      class="h-full w-full scale-50 rounded-full bg-white"
                    />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 提现说明 -->
        <view class="rounded-[12rpx] bg-yellow-50 p-[16rpx]">
          <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
            <text class="i-material-symbols-info text-[20rpx] text-yellow-600" />
            <text class="text-[22rpx] text-yellow-800 font-medium">
              提现说明
            </text>
          </view>
          <view class="text-[20rpx] text-yellow-700 space-y-[4rpx]">
            <text class="block">
              • 提现手续费：每笔2-5元
            </text>
            <text class="block">
              • 到账时间：工作日1-3小时，节假日顺延
            </text>
            <text class="block">
              • 单笔限额：最低10元，最高50,000元
            </text>
          </view>
        </view>

        <!-- 提交按钮 -->
        <view class="flex space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-300 rounded-full bg-white py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
            @tap="withdrawalDrawerVisible = false"
          >
            取消
          </view>
          <view
            class="flex-1 rounded-full py-[24rpx] text-center text-[26rpx] text-white font-medium"
            :class="withdrawalAmount && selectedWithdrawalMethod ? 'bg-purple-600' : 'bg-gray-300'"
            @tap="submitWithdrawal"
          >
            确认提现
          </view>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>
