<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import { useOwnerStore } from '@/store/owner'
import { getOwnerRevenueRecords, type OwnerRevenueRecord, type OwnerRevenueQueryParams } from '@/api/owner-revenue'

// 使用 owner store
const ownerStore = useOwnerStore()
const { revenueData } = storeToRefs(ownerStore)

// 设置当前页面
ownerStore.setActive('revenue')

// 收益详情数据
const detailsData = reactive({
  revenueDetails: [] as OwnerRevenueRecord[],
  withdrawalRecords: [
    {
      id: 1,
      withdrawalNo: 'WD20250715001',
      amount: 1500.00,
      fee: 5.00,
      actualAmount: 1495.00,
      bankName: '招商银行',
      bankAccount: '****1234',
      status: 'completed',
      applyTime: '2025-07-15 10:30',
      completeTime: '2025-07-15 16:45'
    },
    {
      id: 2,
      withdrawalNo: 'WD20250710001',
      amount: 800.00,
      fee: 3.00,
      actualAmount: 797.00,
      bankName: '工商银行',
      bankAccount: '****5678',
      status: 'processing',
      applyTime: '2025-07-10 14:20',
      completeTime: null
    }
  ]
})

// 加载状态
const loading = ref(false)

// 当前显示模式
const currentTab = ref('revenue') // revenue | withdrawal

// 导航方法
function goToWithdraw() {
  uni.navigateTo({ url: '/pages/owner/withdraw' })
}

function goToWithdrawalRecords() {
  currentTab.value = 'withdrawal'
}

function goToRevenueDetails() {
  currentTab.value = 'revenue'
}

