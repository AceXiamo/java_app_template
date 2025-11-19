<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useOrderStore } from '@/store/order'
import { useUserStore } from '@/store/user'
import { repayOrder } from '@/api/order'
import { queryPaymentStatus, requestWxPayment } from '@/api/booking'
import OrderHead from '@/components/page/order/Head.vue'
import RenewOrderDrawer from '@/components/RenewOrderDrawer.vue'
import VehicleReviewDrawer from '@/components/VehicleReviewDrawer.vue'

// 使用 order store
const orderStore = useOrderStore()
const { orderList, orderListStatus, activeTab } = toRefs(orderStore)

// 使用 user store
const userStore = useUserStore()

// 定义 tab 数据
const tabs = [
  { key: 'all', label: '全部订单' },
  { key: 'ongoing', label: '进行中' },
  { key: 'cancelled', label: '已取消' },
]

// 计算滑块样式
const sliderStyle = computed(() => {
  const activeIndex = tabs.findIndex(tab => tab.key === activeTab.value)
  if (activeIndex === -1)
    return {}

  const leftPosition = (100 / tabs.length) * (activeIndex + 0.5)
  return {
    left: `${leftPosition}%`,
    transform: 'translateX(-50%)',
  }
})

// 下拉刷新状态
const refreshing = ref(false)

// 切换订单状态tab
function switchTab(tab: 'all' | 'ongoing' | 'cancelled') {
  orderStore.switchOrderTab(tab)
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  try {
    // 静默刷新：直接调用loadOrderList而不设置loading状态
    orderStore.orderListQuery.page = 1
    await orderStore.loadOrderList(true)
  }
  finally {
    refreshing.value = false
  }
}

// 订单操作
async function contactOwner(orderId: string) {
  await orderStore.handleContactOwner(Number(orderId), '用户主动联系')
  uni.showToast({ title: '已联系车主', icon: 'success' })
}

// 续租相关状态
const renewDrawerVisible = ref(false)
const currentRenewOrder = ref<any>(null)

// 评价相关状态
const reviewDrawerVisible = ref(false)
const currentReviewOrder = ref<any>(null)

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
  // 找到对应的订单数据
  const order = orderList.value.find(o => o.id === orderId)
  if (!order) {
    uni.showToast({ title: '订单信息不存在', icon: 'none' })
    return
  }

  currentReviewOrder.value = order
  reviewDrawerVisible.value = true
}

// 处理评价提交
async function handleReviewSubmit(reviewData: any) {
  try {
    await orderStore.handleReviewOrder(
      reviewData.orderId,
      reviewData.rating,
      reviewData.content,
      reviewData.tags,
      reviewData.images,
      reviewData.isAnonymous,
    )

    // 关闭弹框
    reviewDrawerVisible.value = false
    currentReviewOrder.value = null

    uni.showToast({ title: '评价成功', icon: 'success' })

    // 重新加载订单列表以更新状态
    orderStore.reloadOrderList()
  }
  catch (error) {
    console.error('评价失败:', error)
    uni.showToast({ title: '评价失败，请重试', icon: 'none' })
  }
}

// 关闭评价弹框
function closeReviewDrawer() {
  reviewDrawerVisible.value = false
  currentReviewOrder.value = null
}

async function reOrder(orderId: string) {
  // 找到对应的订单
  const order = orderList.value.find(o => o.id === orderId)

  if (order && order.orderType === 'mystery_box') {
    uni.navigateTo({ url: `/pages/mystery-box/index` })
  }
  else {
    uni.navigateTo({ url: `/pages/vehicle/index` })
  }
}

function viewDetail(orderId: string) {
  // 找到对应的订单
  const order = orderList.value.find(o => o.id === orderId)

  // 如果是盲盒订单，添加 type 参数
  if (order && order.orderType === 'mystery_box') {
    uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}&type=mystery_box` })
  }
  else {
    uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}` })
  }
}

// 取消订单
async function cancelOrder(orderId: string) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderStore.handleCancelOrder(orderId, '用户主动取消', '不想要了')
          uni.showToast({ title: '订单已取消', icon: 'success' })
        }
        catch (error: any) {
          console.error('取消订单失败:', error)
          uni.showToast({ title: '取消失败，请重试', icon: 'none' })
        }
      }
    },
  })
}

