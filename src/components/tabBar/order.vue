<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { useOrderStore } from '@/store/order'
import OrderHead from '@/components/page/order/Head.vue'

// 使用 order store
const orderStore = useOrderStore()
const { orderList, orderListStatus, statusCounts, activeTab } = storeToRefs(orderStore)

const countdownTime = ref('23:45:32')

// 切换订单状态tab
function switchTab(tab: string) {
  orderStore.switchOrderTab(tab)
}

// 订单操作
async function contactOwner(orderId: number) {
  try {
    await orderStore.handleContactOwner(orderId, '用户主动联系')
    uni.showToast({ title: '已联系车主', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '联系车主失败', icon: 'none' })
  }
}

async function renewOrder(orderId: number) {
  try {
    await orderStore.handleRenewOrder(orderId, 1, '2024-12-17 14:00')
    uni.showToast({ title: '续租成功', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '续租失败', icon: 'none' })
  }
}

async function rateOrder(orderId: number) {
  try {
    await orderStore.handleReviewOrder(orderId, 5, '服务很好', ['准时', '车况良好'])
    uni.showToast({ title: '评价成功', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '评价失败', icon: 'none' })
  }
}

async function reOrder(orderId: number) {
  try {
    await orderStore.handleRebookOrder(orderId, '2024-12-20 14:00', '2024-12-21 14:00')
    uni.showToast({ title: '预订成功', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '预订失败', icon: 'none' })
  }
}

