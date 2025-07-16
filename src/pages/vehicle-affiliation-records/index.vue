<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import type { ApplicationRecord } from '@/api/vehicle-affiliation'
import { getApplicationRecords } from '@/api/vehicle-affiliation'

// 页面状态
const loading = ref(false)
const records = ref<ApplicationRecord[]>([])
const total = ref(0)

// 获取状态样式
function getStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-600'
    case 'approved':
      return 'bg-green-100 text-green-600'
    case 'rejected':
      return 'bg-red-100 text-red-600'
    case 'cancelled':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// 加载申请记录
async function loadRecords() {
  try {
    loading.value = true
    const response = await getApplicationRecords()
    if (response.code === 200) {
      records.value = response.data.records
      total.value = response.data.total
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
    loading.value = false
  }
}

// 查看申请详情
function viewDetail(record: ApplicationRecord) {
  uni.navigateTo({
    url: `/pages/vehicle-affiliation-detail/index?id=${record.applicationId}`,
  })
}

// 重新申请
function reapply() {
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
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="() => uni.navigateBack()">
          <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          填写记录
        </text>

        <!-- 新申请按钮 -->
        <view class="absolute right-0 z-10 h-full flex items-center pr-[24rpx]">
          <view
            class="flex items-center rounded-full bg-purple-600 px-[20rpx] py-[12rpx] transition-transform active:scale-95 space-x-[8rpx]"
            @tap="reapply"
          >
            <text class="i-material-symbols-add text-[20rpx] text-white" />
            <text class="text-[24rpx] text-white font-medium">
              新申请
            </text>
          </view>
        </view>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
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
                {{ total }}
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
        <view v-if="records.length > 0" class="space-y-[12rpx]">
          <view
            v-for="record in records"
            :key="record.applicationId"
            class="rounded-[24rpx] bg-white p-[24rpx] shadow-sm transition-all duration-150 active:scale-99"
            @tap="viewDetail(record)"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view class="flex items-center space-x-[12rpx]">
                <text class="text-[28rpx] text-black font-semibold">
                  {{ record.applicationNo }}
                </text>
                <text
                  class="rounded-full px-[12rpx] py-[4rpx] text-[20rpx] font-medium"
                  :class="getStatusStyle(record.status)"
                >
                  {{ record.statusText }}
                </text>
              </view>
              <text class="i-material-symbols-chevron-right text-[24rpx] text-gray-400" />
            </view>

            <view class="mb-[16rpx] space-y-[8rpx]">
              <text class="block text-[24rpx] text-gray-700">
                车辆：{{ record.vehicleInfo.brand }} {{ record.vehicleInfo.model }}
              </text>
              <text class="block text-[24rpx] text-gray-700">
                车牌：{{ record.vehicleInfo.licensePlate }}
              </text>
              <text class="block text-[24rpx] text-gray-700">
                运营模式：{{ record.vehicleInfo.operationMode === 'agent' ? '代理运营' : '自运营' }}
              </text>
            </view>

            <view class="flex items-center justify-between text-[22rpx] text-gray-500">
              <text>提交时间：{{ record.submitTime }}</text>
              <text v-if="record.reviewTime">
                审核时间：{{ record.reviewTime }}
              </text>
            </view>

            <!-- 拒绝原因 -->
            <view v-if="record.status === 'rejected' && record.rejectReason" class="mt-[12rpx] rounded-lg bg-red-50 p-[12rpx]">
              <text class="text-[22rpx] text-red-600">
                拒绝原因：{{ record.rejectReason }}
              </text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!loading" class="rounded-2xl bg-white p-[48rpx] text-center shadow-sm">
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

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <view class="rounded-xl bg-white p-[40rpx] shadow-lg">
        <view class="flex items-center space-x-[16rpx]">
          <view class="h-[32rpx] w-[32rpx] animate-spin border-2 border-purple-600 border-t-transparent rounded-full" />
          <text class="text-[28rpx] text-gray-700">
            加载中...
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
