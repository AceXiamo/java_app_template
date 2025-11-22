<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { type OrderDetail, cancelOrder, getOrderDetail, repayOrder } from '@/api/order'
import { queryPaymentStatus, requestWxPayment } from '@/api/booking'
import { useUserStore } from '@/store/user'

// 页面参数
interface OrderDetailParams {
  orderId: string
  type?: string // 添加type参数来区分盲盒订单
}

const pageParams = ref<OrderDetailParams>({
  orderId: '',
  type: '',
})

// 订单详情数据
const orderDetail = ref<OrderDetail>({
  id: '',
  orderNumber: '',
  status: 'pending',
  statusText: '待支付',
  amount: 0,
  finalAmount: 0,
  discountAmount: 0,
  deliveryFee: 0,
  vehicle: {
    id: 0,
    name: '',
    brand: '',
    model: '',
    licensePlate: '',
    imageUrl: '',
    seats: 5,
    energyType: '',
    carType: '',
    rating: 4.8,
    ratingCount: 128,
  },
  rentPeriod: {
    startTime: '',
    endTime: '',
    days: 0,
  },
  location: '',
  pickupMethod: 'self',
  deliveryAddress: '',
  pickupCode: '',
  remainingTime: '',
  paymentInfo: {
    payTime: '',
    payMethod: '',
    transactionId: '',
  },
  createTime: '',
  updateTime: '',
  remark: '',
})
const userStore = useUserStore()
const loading = ref(false)

// 倒计时相关状态
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: false,
  totalSeconds: 0,
})
const countdownTimer = ref<NodeJS.Timeout | null>(null)

// 判断是否为盲盒订单
const isMysteryBoxOrder = computed(() => {
  return pageParams.value.type === 'mystery_box' || orderDetail.value.orderType === 'mystery_box'
})

// 判断盲盒是否已揭晓（根据取车码核验状态）
const isMysteryBoxRevealed = computed(() => {
  if (!isMysteryBoxOrder.value)
    return false
  // 如果取车码已核验或订单状态为 picked/returned/completed，则认为已揭晓
  return orderDetail.value.mysteryBox?.pickupCodeVerified === true
    || ['picked', 'returned', 'completed'].includes(orderDetail.value.status)
})

// 页面加载
onLoad((options: any) => {
  if (options.orderId) {
    pageParams.value.orderId = options.orderId
    pageParams.value.type = options.type || '' // 获取订单类型
    loadOrderDetail()
  }
})

// 加载订单详情
async function loadOrderDetail() {
  try {
    loading.value = true

    const orderId = pageParams.value.orderId
    if (!orderId) {
      throw new Error('无效的订单ID')
    }

    console.log(orderId)
    console.log(pageParams.value)
    const response = await getOrderDetail(orderId)

    if (response.code === 200 && response.data) {
      orderDetail.value = response.data

      // 如果是已支付状态且有取车截止时间，启动倒计时
      if (['paid', 'picked'].includes(orderDetail.value.status) && orderDetail.value.pickupDeadline) {
        startCountdown()
      }
    }
    else {
      throw new Error(response.message || '获取订单详情失败')
    }
  }
  catch (error) {
    console.error('加载订单详情失败:', error)
    toastRef.value?.error('加载失败')
  }
  finally {
    loading.value = false
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 联系客服
function contactService() {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-123-4567\n工作时间：9:00-21:00',
    showCancel: false,
    confirmText: '知道了',
  })
}

// 签署合同
function signContract() {
  // 检查合同是否已签署
  if (orderDetail.value.contractSigned) {
    uni.showToast({
      title: '合同已签署',
      icon: 'none',
    })
    return
  }

  if (!orderDetail.value.id) {
    uni.showToast({
      title: '订单信息错误',
      icon: 'none',
    })
    return
  }

  uni.navigateTo({
    url: `/pages/contract/sign?orderId=${orderDetail.value.id}&orderNo=${orderDetail.value.orderNumber}`,
  })
}

