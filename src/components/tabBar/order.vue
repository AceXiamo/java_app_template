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
  uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}` })
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
        </view>
        <view
          class="flex-1 rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
          :class="activeTab === 'ongoing' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('ongoing')"
        >
          进行中
        </view>
        <view
          class="flex-1 rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-all duration-200 active:scale-95"
          :class="activeTab === 'cancelled' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('cancelled')"
        >
          已取消
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 空状态 -->
        <view v-if="orderList.length === 0 && orderListStatus !== 'loading'" class="flex flex-col items-center justify-center py-[120rpx]">
          <text class="i-material-symbols-receipt-long mb-[24rpx] text-[96rpx] text-gray-300" />
          <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">
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
          class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]"
          @tap="viewDetail(order.id)"
        >
          <!-- 订单状态和订单号 -->
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <view
                class="mr-[12rpx] rounded-[8rpx] px-[12rpx] py-[4rpx] text-[22rpx] font-medium"
                :class="{
                  'bg-green-50 text-green-600': order.status === 'ongoing',
                  'bg-gray-50 text-gray-600': order.status === 'completed',
                  'bg-red-50 text-red-600': order.status === 'cancelled',
                  'bg-orange-50 text-orange-600': order.status === 'pending',
                }"
              >
                {{ order.statusText }}
              </view>
            </view>
            <text class="text-[22rpx] text-gray-500">
              {{ order.orderNumber }}
            </text>
          </view>

          <!-- 车辆信息 -->
          <view class="mb-[24rpx] flex">
            <!-- 车辆图片 -->
            <view class="h-[120rpx] w-[160rpx] flex-shrink-0">
              <image
                :src="order.vehicle.imageUrl"
                mode="aspectFill"
                class="h-full w-full rounded-[12rpx]"
              />
            </view>

            <!-- 车辆信息 -->
            <view class="ml-[24rpx] flex flex-1 flex-col justify-center">
              <text class="text-[28rpx] text-black font-semibold">
                {{ order.vehicle.name }}
              </text>
              <view class="mt-[8rpx] flex items-center text-[22rpx] text-gray-600 space-x-[16rpx]">
                <text>{{ order.vehicle.licensePlate || '沪A·12345' }}</text>
                <text>{{ order.vehicle.seats || 5 }}座</text>
                <text>{{ order.vehicle.type }}</text>
              </view>
              <view class="mt-[8rpx] flex items-center">
                <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                <text class="text-[20rpx] text-gray-600">
                  {{ order.vehicle.rating || 4.8 }}({{ order.vehicle.ratingCount || 128 }})
                </text>
              </view>
            </view>

            <!-- 价格信息 -->
            <view class="ml-[16rpx] text-right">
              <text class="text-[32rpx] text-purple-600 font-bold">
                ¥{{ order.amount }}
              </text>
              <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
                {{ order.rentPeriod.days }}天
              </text>
            </view>
          </view>

          <!-- 订单详情 -->
          <view class="mb-[24rpx] rounded-[16rpx] bg-gray-50 p-[24rpx]">
            <view class="mb-[16rpx] flex items-center">
              <text class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-purple-600" />
              <text class="text-[26rpx] text-black font-medium">用车时间</text>
            </view>
            <text class="mb-[16rpx] block text-[24rpx] text-gray-700">
              {{ order.rentPeriod.startTime }} - {{ order.rentPeriod.endTime }}
            </text>
            
            <view class="flex items-center">
              <text class="i-material-symbols-location-on mr-[12rpx] text-[24rpx] text-purple-600" />
              <text class="text-[26rpx] text-black font-medium">取车地点</text>
            </view>
            <text class="mt-[8rpx] block text-[24rpx] text-gray-700">
              {{ order.location }}
            </text>
          </view>

          <!-- 取车码区域 (仅进行中订单显示) -->
          <view v-if="order.status === 'ongoing' && order.pickupCode" class="mb-[24rpx] rounded-[16rpx] bg-purple-50 p-[24rpx]">
            <view class="flex items-center justify-between">
              <view>
                <view class="mb-[12rpx] flex items-center">
                  <text class="i-material-symbols-qr-code-scanner mr-[8rpx] text-[24rpx] text-purple-600" />
                  <text class="text-[26rpx] text-purple-800 font-medium">取车码</text>
                </view>
                <text class="text-[56rpx] text-purple-600 font-bold tracking-wider">
                  {{ order.pickupCode }}
                </text>
              </view>
              <view v-if="order.remainingTime" class="text-right">
                <text class="mb-[8rpx] block text-[22rpx] text-gray-600">
                  剩余时间
                </text>
                <text class="text-[28rpx] text-red-500 font-bold font-mono">
                  {{ order.remainingTime }}
                </text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view v-if="order.actions && order.actions.length > 0" class="flex space-x-[16rpx]">
            <view
              v-for="action in order.actions"
              :key="action.type"
              class="flex-1 rounded-[20rpx] py-[20rpx] text-center text-[26rpx] font-medium transition-all duration-200 active:scale-95"
              :class="{
                'bg-gray-100 text-gray-600': action.style === 'secondary',
                'bg-purple-600 text-white': action.style === 'primary',
                'bg-purple-50 text-purple-600 border border-purple-200': action.style === 'outline',
              }"
              @tap.stop="handleOrderAction(action.type, order.id)"
            >
              {{ action.text }}
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="orderListStatus === 'loading'" class="flex items-center justify-center py-[80rpx]">
          <text class="i-material-symbols-sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
          <text class="text-[26rpx] text-gray-600">
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
    </scroll-view>
  </view>
</template>
