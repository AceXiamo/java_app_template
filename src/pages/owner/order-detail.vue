<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'

// 页面参数
const props = defineProps<{
  orderNo?: string
}>()

// 订单详情数据
const orderDetail = ref({
  order_id: 1,
  order_no: 'RO20250720001',
  user_id: 101,
  vehicle_id: 1,
  owner_id: 1001,
  start_time: '2025-07-20 14:30:00',
  end_time: '2025-07-20 18:00:00',
  actual_start_time: '2025-07-20 14:32:00',
  actual_end_time: '2025-07-20 17:58:00',
  pickup_deadline: '2025-07-20 15:00:00',
  rental_days: 1,
  daily_price: 299.00,
  total_amount: 314.00,
  discount_amount: 20.00,
  delivery_fee: 15.00,
  late_pickup_fee: 0.00,
  overtime_fee: 0.00,
  final_amount: 294.00,
  pickup_code: 'A1B2C3',
  return_code: 'D4E5F6',
  pickup_location: '徐汇区漕河泾开发区停车场A区15号',
  delivery_address: '浦东新区陆家嘴环路1000号',
  delivery_distance: 8.5,
  payment_time: '2025-07-20 10:05:00',
  payment_method: 'wechat',
  wechat_transaction_id: '4200001234567890123',
  status: 'completed',
  statusText: '已完成',
  order_type: 'daily',
  pickup_method: 'delivery',
  dispute_status: 'none',
  remark: '用户要求准时到达，车辆已清洁完成',
  create_time: '2025-07-20 10:00:00',

  // 关联用户信息
  user: {
    user_id: 101,
    nickname: '张三',
    phone: '139****5678',
    avatar: '/static/vite.png',
    real_name: '张*三',
    gender: '男',
    age: 28,
  },

  // 关联车辆信息
  vehicle: {
    vehicle_id: 1,
    name: '特斯拉 Model 3',
    brand: '特斯拉',
    model: 'Model 3',
    license_plate: '沪A·12345',
    car_type: '轿车',
    energy_type: '纯电动',
    seats: 5,
    image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/tesla_model3.jpg',
    rating: 4.8,
    rating_count: 128,
    operation_type: 'owner',
    operation_type_text: '自运营',
  },

  // 验证照片
  pickup_verification_photos: [
    'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/verification1.jpg',
    'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/verification2.jpg',
  ],
  return_verification_photos: [
    'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/verification3.jpg',
  ],
})

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
  return statusMap[orderDetail.value.status] || 'text-gray-600 bg-gray-100'
})

const pickupMethodText = computed(() => {
  return orderDetail.value.pickup_method === 'delivery' ? '送车服务' : '自取'
})

const isExpired = computed(() => {
  if (!orderDetail.value.pickup_deadline)
    return false
  return new Date(orderDetail.value.pickup_deadline).getTime() < new Date().getTime()
})

// 方法
function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr)
    return ''
  const date = new Date(dateTimeStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function goBack() {
  uni.navigateBack()
}

function contactUser() {
  uni.makePhoneCall({
    phoneNumber: orderDetail.value.user.phone.replace(/\*/g, '1'),
  })
}

function goToTimeline() {
  uni.navigateTo({
    url: `/pages/owner/order-timeline?orderNo=${orderDetail.value.order_no}`,
  })
}

function previewImage(urls: string[], current: string) {
  uni.previewImage({
    urls,
    current,
  })
}

function openMap() {
  const { delivery_address } = orderDetail.value
  if (delivery_address) {
    uni.openLocation({
      name: '送车地址',
      address: delivery_address,
      latitude: 31.235929,
      longitude: 121.501940,
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
  loading.value = true
  try {
    // TODO: 调用API获取订单详情
    // const response = await api.getOwnerOrderDetail(props.orderNo)
    // orderDetail.value = response.data
  }
  catch (error) {
    console.error('加载订单详情失败:', error)
  }
  finally {
    loading.value = false
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
      <view class="p-[32rpx] space-y-[32rpx]">
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
              <view v-if="orderDetail.delivery_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  送车服务费
                </text>
                <text class="text-[22rpx] text-gray-800">
                  ¥{{ orderDetail.delivery_fee }}
                </text>
              </view>
              <view v-if="orderDetail.discount_amount > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  优惠金额
                </text>
                <text class="text-[22rpx] text-green-600">
                  -¥{{ orderDetail.discount_amount }}
                </text>
              </view>
              <view v-if="orderDetail.late_pickup_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  延迟取车费
                </text>
                <text class="text-[22rpx] text-red-600">
                  +¥{{ orderDetail.late_pickup_fee }}
                </text>
              </view>
              <view v-if="orderDetail.overtime_fee > 0" class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  超时费用
                </text>
                <text class="text-[22rpx] text-red-600">
                  +¥{{ orderDetail.overtime_fee }}
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

          <view class="flex items-center space-x-[20rpx]">
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
                <text class="text-[20rpx] text-gray-500">
                  {{ orderDetail.user.gender }} · {{ orderDetail.user.age }}岁
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

          <view class="flex items-start space-x-[20rpx]">
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
                <text>{{ orderDetail.vehicle.license_plate }}</text>
                <text>{{ orderDetail.vehicle.seats }}座</text>
                <text>{{ orderDetail.vehicle.car_type }}</text>
                <text>{{ orderDetail.vehicle.energy_type }}</text>
              </view>
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[8rpx]">
                  <text class="i-material-symbols-star text-[18rpx] text-yellow-500" />
                  <text class="text-[20rpx] text-gray-600">
                    {{ orderDetail.vehicle.rating }} ({{ orderDetail.vehicle.rating_count }}评价)
                  </text>
                </view>
                <text class="rounded-full bg-blue-50 px-[12rpx] py-[4rpx] text-[16rpx] text-blue-600">
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

            <!-- 实际租期（如果有） -->
            <view v-if="orderDetail.actual_start_time && orderDetail.actual_end_time" class="flex items-start space-x-[16rpx]">
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
              </view>
            </view>

            <!-- 取车截止时间 -->
            <view v-if="orderDetail.pickup_deadline" class="flex items-start space-x-[16rpx]">
              <text
                class="mt-[4rpx] text-[24rpx]"
                :class="isExpired ? 'i-material-symbols-warning text-red-600' : 'i-material-symbols-alarm text-orange-600'"
              />
              <view class="flex-1">
                <text class="mb-[4rpx] block text-[24rpx] text-gray-700 font-medium">
                  取车截止
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
                  {{ orderDetail.pickup_method === 'delivery' ? orderDetail.delivery_address : orderDetail.pickup_location }}
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
                {{ orderDetail.payment_method === 'wechat' ? '微信支付' : '支付宝' }}
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