// 加载收益记录
async function loadRevenueRecords() {
  try {
    loading.value = true
    const params: OwnerRevenueQueryParams = {
      pageNum: 1,
      pageSize: 100, // 获取最近100条记录
      status: 'settled' // 只获取已结算的记录
    }
    
    const response = await getOwnerRevenueRecords(params)
    if (response.code === 200) {
      detailsData.revenueDetails = response.data.records || []
    }
  } catch (error) {
    console.error('加载收益记录失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(() => {
  loadRevenueRecords()
})

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap = {
    settled: 'text-green-600 bg-green-100',
    pending: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100'
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getWithdrawalStatusStyle(status: string) {
  const statusMap = {
    completed: 'text-green-600 bg-green-100',
    processing: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100',
    pending: 'text-blue-600 bg-blue-100'
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getStatusText(status: string) {
  const statusMap = {
    settled: '已结算',
    pending: '待结算',
    failed: '结算失败'
  }
  return statusMap[status] || status
}

function getWithdrawalStatusText(status: string) {
  const statusMap = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败',
    pending: '待处理'
  }
  return statusMap[status] || status
}

// 统计功能
function handleStatistics() {
  uni.showToast({
    title: '统计功能开发中',
    icon: 'none'
  })
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
    <!-- 头部导航栏 -->
    <HeadBar 
      title="收益管理" 
      :show-back="true"
      :show-right="true"
      right-icon="i-material-symbols-bar-chart"
      @right-click="handleStatistics"
    />

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="flex-1">
      <!-- 可提现余额 -->
      <view class="bg-gradient-to-r from-green-500 to-emerald-600 px-[40rpx] py-[48rpx]">
        <view class="text-center">
          <text class="block text-[28rpx] text-white/80 mb-[16rpx]">可提现余额</text>
          <text class="block text-[64rpx] font-bold text-white mb-[32rpx]">
            ¥{{ revenueData.balance.toFixed(2) }}
          </text>
          
          <view class="flex items-center justify-center space-x-[32rpx]">
            <view 
              class="border-2 border-white/30 rounded-xl bg-white/20 px-[32rpx] py-[16rpx] backdrop-blur-sm"
              @tap="goToWithdraw"
            >
              <text class="text-[28rpx] text-white font-medium">立即提现</text>
            </view>
            <view 
              class="border-2 border-white/30 rounded-xl bg-white/20 px-[32rpx] py-[16rpx] backdrop-blur-sm"
              @tap="goToWithdrawalRecords"
            >
              <text class="text-[28rpx] text-white font-medium">提现记录</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 收益趋势 -->
      <view class="bg-white/70 backdrop-blur-sm shadow-md border-b border-white/20 px-[40rpx] py-[32rpx] -mt-[24rpx] mx-[40rpx] rounded-t-xl">
        <view class="flex items-center justify-between mb-[24rpx]">
          <text class="text-[32rpx] font-bold text-gray-800">收益趋势</text>
          <text class="i-material-symbols-trending-up text-[32rpx] text-green-600" />
        </view>
        
        <view class="grid grid-cols-4 gap-[16rpx]">
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-purple-600">¥{{ revenueData.revenue.today }}</text>
            <text class="text-[20rpx] text-gray-600">今日</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-blue-600">¥{{ revenueData.revenue.thisWeek }}</text>
            <text class="text-[20rpx] text-gray-600">本周</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-green-600">¥{{ revenueData.revenue.thisMonth.toLocaleString() }}</text>
            <text class="text-[20rpx] text-gray-600">本月</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-orange-600">¥{{ revenueData.revenue.total.toLocaleString() }}</text>
            <text class="text-[20rpx] text-gray-600">总计</text>
          </view>
        </view>
      </view>

      <!-- 标签切换 -->
      <view class="bg-white/50 backdrop-blur-sm px-[40rpx] py-[24rpx]">
        <view class="flex items-center bg-gray-100 rounded-xl p-[8rpx]">
          <view 
            class="flex-1 text-center py-[16rpx] rounded-lg transition-all duration-200"
            :class="currentTab === 'revenue' ? 'bg-white shadow-sm' : ''"
            @tap="goToRevenueDetails"
          >
            <text 
              class="text-[28rpx] font-medium"
              :class="currentTab === 'revenue' ? 'text-purple-600' : 'text-gray-600'"
            >
              收益明细
            </text>
          </view>
          <view 
            class="flex-1 text-center py-[16rpx] rounded-lg transition-all duration-200"
            :class="currentTab === 'withdrawal' ? 'bg-white shadow-sm' : ''"
            @tap="goToWithdrawalRecords"
          >
            <text 
              class="text-[28rpx] font-medium"
              :class="currentTab === 'withdrawal' ? 'text-purple-600' : 'text-gray-600'"
            >
              提现记录
            </text>
          </view>
        </view>
      </view>

      <!-- 收益明细 -->
      <view v-if="currentTab === 'revenue'" class="px-[40rpx] space-y-[24rpx] pb-[48rpx]">
        <!-- 加载状态 -->
        <view v-if="loading" class="flex items-center justify-center py-[80rpx]">
          <text class="text-[28rpx] text-gray-500">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="detailsData.revenueDetails.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
          <text class="i-material-symbols-account-balance-wallet text-[80rpx] text-gray-300 mb-[24rpx]" />
          <text class="text-[28rpx] text-gray-500 mb-[16rpx]">暂无收益记录</text>
          <text class="text-[24rpx] text-gray-400">完成订单后会自动生成收益记录</text>
        </view>

        <!-- 收益记录列表 -->
        <view 
          v-else
          v-for="item in detailsData.revenueDetails" 
          :key="item.revenueId"
          class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden"
        >
          <!-- 日期和状态 -->
          <view class="bg-gradient-to-r from-gray-50/50 to-gray-50/50 px-[24rpx] py-[16rpx] border-b border-white/10">
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] font-medium text-gray-800">{{ item.settlementDate }}</text>
              <text 
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getStatusStyle(item.status)"
              >
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>

          <!-- 详细信息 -->
          <view class="p-[24rpx] space-y-[16rpx]">
            <!-- 车辆信息 -->
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-directions-car text-[24rpx] text-purple-600" />
              <text class="text-[26rpx] text-gray-800 font-medium">
                {{ item.vehicleName || '未知车辆' }}
                {{ item.licensePlate ? `(${item.licensePlate})` : '' }}
              </text>
            </view>

            <!-- 订单号 -->
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-receipt text-[24rpx] text-blue-600" />
              <text class="text-[24rpx] text-gray-600">{{ item.orderNo }}</text>
            </view>

            <!-- 金额信息 -->
            <view class="bg-green-50/50 rounded-lg p-[16rpx]">
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">订单总额</text>
                <text class="text-[26rpx] font-medium text-gray-800">¥{{ item.orderTotalAmount?.toFixed(2) }}</text>
              </view>
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">平台抽成</text>
                <text class="text-[26rpx] font-medium text-blue-600">
                  {{ (item.platformCommissionRate * 100)?.toFixed(1) }}%
                </text>
              </view>
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">抽成金额</text>
                <text class="text-[26rpx] font-medium text-red-600">-¥{{ item.platformCommissionAmount?.toFixed(2) }}</text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">我的收益</text>
                <text class="text-[32rpx] font-bold text-green-600">¥{{ item.finalRevenueAmount?.toFixed(2) }}</text>
              </view>
            </view>

            <!-- 套餐类型 -->
            <view v-if="item.packageType" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">套餐类型</text>
              <text class="rounded-full bg-purple-100 px-[16rpx] py-[6rpx] text-[20rpx] text-purple-600">
                {{ item.packageType }}
              </text>
            </view>

            <!-- 备注信息 -->
            <view v-if="item.remark" class="text-[22rpx] text-gray-500 bg-gray-50/50 rounded-lg p-[12rpx]">
              {{ item.remark }}
            </view>
          </view>
        </view>
      </view>

      <!-- 提现记录 -->
      <view v-else class="px-[40rpx] space-y-[24rpx] pb-[48rpx]">
        <view 
          v-for="record in detailsData.withdrawalRecords" 
          :key="record.id"
          class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden"
        >
          <!-- 提现单号和状态 -->
          <view class="bg-gradient-to-r from-gray-50/50 to-gray-50/50 px-[24rpx] py-[16rpx] border-b border-white/10">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">{{ record.withdrawalNo }}</text>
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
            <view class="bg-blue-50/50 rounded-lg p-[16rpx]">
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">提现金额</text>
                <text class="text-[28rpx] font-semibold text-blue-600">¥{{ record.amount.toFixed(2) }}</text>
              </view>
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">手续费</text>
                <text class="text-[24rpx] text-orange-600">-¥{{ record.fee.toFixed(2) }}</text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">实际到账</text>
                <text class="text-[32rpx] font-bold text-green-600">¥{{ record.actualAmount.toFixed(2) }}</text>
              </view>
            </view>

            <!-- 银行信息 -->
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">到账银行</text>
              <text class="text-[26rpx] text-gray-800">{{ record.bankName }} {{ record.bankAccount }}</text>
            </view>

            <!-- 时间信息 -->
            <view class="space-y-[8rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">申请时间</text>
                <text class="text-[24rpx] text-gray-600">{{ record.applyTime }}</text>
              </view>
              <view v-if="record.completeTime" class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">完成时间</text>
                <text class="text-[24rpx] text-gray-600">{{ record.completeTime }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部TabBar占位 -->
      <view class="h-[120rpx]" />
    </scroll-view>
  </view>
</template>