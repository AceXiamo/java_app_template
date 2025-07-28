<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { type OwnerOrderDetail, getOwnerOrderDetail, confirmOrderCompletion } from '@/api/owner-orders'

// 页面参数
const props = defineProps<{
  orderNo?: string
}>()

// 订单详情数据
const orderDetail = ref<OwnerOrderDetail>({} as OwnerOrderDetail)

const loading = ref(false)

// 计算属性
const statusColor = computed(() => {
  const statusMap: Record<string, string> = {
    pending: 'text-blue-600 bg-blue-100',
    paid: 'text-purple-600 bg-purple-100',
    picked: 'text-orange-600 bg-orange-100',
    returned: 'text-green-600 bg-green-100',
    completed: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100',
  }
  return statusMap[orderDetail.value?.status] || 'text-gray-600 bg-gray-100'
})

const pickupMethodText = computed(() => {
  return orderDetail.value?.pickup_method === 'delivery' ? '送车服务' : '自取'
})

const isExpired = computed(() => {
  if (!orderDetail.value?.pickup_deadline)
    return false
  return new Date(orderDetail.value.pickup_deadline).getTime() < new Date().getTime()
})

// 计算最晚还车时间（实际开始时间 + 租用天数）
const latestReturnTime = computed(() => {
  if (!orderDetail.value?.actual_start_time || !orderDetail.value?.rental_days)
    return null

  const actualStart = new Date(orderDetail.value.actual_start_time)
  const returnTime = new Date(actualStart)
  returnTime.setDate(actualStart.getDate() + orderDetail.value.rental_days)

  return returnTime
})

// 计算实际用车时长（小时）
const actualUsageHours = computed(() => {
  if (!orderDetail.value?.actual_start_time)
    return null

  const startTime = new Date(orderDetail.value.actual_start_time)
  const now = new Date()
  const diff = now.getTime() - startTime.getTime()

  return Math.floor(diff / (1000 * 60 * 60)) // 转换为小时
})

// 是否超时还车
const isOverdueReturn = computed(() => {
  if (!latestReturnTime.value || orderDetail.value?.status !== 'picked')
    return false

  return new Date().getTime() > latestReturnTime.value.getTime()
})

