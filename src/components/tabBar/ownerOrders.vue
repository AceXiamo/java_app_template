<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { useOwnerStore } from '@/store/owner'

// 使用 owner store
const ownerStore = useOwnerStore()

// 设置当前页面
ownerStore.setActive('orders')

// 筛选选项
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]
const currentFilter = ref('all')

const sliderStyle = computed(() => {
  const activeIndex = tabs.findIndex(tab => tab.key === currentFilter.value)
  if (activeIndex === -1) {
    return {}
  }
  const leftPosition = (100 / tabs.length) * (activeIndex + 0.5)
  return {
    left: `${leftPosition}%`,
    transform: 'translateX(-50%)',
  }
})

// 订单列表
const orderList = reactive([
  {
    order_id: 1,
    order_no: 'RO20250720001',
    user_id: 101,
    vehicle_id: 1,
    start_time: '2025-07-20 14:30:00',
    end_time: '2025-07-20 18:00:00',
    pickup_deadline: '2025-07-20 14:00:00',
    rental_days: 1,
    total_amount: 299,
    final_amount: 254,
    pickup_code: 'A1B2C3',
    pickup_location: '徐汇区漕河泾开发区停车场',
    pickup_method: 'self',
    status: 'completed',
    statusText: '已完成',
    order_type: 'daily',
    user: {
      name: '张三',
      phone: '139****5678',
      avatar: '/static/vite.png',
    },
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
    },
  },
  {
    order_id: 2,
    order_no: 'RO20250721001',
    user_id: 102,
    vehicle_id: 2,
    start_time: '2025-07-21 09:00:00',
    end_time: '2025-07-21 11:00:00',
    pickup_deadline: '2025-07-21 08:30:00',
    rental_days: 1,
    total_amount: 199,
    final_amount: 169,
    pickup_code: 'D4E5F6',
    delivery_address: '浦东新区陆家嘴环路1000号',
    delivery_distance: 8.5,
    delivery_fee: 15.0,
    pickup_method: 'delivery',
    status: 'paid',
    statusText: '待取车',
    order_type: 'daily',
    user: {
      name: '李四',
      phone: '138****1234',
      avatar: '/static/vite.png',
    },
    vehicle: {
      vehicle_id: 2,
      name: '比亚迪汉 EV',
      brand: '比亚迪',
      model: '汉 EV',
      license_plate: '沪A·67890',
      car_type: 'SUV',
      energy_type: '纯电动',
      seats: 5,
      image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/byd_han.jpg',
      rating: 4.6,
      rating_count: 85,
    },
  },
  {
    order_id: 3,
    order_no: 'RO20250719001',
    user_id: 103,
    vehicle_id: 3,
    start_time: '2025-07-19 16:00:00',
    end_time: '2025-07-19 20:00:00',
    pickup_deadline: '2025-07-19 15:30:00',
    rental_days: 1,
    total_amount: 359,
    final_amount: 305,
    return_code: 'G7H8I9',
    pickup_location: '静安区南京西路1788号停车场',
    pickup_method: 'self',
    status: 'completed',
    statusText: '已完成',
    order_type: 'daily',
    user: {
      name: '王五',
      phone: '137****9999',
      avatar: '/static/vite.png',
    },
    vehicle: {
      vehicle_id: 3,
      name: '理想 L7',
      brand: '理想',
      model: 'L7',
      license_plate: '沪A·11111',
      car_type: 'SUV',
      energy_type: '增程式',
      seats: 6,
      image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/lixiang_l7.jpg',
      rating: 4.9,
      rating_count: 156,
    },
  },
  {
    order_id: 4,
    order_no: 'RO20250722001',
    user_id: 104,
    vehicle_id: 1,
    start_time: '2025-07-22 10:00:00',
    end_time: '2025-07-22 18:00:00',
    pickup_deadline: '2025-07-22 09:30:00',
    rental_days: 1,
    total_amount: 299,
    final_amount: 254,
    return_code: 'H9J1K2',
    pickup_location: '徐汇区漕河泾开发区停车场',
    pickup_method: 'self',
    status: 'picked',
    statusText: '使用中',
    order_type: 'daily',
    user: {
      name: '赵六',
      phone: '136****7777',
      avatar: '/static/vite.png',
    },
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
    },
  },
])

