<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { type OrderDetail, cancelOrder, getOrderDetail } from '@/api/order'
import { queryPaymentStatus, requestWxPayment } from '@/api/booking'

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

const loading = ref(false)
const toastRef = ref()

// 判断是否为盲盒订单
const isMysteryBoxOrder = computed(() => {
  return pageParams.value.type === 'mystery_box' || orderDetail.value.orderType === 'mystery_box'
})

// 判断盲盒是否已揭晓（根据取车码核验状态）
const isMysteryBoxRevealed = computed(() => {
  if (!isMysteryBoxOrder.value) return false
  // 如果取车码已核验或订单状态为 picked/returned/completed，则认为已揭晓
  return orderDetail.value.mysteryBox?.pickupCodeVerified === true || 
         ['picked', 'returned', 'completed'].includes(orderDetail.value.status)
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

    const response = await getOrderDetail(orderId)

    if (response.code === 200 && response.data) {
      orderDetail.value = response.data
    }
    else {
      throw new Error(response.message || '获取订单详情失败')
    }
  }
  catch (error) {
    console.error('加载订单详情失败:', error)
    toastRef.value?.error('加载失败')

    // 如果API失败，显示模拟数据用于开发测试
    if (process.env.NODE_ENV === 'development') {
      orderDetail.value = {
        id: pageParams.value.orderId,
        orderNumber: pageParams.value.orderId,
        status: 'ongoing',
        statusText: '进行中',
        amount: 598,
        finalAmount: 568,
        discountAmount: 30,
        deliveryFee: 0,
        vehicle: {
          id: 1,
          name: '特斯拉 Model 3',
          brand: '特斯拉',
          model: 'Model 3',
          licensePlate: '沪A·88888',
          imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
          seats: 5,
          energyType: 'electric',
          carType: '轿车',
          rating: 4.9,
          ratingCount: 256,
        },
        rentPeriod: {
          startTime: '2025-07-12 09:00',
          endTime: '2025-07-13 18:00',
          days: 1,
        },
        location: '上海市浦东新区陆家嘴环路1000号',
        pickupMethod: 'self',
        deliveryAddress: '',
        pickupCode: '8888',
        remainingTime: '23:45:32',
        paymentInfo: {
          payTime: '2025-07-12 08:30:15',
          payMethod: '微信支付',
          transactionId: '4200001234567890123456789',
        },
        createTime: '2025-07-12 08:30:00',
        updateTime: '2025-07-12 08:30:15',
        remark: '',
      }
    }
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
      title: '跳转支付...',
      icon: 'loading',
    })

    // 查询支付状态，获取支付参数
    const response = await queryPaymentStatus(orderDetail.value.orderNumber)

    if (response.code === 200 && response.data) {
      // 如果已支付，直接刷新页面
      if (response.data.tradeState === 'SUCCESS') {
        toastRef.value?.success('订单已支付')
        await loadOrderDetail()
        return
      }

      // 这里需要重新创建支付订单，实际项目中应该有专门的重新支付API
      // 暂时模拟支付参数
      const payData = {
        appId: 'your-app-id',
        timeStamp: String(Date.now()),
        nonceStr: 'random-string',
        package: 'prepay_id=wx123456789',
        signType: 'RSA',
        paySign: 'signature',
      }

      await requestWxPayment(payData)

      toastRef.value?.success('支付成功')

      // 重新加载订单详情
      await loadOrderDetail()
    }
    else {
      throw new Error(response.msg || '获取支付信息失败')
    }
  }
  catch (error: any) {
    console.error('支付失败:', error)
    toastRef.value?.error('支付失败，请重试')
  }
}