// 取消订单
function cancelOrderAction() {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const orderId = pageParams.value.orderId
          const response = await cancelOrder(orderId, '用户主动取消', '不想要了')

          if (response.code === 200) {
            toastRef.value?.success('订单已取消')
            // 重新加载订单详情
            await loadOrderDetail()
          }
          else {
            throw new Error(response.message || '取消订单失败')
          }
        }
        catch (error) {
          console.error('取消订单失败:', error)
          toastRef.value?.error('取消失败，请重试')
        }
      }
    },
  })
}

// 继续支付
async function continuePay() {
  try {
    uni.showToast({
      title: '获取支付参数...',
      icon: 'loading',
    })

    // 1. 先查询支付状态，如果已支付则直接刷新
    const statusResponse = await queryPaymentStatus(orderDetail.value.orderNumber)
    if (statusResponse.code === 200 && statusResponse.data?.tradeState === 'SUCCESS') {
      toastRef.value?.success('订单已支付')
      return loadOrderDetail()
    }

    // 2. 获取用户openId（实际项目中应该从用户信息中获取）
    const openId = userStore.getUserOpenId()

    // 3. 调用继续支付API
    const repayResponse = await repayOrder(Number(orderDetail.value.id), openId, 'wx')

    if (repayResponse.code === 200 && repayResponse.data) {
      // 4. 调用微信支付
      await requestWxPayment(repayResponse.data)

      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
      // 重新加载订单详情
      await loadOrderDetail()
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

// 格式化时间显示
function formatTime(timeStr: string) {
  if (!timeStr)
    return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 检查还车是否超时 (基于实际取车时间 + 租用天数)
function isReturnExpired(order: any) {
  if (!order.actualStartTime || !order.rentPeriod?.days) {
    return false
  }

  try {
    const actualStartTime = new Date(order.actualStartTime).getTime()
    const rentalDays = Number.parseInt(order.rentPeriod.days)
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
  if (!order.actualStartTime || !order.rentPeriod?.days) {
    return null
  }

  try {
    const actualStartTime = new Date(order.actualStartTime)
    const rentalDays = Number.parseInt(order.rentPeriod.days)
    const returnDeadline = new Date(actualStartTime.getTime() + (rentalDays * 24 * 60 * 60 * 1000))

    return returnDeadline.toISOString()
  }
  catch (error) {
    console.error('计算还车截止时间失败:', error)
    return null
  }
}

// 计算倒计时
function calculateCountdown() {
  if (!orderDetail.value.pickupDeadline) {
    countdown.value.isExpired = true
    return
  }

  const now = new Date().getTime()
  const deadline = new Date(orderDetail.value.pickupDeadline).getTime()
  const diff = deadline - now

  if (diff <= 0) {
    countdown.value = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    }
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  countdown.value = {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds: Math.floor(diff / 1000),
  }
}

// 启动倒计时
function startCountdown() {
  // 清除之前的定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }

  // 立即计算一次
  calculateCountdown()

  // 如果已经过期，不启动定时器
  if (countdown.value.isExpired) {
    return
  }

  // 每秒更新一次
  countdownTimer.value = setInterval(() => {
    calculateCountdown()

    // 如果倒计时结束，清除定时器
    if (countdown.value.isExpired) {
      clearInterval(countdownTimer.value!)
      countdownTimer.value = null
    }
  }, 1000)
}

// 停止倒计时
function stopCountdown() {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 格式化倒计时显示
function formatCountdown() {
  if (countdown.value.isExpired) {
    return '已超时'
  }

  const { days, hours, minutes, seconds } = countdown.value

  if (days > 0) {
    return `${days}天${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 获取倒计时颜色
function getCountdownColor() {
  if (countdown.value.isExpired) {
    return 'text-red-500'
  }

  const totalHours = countdown.value.totalSeconds / 3600

  if (totalHours <= 1) {
    return 'text-red-500' // 1小时内，红色
  }
  else if (totalHours <= 6) {
    return 'text-orange-500' // 6小时内，橙色
  }
  else {
    return 'text-green-500' // 超过6小时，绿色
  }
}

// 获取状态颜色
function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'bg-orange-50 text-orange-600',
    paid: 'bg-blue-50 text-blue-600',
    picked: 'bg-green-50 text-green-600',
    returned: 'bg-purple-50 text-purple-600',
    cancelled: 'bg-red-50 text-red-600',
    completed: 'bg-gray-50 text-gray-600',
  }
  return colorMap[status] || 'bg-gray-50 text-gray-600'
}

// 获取状态文本
function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    picked: '已取车',
    returned: '已还车',
    cancelled: '已取消',
    completed: '已完成',
  }
  return statusMap[status] || status
}

// 页面销毁时清理定时器
onUnmounted(() => {
  stopCountdown()
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
          <text class="i-material-symbols:arrow-back-ios text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          订单详情
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view v-if="loading" class="flex items-center justify-center py-[120rpx]">
        <text class="i-material-symbols-sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
        <text class="text-[26rpx] text-gray-600">
          加载中...
        </text>
      </view>

      <view v-else class="p-[24rpx] space-y-[24rpx]">
        <!-- 订单状态 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="flex items-center justify-between">
            <view
              class="rounded-[8rpx] px-[12rpx] py-[4rpx] text-[22rpx] font-medium"
              :class="getStatusColor(orderDetail.status)"
            >
              {{ getStatusText(orderDetail.status) }}
            </view>
            <text class="text-[22rpx] text-gray-500">
              {{ orderDetail.orderNumber }}
            </text>
          </view>

          <!-- 取车码显示 -->
          <view v-if="orderDetail.pickupCode && ['paid', 'picked', 'returned', 'completed'].includes(orderDetail.status)" class="mt-[24rpx] flex items-center rounded-[16rpx] bg-purple-50 p-[24rpx]">
            <text class="i-material-symbols-qr-code-scanner mr-[16rpx] text-[40rpx] text-purple-600" />
            <view class="flex-1">
              <view class="mb-[4rpx] flex items-center">
                <text class="text-[24rpx] text-purple-800 font-medium">
                  取车码
                </text>
                <text v-if="['picked', 'returned', 'completed'].includes(orderDetail.status)" class="ml-[8rpx] rounded-full bg-green-100 px-[8rpx] py-[2rpx] text-[18rpx] text-green-600">
                  已使用
                </text>
              </view>
              <text class="text-[56rpx] text-purple-600 font-bold tracking-wider font-mono">
                {{ orderDetail.pickupCode }}
              </text>
            </view>
            <view v-if="orderDetail.pickupDeadline && orderDetail.status === 'paid'" class="ml-[16rpx] flex flex-col items-end text-right">
              <view class="mb-[2rpx] flex items-center">
                <text class="i-material-symbols-schedule mr-[4rpx] text-[18rpx]" :class="getCountdownColor()" />
                <text class="text-[18rpx]" :class="getCountdownColor()">
                  取车截止
                </text>
              </view>
              <text class="text-[28rpx] font-bold font-mono" :class="getCountdownColor()">
                {{ formatCountdown() }}
              </text>
              <text v-if="!countdown.isExpired" class="mt-[4rpx] block text-[18rpx] text-gray-500">
                {{ formatTime(orderDetail.pickupDeadline) }}
              </text>
              <text v-if="countdown.isExpired" class="mt-[4rpx] block text-[18rpx] text-red-500">
                已超过截止时间
              </text>
            </view>
          </view>

          <!-- 还车码显示 (picked状态) -->
          <view v-if="orderDetail.status === 'picked' && orderDetail.returnCode" class="mt-[24rpx] flex items-center rounded-[16rpx] bg-green-50 p-[24rpx]">
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
              <text class="text-[56rpx] text-green-600 font-bold tracking-wider font-mono">
                {{ orderDetail.returnCode }}
              </text>
            </view>

            <!-- picked状态：显示还车截止时间 -->
            <view v-if="getReturnDeadline(orderDetail)" class="ml-[16rpx] flex flex-col items-end text-right">
              <view class="mb-[2rpx] flex items-center">
                <text class="i-material-symbols-schedule mr-[4rpx] text-[18rpx]" :class="isReturnExpired(orderDetail) ? 'text-orange-500' : 'text-green-500'" />
                <text class="text-[18rpx]" :class="isReturnExpired(orderDetail) ? 'text-orange-500' : 'text-green-500'">
                  还车截止
                </text>
              </view>
              <text class="text-[28rpx] font-bold font-mono" :class="isReturnExpired(orderDetail) ? 'text-orange-500' : 'text-green-700'">
                {{ formatTime(getReturnDeadline(orderDetail)) }}
              </text>
              <text v-if="isReturnExpired(orderDetail)" class="mt-[4rpx] block text-[18rpx] text-orange-500">
                已超时
              </text>
            </view>
          </view>

          <!-- 合同签署提示 (未签署状态) -->
          <view v-if="['paid', 'picked'].includes(orderDetail.status) && !orderDetail.contractSigned" class="mt-[24rpx] rounded-[16rpx] bg-blue-50 p-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center">
                <text class="i-material-symbols-contract-edit mr-[8rpx] text-[24rpx] text-blue-600" />
                <text class="text-[26rpx] text-blue-800 font-medium">
                  电子合同签署
                </text>
              </view>
              <view
                class="rounded-[12rpx] bg-blue-600 px-[20rpx] py-[8rpx] flex"
                @tap="signContract"
              >
                <text class="text-[22rpx] text-white font-medium">
                  立即签署
                </text>
              </view>
            </view>
            <text class="mt-[8rpx] text-[20rpx] text-blue-700">
              为保障双方权益，请及时签署租车合同
            </text>
          </view>

          <!-- 合同已签署状态 -->
          <view v-if="['paid', 'picked', 'returned', 'completed'].includes(orderDetail.status) && orderDetail.contractSigned" class="mt-[24rpx] rounded-[16rpx] bg-green-50 p-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center">
                <text class="i-material-symbols-check-circle mr-[8rpx] text-[24rpx] text-green-600" />
                <text class="text-[26rpx] text-green-800 font-medium">
                  电子合同已签署
                </text>
              </view>
              <view class="rounded-[12rpx] bg-green-600 px-[20rpx] py-[8rpx] flex">
                <text class="text-[22rpx] text-white font-medium">
                  已完成
                </text>
              </view>
            </view>
            <view v-if="orderDetail.contractSignTime" class="mt-[8rpx] flex items-center">
              <text class="i-material-symbols-schedule mr-[4rpx] text-[18rpx] text-green-600" />
              <text class="text-[20rpx] text-green-700">
                签署时间：{{ orderDetail.contractSignTime }}
              </text>
            </view>
          </view>

          <!-- 待支付提示 -->
          <view v-if="orderDetail.status === 'pending'" class="mt-[24rpx] rounded-[16rpx] bg-orange-50 p-[24rpx]">
            <view class="flex items-center">
              <text class="i-material-symbols-schedule mr-[8rpx] text-[24rpx] text-orange-600" />
              <text class="text-[26rpx] text-orange-800 font-medium">
                请尽快完成支付，支付后即可查看取车码
              </text>
            </view>
          </view>

          <!-- 取车超时警告 (仅paid状态) -->
          <view v-if="orderDetail.status === 'paid' && countdown.isExpired" class="mt-[24rpx] rounded-[16rpx] bg-red-50 p-[24rpx]">
            <view class="flex items-center">
              <text class="i-material-symbols-warning mr-[8rpx] text-[24rpx] text-red-600" />
              <text class="text-[26rpx] text-red-800 font-medium">
                取车时间已超时，请尽快联系客服
              </text>
            </view>
          </view>

          <!-- 还车超时警告 (仅picked状态) -->
          <view v-if="orderDetail.status === 'picked' && isReturnExpired(orderDetail)" class="mt-[24rpx] rounded-[16rpx] bg-orange-50 p-[24rpx]">
            <view class="flex items-center">
              <text class="i-material-symbols-warning mr-[8rpx] text-[24rpx] text-orange-600" />
              <text class="text-[26rpx] text-orange-800 font-medium">
                还车时间已超时，请尽快归还车辆
              </text>
            </view>
          </view>
        </view>

        <!-- 车辆信息 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-directions-car mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              {{ isMysteryBoxOrder ? '神秘盲盒' : '车辆信息' }}
            </text>
          </view>

          <!-- 盲盒未揭晓状态 -->
          <view v-if="isMysteryBoxOrder && !isMysteryBoxRevealed" class="relative h-[200rpx] flex items-center justify-center">
            <!-- 模糊背景 -->
            <view class="absolute inset-0 rounded-[16rpx] from-purple-100 via-purple-200 to-pink-100 bg-gradient-to-br opacity-80">
              <!-- 装饰图案 -->
              <view class="absolute left-[20rpx] top-[20rpx] h-[40rpx] w-[40rpx] rounded-full bg-purple-300 opacity-50" />
              <view class="absolute right-[30rpx] top-[40rpx] h-[24rpx] w-[24rpx] rounded-full bg-pink-300 opacity-60" />
              <view class="absolute bottom-[30rpx] left-[40rpx] h-[32rpx] w-[32rpx] rounded-full bg-blue-300 opacity-50" />
              <view class="absolute bottom-[20rpx] right-[20rpx] h-[20rpx] w-[20rpx] rounded-full bg-yellow-300 opacity-60" />
            </view>

            <!-- 中心内容 -->
            <view class="relative z-10 text-center">
              <text class="i-material-symbols-card-giftcard mb-[16rpx] block text-[80rpx] text-purple-600" />
              <text class="mb-[8rpx] block text-[32rpx] text-purple-800 font-bold">
                惊喜盲盒
              </text>
              <text class="text-[24rpx] text-purple-600">
                {{
                  orderDetail.status === 'pending' ? '支付后可查看取车码'
                  : orderDetail.status === 'paid' ? '已支付，取车时揭晓'
                    : '取车时揭晓'
                }}
              </text>
              <!-- 显示盲盒偏好 -->
              <view v-if="orderDetail.mysteryBox" class="mt-[16rpx]">
                <text class="block text-[22rpx] text-purple-500">
                  {{ orderDetail.mysteryBox.energyTypeName }} · {{ orderDetail.mysteryBox.carTypeName }}
                </text>
              </view>
            </view>
          </view>

          <!-- 盲盒已揭晓或普通车辆信息 -->
          <view v-else class="flex">
            <!-- 车辆图片 -->
            <view class="h-[120rpx] w-[160rpx] flex-shrink-0">
              <image
                v-if="orderDetail.vehicle.imageUrl"
                :src="orderDetail.vehicle.imageUrl"
                mode="aspectFill"
                class="h-full w-full rounded-[12rpx]"
              />
              <view v-else class="h-full w-full flex items-center justify-center rounded-[12rpx] bg-gray-100">
                <text class="i-material-symbols-directions-car text-[48rpx] text-gray-400" />
              </view>
            </view>

            <!-- 车辆信息 -->
            <view class="ml-[24rpx] flex flex-1 flex-col justify-center">
              <text class="text-[28rpx] text-black font-semibold">
                {{ isMysteryBoxOrder && isMysteryBoxRevealed ? '🎊 ' : '' }}{{ orderDetail.vehicle.name }}
              </text>
              <view class="mt-[8rpx] flex items-center text-[22rpx] text-gray-600 space-x-[16rpx]">
                <text>{{ orderDetail.vehicle.licensePlate }}</text>
                <text>{{ orderDetail.vehicle.seats }}座</text>
                <text>{{ orderDetail.vehicle.carType }}</text>
              </view>
              <view class="mt-[8rpx] flex items-center">
                <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                <text class="text-[20rpx] text-gray-600">
                  {{ orderDetail.vehicle.rating }}({{ orderDetail.vehicle.ratingCount }})
                </text>
              </view>
              <!-- 盲盒揭晓提示 -->
              <view v-if="isMysteryBoxOrder && isMysteryBoxRevealed" class="mt-[8rpx]">
                <text class="rounded-[8rpx] bg-green-50 px-[8rpx] py-[4rpx] text-[20rpx] text-green-600">
                  🎉 盲盒已揭晓
                </text>
                <text v-if="orderDetail.mysteryBox?.revealMessage" class="ml-[8rpx] text-[20rpx] text-purple-600">
                  {{ orderDetail.mysteryBox.revealMessage }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 租赁信息 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              租赁信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <!-- 计划时间 -->
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                计划用车时间
              </text>
              <text class="text-[24rpx] text-black">
                {{ formatTime(orderDetail.rentPeriod.startTime) }} - {{ formatTime(orderDetail.rentPeriod.endTime) }}
              </text>
            </view>

            <!-- 实际时间 -->
            <view v-if="orderDetail.actualStartTime" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                实际开始时间
              </text>
              <text class="text-[24rpx] text-green-600">
                {{ formatTime(orderDetail.actualStartTime) }}
              </text>
            </view>
            <view v-if="orderDetail.actualEndTime" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                实际结束时间
              </text>
              <text class="text-[24rpx] text-green-600">
                {{ formatTime(orderDetail.actualEndTime) }}
              </text>
            </view>

            <!-- 取车截止时间 -->
            <view v-if="orderDetail.pickupDeadline" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                取车截止时间
              </text>
              <view class="text-right">
                <text class="text-[24rpx] text-orange-600">
                  {{ formatTime(orderDetail.pickupDeadline) }}
                </text>
                <text v-if="['paid', 'picked'].includes(orderDetail.status)" class="block text-[20rpx] font-mono" :class="getCountdownColor()">
                  {{ formatCountdown() }}
                </text>
              </view>
            </view>

            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                租赁天数
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.rentPeriod.days }}天
              </text>
            </view>

            <!-- 取车方式 -->
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                取车方式
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.pickupMethod === 'self' ? '用户自取' : '平台送车' }}
              </text>
            </view>

            <!-- 取车地点 -->
            <view class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                取车地点
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.pickupLocation || orderDetail.deliveryAddress || orderDetail.location }}
              </text>
            </view>

            <!-- 还车地点 -->
            <view v-if="orderDetail.returnLocation" class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                还车地点
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.returnLocation }}
              </text>
            </view>

            <!-- 送车距离 -->
            <view v-if="orderDetail.deliveryDistance" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                送车距离
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.deliveryDistance }}公里
              </text>
            </view>

            <!-- 还车码 -->
            <view v-if="orderDetail.returnCode && ['picked', 'returned', 'completed'].includes(orderDetail.status)" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                还车码
              </text>
              <text class="text-[24rpx] text-green-600 font-mono">
                {{ orderDetail.returnCode }}
              </text>
            </view>

            <!-- 是否可续租 -->
            <view v-if="orderDetail.orderType === 'monthly' && orderDetail.isRenewable !== undefined" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                是否可续租
              </text>
              <text class="text-[24rpx]" :class="orderDetail.isRenewable ? 'text-green-600' : 'text-red-600'">
                {{ orderDetail.isRenewable ? '是' : '否' }}
              </text>
            </view>
          </view>
        </view>

        <!-- 费用明细 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-receipt mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              费用明细
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <!-- 基础费用 -->
            <view v-if="orderDetail.dailyPrice" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                日租价格
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.dailyPrice }}
              </text>
            </view>
            <view v-if="orderDetail.monthlyPrice" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                月租价格
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.monthlyPrice }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                租金费用
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.totalAmount || orderDetail.amount }}
              </text>
            </view>

            <!-- 额外费用 -->
            <view v-if="orderDetail.deliveryFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                送车服务费
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.deliveryFee }}
              </text>
            </view>
            <view v-if="orderDetail.deliveryServicesFee && orderDetail.deliveryServicesFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                交付服务费
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.deliveryServicesFee }}
              </text>
            </view>
            <view v-if="orderDetail.latePickupFee && orderDetail.latePickupFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                延迟取车费
              </text>
              <text class="text-[24rpx] text-red-600">
                ¥{{ orderDetail.latePickupFee }}
              </text>
            </view>
            <view v-if="orderDetail.overtimeFee && orderDetail.overtimeFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                超时费用 ({{ orderDetail.overtimeHours }}小时)
              </text>
              <text class="text-[24rpx] text-red-600">
                ¥{{ orderDetail.overtimeFee }}
              </text>
            </view>
            <view v-if="orderDetail.cancelFee && orderDetail.cancelFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                取消手续费
              </text>
              <text class="text-[24rpx] text-red-600">
                ¥{{ orderDetail.cancelFee }}
              </text>
            </view>

            <!-- 优惠 -->
            <view v-if="orderDetail.discountAmount > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                优惠折扣
              </text>
              <text class="text-[24rpx] text-green-600">
                -¥{{ orderDetail.discountAmount }}
              </text>
            </view>

            <!-- 保险费用 -->
            <view v-if="orderDetail.insurance_fee && orderDetail.insurance_fee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                保险费用
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.insurance_fee }}
              </text>
            </view>

            <!-- 增值服务费 -->
            <view v-if="orderDetail.service_fee && orderDetail.service_fee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                增值服务费
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.service_fee }}
              </text>
            </view>

            <!-- 实付金额 -->
            <view class="border-t border-gray-100 pt-[16rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[26rpx] text-black font-semibold">
                  实付金额
                </text>
                <text class="text-[28rpx] text-purple-600 font-bold">
                  ¥{{ orderDetail.finalAmount }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 支付信息 (已支付订单显示) -->
        <view v-if="orderDetail.paymentInfo.payTime" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-credit-card mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              支付信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                支付时间
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.paymentInfo.payTime }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                支付方式
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.paymentInfo.payMethod }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                交易单号
              </text>
              <text class="text-[20rpx] text-gray-500">
                {{ orderDetail.paymentInfo.transactionId }}
              </text>
            </view>
          </view>
        </view>

        <!-- 保险信息 -->
        <view v-if="orderDetail.insurance?.length" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-security mr-[12rpx] text-[24rpx] text-blue-600" />
            <text class="text-[28rpx] text-black font-semibold">
              保险信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view
              v-for="(insurance, index) in orderDetail.insurance"
              :key="index"
              class="rounded-[16rpx] bg-blue-50 p-[20rpx]"
            >
              <view class="mb-[12rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-blue-800 font-medium">
                  {{ insurance.product_name }}
                </text>
                <text class="text-[24rpx] text-blue-600 font-bold">
                  ¥{{ insurance.price }}
                </text>
              </view>
              <view class="space-y-[8rpx]">
                <view class="flex items-center justify-between">
                  <text class="text-[20rpx] text-gray-600">
                    保额
                  </text>
                  <text class="text-[20rpx] text-gray-800">
                    ¥{{ insurance.coverage_amount }}
                  </text>
                </view>
                <text class="text-[18rpx] text-gray-600 leading-relaxed">
                  {{ insurance.coverage_description }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 增值服务信息 -->
        <view v-if="orderDetail.services?.length" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-build mr-[12rpx] text-[24rpx] text-green-600" />
            <text class="text-[28rpx] text-black font-semibold">
              增值服务
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view
              v-for="(service, index) in orderDetail.services"
              :key="index"
              class="rounded-[16rpx] bg-green-50 p-[20rpx]"
            >
              <view class="mb-[12rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-green-800 font-medium">
                  {{ service.service_name }}
                </text>
                <text class="text-[24rpx] text-green-600 font-bold">
                  ¥{{ service.total_amount }}
                </text>
              </view>
              <view class="space-y-[8rpx]">
                <view class="flex items-center justify-between">
                  <text class="text-[20rpx] text-gray-600">
                    单价
                  </text>
                  <text class="text-[20rpx] text-gray-800">
                    ¥{{ service.price }}
                  </text>
                </view>
                <view class="flex items-center justify-between">
                  <text class="text-[20rpx] text-gray-600">
                    数量
                  </text>
                  <text class="text-[20rpx] text-gray-800">
                    {{ service.quantity }}
                  </text>
                </view>
                <text v-if="service.description" class="text-[18rpx] text-gray-600 leading-relaxed">
                  {{ service.description }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 取消信息 -->
        <view v-if="orderDetail.status === 'cancelled' && (orderDetail.cancelReason || orderDetail.cancelTime)" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-cancel mr-[12rpx] text-[24rpx] text-red-600" />
            <text class="text-[28rpx] text-black font-semibold">
              取消信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view v-if="orderDetail.cancelReason" class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                取消原因
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.cancelReason }}
              </text>
            </view>
            <view v-if="orderDetail.cancelTime" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                取消时间
              </text>
              <text class="text-[24rpx] text-red-600">
                {{ orderDetail.cancelTime }}
              </text>
            </view>
          </view>
        </view>

        <!-- 退款信息 -->
        <view v-if="orderDetail.refundAmount && orderDetail.refundAmount > 0" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-payments mr-[12rpx] text-[24rpx] text-green-600" />
            <text class="text-[28rpx] text-black font-semibold">
              退款信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                退款金额
              </text>
              <text class="text-[24rpx] text-green-600 font-semibold">
                ¥{{ orderDetail.refundAmount }}
              </text>
            </view>
            <view v-if="orderDetail.refundStatus" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                退款状态
              </text>
              <text
                class="text-[24rpx]" :class="{
                  'text-orange-600': orderDetail.refundStatus === 'processing',
                  'text-green-600': orderDetail.refundStatus === 'success',
                  'text-red-600': orderDetail.refundStatus === 'failed',
                }"
              >
                {{
                  orderDetail.refundStatus === 'processing' ? '处理中'
                  : orderDetail.refundStatus === 'success' ? '退款成功'
                    : orderDetail.refundStatus === 'failed' ? '退款失败' : orderDetail.refundStatus
                }}
              </text>
            </view>
            <view v-if="orderDetail.refundTime" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                退款时间
              </text>
              <text class="text-[24rpx] text-green-600">
                {{ orderDetail.refundTime }}
              </text>
            </view>
            <view v-if="orderDetail.refundReason" class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                退款原因
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.refundReason }}
              </text>
            </view>
            <view v-if="orderDetail.refundNo" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                退款单号
              </text>
              <text class="text-[20rpx] text-gray-500">
                {{ orderDetail.refundNo }}
              </text>
            </view>
          </view>
        </view>

        <!-- 争议信息 -->
        <view v-if="orderDetail.disputeStatus && orderDetail.disputeStatus !== 'none'" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-report mr-[12rpx] text-[24rpx] text-orange-600" />
            <text class="text-[28rpx] text-black font-semibold">
              争议信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                争议状态
              </text>
              <text
                class="text-[24rpx]" :class="{
                  'text-orange-600': orderDetail.disputeStatus === 'pending',
                  'text-green-600': orderDetail.disputeStatus === 'resolved',
                }"
              >
                {{
                  orderDetail.disputeStatus === 'pending' ? '处理中'
                  : orderDetail.disputeStatus === 'resolved' ? '已解决' : orderDetail.disputeStatus
                }}
              </text>
            </view>
            <view v-if="orderDetail.disputeReason" class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                争议原因
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.disputeReason }}
              </text>
            </view>
          </view>
        </view>

        <!-- 订单信息 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-info mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              订单信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                订单编号
              </text>
              <text class="text-[22rpx] text-black font-mono">
                {{ orderDetail.orderNumber }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                订单类型
              </text>
              <text class="text-[24rpx] text-black">
                {{
                  orderDetail.orderType === 'daily' ? '日租订单'
                  : orderDetail.orderType === 'monthly' ? '月租订单'
                    : orderDetail.orderType === 'mystery_box' ? '盲盒订单' : '普通订单'
                }}
              </text>
            </view>
            <view v-if="orderDetail.couponId" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                使用优惠券
              </text>
              <text class="text-[24rpx] text-green-600">
                ID: {{ orderDetail.couponId }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                创建时间
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.createTime }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                更新时间
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.updateTime }}
              </text>
            </view>
            <view v-if="orderDetail.remark" class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                备注信息
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.remark }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view v-if="!loading" class="flex-shrink-0 border-t border-gray-100 bg-white p-[24rpx]">
      <view v-if="orderDetail.status === 'pending'" class="flex space-x-[16rpx]">
        <view
          class="flex-1 rounded-[20rpx] bg-gray-100 py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
          @tap="cancelOrderAction"
        >
          取消订单
        </view>
        <view
          class="flex-1 rounded-[20rpx] bg-purple-600 py-[24rpx] text-center text-[26rpx] text-white font-medium"
          @tap="continuePay"
        >
          继续支付
        </view>
      </view>
      <view v-else-if="orderDetail.status === 'ongoing'" class="flex space-x-[16rpx]">
        <view
          class="flex-1 rounded-[20rpx] bg-gray-100 py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
          @tap="contactService"
        >
          联系客服
        </view>
      </view>
      <view v-else-if="orderDetail.status === 'completed'" class="flex space-x-[16rpx]">
        <view
          class="flex-1 rounded-[20rpx] bg-gray-100 py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
          @tap="contactService"
        >
          联系客服
        </view>
        <view
          class="flex-1 rounded-[20rpx] bg-purple-600 py-[24rpx] text-center text-[26rpx] text-white font-medium"
        >
          再次预订
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