// 过滤后的订单
const filteredOrders = computed(() => {
  if (currentFilter.value === 'all') {
    return orderList
  }

  // 根据筛选条件映射到实际状态
  const statusMapping: Record<string, string[]> = {
    ongoing: ['paid', 'picked'], // 进行中包含已支付和已取车
    completed: ['returned', 'completed'], // 已完成包含已还车和已完成
    cancelled: ['cancelled'], // 已取消
  }

  const targetStatuses = statusMapping[currentFilter.value]
  if (targetStatuses) {
    return orderList.filter(order => targetStatuses.includes(order.status))
  }

  return orderList.filter(order => order.status === currentFilter.value)
})

// 导航方法
function goToOrderDetail(orderNo: string) {
  uni.navigateTo({ url: `/pages/owner/order-detail?orderNo=${orderNo}` })
}

function goToTimeline(orderNo: string) {
  uni.navigateTo({ url: `/pages/owner/order-timeline?orderNo=${orderNo}` })
}

function contactUser(phone: string) {
  uni.makePhoneCall({
    phoneNumber: phone.replace('*', ''),
  })
}

function switchTab(tabKey: string) {
  currentFilter.value = tabKey
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'text-blue-600 bg-blue-100', // 待支付
    paid: 'text-purple-600 bg-purple-100', // 已支付（待取车）
    picked: 'text-orange-600 bg-orange-100', // 已取车（使用中）
    returned: 'text-green-600 bg-green-100', // 已还车
    completed: 'text-green-600 bg-green-100', // 已完成
    cancelled: 'text-red-600 bg-red-100', // 已取消
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

// 格式化时间显示
function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr) {
    return ''
  }
  try {
    const date = new Date(dateTimeStr)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  catch {
    return dateTimeStr
  }
}

// 检查是否已过期
function isExpired(deadline: string) {
  if (!deadline) {
    return false
  }
  return new Date(deadline).getTime() < new Date().getTime()
}

// 照片提交弹窗相关
const photoDrawerVisible = ref(false)
const currentAction = ref<'pickup' | 'return'>('pickup')
const currentOrder = ref<any>(null)
const uploadedPhotos = ref<string[]>([])

// 取车验证
function startPickupVerification(order: any) {
  currentOrder.value = order
  currentAction.value = 'pickup'
  uploadedPhotos.value = []
  photoDrawerVisible.value = true
}

// 还车验证
function confirmReturn(order: any) {
  currentOrder.value = order
  currentAction.value = 'return'
  uploadedPhotos.value = []
  photoDrawerVisible.value = true
}

// 选择照片
function chooseImage() {
  uni.chooseImage({
    count: 4,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      uploadedPhotos.value.push(...res.tempFilePaths)
    },
    fail: () => {
      uni.showToast({ title: '选择照片失败', icon: 'none' })
    },
  })
}

// 删除照片
function removePhoto(index: number) {
  uploadedPhotos.value.splice(index, 1)
}