// 格式化时间显示
function formatTime(timeStr: string) {
  if (!timeStr)
    return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取状态颜色
function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'bg-orange-50 text-orange-600',
    ongoing: 'bg-green-50 text-green-600',
    completed: 'bg-gray-50 text-gray-600',
    cancelled: 'bg-red-50 text-red-600',
  }
  return colorMap[status] || 'bg-gray-50 text-gray-600'
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
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
              {{ orderDetail.statusText }}
            </view>
            <text class="text-[22rpx] text-gray-500">
              {{ orderDetail.orderNumber }}
            </text>
          </view>

          <!-- 取车码 (进行中订单显示) -->
          <view v-if="orderDetail.status === 'ongoing' && orderDetail.pickupCode" class="rounded-[16rpx] bg-purple-50 p-[24rpx] mt-[24rpx]">
            <view class="flex items-center justify-between">
              <view>
                <view class="mb-[12rpx] flex items-center">
                  <text class="i-material-symbols-qr-code-scanner mr-[8rpx] text-[24rpx] text-purple-600" />
                  <text class="text-[26rpx] text-purple-800 font-medium">
                    取车码
                  </text>
                </view>
                <text class="text-[56rpx] text-purple-600 font-bold tracking-wider">
                  {{ orderDetail.pickupCode }}
                </text>
              </view>
              <view v-if="orderDetail.remainingTime" class="text-right">
                <text class="mb-[8rpx] block text-[22rpx] text-gray-600">
                  剩余时间
                </text>
                <text class="text-[28rpx] text-red-500 font-bold font-mono">
                  {{ orderDetail.remainingTime }}
                </text>
              </view>
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
            <view class="absolute inset-0 rounded-[16rpx] bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 opacity-80">
              <!-- 装饰图案（移除动画） -->
              <view class="absolute top-[20rpx] left-[20rpx] h-[40rpx] w-[40rpx] rounded-full bg-purple-300 opacity-50" />
              <view class="absolute top-[40rpx] right-[30rpx] h-[24rpx] w-[24rpx] rounded-full bg-pink-300 opacity-60" />
              <view class="absolute bottom-[30rpx] left-[40rpx] h-[32rpx] w-[32rpx] rounded-full bg-blue-300 opacity-50" />
              <view class="absolute bottom-[20rpx] right-[20rpx] h-[20rpx] w-[20rpx] rounded-full bg-yellow-300 opacity-60" />
            </view>
            
            <!-- 中心内容 -->
            <view class="relative z-10 text-center">
              <text class="i-material-symbols-card-giftcard text-[80rpx] text-purple-600 block mb-[16rpx]" />
              <text class="text-[32rpx] text-purple-800 font-bold block mb-[8rpx]">惊喜盲盒</text>
              <text class="text-[24rpx] text-purple-600">
                {{ orderDetail.status === 'pending' ? '支付后可查看取车码' : '取车时揭晓' }}
              </text>
              <!-- 显示盲盒偏好 -->
              <view v-if="orderDetail.mysteryBox" class="mt-[16rpx]">
                <text class="text-[22rpx] text-purple-500 block">
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
              <view v-else class="h-full w-full rounded-[12rpx] bg-gray-100 flex items-center justify-center">
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
                <text class="text-[20rpx] text-green-600 bg-green-50 px-[8rpx] py-[4rpx] rounded-[8rpx]">
                  🎉 盲盒已揭晓
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
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                用车时间
              </text>
              <text class="text-[24rpx] text-black">
                {{ formatTime(orderDetail.rentPeriod.startTime) }} - {{ formatTime(orderDetail.rentPeriod.endTime) }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                租赁天数
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.rentPeriod.days }}天
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                取车方式
              </text>
              <text class="text-[24rpx] text-black">
                {{ orderDetail.pickupMethod === 'self' ? '用户自取' : '平台送车' }}
              </text>
            </view>
            <view class="flex items-start justify-between">
              <text class="text-[24rpx] text-gray-600">
                取车地点
              </text>
              <text class="max-w-[400rpx] text-right text-[24rpx] text-black">
                {{ orderDetail.deliveryAddress || orderDetail.location }}
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
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                租金费用
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.amount }}
              </text>
            </view>
            <view v-if="orderDetail.deliveryFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                送车服务费
              </text>
              <text class="text-[24rpx] text-black">
                ¥{{ orderDetail.deliveryFee }}
              </text>
            </view>
            <view v-if="orderDetail.discountAmount > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                优惠折扣
              </text>
              <text class="text-[24rpx] text-green-600">
                -¥{{ orderDetail.discountAmount }}
              </text>
            </view>
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
            <text class="i-material-symbols-payment mr-[12rpx] text-[24rpx] text-purple-600" />
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