// 方法
function formatDateTime(dateTimeStr: string | Date) {
  if (!dateTimeStr)
    return ''
  const date = typeof dateTimeStr === 'string' ? new Date(dateTimeStr) : dateTimeStr

  // 检查是否为有效日期
  if (Number.isNaN(date.getTime())) {
    return '无效日期'
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 格式化用车时长
function formatUsageTime(hours: number) {
  if (hours < 24) {
    return `${hours}小时`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`
}

function goBack() {
  uni.navigateBack()
}

function contactUser() {
  const phone = orderDetail.value?.user?.phone
  if (!phone) {
    uni.showToast({
      title: '用户电话信息不可用',
      icon: 'none',
    })
    return
  }
  uni.makePhoneCall({
    phoneNumber: phone.replace(/\*/g, '1'),
  })
}

function goToTimeline() {
  const orderNo = orderDetail.value?.order_no
  if (!orderNo) {
    uni.showToast({
      title: '订单信息不完整',
      icon: 'none',
    })
    return
  }
  uni.navigateTo({
    url: `/pages/owner/order-timeline?orderNo=${orderNo}`,
  })
}

function previewImage(urls: string[], current: string) {
  uni.previewImage({
    urls,
    current,
  })
}

function openMap() {
  const deliveryAddress = orderDetail.value?.delivery_address
  if (deliveryAddress) {
    uni.openLocation({
      name: '送车地址',
      address: deliveryAddress,
      latitude: 31.235929,
      longitude: 121.501940,
    })
  }
  else {
    uni.showToast({
      title: '地址信息不可用',
      icon: 'none',
    })
  }
}

// 生命周期
onMounted(() => {
  // 这里应该根据 orderNo 获取订单详情
  console.log('Order No:', props.orderNo)
  loadOrderDetail()
})

async function loadOrderDetail() {
  if (!props.orderNo) {
    console.error('订单号不能为空')
    return
  }

  loading.value = true
  try {
    const response = await getOwnerOrderDetail(props.orderNo)
    if (response.code === 200) {
      orderDetail.value = response.data
    }
    else {
      console.error('获取订单详情失败:', response.msg)
      uni.showToast({
        title: response.msg || '获取订单详情失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 确认订单完成
async function confirmCompletion() {
  try {
    // 显示确认对话框
    const result = await new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '确认订单完成',
        content: `确认订单 ${orderDetail.value.order_no} 已完成？完成后车辆将进入维护状态。`,
        confirmText: '确认完成',
        cancelText: '取消',
        success: (res) => {
          resolve(res.confirm)
        },
        fail: () => {
          resolve(false)
        }
      })
    })

    if (!result) return

    uni.showLoading({ title: '确认完成中...' })

    // 调用确认完成API
    await confirmOrderCompletion(orderDetail.value.order_id, '车主', '车主确认订单已完成')

    uni.hideLoading()
    uni.showToast({ 
      title: '订单已确认完成', 
      icon: 'success',
      duration: 2000
    })

    // 更新本地状态
    orderDetail.value.status = 'completed'
    orderDetail.value.statusText = '已完成'
    
  } catch (error) {
    uni.hideLoading()
    console.error('确认订单完成失败:', error)
    uni.showToast({ 
      title: error?.message || '确认完成失败，请重试', 
      icon: 'none',
      duration: 3000
    })
  }
}

// 页面标题
uni.setNavigationBarTitle({
  title: '订单详情',
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-[32rpx] z-10 h-full flex items-center justify-center" @tap="goBack">
          <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-gray-50 transition-colors active:bg-gray-100">
            <text class="i-material-symbols-arrow-back text-[28rpx] text-gray-700" />
          </view>
        </view>
        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          订单详情
        </text>
      </view>
    </HeadBar>

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <!-- 加载中状态 -->
      <view v-if="loading" class="h-full flex items-center justify-center">
        <view class="text-center">
          <view class="mx-auto mb-[20rpx] h-[80rpx] w-[80rpx] animate-spin border-4 border-purple-200 border-t-purple-600 rounded-full" />
          <text class="text-[24rpx] text-gray-600">
            加载中...
          </text>
        </view>
      </view>

      <!-- 订单详情内容 -->
      <view v-else-if="orderDetail?.order_id" class="p-[32rpx] space-y-[32rpx]">
        <!-- 订单状态卡片 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center space-x-[16rpx]">
              <view
                class="rounded-full px-[20rpx] py-[8rpx] text-[24rpx] font-medium"
                :class="statusColor"
              >
                {{ orderDetail.statusText }}
              </view>
              <text class="text-[24rpx] text-gray-600">
                {{ orderDetail.order_type === 'daily' ? '日租订单' : '月租订单' }}
              </text>
            </view>
            <text class="text-[22rpx] text-gray-400">
              {{ orderDetail.order_no }}
            </text>
          </view>

          <!-- 订单金额信息 -->
          <view class="rounded-[16rpx] bg-purple-50 p-[24rpx]">
            <view class="mb-[12rpx] flex items-center justify-between">
              <text class="text-[28rpx] text-purple-800 font-bold">
                订单金额
              </text>
              <text class="text-[36rpx] text-purple-600 font-bold">
                ¥{{ orderDetail.final_amount }}
              </text>
            </view>
            <view class="space-y-[8rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  基础租金
                </text>
                <text class="text-[22rpx] text-gray-800">
                  ¥{{ orderDetail.daily_price }} × {{ orderDetail.rental_days }}天
                </text>
              </view>
              <view v-if="orderDetail.delivery_fee && orderDetail.delivery_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  送车服务费
                </text>
                <text class="text-[22rpx] text-gray-800">
                  ¥{{ orderDetail.delivery_fee }}
                </text>
              </view>
              <view v-if="orderDetail.discount_amount && orderDetail.discount_amount > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  优惠金额
                </text>
                <text class="text-[22rpx] text-green-600">
                  -¥{{ orderDetail.discount_amount }}
                </text>
              </view>
              <view v-if="orderDetail.late_pickup_fee && orderDetail.late_pickup_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  延迟取车费
                </text>
                <text class="text-[22rpx] text-red-600">
                  +¥{{ orderDetail.late_pickup_fee }}
                </text>
              </view>
              <view v-if="orderDetail.overtime_fee && orderDetail.overtime_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  超时费用
                </text>
                <text class="text-[22rpx] text-red-600">
                  +¥{{ orderDetail.overtime_fee }}
                </text>
              </view>
              <view v-if="orderDetail.insurance_fee && orderDetail.insurance_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  保险费用
                </text>
                <text class="text-[22rpx] text-gray-800">
                  ¥{{ orderDetail.insurance_fee }}
                </text>
              </view>
              <view v-if="orderDetail.service_fee && orderDetail.service_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  增值服务费
                </text>
                <text class="text-[22rpx] text-gray-800">
                  ¥{{ orderDetail.service_fee }}
                </text>
              </view>
              <view class="flex items-center justify-between border-t border-purple-200 pt-[8rpx]">
                <text class="text-[24rpx] text-purple-800 font-medium">
                  实付金额
                </text>
                <text class="text-[28rpx] text-purple-600 font-bold">
                  ¥{{ orderDetail.final_amount }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 用户信息卡片 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[20rpx] flex items-center justify-between">
            <text class="text-[28rpx] text-gray-900 font-bold">
              租车用户
            </text>
            <view
              class="flex items-center rounded-full bg-purple-50 px-[20rpx] py-[8rpx] transition-colors active:bg-purple-100"
              @tap="contactUser"
            >
              <text class="i-material-symbols-call mr-[8rpx] text-[20rpx] text-purple-600" />
              <text class="text-[20rpx] text-purple-600 font-medium">
                联系用户
              </text>
            </view>
          </view>

          <view v-if="orderDetail.user" class="flex items-center space-x-[20rpx]">
            <image
              :src="orderDetail.user.avatar"
              class="h-[80rpx] w-[80rpx] rounded-full bg-gray-200"
              mode="aspectFill"
            />
            <view class="min-w-0 flex-1">
              <view class="mb-[6rpx] flex items-center space-x-[12rpx]">
                <text class="text-[26rpx] text-gray-900 font-medium">
                  {{ orderDetail.user.nickname }}
                </text>
                <text v-if="orderDetail.user.gender || orderDetail.user.age" class="text-[20rpx] text-gray-500">
                  {{ orderDetail.user.gender }}{{ orderDetail.user.age ? ` · ${orderDetail.user.age}岁` : '' }}
                </text>
              </view>
              <text class="text-[24rpx] text-gray-600">
                {{ orderDetail.user.phone }}
              </text>
            </view>
          </view>
        </view>

        <!-- 车辆信息卡片 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            租用车辆
          </text>

          <view v-if="orderDetail.vehicle" class="flex items-start space-x-[20rpx]">
            <view class="h-[90rpx] w-[120rpx] flex-shrink-0 overflow-hidden rounded-[12rpx] bg-gray-200">
              <image
                :src="orderDetail.vehicle.image_url"
                class="h-full w-full"
                mode="aspectFill"
              />
            </view>
            <view class="min-w-0 flex-1">
              <text class="mb-[8rpx] block text-[26rpx] text-gray-900 font-medium">
                {{ orderDetail.vehicle.name }}
              </text>
              <view class="mb-[8rpx] flex items-center text-[20rpx] text-gray-600 space-x-[16rpx]">
                <text v-if="orderDetail.vehicle.license_plate">{{ orderDetail.vehicle.license_plate }}</text>
                <text v-if="orderDetail.vehicle.seats">{{ orderDetail.vehicle.seats }}座</text>
                <text v-if="orderDetail.vehicle.car_type">{{ orderDetail.vehicle.car_type }}</text>
                <text v-if="orderDetail.vehicle.energy_type">{{ orderDetail.vehicle.energy_type }}</text>
              </view>
              <view class="flex items-center justify-between">
                <view v-if="orderDetail.vehicle.rating && orderDetail.vehicle.rating_count" class="flex items-center space-x-[8rpx]">
                  <text class="i-material-symbols-star text-[18rpx] text-yellow-500" />
                  <text class="text-[20rpx] text-gray-600">
                    {{ orderDetail.vehicle.rating }} ({{ orderDetail.vehicle.rating_count }}评价)
                  </text>
                </view>
                <text v-if="orderDetail.vehicle.operation_type_text" class="rounded-full bg-blue-50 px-[12rpx] py-[4rpx] text-[16rpx] text-blue-600">
                  {{ orderDetail.vehicle.operation_type_text }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 租期信息卡片 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            租期信息
          </text>

          <view class="space-y-[16rpx]">
            <!-- 计划租期 -->
            <view class="flex items-start space-x-[16rpx]">
              <text class="i-material-symbols-schedule mt-[4rpx] text-[24rpx] text-purple-600" />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  计划租期
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  {{ formatDateTime(orderDetail.start_time) }}
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  至 {{ formatDateTime(orderDetail.end_time) }}
                </text>
                <text class="mt-[4rpx] block text-[18rpx] text-purple-600">
                  租期 {{ orderDetail.rental_days }} 天
                </text>
              </view>
            </view>

            <!-- 取车截止时间（已支付未取车状态） -->
            <view v-if="orderDetail.status === 'paid' && orderDetail.pickup_deadline" class="flex items-start space-x-[16rpx]">
              <text
                class="mt-[4rpx] text-[24rpx]"
                :class="isExpired ? 'i-material-symbols-warning text-red-600' : 'i-material-symbols-alarm text-orange-600'"
              />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  取车截止时间
                </text>
                <text
                  class="block text-[20rpx]"
                  :class="isExpired ? 'text-red-600' : 'text-gray-600'"
                >
                  {{ formatDateTime(orderDetail.pickup_deadline) }}
                  <text v-if="isExpired" class="ml-[8rpx] text-[16rpx]">
                    已超时
                  </text>
                </text>
                <text v-if="!isExpired" class="mt-[4rpx] block text-[18rpx] text-orange-600">
                  请提醒用户及时取车
                </text>
              </view>
            </view>

            <!-- 实际用车时间（已取车未还车状态） -->
            <view v-if="orderDetail.status === 'picked' && orderDetail.actual_start_time" class="flex items-start space-x-[16rpx]">
              <text class="i-material-symbols-directions-car mt-[4rpx] text-[24rpx] text-blue-600" />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  实际用车时间
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  开始：{{ formatDateTime(orderDetail.actual_start_time) }}
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  已用车：{{ formatUsageTime(actualUsageHours || 0) }}
                </text>
                <text v-if="latestReturnTime" class="mt-[4rpx] block text-[18rpx]" :class="isOverdueReturn ? 'text-red-600' : 'text-blue-600'">
                  最晚还车：{{ formatDateTime(latestReturnTime) }}
                  <text v-if="isOverdueReturn" class="ml-[8rpx]">
                    (已超时)
                  </text>
                </text>
              </view>
            </view>

            <!-- 实际租期（已还车或已完成状态） -->
            <view v-if="(orderDetail.status === 'returned' || orderDetail.status === 'completed') && orderDetail.actual_start_time && orderDetail.actual_end_time" class="flex items-start space-x-[16rpx]">
              <text class="i-material-symbols-check-circle mt-[4rpx] text-[24rpx] text-green-600" />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  实际租期
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  {{ formatDateTime(orderDetail.actual_start_time) }}
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  至 {{ formatDateTime(orderDetail.actual_end_time) }}
                </text>
                <text class="mt-[4rpx] block text-[18rpx] text-green-600">
                  实际用车 {{ formatUsageTime(Math.ceil((new Date(orderDetail.actual_end_time).getTime() - new Date(orderDetail.actual_start_time).getTime()) / (1000 * 60 * 60))) }}
                </text>
              </view>
            </view>

            <!-- 部分取车信息（如果只有开始时间没有结束时间） -->
            <view v-if="orderDetail.actual_start_time && !orderDetail.actual_end_time && orderDetail.status !== 'picked'" class="flex items-start space-x-[16rpx]">
              <text class="i-material-symbols-info mt-[4rpx] text-[24rpx] text-blue-600" />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  取车时间
                </text>
                <text class="block text-[20rpx] text-gray-600">
                  {{ formatDateTime(orderDetail.actual_start_time) }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 地点信息卡片 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            {{ pickupMethodText }}信息
          </text>

          <view class="space-y-[20rpx]">
            <!-- 取车/送车地址 -->
            <view class="flex items-start space-x-[16rpx]">
              <text
                class="mt-[4rpx] text-[24rpx]"
                :class="orderDetail.pickup_method === 'delivery' ? 'i-material-symbols-local-shipping text-blue-600' : 'i-material-symbols-location-on text-purple-600'"
              />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  {{ orderDetail.pickup_method === 'delivery' ? '送车地址' : '取车地点' }}
                </text>
                <text class="text-[22rpx] text-gray-800 leading-relaxed">
                  {{ orderDetail.pickup_method === 'delivery' ? (orderDetail.delivery_address || '暂无地址') : (orderDetail.pickup_location || '暂无地点') }}
                </text>

                <!-- 送车额外信息 -->
                <view v-if="orderDetail.pickup_method === 'delivery'" class="mt-[8rpx] flex items-center space-x-[16rpx]">
                  <view v-if="orderDetail.delivery_distance" class="flex items-center space-x-[4rpx]">
                    <text class="i-material-symbols-route text-[16rpx] text-gray-500" />
                    <text class="text-[18rpx] text-gray-500">
                      {{ orderDetail.delivery_distance }}km
                    </text>
                  </view>
                  <view v-if="orderDetail.delivery_fee" class="flex items-center space-x-[4rpx]">
                    <text class="i-material-symbols-payments text-[16rpx] text-gray-500" />
                    <text class="text-[18rpx] text-gray-500">
                      服务费¥{{ orderDetail.delivery_fee }}
                    </text>
                  </view>
                  <view
                    class="flex items-center rounded-full bg-blue-50 px-[12rpx] py-[4rpx] transition-colors space-x-[4rpx] active:bg-blue-100"
                    @tap="openMap"
                  >
                    <text class="i-material-symbols-map text-[16rpx] text-blue-600" />
                    <text class="text-[16rpx] text-blue-600">
                      查看地图
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 取车码/还车码信息 -->
        <view v-if="orderDetail.pickup_code || orderDetail.return_code" class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            验证码信息
          </text>

          <view class="space-y-[16rpx]">
            <!-- 取车码 -->
            <view v-if="orderDetail.pickup_code" class="rounded-[16rpx] bg-purple-50 p-[20rpx]">
              <view class="mb-[8rpx] flex items-center space-x-[12rpx]">
                <text class="i-material-symbols-qr-code-scanner text-[24rpx] text-purple-600" />
                <text class="text-[24rpx] text-purple-800 font-medium">
                  取车码
                </text>
              </view>
              <text class="text-[40rpx] text-purple-600 font-bold tracking-wider">
                {{ orderDetail.pickup_code }}
              </text>
            </view>

            <!-- 还车码 -->
            <view v-if="orderDetail.return_code" class="rounded-[16rpx] bg-green-50 p-[20rpx]">
              <view class="mb-[8rpx] flex items-center space-x-[12rpx]">
                <text class="i-material-symbols-qr-code-scanner text-[24rpx] text-green-600" />
                <text class="text-[24rpx] text-green-800 font-medium">
                  还车码
                </text>
              </view>
              <text class="text-[40rpx] text-green-600 font-bold tracking-wider">
                {{ orderDetail.return_code }}
              </text>
            </view>
          </view>
        </view>

        <!-- 验证照片 -->
        <view v-if="orderDetail.pickup_verification_photos?.length || orderDetail.return_verification_photos?.length" class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            验证照片
          </text>

          <!-- 取车验证照片 -->
          <view v-if="orderDetail.pickup_verification_photos?.length" class="mb-[24rpx]">
            <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
              取车验证
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="(photo, index) in orderDetail.pickup_verification_photos"
                :key="index"
                class="h-[90rpx] w-[120rpx] overflow-hidden rounded-[8rpx] bg-gray-200"
                @tap="previewImage(orderDetail.pickup_verification_photos!, photo)"
              >
                <image :src="photo" class="h-full w-full" mode="aspectFill" />
              </view>
            </view>
          </view>

          <!-- 还车验证照片 -->
          <view v-if="orderDetail.return_verification_photos?.length">
            <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
              还车验证
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="(photo, index) in orderDetail.return_verification_photos"
                :key="index"
                class="h-[90rpx] w-[120rpx] overflow-hidden rounded-[8rpx] bg-gray-200"
                @tap="previewImage(orderDetail.return_verification_photos!, photo)"
              >
                <image :src="photo" class="h-full w-full" mode="aspectFill" />
              </view>
            </view>
          </view>
        </view>

        <!-- 支付信息 -->
        <view class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            支付信息
          </text>

          <view class="space-y-[12rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[22rpx] text-gray-600">
                支付方式
              </text>
              <text class="text-[22rpx] text-gray-800">
                {{ orderDetail.payment_method === 'wechat' ? '微信支付' : (orderDetail.payment_method === 'alipay' ? '支付宝' : '未知') }}
              </text>
            </view>
            <view v-if="orderDetail.payment_time" class="flex items-center justify-between">
              <text class="text-[22rpx] text-gray-600">
                支付时间
              </text>
              <text class="text-[22rpx] text-gray-800">
                {{ formatDateTime(orderDetail.payment_time) }}
              </text>
            </view>
            <view v-if="orderDetail.wechat_transaction_id" class="flex items-center justify-between">
              <text class="text-[22rpx] text-gray-600">
                交易单号
              </text>
              <text class="text-[20rpx] text-gray-500 font-mono">
                {{ orderDetail.wechat_transaction_id }}
              </text>
            </view>
          </view>
        </view>

        <!-- 保险信息 -->
        <view v-if="orderDetail.insurance?.length" class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            保险信息
          </text>
          
          <view class="space-y-[16rpx]">
            <view
              v-for="(insurance, index) in orderDetail.insurance"
              :key="index"
              class="rounded-[16rpx] bg-blue-50 p-[20rpx]"
            >
              <view class="mb-[8rpx] flex items-center justify-between">
                <view class="flex items-center space-x-[12rpx]">
                  <text class="i-material-symbols-security text-[24rpx] text-blue-600" />
                  <text class="text-[24rpx] text-blue-800 font-medium">
                    {{ insurance.product_name }}
                  </text>
                </view>
                <text class="text-[24rpx] text-blue-600 font-bold">
                  ¥{{ insurance.price }}
                </text>
              </view>
              <view class="space-y-[4rpx]">
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
        <view v-if="orderDetail.services?.length" class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            增值服务
          </text>
          
          <view class="space-y-[16rpx]">
            <view
              v-for="(service, index) in orderDetail.services"
              :key="index"
              class="rounded-[16rpx] bg-green-50 p-[20rpx]"
            >
              <view class="mb-[8rpx] flex items-center justify-between">
                <view class="flex items-center space-x-[12rpx]">
                  <text class="i-material-symbols-build text-[24rpx] text-green-600" />
                  <text class="text-[24rpx] text-green-800 font-medium">
                    {{ service.service_name }}
                  </text>
                </view>
                <text class="text-[24rpx] text-green-600 font-bold">
                  ¥{{ service.total_amount }}
                </text>
              </view>
              <view class="space-y-[4rpx]">
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

        <!-- 备注信息 -->
        <view v-if="orderDetail.remark" class="rounded-[20rpx] bg-white p-[32rpx] shadow-sm">
          <text class="mb-[20rpx] block text-[28rpx] text-gray-900 font-bold">
            订单备注
          </text>
          <text class="text-[22rpx] text-gray-700 leading-relaxed">
            {{ orderDetail.remark }}
          </text>
        </view>

        <!-- 操作按钮 -->
        <view class="flex pb-[32rpx] space-x-[16rpx]">
          <!-- 已还车状态：显示确认完成按钮 -->
          <template v-if="orderDetail.status === 'returned'">
            <view
              class="flex-1 rounded-full bg-green-600 py-[24rpx] text-center text-[26rpx] text-white font-medium transition-colors active:bg-green-700"
              @tap="confirmCompletion"
            >
              确认完成
            </view>
            <view
              class="flex-1 rounded-full bg-gray-100 py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium transition-colors active:bg-gray-200"
              @tap="contactUser"
            >
              联系用户
            </view>
            <view
              class="flex-1 border border-purple-200 rounded-full bg-purple-50 py-[24rpx] text-center text-[26rpx] text-purple-600 font-medium transition-colors active:bg-purple-100"
              @tap="goToTimeline"
            >
              查看时间线
            </view>
          </template>
          
          <!-- 其他状态：默认按钮 -->
          <template v-else>
            <view
              class="flex-1 rounded-full bg-gray-100 py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium transition-colors active:bg-gray-200"
              @tap="contactUser"
            >
              联系用户
            </view>
            <view
              class="flex-1 border border-purple-200 rounded-full bg-purple-50 py-[24rpx] text-center text-[26rpx] text-purple-600 font-medium transition-colors active:bg-purple-100"
              @tap="goToTimeline"
            >
              查看时间线
            </view>
          </template>
        </view>
      </view>

      <!-- 数据为空状态 -->
      <view v-else class="h-full flex items-center justify-center">
        <view class="text-center">
          <text class="i-material-symbols-error-outline mb-[20rpx] block text-[80rpx] text-gray-400" />
          <text class="text-[24rpx] text-gray-600">
            订单数据不存在
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