// 提交验证
function submitVerification() {
  if (uploadedPhotos.value.length === 0) {
    uni.showToast({ title: '请至少上传一张照片', icon: 'none' })
    return
  }

  // TODO: 实现照片上传和订单状态更新的API调用
  uni.showLoading({ title: '提交中...' })

  // 模拟API调用
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '验证成功', icon: 'success' })
    photoDrawerVisible.value = false

    // 更新订单状态
    const order = orderList.find(o => o.order_id === currentOrder.value.order_id)
    if (order) {
      if (currentAction.value === 'pickup') {
        order.status = 'picked'
        order.statusText = '使用中'
      }
      else {
        order.status = 'returned'
        order.statusText = '已还车'
      }
    }
  }, 2000)
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航栏 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          我的订单
        </text>
      </view>
    </HeadBar>

    <!-- 横向Tab筛选区 - 固定在顶部 -->
    <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[32rpx] py-[16rpx] shadow-sm">
      <view class="relative flex rounded-[10rpx] bg-gray-50 p-[8rpx]">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 cursor-pointer rounded-[16rpx] px-[32rpx] py-[16rpx] text-center text-[28rpx] font-medium transition-colors duration-300"
          :class="currentFilter === tab.key ? 'text-purple-600' : 'text-gray-400'"
          @tap="switchTab(tab.key)"
        >
          {{ tab.label }}
        </view>
        <view
          class="absolute bottom-[8rpx] h-[6rpx] w-[40rpx] rounded-full bg-purple-600 transition-all duration-300 ease-out"
          :style="sliderStyle"
        />
      </view>
    </view>

    <!-- 滚动内容区域 -->
    <view class="h-0 flex flex-1 flex-col">
      <scroll-view scroll-y class="h-full w-full">
        <view class="content px-[32rpx] pt-[32rpx]">
          <!-- 订单列表 -->
          <view v-if="filteredOrders.length" class="pb-[32rpx] space-y-[24rpx]">
            <view
              v-for="order in filteredOrders"
              :key="order.order_id"
              class="overflow-hidden rounded-[20rpx] bg-white p-[32rpx] shadow-sm"
            >
              <!-- 头部：订单状态和订单号 -->
              <view class="mb-[20rpx] flex items-center justify-between">
                <view
                  class="flex items-center rounded-full px-[16rpx] py-[6rpx]"
                  :class="getStatusStyle(order.status)"
                >
                  <text class="text-[22rpx] font-medium">
                    {{ order.statusText }}
                  </text>
                </view>
                <text class="text-[22rpx] text-gray-400">
                  {{ order.order_no }}
                </text>
              </view>

              <!-- 主体：车辆信息 -->
              <view class="mb-[20rpx] flex">
                <view class="h-[120rpx] w-[160rpx] flex-shrink-0">
                  <image
                    :src="order.vehicle.image_url"
                    mode="aspectFill"
                    class="h-full w-full rounded-[12rpx]"
                  />
                </view>
                <view class="ml-[24rpx] min-w-0 flex flex-1 flex-col justify-center">
                  <text class="truncate text-[28rpx] text-black font-bold">
                    {{ order.vehicle.name }}
                  </text>
                  <view class="mt-[8rpx] flex items-center gap-x-[16rpx] text-[22rpx] text-gray-600">
                    <text class="rounded-[6rpx] bg-blue-50 px-[8rpx] py-[2rpx] text-[20rpx] text-blue-700 font-medium">
                      {{ order.vehicle.license_plate }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle.seats }}座 {{ order.vehicle.car_type }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle.energy_type }}
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                    <text class="truncate text-[20rpx] text-gray-600">
                      {{ order.vehicle.rating }}({{ order.vehicle.rating_count }})
                    </text>
                  </view>
                </view>
                <!-- 金额信息 -->
                <view class="ml-[16rpx] min-w-[80rpx] flex flex-col items-end justify-between text-right">
                  <text class="text-[32rpx] text-purple-600 font-bold">
                    ¥{{ order.final_amount }}
                  </text>
                  <text class="mt-[4rpx] block text-[22rpx] text-gray-400">
                    {{ order.rental_days }}天
                  </text>
                </view>
              </view>

              <!-- 用车时间和地点 -->
              <view class="mb-[20rpx] rounded-[14rpx] bg-gray-50 p-[20rpx]">
                <view class="mb-[10rpx] flex items-center">
                  <text class="i-material-symbols-schedule mr-[8rpx] text-[22rpx] text-purple-600" />
                  <text class="text-[24rpx] text-black font-medium">
                    用车时间
                  </text>
                </view>
                <text class="mb-[10rpx] block text-[22rpx] text-gray-700">
                  {{ formatDateTime(order.start_time) }} - {{ formatDateTime(order.end_time) }}
                </text>

                <!-- 取车方式分支展示 -->
                <template v-if="order.pickup_method === 'self'">
                  <view class="flex items-center">
                    <text class="i-material-symbols-location-on mr-[8rpx] text-[22rpx] text-purple-600" />
                    <text class="text-[24rpx] text-black font-medium">
                      取车地点
                    </text>
                  </view>
                  <text class="mt-[6rpx] block truncate text-[22rpx] text-gray-700">
                    {{ order.pickup_location }}
                  </text>
                </template>
                <template v-else>
                  <view class="flex items-center justify-between">
                    <view class="flex items-center">
                      <text class="i-material-symbols-local-shipping mr-[8rpx] text-[22rpx] text-blue-600" />
                      <text class="text-[24rpx] text-black font-medium">
                        送车地址
                      </text>
                    </view>
                    <view class="flex items-center text-[20rpx] text-gray-500">
                      <text v-if="order.delivery_distance">
                        {{ order.delivery_distance }}km
                      </text>
                      <text v-if="order.delivery_fee" class="ml-[8rpx]">
                        服务费¥{{ order.delivery_fee }}
                      </text>
                    </view>
                  </view>
                  <text class="mt-[6rpx] block truncate text-[22rpx] text-gray-700">
                    {{ order.delivery_address }}
                  </text>
                </template>
              </view>

              <!-- 取车码/还车码区域 -->
              <view v-if="order.pickup_code || order.return_code" class="mb-[20rpx] flex items-center rounded-[14rpx] bg-purple-50 p-[20rpx]">
                <text class="i-material-symbols-qr-code-scanner mr-[16rpx] text-[40rpx] text-purple-600" />
                <view class="flex-1">
                  <text class="text-[24rpx] text-purple-800 font-medium">
                    {{ order.pickup_code ? '取车码' : '还车码' }}
                  </text>
                  <text class="block text-[36rpx] text-purple-600 font-bold tracking-wider">
                    {{ order.pickup_code || order.return_code }}
                  </text>
                </view>
                <view v-if="order.pickup_deadline" class="ml-[16rpx] flex flex-col items-end text-right">
                  <text class="text-[18rpx]" :class="isExpired(order.pickup_deadline) ? 'text-red-500' : 'text-gray-500'">
                    截止时间
                  </text>
                  <text class="text-[20rpx] font-medium" :class="isExpired(order.pickup_deadline) ? 'text-red-500' : 'text-gray-700'">
                    {{ formatDateTime(order.pickup_deadline) }}
                  </text>
                  <text v-if="isExpired(order.pickup_deadline)" class="mt-[2rpx] text-[16rpx] text-red-500">
                    已超时
                  </text>
                </view>
              </view>

              <!-- 动态操作按钮 -->
              <view class="flex space-x-[16rpx]">
                <!-- 已支付状态：等待取车 -->
                <template v-if="order.status === 'paid'">
                  <view
                    class="flex-1 rounded-full bg-purple-600 py-[20rpx] text-center text-[26rpx] text-white font-medium transition-colors duration-200 active:bg-purple-700"
                    @tap="startPickupVerification(order)"
                  >
                    扫码取车
                  </view>
                  <view
                    class="flex-1 rounded-full bg-gray-100 py-[20rpx] text-center text-[26rpx] text-gray-600 font-medium transition-colors duration-200 active:bg-gray-200"
                    @tap="contactUser(order.user.phone)"
                  >
                    联系用户
                  </view>
                </template>

                <!-- 已取车状态：使用中 -->
                <template v-else-if="order.status === 'picked'">
                  <view
                    class="flex-1 rounded-full bg-green-600 py-[20rpx] text-center text-[26rpx] text-white font-medium transition-colors duration-200 active:bg-green-700"
                    @tap="confirmReturn(order)"
                  >
                    确认还车
                  </view>
                  <view
                    class="flex-1 rounded-full bg-gray-100 py-[20rpx] text-center text-[26rpx] text-gray-600 font-medium transition-colors duration-200 active:bg-gray-200"
                    @tap="contactUser(order.user.phone)"
                  >
                    联系用户
                  </view>
                </template>

                <!-- 其他状态：默认操作 -->
                <template v-else>
                  <view
                    class="flex-1 rounded-full bg-gray-100 py-[20rpx] text-center text-[26rpx] text-gray-600 font-medium transition-colors duration-200 active:bg-gray-200"
                    @tap="contactUser(order.user.phone)"
                  >
                    联系用户
                  </view>
                  <view
                    class="flex-1 border border-purple-200 rounded-full bg-purple-50 py-[20rpx] text-center text-[26rpx] text-purple-600 font-medium transition-colors duration-200 active:bg-purple-100"
                    @tap="goToTimeline(order.order_no)"
                  >
                    时间线
                  </view>
                  <view
                    class="flex-1 rounded-full bg-purple-600 py-[20rpx] text-center text-[26rpx] text-white font-medium transition-colors duration-200 active:bg-purple-700"
                    @tap="goToOrderDetail(order.order_no)"
                  >
                    查看详情
                  </view>
                </template>
              </view>
            </view>

            <!-- 占位 -->
            <view class="h-[1rpx]" />
          </view>
          <!-- 空状态 -->
          <view v-else class="flex flex-col items-center justify-center py-[120rpx] text-gray-400">
            <text class="i-material-symbols-inbox mb-[16rpx] text-[64rpx]" />
            <text class="mb-[8rpx] text-[28rpx] font-medium">
              暂无订单
            </text>
            <text class="text-[24rpx]">
              当前筛选条件下没有订单记录
            </text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 照片提交弹窗 -->
    <BottomDrawer
      v-model:visible="photoDrawerVisible"
      :title="currentAction === 'pickup' ? '取车验证' : '还车验证'"
      height="600rpx"
    >
      <view class="pt-[30rpx]">
        <!-- 订单信息 -->
        <view class="mb-[30rpx] rounded-[16rpx] bg-gray-50 p-[20rpx]">
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              订单号
            </text>
            <text class="text-[24rpx] font-medium">
              {{ currentOrder?.order_no }}
            </text>
          </view>
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              用户
            </text>
            <text class="text-[24rpx] font-medium">
              {{ currentOrder?.user.name }}
            </text>
          </view>
        </view>

        <!-- 车辆信息卡片 -->
        <view class="mb-[30rpx] border border-blue-100 rounded-[16rpx] bg-blue-50 p-[20rpx]">
          <view class="mb-[12rpx] flex items-center">
            <text class="i-material-symbols-directions-car mr-[8rpx] text-[24rpx] text-blue-600" />
            <text class="text-[26rpx] text-blue-800 font-semibold">
              车辆信息
            </text>
          </view>

          <!-- 车牌号突出显示 -->
          <view class="mb-[12rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              车牌号码
            </text>
            <text class="rounded-[8rpx] bg-blue-600 px-[12rpx] py-[4rpx] text-[24rpx] text-white font-bold tracking-wider">
              {{ currentOrder?.vehicle.license_plate }}
            </text>
          </view>

          <!-- 车辆基本信息 -->
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              车辆名称
            </text>
            <text class="text-[24rpx] text-gray-800 font-medium">
              {{ currentOrder?.vehicle.name }}
            </text>
          </view>
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              品牌车型
            </text>
            <text class="text-[24rpx] text-gray-800 font-medium">
              {{ currentOrder?.vehicle.brand }} {{ currentOrder?.vehicle.model }}
            </text>
          </view>
          <view class="flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              车辆配置
            </text>
            <text class="text-[24rpx] text-gray-800 font-medium">
              {{ currentOrder?.vehicle.seats }}座 {{ currentOrder?.vehicle.car_type }} {{ currentOrder?.vehicle.energy_type }}
            </text>
          </view>
        </view>

        <!-- 拍照说明 -->
        <view class="mb-[20rpx]">
          <text class="text-[26rpx] font-semibold">
            {{ currentAction === 'pickup' ? '取车状态拍照' : '还车状态拍照' }}
          </text>
          <text class="mt-[8rpx] block text-[22rpx] text-gray-600">
            请拍摄车辆{{ currentAction === 'pickup' ? '交付前' : '归还后' }}的状态，包括外观、内饰等关键部位
          </text>
        </view>

        <!-- 照片上传区域 -->
        <view class="mb-[30rpx]">
          <view class="grid grid-cols-3 gap-[16rpx]">
            <!-- 已上传照片 -->
            <view
              v-for="(photo, index) in uploadedPhotos"
              :key="index"
              class="relative aspect-square"
            >
              <image
                :src="photo"
                mode="aspectFill"
                class="h-full w-full rounded-[12rpx]"
              />
              <view
                class="absolute h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                @tap="removePhoto(index)"
              >
                <text class="i-material-symbols-close text-[18rpx] text-white" />
              </view>
            </view>

            <!-- 添加照片按钮 -->
            <view
              v-if="uploadedPhotos.length < 4"
              class="aspect-square flex items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed"
              @tap="chooseImage"
            >
              <view class="flex flex-col items-center">
                <text class="i-material-symbols-add-a-photo mb-[8rpx] block text-[32rpx] text-gray-400" />
                <text class="text-[20rpx] text-gray-400">
                  添加照片
                </text>
              </view>
            </view>
          </view>

          <text class="mt-[12rpx] block text-[20rpx] text-gray-500">
            最多上传4张照片，建议拍摄清晰度较高的照片
          </text>
        </view>

        <!-- 提交按钮 -->
        <view class="flex space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-300 rounded-full bg-white py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
            @tap="photoDrawerVisible = false"
          >
            取消
          </view>
          <view
            class="flex-1 rounded-full py-[24rpx] text-center text-[26rpx] text-white font-medium"
            :class="uploadedPhotos.length > 0 ? 'bg-purple-600' : 'bg-gray-300'"
            @tap="submitVerification"
          >
            {{ currentAction === 'pickup' ? '确认取车' : '确认还车' }}
          </view>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>
