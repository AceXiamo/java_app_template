<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/store/order'
import OrderHead from '@/components/page/order/Head.vue'
import RenewOrderDrawer from '@/components/RenewOrderDrawer.vue'

// 使用 order store
const orderStore = useOrderStore()
const { orderList, orderListStatus, activeTab } = storeToRefs(orderStore)

// 切换订单状态tab
function switchTab(tab: string) {
  orderStore.switchOrderTab(tab)
}

// 订单操作
async function contactOwner(orderId: string) {
  try {
    await orderStore.handleContactOwner(Number(orderId), '用户主动联系')
    uni.showToast({ title: '已联系车主', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '联系车主失败', icon: 'none' })
  }
}

// 续租相关状态
const renewDrawerVisible = ref(false)
const currentRenewOrder = ref<any>(null)

async function renewOrder(orderId: string) {
  // 找到对应的订单数据
  const order = orderList.value.find(o => o.id === orderId)
  if (!order) {
    uni.showToast({ title: '订单信息不存在', icon: 'none' })
    return
  }

  currentRenewOrder.value = order
  renewDrawerVisible.value = true
}

// 处理续租确认
async function handleRenewConfirm(data: { orderId: number, extendDays: number, newEndTime: string, amount: number }) {
  try {
    uni.showLoading({ title: '处理中...' })

    // 调用续租API
    const result = await orderStore.handleRenewOrder(data.orderId, data.extendDays, data.newEndTime)

    // 关闭弹框
    renewDrawerVisible.value = false
    currentRenewOrder.value = null

    // 支付流程
    if (result.paymentUrl) {
      // 显示支付确认
      uni.showModal({
        title: '续租费用',
        content: `续租${data.extendDays}天，需要支付 ¥${data.amount}`,
        confirmText: '立即支付',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 发起支付
            uni.showLoading({ title: '支付中...' })

            // 这里应该集成真实的支付SDK（微信支付、支付宝等）
            // 目前模拟支付流程
            setTimeout(() => {
              uni.hideLoading()
              uni.showModal({
                title: '支付成功',
                content: '续租订单已生效，新的结束时间已更新',
                showCancel: false,
                success: () => {
                  uni.showToast({ title: '续租成功', icon: 'success' })
                  // 重新加载订单列表以获取最新状态
                  orderStore.reloadOrderList()
                },
              })
            }, 2000) // 模拟支付耗时
          }
        },
      })
    }
    else {
      // 无需支付（例如免费续租或已预付费）
      uni.showToast({ title: '续租成功', icon: 'success' })
      orderStore.reloadOrderList()
    }
  }
  catch (error) {
    console.error('续租失败:', error)
    uni.showToast({ title: '续租失败，请稍后重试', icon: 'none' })
  }
  finally {
    uni.hideLoading()
  }
}

// 关闭续租弹框
function closeRenewDrawer() {
  renewDrawerVisible.value = false
  currentRenewOrder.value = null
}

async function rateOrder(orderId: string) {
  try {
    await orderStore.handleReviewOrder(Number(orderId), 5, '服务很好', ['准时', '车况良好'])
    uni.showToast({ title: '评价成功', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '评价失败', icon: 'none' })
  }
}

async function reOrder(orderId: string) {
  try {
    await orderStore.handleRebookOrder(Number(orderId), '2024-12-20 14:00', '2024-12-21 14:00')
    uni.showToast({ title: '预订成功', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '预订失败', icon: 'none' })
  }
}

