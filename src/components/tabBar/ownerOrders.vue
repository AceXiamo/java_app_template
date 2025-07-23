<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { useOwnerStore } from '@/store/owner'
import { useUserStore } from '@/store/user'
import { getOwnerOrders, type OwnerOrderQueryParams, type OwnerOrder } from '@/api/owner-orders'

// 使用 owner store
const ownerStore = useOwnerStore()

// 使用 user store
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

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

// 订单列表 - 从API获取
const orderList = ref<OwnerOrder[]>([])
const loading = ref(false)

// 页面初始化时加载数据
onMounted(async () => {
  await loadOrders()
})

// 加载订单数据
async function loadOrders() {
  try {
    loading.value = true
    const ownerId = user.value?.userId
    if (!ownerId) 
      return

    const params: OwnerOrderQueryParams = {
      ownerId,
      status: currentFilter.value === 'all' ? undefined : getApiStatus(currentFilter.value),
      pageNum: 1,
      pageSize: 50,
    }

    const response = await getOwnerOrders(params)
    if (response.code === 200 && response.data) {
      orderList.value = response.data.records || []
    }
  }
  catch (error) {
    console.error('加载订单数据失败', error)
    uni.showToast({
      title: '加载订单失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 将前端状态映射到API状态
function getApiStatus(filterKey: string): string | undefined {
  const statusMapping: Record<string, string> = {
    ongoing: 'paid,picked', // 进行中包含已支付和已取车
    completed: 'completed', // 已完成
    cancelled: 'cancelled', // 已取消
  }
  return statusMapping[filterKey]
}

// 过滤后的订单 - 现在直接从API获取已过滤的数据
const filteredOrders = computed(() => orderList.value)

// 切换标签时重新加载数据
async function switchTab(tabKey: string) {
  currentFilter.value = tabKey
  await loadOrders()
}

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
    const order = orderList.value.find(o => o.orderId === currentOrder.value.orderId)
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
    <HeadBar bg-color="transparent">
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
              :key="order.orderId"
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
                  {{ order.orderNo }}
                </text>
              </view>

              <!-- 主体：车辆信息 -->
              <view class="mb-[20rpx] flex">
                <view class="h-[120rpx] w-[160rpx] flex-shrink-0">
                  <image
                    :src="order.vehicle?.imageUrl"
                    mode="aspectFill"
                    class="h-full w-full rounded-[12rpx]"
                  />
                </view>
                <view class="ml-[24rpx] min-w-0 flex flex-1 flex-col justify-center">
                  <text class="truncate text-[28rpx] text-black font-bold">
                    {{ order.vehicle?.name }}
                  </text>
                  <view class="mt-[8rpx] flex items-center gap-x-[16rpx] text-[22rpx] text-gray-600">
                    <text class="rounded-[6rpx] bg-blue-50 px-[8rpx] py-[2rpx] text-[20rpx] text-blue-700 font-medium">
                      {{ order.vehicle?.licensePlate }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle.seats }}座 {{ order.vehicle?.carType }}
                    </text>
                    <text class="truncate">
                      {{ order.vehicle?.energyType }}
                    </text>
                  </view>
                  <view class="mt-[8rpx] flex items-center">
                    <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                    <text class="truncate text-[20rpx] text-gray-600">
                      {{ order.vehicle.rating }}({{ order.vehicle?.ratingCount }})
                    </text>
                  </view>
                </view>
                <!-- 金额信息 -->
                <view class="ml-[16rpx] min-w-[80rpx] flex flex-col items-end justify-between text-right">
                  <text class="text-[32rpx] text-purple-600 font-bold">
                    ¥{{ order.finalAmount }}
                  </text>
                  <text class="mt-[4rpx] block text-[22rpx] text-gray-400">
                    {{ order.rentalDays }}天
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
                  {{ formatDateTime(order.startTime) }} - {{ formatDateTime(order.endTime) }}
                </text>

                <!-- 取车方式分支展示 -->
                <template v-if="order.pickupMethod === 'self'">
                  <view class="flex items-center">
                    <text class="i-material-symbols-location-on mr-[8rpx] text-[22rpx] text-purple-600" />
                    <text class="text-[24rpx] text-black font-medium">
                      取车地点
                    </text>
                  </view>
                  <text class="mt-[6rpx] block truncate text-[22rpx] text-gray-700">
                    {{ order.pickupLocation }}
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
                      <text v-if="order.deliveryDistance">
                        {{ order.deliveryDistance }}km
                      </text>
                      <text v-if="order.deliveryFee" class="ml-[8rpx]">
                        服务费¥{{ order.deliveryFee }}
                      </text>
                    </view>
                  </view>
                  <text class="mt-[6rpx] block truncate text-[22rpx] text-gray-700">
                    {{ order.deliveryAddress }}
                  </text>
                </template>
              </view>

              <!-- 取车码/还车码区域 -->
              <view v-if="order.pickupCode || order.returnCode" class="mb-[20rpx] flex items-center rounded-[14rpx] bg-purple-50 p-[20rpx]">
                <text class="i-material-symbols-qr-code-scanner mr-[16rpx] text-[40rpx] text-purple-600" />
                <view class="flex-1">
                  <text class="text-[24rpx] text-purple-800 font-medium">
                    {{ order.pickupCode ? '取车码' : '还车码' }}
                  </text>
                  <text class="block text-[36rpx] text-purple-600 font-bold tracking-wider">
                    {{ order.pickupCode || order.returnCode }}
                  </text>
                </view>
                <view v-if="order.pickupDeadline" class="ml-[16rpx] flex flex-col items-end text-right">
                  <text class="text-[18rpx]" :class="isExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-500'">
                    截止时间
                  </text>
                  <text class="text-[20rpx] font-medium" :class="isExpired(order.pickupDeadline) ? 'text-red-500' : 'text-gray-700'">
                    {{ formatDateTime(order.pickupDeadline) }}
                  </text>
                  <text v-if="isExpired(order.pickupDeadline)" class="mt-[2rpx] text-[16rpx] text-red-500">
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
                    @tap="goToTimeline(order.orderNo)"
                  >
                    时间线
                  </view>
                  <view
                    class="flex-1 rounded-full bg-purple-600 py-[20rpx] text-center text-[26rpx] text-white font-medium transition-colors duration-200 active:bg-purple-700"
                    @tap="goToOrderDetail(order.orderNo)"
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
