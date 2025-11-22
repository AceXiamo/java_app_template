<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { VehicleRentalRequest } from '@/api/vehicle-rental-request'
import { getApplicationHistory } from '@/api/vehicle-rental-request'
import dayjs from 'dayjs'

// 页面状态
const refreshing = ref(false)
const records = ref<VehicleRentalRequest[]>([])

// 状态映射
const statusMap = {
  pending: { text: '待处理', color: 'orange' },
  processing: { text: '处理中', color: 'blue' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  cancelled: { text: '已取消', color: 'gray' },
}

// 获取状态显示信息
function getStatusInfo(status: string) {
  return statusMap[status as keyof typeof statusMap] || { text: status, color: 'gray' }
}

// 获取状态样式
function getStatusStyle(status: string) {
  const statusInfo = getStatusInfo(status)
  switch (statusInfo.color) {
    case 'orange':
      return 'bg-orange-100 text-orange-600'
    case 'blue':
      return 'bg-blue-100 text-blue-600'
    case 'green':
      return 'bg-green-100 text-green-600'
    case 'red':
      return 'bg-red-100 text-red-600'
    case 'gray':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// 格式化时间
function formatTime(timeStr: string) {
  if (!timeStr)
    return ''
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

// 加载申请记录
async function loadRecords() {
  try {
    if (!refreshing.value) {
      uni.showLoading({
        title: '加载中...',
      })
    }

    const response = await getApplicationHistory()
    if (response.code === 200) {
      records.value = response.data || []
    }
  }
  catch (error) {
    console.error('获取申请记录失败:', error)
    uni.showToast({
      title: '获取申请记录失败',
      icon: 'error',
    })
  }
  finally {
    if (!refreshing.value) {
      uni.hideLoading()
    }
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  try {
    await loadRecords()
  }
  finally {
    refreshing.value = false
  }
}

function back() {
  uni.navigateBack()
}

// 页面加载
onMounted(() => {
  loadRecords()
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="back">
          <text class="i-material-symbols:arrow-back-ios text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          申请记录
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <scroll-view
      scroll-y
      class="h-0 flex-1"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 统计信息 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-bar-chart text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              申请统计
            </text>
          </view>
          <view class="grid grid-cols-3 gap-[16rpx] text-center">
            <view class="rounded-[16rpx] bg-gray-50 p-[20rpx]">
              <text class="mb-[4rpx] block text-[32rpx] text-purple-600 font-bold">
                {{ records.length }}
              </text>
              <text class="text-[22rpx] text-gray-600">
                总申请
              </text>
            </view>
            <view class="rounded-[16rpx] bg-gray-50 p-[20rpx]">
              <text class="mb-[4rpx] block text-[32rpx] text-orange-600 font-bold">
                {{ records.filter(r => r.status === 'pending').length }}
              </text>
              <text class="text-[22rpx] text-gray-600">
                待审核
              </text>
            </view>
            <view class="rounded-[16rpx] bg-gray-50 p-[20rpx]">
              <text class="mb-[4rpx] block text-[32rpx] text-green-600 font-bold">
                {{ records.filter(r => r.status === 'approved').length }}
              </text>
              <text class="text-[22rpx] text-gray-600">
                已通过
              </text>
            </view>
          </view>
        </view>

        <!-- 申请记录列表 -->
        <view v-if="records.length > 0" class="space-y-[16rpx]">
          <view
            v-for="record in records"
            :key="record.applicationId"
            class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm"
          >
            <!-- 状态和申请编号 -->
            <view class="mb-[24rpx] flex items-center justify-between">
              <view class="flex items-center space-x-[12rpx]">
                <text
                  class="rounded-[8rpx] px-[12rpx] py-[4rpx] text-[22rpx] font-medium"
                  :class="getStatusStyle(record.status)"
                >
                  {{ getStatusInfo(record.status).text }}
                </text>
              </view>
              <text class="text-[22rpx] text-gray-500">
                {{ record.applicationNo }}
              </text>
            </view>

            <!-- 申请信息 -->
            <view class="mb-[24rpx] space-y-[16rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[26rpx] text-gray-600">
                  提交时间
                </text>
                <text class="text-[26rpx] text-black font-medium">
                  {{ formatTime(record.timeInfo.submitTime) }}
                </text>
              </view>

              <view class="flex items-center justify-between">
                <text class="text-[26rpx] text-gray-600">
                  运营套餐
                </text>
                <text class="text-[26rpx] text-black font-medium">
                  {{ record.operationMode }}
                </text>
              </view>

              <view class="flex items-center justify-between">
                <text class="text-[26rpx] text-gray-600">
                  联系电话
                </text>
                <text class="text-[26rpx] text-black font-medium">
                  {{ record.contactInfo.contactPhone }}
                </text>
              </view>

              <view v-if="record.contactInfo.contactAddress" class="flex items-start justify-between">
                <text class="text-[26rpx] text-gray-600">
                  联系地址
                </text>
                <text class="min-w-0 flex-1 text-right text-[26rpx] text-black font-medium">
                  {{ record.contactInfo.contactAddress }}
                </text>
              </view>
            </view>

            <!-- 套餐详情 -->
            <view v-if="record.packageInfo" class="rounded-[16rpx] bg-purple-50 p-[20rpx]">
              <view class="mb-[12rpx] flex items-center">
                <text class="i-material-symbols-business-center mr-[8rpx] text-[24rpx] text-purple-600" />
                <text class="text-[24rpx] text-purple-800 font-medium">
                  套餐详情
                </text>
              </view>
              <text class="mb-[8rpx] block text-[22rpx] text-purple-700">
                {{ record.packageInfo.packageDescription }}
              </text>
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-purple-600">
                  车主分成比例
                </text>
                <text class="text-[22rpx] text-purple-800 font-medium">
                  {{ (record.packageInfo.revenueShareRate * 100).toFixed(0) }}%
                </text>
              </view>
            </view>

            <!-- 状态说明 -->
            <view v-if="record.status === 'pending'" class="mt-[16rpx] rounded-[16rpx] bg-orange-50 p-[20rpx]">
              <view class="flex items-center">
                <text class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-orange-600" />
                <text class="text-[24rpx] text-orange-800 font-medium">
                  我们将在1-3个工作日内联系您进行详细沟通
                </text>
              </view>
            </view>

            <view v-else-if="record.status === 'processing'" class="mt-[16rpx] rounded-[16rpx] bg-blue-50 p-[20rpx]">
              <view class="flex items-center">
                <text class="i-material-symbols-sync mr-[12rpx] text-[24rpx] text-blue-600" />
                <text class="text-[24rpx] text-blue-800 font-medium">
                  正在处理您的申请，请耐心等待
                </text>
              </view>
            </view>

            <view v-else-if="record.status === 'approved'" class="mt-[16rpx] rounded-[16rpx] bg-green-50 p-[20rpx]">
              <view class="flex items-center">
                <text class="i-material-symbols-check-circle mr-[12rpx] text-[24rpx] text-green-600" />
                <text class="text-[24rpx] text-green-800 font-medium">
                  恭喜！您的申请已通过审核
                </text>
              </view>
            </view>

            <!-- 拒绝原因 -->
            <view v-else-if="record.status === 'rejected'" class="mt-[16rpx] rounded-[16rpx] bg-red-50 p-[20rpx]">
              <view class="flex items-start">
                <text class="i-material-symbols-cancel mr-[12rpx] mt-[2rpx] flex-shrink-0 text-[24rpx] text-red-600" />
                <view class="flex-1">
                  <text class="block text-[24rpx] text-red-800 font-medium">
                    很抱歉，您的申请未通过审核
                  </text>
                  <text v-if="record.processInfo?.rejectReason" class="mt-[8rpx] block text-[22rpx] text-red-700">
                    拒绝原因：{{ record.processInfo.rejectReason }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="rounded-2xl bg-white p-[48rpx] text-center shadow-sm">
          <text class="i-material-symbols-description mb-[16rpx] block text-[80rpx] text-gray-300" />
          <text class="mb-[8rpx] block text-[28rpx] text-gray-600">
            暂无申请记录
          </text>
          <text class="text-[24rpx] text-gray-500">
            点击右上角开始您的第一次申请
          </text>
        </view>

        <!-- 底部安全距离 -->
        <view class="h-[40rpx]" />
      </view>
    </scroll-view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