function viewDetail(orderId: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` })
}

// 处理订单操作
function handleOrderAction(actionType: string, orderId: number) {
  switch (actionType) {
    case 'contact':
      contactOwner(orderId)
      break
    case 'renew':
      renewOrder(orderId)
      break
    case 'review':
      rateOrder(orderId)
      break
    case 'rebook':
      reOrder(orderId)
      break
    case 'detail':
      viewDetail(orderId)
      break
    default:
      uni.showToast({ title: '操作暂未实现', icon: 'none' })
  }
}

// 页面初始化时加载数据（首次进入时）
onMounted(() => {
  // 不在这里主动加载数据，由 AppFooter 统一管理
  // 只在真正没有数据且没有在加载时才初始化
  if (orderList.value.length === 0 && orderListStatus.value !== 'loading') {
    orderStore.reloadOrderList()
  }
})

// 触底加载更多
onReachBottom(() => {
  orderStore.loadMoreOrders()
})

// 倒计时更新
onShow(() => {
  setInterval(() => {
    // 简单的倒计时逻辑
    const parts = countdownTime.value.split(':').map(Number)
    let hours = parts[0]
    let minutes = parts[1]
    let seconds = parts[2]

    if (seconds > 0) {
      seconds--
    }
    else if (minutes > 0) {
      minutes--
      seconds = 59
    }
    else if (hours > 0) {
      hours--
      minutes = 59
      seconds = 59
    }

    countdownTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-y-auto bg-gray-50">
    <!-- 头部导航 -->
    <OrderHead />

    <!-- 订单状态筛选 -->
    <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[40rpx] py-[32rpx]">
      <view class="flex rounded-[24rpx] bg-gray-100 p-[8rpx] space-x-[8rpx]">
        <view
          class="flex-1 rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
          :class="activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('all')"
        >
          全部订单
          <text v-if="statusCounts.all" class="ml-1 text-[20rpx]">
            ({{ statusCounts.all }})
          </text>
        </view>
        <view
          class="flex-1 rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
          :class="activeTab === 'ongoing' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('ongoing')"
        >
          进行中
          <text v-if="statusCounts.ongoing" class="ml-1 text-[20rpx]">
            ({{ statusCounts.ongoing }})
          </text>
        </view>
        <view
          class="flex-1 rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
          :class="activeTab === 'cancelled' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('cancelled')"
        >
          已取消
          <text v-if="statusCounts.cancelled" class="ml-1 text-[20rpx]">
            ({{ statusCounts.cancelled }})
          </text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto bg-gray-50">
      <!-- 订单列表 -->
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 空状态 -->
        <view v-if="orderList.length === 0 && orderListStatus !== 'loading'" class="flex flex-col items-center justify-center py-[120rpx]">
          <text class="mb-[24rpx] text-[48rpx] text-gray-400">
            📋
          </text>
          <text class="mb-[16rpx] text-[28rpx] text-gray-500">
            暂无订单
          </text>
          <text class="text-[24rpx] text-gray-400">
            快去租辆车开始旅程吧
          </text>
        </view>

        <!-- 订单列表 -->
        <view
          v-for="order in orderList"
          :key="order.id"
          class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
        >
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center space-x-[16rpx]">
              <view
                class="h-[16rpx] w-[16rpx] rounded-full"
                :class="{
                  'bg-green-500': order.status === 'ongoing',
                  'bg-gray-400': order.status === 'completed',
                  'bg-red-400': order.status === 'cancelled',
                }"
              />
              <text class="text-[28rpx] text-gray-900 font-medium">
                {{ order.statusText }}
              </text>
            </view>
            <text class="text-[24rpx] text-gray-500">
              订单号：{{ order.orderNumber }}
            </text>
          </view>

          <view class="mb-[32rpx] flex items-center space-x-[24rpx]">
            <view class="h-[96rpx] w-[128rpx] overflow-hidden rounded-[16rpx]">
              <image
                :src="order.vehicle.imageUrl"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-[32rpx] text-black font-semibold">
                {{ order.vehicle.name }}
              </text>
              <text class="text-[28rpx] text-gray-600">
                {{ order.vehicle.type }}
              </text>
            </view>
            <view class="text-right">
              <text class="block text-[32rpx] text-black font-semibold">
                ¥{{ order.amount }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                {{ order.rentPeriod.days }}天
              </text>
            </view>
          </view>

          <view class="mb-[32rpx] rounded-[24rpx] bg-gray-50 p-[24rpx]">
            <view class="mb-[16rpx] flex items-center justify-between">
              <text class="text-[28rpx] text-gray-600">
                用车时间
              </text>
              <text class="text-[28rpx] text-black">
                {{ order.rentPeriod.startTime }} - {{ order.rentPeriod.endTime }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-gray-600">
                取车地点
              </text>
              <text class="text-[28rpx] text-black">
                {{ order.location }}
              </text>
            </view>
          </view>

          <!-- 取车码区域 (仅进行中订单显示) -->
          <view v-if="order.status === 'ongoing' && order.pickupCode" class="mb-[24rpx] flex items-center justify-between py-[32rpx]">
            <view class="flex items-center space-x-[32rpx]">
              <view>
                <view class="mb-[8rpx] flex items-center text-[24rpx] text-gray-600 space-x-[8rpx]">
                  <text class="i-material-symbols-qr-code-scanner text-[24rpx] text-gray-600" />
                  <text>取车码</text>
                </view>
                <text class="text-[72rpx] text-black font-bold tracking-wider">
                  {{ order.pickupCode }}
                </text>
              </view>
            </view>
            <view v-if="order.remainingTime" class="text-right">
              <text class="mb-[8rpx] block text-[24rpx] text-gray-600">
                剩余时间
              </text>
              <text class="text-[32rpx] text-red-500 font-bold font-mono">
                {{ order.remainingTime }}
              </text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view v-if="order.actions && order.actions.length > 0" class="flex space-x-[24rpx]">
            <view
              v-for="action in order.actions"
              :key="action.type"
              class="flex-1 rounded-[16rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
              :class="{
                'bg-gray-100 text-gray-600': action.style === 'secondary',
                'bg-purple-600 text-white': action.style === 'primary',
                'bg-purple-50 text-purple-600': action.style === 'outline',
              }"
              @tap="handleOrderAction(action.type, order.id)"
            >
              {{ action.text }}
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="orderListStatus === 'loading'" class="flex items-center justify-center py-[80rpx]">
          <text class="text-[28rpx] text-gray-500">
            加载中...
          </text>
        </view>

        <!-- 没有更多数据 -->
        <view v-if="orderListStatus === 'nomore' && orderList.length > 0" class="flex items-center justify-center py-[40rpx]">
          <text class="text-[24rpx] text-gray-400">
            没有更多订单了
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