// 继续支付
async function continuePayment(orderId: string) {
  const order = orderList.value.find(o => o.id === orderId)
  if (!order) {
    uni.showToast({ title: '订单信息不存在', icon: 'none' })
    return
  }

  try {
    uni.showToast({
      title: '获取支付参数...',
      icon: 'loading',
    })

    // 1. 先查询支付状态，如果已支付则直接刷新
    const statusResponse = await queryPaymentStatus(order.orderNumber)
    if (statusResponse.code === 200 && statusResponse.data?.tradeState === 'SUCCESS') {
      uni.showToast({ title: '订单已支付', icon: 'success' })
      // 重新加载订单列表
      orderStore.reloadOrderList()
      return
    }

    // 2. 获取用户openId
    const openId = userStore.getUserOpenId()

    // 3. 调用继续支付API
    const repayResponse = await repayOrder(Number(order.id), openId, 'wx')

    if (repayResponse.code === 200 && repayResponse.data) {
      // 4. 调用微信支付
      await requestWxPayment(repayResponse.data)

      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
      // 重新加载订单列表
      orderStore.reloadOrderList()
    }
    else {
      throw new Error(repayResponse.message || '获取支付参数失败')
    }
  }
  catch (error: any) {
    console.error('继续支付失败:', error)
    uni.showToast({
      title: '支付失败，请重试',
      icon: 'none',
    })
  }
}