function viewDetail(orderId: string) {
  uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}` })
}

// 处理订单操作
function handleOrderAction(actionType: string, orderId: string) {
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

// 注意：现在使用 scroll-view 的 @scrolltolower 事件来处理触底加载

// 格式化时间显示
function formatTime(timeStr: string) {
  if (!timeStr)
    return ''

  try {
    let date: Date

    // 支持多种日期格式
    if (timeStr.includes('T') || timeStr.includes('Z')) {
      date = new Date(timeStr)
    }
    else if (timeStr.includes('-') && timeStr.includes(':')) {
      // 如果是 'YYYY-MM-DD HH:MM' 或 'YYYY-MM-DD HH:MM:SS' 格式
      const isoString = timeStr.replace(' ', 'T')
      date = new Date(isoString)
    }
    else {
      // 尝试直接解析
      date = new Date(timeStr)
    }

    // 检查日期是否有效
    if (Number.isNaN(date.getTime())) {
      console.error('Invalid date format in formatTime:', timeStr)
      return timeStr // 返回原始字符串
    }

    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  catch (error) {
    console.error('Error formatting time:', error, timeStr)
    return timeStr // 返回原始字符串
  }
}

// 检查取车截止时间是否已过期
function isPickupExpired(pickupDeadline: string) {
  if (!pickupDeadline)
    return false
  const now = new Date().getTime()
  const deadline = new Date(pickupDeadline).getTime()
  return deadline < now
}

// 打开导航
async function openNavigation(location: string) {
  if (!location) {
    uni.showToast({ title: '取车地点信息不完整', icon: 'none' })
    return
  }

  try {
    // 使用地图搜索API或直接调用地图应用
    const url = `https://uri.amap.com/search?query=${encodeURIComponent(location)}`

    // 先尝试使用系统地图应用
    uni.openLocation({
      name: location,
      address: location,
      latitude: 0, // 默认值，实际应该从后端获取
      longitude: 0,
      success: () => {
        console.log('导航成功')
      },
      fail: () => {
        // 如果系统地图打开失败，使用web地图
        uni.showModal({
          title: '打开地图',
          content: `是否使用高德地图导航至：${location}`,
          success: (res) => {
            if (res.confirm) {
              // #ifdef H5
              window.open(url, '_blank')
              // #endif
              // #ifdef MP-WEIXIN
              uni.navigateTo({
                url: `/pages/map/navigation?location=${encodeURIComponent(location)}`,
              })
              // #endif
            }
          },
        })
      },
    })
  }
  catch (error) {
    console.error('导航失败', error)
    uni.showToast({ title: '导航失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
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
    <view class="relative h-0 flex-1">
      <scroll-view
        scroll-y
        class="h-full"
        @scrolltolower="orderStore.loadMoreOrders"
      >
        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 初始加载状态 -->
          <view v-if="orderList.length === 0 && orderListStatus === 'loading'" class="flex flex-col items-center justify-center py-[120rpx]">
            <text class="i-material-symbols-sync mb-[24rpx] animate-spin text-[96rpx] text-purple-400" />
            <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">
              加载订单中
            </text>
            <text class="text-[24rpx] text-gray-400">
              请稍候...
            </text>
          </view>

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
            @tap="viewDetail(order.orderNumber)"
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
                <!-- 盲盒徽章 -->
                <view v-if="order.orderType === 'mystery_box'" class="rounded-[8rpx] bg-purple-100 px-[12rpx] py-[4rpx] text-[20rpx] text-purple-700 font-medium">
                  <text class="i-material-symbols-auto-awesome mr-[4rpx] text-[16rpx]" />
                  神秘盲盒
                </view>
                <!-- 超时提示 -->
                <view v-if="order.pickupDeadline && ['paid', 'picked'].includes(order.originalStatus || order.status) && isPickupExpired(order.pickupDeadline)" class="ml-[8rpx] rounded-[8rpx] bg-red-100 px-[12rpx] py-[4rpx] text-[20rpx] text-red-700 font-medium">
                  <text class="i-material-symbols-warning mr-[4rpx] text-[16rpx]" />
                  已超时
                </view>
              </view>
              <text class="text-[22rpx] text-gray-500">
                {{ order.orderNumber }}
              </text>
            </view>

            <!-- 车辆信息 -->
            <view class="mb-[24rpx] flex">
              <!-- 盲盒订单特殊显示 -->
              <view v-if="order.orderType === 'mystery_box'" class="h-[120rpx] w-[160rpx] flex-shrink-0">
                <view class="relative h-full w-full flex items-center justify-center overflow-hidden rounded-[12rpx] from-purple-100 via-purple-200 to-pink-100 bg-gradient-to-br">
                  <!-- 装饰背景 -->
                  <view class="absolute inset-0">
                    <view class="absolute left-[8rpx] top-[8rpx] h-[20rpx] w-[20rpx] rounded-full bg-purple-300 opacity-50" />
                    <view class="absolute right-[12rpx] top-[20rpx] h-[12rpx] w-[12rpx] rounded-full bg-pink-300 opacity-60" />
                    <view class="absolute bottom-[12rpx] left-[20rpx] h-[16rpx] w-[16rpx] rounded-full bg-blue-300 opacity-50" />
                    <view class="absolute bottom-[8rpx] right-[8rpx] h-[10rpx] w-[10rpx] rounded-full bg-yellow-300 opacity-60" />
                  </view>
                  <!-- 盲盒图标 -->
                  <text class="i-material-symbols-card-giftcard relative z-10 text-[48rpx] text-purple-600" />
                </view>
              </view>

              <!-- 普通车辆图片 -->
              <view v-else class="h-[120rpx] w-[160rpx] flex-shrink-0">
                <image
                  v-if="order.vehicle && order.vehicle.imageUrl"
                  :src="order.vehicle.imageUrl"
                  mode="aspectFill"
                  class="h-full w-full rounded-[12rpx]"
                />
                <view v-else class="h-full w-full flex items-center justify-center rounded-[12rpx] bg-gray-100">
                  <text class="i-material-symbols-directions-car text-[48rpx] text-gray-400" />
                </view>
              </view>

              <!-- 车辆信息 -->
              <view class="ml-[24rpx] flex flex-1 flex-col justify-center">
                <!-- 盲盒订单显示 -->
                <template v-if="order.orderType === 'mystery_box'">
                  <text class="text-[28rpx] text-black font-semibold">
                    神秘盲盒
                  </text>
                  <view class="mt-[8rpx] flex items-center text-[22rpx] text-gray-600 space-x-[16rpx]">
                    <text>{{ order.mysteryBox?.energyTypeName || '纯电动' }}</text>
                    <text>{{ order.mysteryBox?.carTypeName || 'SUV' }}</text>
                    <text class="text-purple-600 font-medium">
                      取车揭晓
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-auto-awesome mr-[4rpx] text-[20rpx] text-purple-500" />
                    <text class="text-[20rpx] text-purple-600 font-medium">
                      惊喜车型等你解锁
                    </text>
                  </view>
                </template>

                <!-- 普通订单显示 -->
                <template v-else>
                  <text class="text-[28rpx] text-black font-semibold">
                    {{ order.vehicle?.name || '暂无车辆信息' }}
                  </text>
                  <view class="mt-[8rpx] flex items-center text-[22rpx] text-gray-600 space-x-[16rpx]">
                    <text>{{ order.vehicle?.licensePlate || '沪A·****' }}</text>
                    <text>{{ order.vehicle?.seats || 5 }}座</text>
                    <text>{{ order.vehicle?.type || '轿车' }}</text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                    <text class="text-[20rpx] text-gray-600">
                      {{ order.vehicle?.rating || 4.8 }}({{ order.vehicle?.ratingCount || 128 }})
                    </text>
                  </view>
                </template>
              </view>

              <!-- 价格信息 -->
              <view class="ml-[16rpx] text-right">
                <text class="text-[32rpx] text-purple-600 font-bold">
                  ¥{{ order.amount }}
                </text>
                <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
                  {{ order.rentPeriod?.days || 1 }}天
                </text>
                <!-- 盲盒标识 -->
                <view v-if="order.orderType === 'mystery_box'" class="mt-[8rpx]">
                  <text class="rounded-[8rpx] bg-purple-50 px-[8rpx] py-[4rpx] text-[20rpx] text-purple-500">
                    盲盒
                  </text>
                </view>
              </view>
            </view>

            <!-- 订单详情 -->
            <view class="mb-[24rpx] rounded-[16rpx] bg-gray-50 p-[24rpx]">
              <view class="mb-[16rpx] flex items-center">
                <text class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-purple-600" />
                <text class="text-[26rpx] text-black font-medium">
                  用车时间
                </text>
              </view>
              <text class="mb-[16rpx] block text-[24rpx] text-gray-700">
                {{ order.rentPeriod?.startTime }} - {{ order.rentPeriod?.endTime }}
              </text>

              <view class="flex items-center justify-between">
                <view class="flex items-center">
                  <text class="i-material-symbols-location-on mr-[12rpx] text-[24rpx] text-purple-600" />
                  <text class="text-[26rpx] text-black font-medium">
                    取车地点
                  </text>
                </view>
                <view class="rounded-[12rpx] bg-purple-100 px-[16rpx] py-[8rpx] active:scale-95" @tap="openNavigation(order.location)">
                  <text class="text-[22rpx] text-purple-600 font-medium">
                    导航
                  </text>
                </view>
              </view>
              <text class="mt-[8rpx] block text-[24rpx] text-gray-700">
                {{ order.location }}
              </text>
            </view>

            <!-- 超时警告 -->
            <view v-if="order.pickupDeadline && ['paid', 'picked'].includes(order.originalStatus || order.status) && isPickupExpired(order.pickupDeadline)" class="mb-[24rpx] rounded-[16rpx] bg-red-50 p-[24rpx]">
              <view class="flex items-center">
                <text class="i-material-symbols-warning mr-[12rpx] text-[24rpx] text-red-600" />
                <text class="text-[24rpx] text-red-800 font-medium">
                  {{ (order.originalStatus || order.status) === 'paid' ? '取车时间已超时，请尽快联系客服' : '订单已超时，请尽快还车' }}
                </text>
              </view>
            </view>

            <!-- 取车码区域 -->
            <view v-if="['paid', 'picked'].includes(order.originalStatus || order.status) && order.pickupCode" class="mb-[24rpx] rounded-[16rpx] bg-purple-50 p-[20rpx]">
              <view class="flex items-center justify-between">
                <view class="flex-1">
                  <view class="mb-[8rpx] flex items-center">
                    <text class="i-material-symbols-qr-code-scanner mr-[8rpx] text-[20rpx] text-purple-600" />
                    <text class="text-[24rpx] text-purple-800 font-medium">
                      取车码
                    </text>
                    <text v-if="(order.originalStatus || order.status) === 'picked'" class="ml-[8rpx] rounded-[6rpx] bg-green-100 px-[8rpx] py-[2rpx] text-[18rpx] text-green-600">
                      已使用
                    </text>
                  </view>
                  <text class="text-[40rpx] text-purple-600 font-bold tracking-wider">
                    {{ order.pickupCode }}
                  </text>
                </view>
                <view v-if="order.pickupDeadline" class="text-right">
                  <text class="mb-[4rpx] block text-[20rpx] text-gray-500">
                    {{ (order.originalStatus || order.status) === 'paid' ? '取车截止' : '截止时间' }}
                  </text>
                  <text class="text-[22rpx] font-medium" :class="isPickupExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-700'">
                    {{ formatTime(order.pickupDeadline) }}
                  </text>
                  <text v-if="isPickupExpired(order.pickupDeadline)" class="mt-[2rpx] block text-[16rpx] text-red-500">
                    已超时
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

          <!-- 没有更多数据 -->
          <view v-if="orderListStatus === 'nomore' && orderList.length > 0" class="flex flex-col items-center justify-center py-[40rpx]">
            <text class="i-material-symbols-done-all mb-[8rpx] text-[32rpx] text-gray-400" />
            <text class="text-[24rpx] text-gray-400">
              没有更多订单了
            </text>
          </view>
        </view>
      </scroll-view>

      <!-- 触底加载动画覆盖层 -->
      <view
        v-if="orderListStatus === 'loading' && orderList.length > 0"
        class="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out"
        :class="orderListStatus === 'loading' ? 'translate-y-0' : 'translate-y-full'"
      >
        <view class="flex items-center justify-center py-[32rpx]">
          <text class="i-material-symbols-sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
          <text class="text-[26rpx] text-gray-600 font-medium">
            加载更多订单中...
          </text>
        </view>
      </view>
    </view>

    <!-- 续租弹框 -->
    <RenewOrderDrawer
      v-model:visible="renewDrawerVisible"
      :order="currentRenewOrder"
      @confirm="handleRenewConfirm"
      @close="closeRenewDrawer"
    />
  </view>
</template>