// 处理订单操作
function handleOrderAction(actionType: string, orderId: string, orderNumber?: string) {
  switch (actionType) {
    case 'cancel':
      cancelOrder(orderNumber!)
      break
    case 'continuePay':
      continuePayment(orderId)
      break
    case 'contact':
      contactOwner(orderId)
      break
    case 'renew':
      renewOrder(orderId)
      break
    case 'review':
      rateOrder(orderId)
      break
    case 'viewReview':
      // 已完成评价，显示提示
      uni.showToast({ title: '已完成评价', icon: 'success' })
      break
    case 'rebook':
      reOrder(orderId)
      break
    case 'detail':
      viewDetail(orderId)
      break
    default:
      // uni.showToast({ title: '操作暂未实现', icon: 'none' })
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

// 检查还车是否超时 (基于实际取车时间 + 租用天数)
function isReturnExpired(order: any) {
  if (!order.actualStartTime || !order.rentalDays) {
    return false
  }

  try {
    const actualStartTime = new Date(order.actualStartTime).getTime()
    const rentalDays = Number.parseInt(order.rentalDays)
    const returnDeadline = actualStartTime + (rentalDays * 24 * 60 * 60 * 1000) // 租用天数转毫秒
    const now = new Date().getTime()

    return now > returnDeadline
  }
  catch (error) {
    console.error('计算还车超时失败:', error)
    return false
  }
}

// 计算还车截止时间
function getReturnDeadline(order: any) {
  if (!order.actualStartTime || !order.rentalDays) {
    return null
  }

  try {
    const actualStartTime = new Date(order.actualStartTime)
    const rentalDays = Number.parseInt(order.rentalDays)
    const returnDeadline = new Date(actualStartTime.getTime() + (rentalDays * 24 * 60 * 60 * 1000))

    return returnDeadline.toISOString()
  }
  catch (error) {
    console.error('计算还车截止时间失败:', error)
    return null
  }
}

// 判断盲盒是否已揭晓（用户完成取车）
function isMysteryBoxRevealed(order: any) {
  if (order.orderType !== 'mystery_box')
    return false

  // 只有在 picked、returned、completed 状态下才认为盲盒已揭晓
  return ['picked', 'returned', 'completed'].includes(order.originalStatus || order.status)
}

// 打开导航
async function openNavigation(order: any) {
  const { location, vehicleLatitude, vehicleLongitude } = order

  if (!location) {
    uni.showToast({ title: '取车地点信息不完整', icon: 'none' })
    return
  }

  try {
    // 优先使用精确坐标
    if (vehicleLatitude && vehicleLongitude) {
      console.log('使用精确坐标导航:', vehicleLatitude, vehicleLongitude)
      uni.openLocation({
        name: location,
        address: location,
        latitude: Number(vehicleLatitude),
        longitude: Number(vehicleLongitude),
        success: () => {
          console.log('精确坐标导航成功')
        },
        fail: () => {
          console.error('精确坐标导航失败，降级到地址搜索')
          fallbackToAddressSearch(location)
        },
      })
    }
    else {
      console.log('无精确坐标，使用地址搜索导航:', location)
      fallbackToAddressSearch(location)
    }
  }
  catch (error) {
    console.error('导航失败', error)
    uni.showToast({ title: '导航失败', icon: 'none' })
  }
}

// 降级到地址搜索导航
function fallbackToAddressSearch(location: string) {
  const url = `https://uri.amap.com/search?query=${encodeURIComponent(location)}`

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
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航 -->
    <PageOrderHead />

    <!-- 订单状态筛选 -->
    <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[40rpx] py-[32rpx]">
      <view class="relative flex rounded-[10rpx] bg-gray-50 p-[8rpx]">
        <!-- Tabs -->
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 cursor-pointer rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-colors duration-300"
          :class="activeTab === tab.key ? 'text-purple-600' : 'text-gray-400'"
          @tap="switchTab(tab.key as 'all' | 'ongoing' | 'cancelled')"
        >
          {{ tab.label }}
        </view>

        <!-- Moving Slider -->
        <view
          class="absolute bottom-[8rpx] h-[6rpx] w-[40rpx] rounded-full bg-purple-600 transition-all duration-300 ease-out"
          :style="sliderStyle"
        />
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="relative h-0 flex-1">
      <scroll-view
        scroll-y
        class="h-full"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="orderStore.loadMoreOrders"
      >
        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 初始加载状态 -->
          <view v-if="orderList.length === 0 && orderListStatus === 'loading'" class="flex flex-col items-center justify-center py-[120rpx]">
            <text class="i-material-symbols-sync mb-[24rpx] animate-spin text-[32rpx] text-purple-400" />
            <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">
              加载订单中
            </text>
            <text class="text-[24rpx] text-gray-400">
              请稍候...
            </text>
          </view>

          <!-- 空状态 -->
          <view v-if="orderList.length === 0 && orderListStatus !== 'loading'" class="flex flex-col items-center justify-center py-[120rpx]">
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/empty_order.png"
              class="mb-[32rpx] h-[180rpx] w-[180rpx]"
              mode="aspectFit"
              alt="暂无订单"
            />
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
            class="mb-[24rpx] overflow-hidden rounded-[20rpx] bg-white p-[32rpx] shadow-sm"
            @tap="viewDetail(order.orderNumber)"
          >
            <!-- 订单状态和订单号 -->
            <view class="mb-[20rpx] flex items-center justify-between">
              <view class="flex items-center">
                <view
                  class="mr-[10rpx] flex items-center rounded-full px-[16rpx] py-[4rpx]"
                  :class="{
                    'bg-green-50': order.status === 'ongoing',
                    'bg-gray-50': order.status === 'completed',
                    'bg-red-50': order.status === 'cancelled',
                    'bg-orange-50': order.status === 'pending',
                  }"
                >
                  <text v-if="order.status === 'ongoing'" class="i-material-symbols-schedule mr-[6rpx] text-[20rpx] text-green-500" />
                  <text v-if="order.status === 'completed'" class="i-material-symbols-check-circle mr-[6rpx] text-[20rpx] text-gray-400" />
                  <text v-if="order.status === 'cancelled'" class="i-material-symbols-cancel mr-[6rpx] text-[20rpx] text-red-400" />
                  <text v-if="order.status === 'pending'" class="i-material-symbols-hourglass-empty mr-[6rpx] text-[20rpx] text-orange-400" />
                  <text
                    class="text-[22rpx] font-medium" :class="{
                      'text-green-600': order.status === 'ongoing',
                      'text-gray-600': order.status === 'completed',
                      'text-red-600': order.status === 'cancelled',
                      'text-orange-600': order.status === 'pending',
                    }"
                  >
                    {{ order.statusText }}
                  </text>
                </view>
                <!-- 盲盒徽章 -->
                <view v-if="order.orderType === 'mystery_box'" class="ml-[8rpx] flex items-center rounded-full bg-purple-100 px-[14rpx] py-[4rpx] text-[20rpx] text-purple-700 font-medium">
                  <text class="i-material-symbols-auto-awesome mr-[4rpx] text-[16rpx]" />
                  神秘盲盒
                </view>
                <!-- 取车超时提示 (仅paid状态) -->
                <view v-if="order.pickupDeadline && (order.originalStatus || order.status) === 'paid' && isPickupExpired(order.pickupDeadline)" class="ml-[8rpx] flex items-center rounded-full bg-red-100 px-[14rpx] py-[4rpx] text-[20rpx] text-red-700 font-medium">
                  <text class="i-material-symbols-warning mr-[4rpx] text-[16rpx]" />
                  取车超时
                </view>
                <!-- 还车超时提示 (仅picked状态) -->
                <view v-if="(order.originalStatus || order.status) === 'picked' && isReturnExpired(order)" class="ml-[8rpx] flex items-center rounded-full bg-orange-100 px-[14rpx] py-[4rpx] text-[20rpx] text-orange-700 font-medium">
                  <text class="i-material-symbols-warning mr-[4rpx] text-[16rpx]" />
                  还车超时
                </view>
              </view>
              <text class="text-[22rpx] text-gray-400">
                {{ order.orderNumber }}
              </text>
            </view>
            <!-- 车辆信息 -->
            <view class="mb-[20rpx] flex">
              <!-- 盲盒订单未揭晓显示 -->
              <view v-if="order.orderType === 'mystery_box' && !isMysteryBoxRevealed(order)" class="h-[120rpx] w-[160rpx] flex-shrink-0">
                <view class="relative h-full w-full flex items-center justify-center overflow-hidden rounded-[12rpx] from-purple-50 to-purple-100 bg-gradient-to-br">
                  <image
                    src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/mystery-box.png"
                    class="h-[90rpx] w-[90rpx]"
                    mode="aspectFit"
                    alt="神秘盲盒"
                  />
                </view>
              </view>
              <!-- 盲盒订单已揭晓或普通车辆图片 -->
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
              <view class="ml-[24rpx] min-w-0 flex flex-1 flex-col justify-center">
                <!-- 盲盒订单未揭晓显示 -->
                <template v-if="order.orderType === 'mystery_box' && !isMysteryBoxRevealed(order)">
                  <text class="truncate text-[28rpx] text-black font-bold">
                    神秘盲盒
                  </text>
                  <view class="mt-[8rpx] flex flex-wrap items-center gap-x-[16rpx] gap-y-[4rpx] text-[22rpx] text-gray-600">
                    <text class="truncate">
                      {{ order.mysteryBox?.energyTypeName || '纯电动' }}
                    </text>
                    <text class="truncate">
                      {{ order.mysteryBox?.carTypeName || 'SUV' }}
                    </text>
                    <text class="truncate text-purple-600 font-medium">
                      取车揭晓
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-auto-awesome mr-[4rpx] text-[20rpx] text-purple-500" />
                    <text class="truncate text-[20rpx] text-purple-600 font-medium">
                      惊喜车型等你解锁
                    </text>
                  </view>
                </template>
                <!-- 盲盒订单已揭晓显示 -->
                <template v-else-if="order.orderType === 'mystery_box' && isMysteryBoxRevealed(order)">
                  <view class="flex items-center">
                    <text class="truncate text-[28rpx] text-black font-bold">
                      🎉 {{ order.vehicle?.name || '暂无车辆信息' }}
                    </text>
                    <text class="ml-[8rpx] rounded-full bg-green-100 px-[8rpx] py-[2rpx] text-[18rpx] text-green-600 font-medium">
                      已揭晓
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex flex-wrap items-center gap-x-[16rpx] gap-y-[4rpx] text-[22rpx] text-gray-600">
                    <text class="truncate">
                      {{ order.vehicle?.licensePlate || '沪A·****' }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle?.seats || 5 }}座
                    </text>
                    <text class="truncate">
                      {{ order.vehicle?.type || '轿车' }}
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                    <text class="truncate text-[20rpx] text-gray-600">
                      {{ order.vehicle?.rating || 4.8 }}({{ order.vehicle?.ratingCount || 128 }})
                    </text>
                  </view>
                </template>
                <!-- 普通订单显示 -->
                <template v-else>
                  <text class="truncate text-[28rpx] text-black font-bold">
                    {{ order.vehicle?.name || '暂无车辆信息' }}
                  </text>
                  <view class="mt-[8rpx] flex flex-wrap items-center gap-x-[16rpx] gap-y-[4rpx] text-[22rpx] text-gray-600">
                    <text class="truncate">
                      {{ order.vehicle?.licensePlate || '沪A·****' }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle?.seats || 5 }}座
                    </text>
                    <text class="truncate">
                      {{ order.vehicle?.type || '轿车' }}
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                    <text class="truncate text-[20rpx] text-gray-600">
                      {{ order.vehicle?.rating || 4.8 }}({{ order.vehicle?.ratingCount || 128 }})
                    </text>
                  </view>
                </template>
              </view>
              <!-- 价格信息 -->
              <view class="ml-[16rpx] min-w-[80rpx] flex flex-col items-end justify-between text-right">
                <text class="text-[32rpx] text-purple-600 font-bold">
                  ¥{{ order.amount }}
                </text>
                <text class="mt-[4rpx] block text-[22rpx] text-gray-400">
                  {{ order.rentPeriod?.days || 1 }}天
                </text>
                <!-- 盲盒标识 -->
                <view v-if="order.orderType === 'mystery_box'" class="mt-[8rpx]">
                  <text class="rounded-full bg-purple-50 px-[10rpx] py-[2rpx] text-[18rpx] text-purple-500">
                    盲盒
                  </text>
                </view>
              </view>
            </view>
            <!-- 用车时间地点区 -->
            <view class="mb-[20rpx] rounded-[14rpx] bg-gray-50 p-[20rpx]">
              <view class="mb-[10rpx] flex items-center">
                <text class="i-material-symbols-schedule mr-[8rpx] text-[22rpx] text-purple-600" />
                <text class="text-[24rpx] text-black font-medium">
                  用车时间
                </text>
              </view>
              <text class="mb-[10rpx] block text-[22rpx] text-gray-700">
                {{ order.rentPeriod?.startTime }} - {{ order.rentPeriod?.endTime }}
              </text>
              <view class="flex items-center justify-between">
                <view class="flex items-center">
                  <text class="i-material-symbols-location-on mr-[8rpx] text-[22rpx] text-purple-600" />
                  <text class="text-[24rpx] text-black font-medium">
                    取车地点
                  </text>
                </view>
                <view class="flex cursor-pointer items-center rounded-full bg-purple-100 px-[16rpx] py-[8rpx] transition-colors" @click.stop="openNavigation(order)">
                  <text class="i-material-symbols-near-me mr-[8rpx] text-[22rpx] text-purple-600" />
                  <text class="text-[22rpx] text-purple-600 font-medium">
                    导航
                  </text>
                </view>
              </view>
              <text class="mt-[6rpx] block truncate text-[22rpx] text-gray-700">
                {{ order.location }}
              </text>
            </view>
            <!-- 取车超时警告 (仅paid状态) -->
            <view v-if="order.pickupDeadline && (order.originalStatus || order.status) === 'paid' && isPickupExpired(order.pickupDeadline)" class="mb-[24rpx] rounded-[16rpx] bg-red-50 p-[24rpx]">
              <view class="flex items-center">
                <image
                  src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/deadline.png"
                  class="mr-[16rpx] h-[40rpx] w-[40rpx] flex-shrink-0"
                  mode="aspectFit"
                  alt="取车超时警告"
                />
                <text class="text-[24rpx] text-red-800 font-medium">
                  取车时间已超时，请尽快联系客服或进行取车
                </text>
              </view>
            </view>

            <!-- 还车超时警告 (仅picked状态) -->
            <view v-if="(order.originalStatus || order.status) === 'picked' && isReturnExpired(order)" class="mb-[24rpx] rounded-[16rpx] bg-orange-50 p-[24rpx]">
              <view class="flex items-center">
                <image
                  src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/deadline.png"
                  class="mr-[16rpx] h-[40rpx] w-[40rpx] flex-shrink-0"
                  mode="aspectFit"
                  alt="还车超时警告"
                />
                <text class="text-[24rpx] text-orange-800 font-medium">
                  还车时间已超时，请尽快归还车辆
                </text>
              </view>
            </view>
            <!-- 取车码/还车码区域 -->
            <view v-if="['paid', 'picked'].includes(order.originalStatus || order.status)" class="mb-[20rpx] space-y-[12rpx]">
              <!-- 取车码显示 (仅paid状态) -->
              <view v-if="order.pickupCode && (order.originalStatus || order.status) === 'paid'" class="flex items-center rounded-[14rpx] bg-purple-50 p-[20rpx]">
                <text class="i-material-symbols-qr-code-scanner mr-[16rpx] text-[40rpx] text-purple-600" />
                <view class="flex-1">
                  <view class="mb-[4rpx] flex items-center">
                    <text class="text-[24rpx] text-purple-800 font-medium">
                      取车码
                    </text>
                  </view>
                  <text class="text-[36rpx] text-purple-600 font-bold tracking-wider">
                    {{ order.pickupCode }}
                  </text>
                </view>

                <!-- paid状态：显示取车截止时间 -->
                <view v-if="order.pickupDeadline" class="ml-[16rpx] flex flex-col items-end text-right">
                  <view class="mb-[2rpx] flex items-center">
                    <text class="i-material-symbols-schedule mr-[4rpx] text-[18rpx]" :class="isPickupExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-500'" />
                    <text class="text-[18rpx]" :class="isPickupExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-500'">
                      取车截止
                    </text>
                  </view>
                  <text class="text-[20rpx] font-medium" :class="isPickupExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-700'">
                    {{ formatTime(order.pickupDeadline) }}
                  </text>
                  <text v-if="isPickupExpired(order.pickupDeadline)" class="mt-[2rpx] block text-[16rpx] text-red-500">
                    已超时
                  </text>
                </view>
              </view>

              <!-- 还车码显示 (仅picked状态) -->
              <view v-if="(order.originalStatus || order.status) === 'picked' && order.returnCode" class="flex items-center rounded-[14rpx] bg-green-50 p-[20rpx]">
                <text class="i-material-symbols-qr-code-scanner mr-[16rpx] text-[40rpx] text-green-600" />
                <view class="flex-1">
                  <view class="mb-[4rpx] flex items-center">
                    <text class="text-[24rpx] text-green-800 font-medium">
                      还车码
                    </text>
                    <text class="ml-[8rpx] rounded-full bg-orange-100 px-[8rpx] py-[2rpx] text-[18rpx] text-orange-600">
                      使用中
                    </text>
                  </view>
                  <text class="text-[36rpx] text-green-600 font-bold tracking-wider">
                    {{ order.returnCode || '' }}
                  </text>
                </view>

                <!-- picked状态：显示还车截止时间 -->
                <view v-if="getReturnDeadline(order)" class="ml-[16rpx] flex flex-col items-end text-right">
                  <view class="mb-[2rpx] flex items-center">
                    <text class="i-material-symbols-schedule mr-[4rpx] text-[18rpx]" :class="isReturnExpired(order) ? 'text-orange-500' : 'text-green-500'" />
                    <text class="text-[18rpx]" :class="isReturnExpired(order) ? 'text-orange-500' : 'text-green-500'">
                      还车截止
                    </text>
                  </view>
                  <text class="text-[20rpx] font-medium" :class="isReturnExpired(order) ? 'text-orange-500' : 'text-green-700'">
                    {{ formatTime(getReturnDeadline(order) || '') }}
                  </text>
                  <text v-if="isReturnExpired(order)" class="mt-[2rpx] block text-[16rpx] text-orange-500">
                    已超时
                  </text>
                </view>
              </view>
            </view>
            <!-- 操作按钮 -->
            <view v-if="order.actions && order.actions.length > 0" class="mt-[8rpx] flex space-x-[16rpx]">
              <view
                v-for="action in order.actions"
                :key="action.type"
                class="flex-1 rounded-full py-[20rpx] text-center text-[26rpx] font-medium transition-colors duration-200"
                :class="{
                  'bg-gray-100 text-gray-600': action.style === 'secondary',
                  'bg-purple-600 text-white': action.style === 'primary',
                  'bg-purple-50 text-purple-600 border border-purple-200': action.style === 'outline',
                }"
                @tap.stop="handleOrderAction(action.type, order.id, order.orderNumber)"
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
        class="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out"
        :style="{ transform: (orderListStatus === 'loading' && orderList.length > 0) ? 'translateY(0)' : 'translateY(100%)' }"
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

    <!-- 评价弹框 -->
    <VehicleReviewDrawer
      v-model:visible="reviewDrawerVisible"
      :order="currentReviewOrder"
      @submit="handleReviewSubmit"
      @update:visible="closeReviewDrawer"
    />
  </view>
</template>
