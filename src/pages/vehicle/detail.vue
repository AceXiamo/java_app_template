<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
// import BottomDrawer from '@/components/BottomDrawer.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import { getSimilarVehicles, getVehicleDetail, getVehicleReviews } from '@/api/vehicle'
import type { VehicleDetail } from '@/api/vehicle'
import { getJumpData, setJumpData } from '@/utils/index'
import PageVehicleHead from '@/components/page/vehicle/Head.vue'

// 页面参数
const vehicleId = ref('')

// 车辆详情数据
const vehicleDetail = ref<VehicleDetail | null>(null)

// 页面状态
const loading = ref(false)
const currentImageIndex = ref(0)
const showImageViewer = ref(false)

// 预订参数
const bookingParams = ref({
  startTime: '',
  endTime: '',
  rentalDays: 1,
})

// 时间选择器状态
const showDatePicker = ref(false)
const timeForm = ref({
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
})

// 评价列表
const reviews = ref<any[]>([])
const reviewsTotal = ref(0)
// const showAllReviews = ref(false)

// 相似车辆
const similarVehicles = ref<any[]>([])

// 页面加载
onLoad((options: any) => {
  vehicleId.value = options.id || ''

  // 获取从其他页面传递的时间参数
  const jumpData = getJumpData('vehicleDetailParams')
  if (jumpData) {
    if (jumpData.startTime && jumpData.endTime) {
      bookingParams.value.startTime = jumpData.startTime
      bookingParams.value.endTime = jumpData.endTime

      // 解析时间参数到timeForm
      const startDateTime = new Date(jumpData.startTime)
      const endDateTime = new Date(jumpData.endTime)

      timeForm.value.startDate = startDateTime.toISOString().split('T')[0]
      timeForm.value.endDate = endDateTime.toISOString().split('T')[0]
      timeForm.value.startTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`
      timeForm.value.endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`

      // 计算租赁天数
      const timeDiff = endDateTime.getTime() - startDateTime.getTime()
      bookingParams.value.rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
    }
  }

  loadVehicleDetail()
  loadSimilarVehicles()
  loadReviews()
})

// 加载车辆详情
async function loadVehicleDetail() {
  if (!vehicleId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'error',
    })
    return
  }

  try {
    loading.value = true
    const response = await getVehicleDetail(Number(vehicleId.value))

    if (response.code === 200 && response.data) {
      vehicleDetail.value = response.data
    }
    else {
      throw new Error(response.msg || '获取车辆详情失败')
    }
  }
  catch (error) {
    console.error('加载车辆详情失败:', error)
    vehicleDetail.value = null
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 加载相似车辆
async function loadSimilarVehicles() {
  if (!vehicleId.value) {
    return
  }

  try {
    const response = await getSimilarVehicles(Number(vehicleId.value), 2)
    if (response.code === 200 && response.data) {
      similarVehicles.value = response.data.map((vehicle: any) => ({
        vehicleId: vehicle.vehicleId,
        name: vehicle.name,
        imageUrl: vehicle.imageUrl,
        dailyPrice: vehicle.dailyPrice,
        rating: vehicle.rating,
        distance: vehicle.distance,
      }))
    }
    else {
      similarVehicles.value = []
    }
  }
  catch (error) {
    console.error('加载相似车辆失败:', error)
    similarVehicles.value = []
  }
}

// 加载评价
async function loadReviews() {
  if (!vehicleId.value) {
    return
  }

  try {
    const response = await getVehicleReviews(Number(vehicleId.value), 1, 5)

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        reviews.value = response.data
        reviewsTotal.value = response.data.length
      }
      else if (response.data && typeof response.data === 'object' && 'records' in response.data) {
        reviews.value = (response.data as any).records || []
        reviewsTotal.value = (response.data as any).total || 0
      }
    }
    else {
      reviews.value = []
      reviewsTotal.value = 0
    }
  }
  catch (error) {
    console.error('加载评价失败:', error)
    reviews.value = []
    reviewsTotal.value = 0
  }
}

// 计算月租折扣
const monthlyDiscount = computed(() => {
  if (!vehicleDetail.value?.monthlyPrice || vehicleDetail.value.monthlyPrice <= 0) {
    return null
  }

  const monthlyByDaily = vehicleDetail.value.dailyPrice * 30
  const discount = vehicleDetail.value.monthlyPrice / monthlyByDaily

  if (discount >= 0.95) {
    return null
  }

  const discountPercent = Math.round(discount * 10)
  const savings = monthlyByDaily - vehicleDetail.value.monthlyPrice

  return {
    discountPercent,
    savings,
    originalPrice: monthlyByDaily,
    monthlyPrice: vehicleDetail.value.monthlyPrice,
  }
})

// 格式化距离
function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

// 查看大图
function viewImage(index: number) {
  currentImageIndex.value = index
  showImageViewer.value = true
}

// 联系车主
function contactOwner() {
  uni.showModal({
    title: '联系车主',
    content: '是否要拨打车主电话？',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '13800138000',
        })
      }
    },
  })
}

// 收藏车辆
function toggleFavorite() {
  // TODO: 实现收藏功能
  uni.showToast({
    title: '收藏成功',
    icon: 'success',
  })
}

// 分享车辆
function shareVehicle() {
  if (!vehicleDetail.value)
    return

  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: '',
    title: vehicleDetail.value.name,
    summary: `日租¥${vehicleDetail.value.dailyPrice}起`,
    imageUrl: vehicleDetail.value.imageUrl,
  })
}

// 立即预订
function bookNow() {
  if (!bookingParams.value.startTime || !bookingParams.value.endTime) {
    showDatePicker.value = true
    return
  }

  // 使用 setJumpData 传递预订参数
  const bookingData = {
    vehicleId: vehicleId.value,
    startTime: bookingParams.value.startTime,
    endTime: bookingParams.value.endTime,
  }

  setJumpData('bookingParams', bookingData)

  uni.navigateTo({
    url: '/pages/booking/index',
  })
}

// 查看相似车辆详情
function viewSimilarVehicle(vehicle: any) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.vehicleId}`,
  })
}

// 查看全部评价
function viewAllReviews() {
  uni.navigateTo({
    url: `/pages/vehicle/reviews?vehicleId=${vehicleId.value}&vehicleName=${encodeURIComponent(vehicleDetail.value?.name || '')}`,
  })
}

// 格式化时间
function formatDate(dateString: string) {
  return dayjs(dateString).format('YYYY-MM-DD')
}

// 打开地图导航
function openNavigation() {
  if (!vehicleDetail.value?.location) {
    uni.showToast({
      title: '位置信息不可用',
      icon: 'none',
    })
    return
  }

  const location = vehicleDetail.value.location
  // 检查是否有经纬度信息
  if (!location.latitude || !location.longitude) {
    uni.showToast({
      title: '位置信息不完整',
      icon: 'none',
    })
    return
  }

  // 使用 uni.openLocation 打开地图导航
  uni.openLocation({
    latitude: location.latitude,
    longitude: location.longitude,
    name: vehicleDetail.value.name,
    address: location.address,
    scale: 18,
    success: () => {
      console.log('打开地图成功')
    },
    fail: (error) => {
      console.error('打开地图失败:', error)
      uni.showToast({
        title: '打开地图失败',
        icon: 'none',
      })
    },
  })
}

// 处理时间选择确认
function handleDateRangeConfirm(data: {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  startDateTime: string
  endDateTime: string
}) {
  timeForm.value.startDate = data.startDate
  timeForm.value.endDate = data.endDate
  timeForm.value.startTime = data.startTime
  timeForm.value.endTime = data.endTime

  // 更新预订信息
  bookingParams.value.startTime = data.startDateTime
  bookingParams.value.endTime = data.endDateTime

  // 重新计算租赁天数
  const startDateTime = new Date(data.startDateTime)
  const endDateTime = new Date(data.endDateTime)
  const timeDiff = endDateTime.getTime() - startDateTime.getTime()
  bookingParams.value.rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // 直接进入预订页面
  bookNow()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageVehicleHead
      @favorite="toggleFavorite"
      @share="shareVehicle"
    />

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-[200rpx]">
        <text class="text-[28rpx] text-gray-500">
          加载中...
        </text>
      </view>

      <!-- 车辆详情内容 -->
      <view v-else-if="vehicleDetail">
        <!-- 车辆图片轮播 -->
        <view class="relative">
          <swiper
            class="h-[400rpx]"
            indicator-dots
            indicator-color="rgba(255,255,255,0.5)"
            indicator-active-color="#fff"
            @change="(e: any) => currentImageIndex = e.detail.current"
          >
            <swiper-item v-for="(image, index) in vehicleDetail.images" :key="index">
              <image
                :src="image"
                mode="aspectFill"
                class="h-full w-full"
                @tap="viewImage(index)"
              />
            </swiper-item>
          </swiper>

          <!-- 图片指示器 -->
          <view class="absolute bottom-[24rpx] right-[24rpx] rounded-[20rpx] bg-black bg-opacity-50 px-[16rpx] py-[8rpx]">
            <text class="text-[24rpx] text-white">
              {{ currentImageIndex + 1 }}/{{ vehicleDetail.images.length }}
            </text>
          </view>
        </view>

        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 基本信息 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx]">
              <text class="block text-[36rpx] text-black font-bold leading-[48rpx]">
                {{ vehicleDetail.name }}
              </text>
              <view class="mt-[8rpx] flex items-center text-[24rpx] text-gray-600 space-x-[16rpx]">
                <text>{{ vehicleDetail.licensePlate }}</text>
                <text>{{ vehicleDetail.seats }}座</text>
                <text>{{ vehicleDetail.energyType }}</text>
              </view>
            </view>

            <!-- 价格信息 -->
            <view class="mb-[24rpx]">
              <!-- 超值月租车辆 - 优先展示月租价格 -->
              <template v-if="vehicleDetail.isMonthlyRental && vehicleDetail.monthlyPrice">
                <view class="flex items-baseline">
                  <text class="text-[40rpx] text-purple-600 font-bold">
                    ¥{{ vehicleDetail.monthlyPrice }}
                  </text>
                  <text class="ml-[8rpx] text-[24rpx] text-gray-500">
                    /月
                  </text>
                </view>

                <!-- 显示月租折扣信息 -->
                <view v-if="monthlyDiscount" class="mt-[8rpx] flex items-center">
                  <text class="mr-[12rpx] text-[24rpx] text-gray-400 line-through">
                    ¥{{ monthlyDiscount.originalPrice.toFixed(0) }}
                  </text>
                  <text class="rounded-full bg-red-50 px-[12rpx] py-[4rpx] text-[22rpx] text-red-500 font-medium">
                    {{ monthlyDiscount.discountPercent }}折
                  </text>
                  <text class="ml-[12rpx] text-[20rpx] text-green-600">
                    省{{ monthlyDiscount.savings.toFixed(0) }}元
                  </text>
                </view>

                <!-- 显示日租参考价格 -->
                <view class="mt-[8rpx]">
                  <text class="text-[22rpx] text-gray-500">
                    日租参考价：¥{{ vehicleDetail.dailyPrice }}/天
                  </text>
                </view>
              </template>

              <!-- 普通日租车辆 -->
              <template v-else>
                <view class="flex items-baseline">
                  <text class="text-[40rpx] text-purple-600 font-bold">
                    ¥{{ vehicleDetail.dailyPrice }}
                  </text>
                  <text class="ml-[8rpx] text-[24rpx] text-gray-500">
                    /天
                  </text>
                </view>

                <!-- 如果普通车辆也有月租价格，可以显示月租优惠 -->
                <view v-if="monthlyDiscount" class="mt-[8rpx] flex items-center">
                  <text class="mr-[12rpx] text-[24rpx] text-gray-400 line-through">
                    ¥{{ (vehicleDetail.dailyPrice * 30).toFixed(0) }}
                  </text>
                  <text class="rounded-full bg-red-50 px-[12rpx] py-[4rpx] text-[22rpx] text-red-500 font-medium">
                    月租{{ monthlyDiscount.discountPercent }}折
                  </text>
                  <text class="ml-[12rpx] text-[20rpx] text-green-600">
                    省{{ monthlyDiscount.savings.toFixed(0) }}元
                  </text>
                </view>
              </template>
            </view>

            <!-- 车辆特性 -->
            <view class="grid grid-cols-4 gap-[24rpx]">
              <view class="flex flex-col items-center">
                <text class="i-material-symbols-airline-seat-recline-normal block text-[32rpx] text-purple-600" />
                <text class="mt-[8rpx] block text-[22rpx] text-gray-600">
                  {{ vehicleDetail.seats }}座
                </text>
              </view>
              <view class="flex flex-col items-center">
                <text class="i-material-symbols-local-gas-station block text-[32rpx] text-purple-600" />
                <text class="mt-[8rpx] block text-[22rpx] text-gray-600">
                  {{ vehicleDetail.energyType }}
                </text>
              </view>
              <view v-if="vehicleDetail.rangeKm" class="flex flex-col items-center">
                <text class="i-material-symbols-battery-charging-full block text-[32rpx] text-purple-600" />
                <text class="mt-[8rpx] block text-[22rpx] text-gray-600">
                  {{ vehicleDetail.rangeKm }}km
                </text>
              </view>
              <view class="flex flex-col items-center">
                <text class="i-material-symbols-star block text-[32rpx] text-purple-600" />
                <text class="mt-[8rpx] block text-[22rpx] text-gray-600">
                  {{ vehicleDetail.rating }}分
                </text>
              </view>
            </view>
          </view>

          <!-- 运营信息 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-business mr-[12rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                运营信息
              </text>
            </view>

            <view class="flex items-center justify-between">
              <view class="flex items-center">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-full bg-purple-100">
                  <text class="i-material-symbols-corporate-fare text-[40rpx] text-purple-600" />
                </view>
                <view class="ml-[24rpx]">
                  <text class="block text-[26rpx] text-black font-medium">
                    {{ vehicleDetail.operationType === 'platform' ? '平台自营' : '车主自运营' }}
                  </text>
                  <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                    {{ vehicleDetail.operationType === 'platform' ? '专业运营，服务保障' : '车主直租，沟通便利' }}
                  </text>
                </view>
              </view>
              <view
                class="border border-purple-600 rounded-[20rpx] px-[24rpx] py-[12rpx] text-center text-[24rpx] text-purple-600 transition-colors active:bg-purple-50"
                @tap="contactOwner"
              >
                {{ vehicleDetail.operationType === 'platform' ? '联系客服' : '联系车主' }}
              </view>
            </view>
          </view>

          <!-- 车辆位置 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-location-on mr-[12rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                车辆位置
              </text>
            </view>

            <view class="flex items-center justify-between" @tap="openNavigation">
              <view class="flex-1">
                <text class="block text-[26rpx] text-black">
                  {{ vehicleDetail.location.address }}
                </text>
                <text v-if="vehicleDetail.distance" class="mt-[4rpx] block text-[22rpx] text-gray-600">
                  距离您 {{ formatDistance(vehicleDetail.distance) }}
                </text>
              </view>
              <text class="i-material-symbols-chevron-right text-[28rpx] text-gray-400" />
            </view>
          </view>

          <!-- 送车服务 -->
          <view v-if="vehicleDetail.deliveryEnabled" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-local-shipping mr-[12rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                送车服务
              </text>
            </view>

            <view>
              <text class="block text-[26rpx] text-black">
                支持送车上门
              </text>
              <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                {{ vehicleDetail.deliveryFreeDistance }}公里内¥{{ vehicleDetail.deliveryBaseFee }}，超出¥{{ vehicleDetail.deliveryPricePerKm }}/公里
              </text>
              <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
                最远送车距离：{{ vehicleDetail.maxDeliveryDistance }}公里
              </text>
            </view>
          </view>

          <!-- 用户评价 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center justify-between">
              <view class="flex items-center">
                <text class="i-material-symbols-reviews mr-[12rpx] text-[28rpx] text-purple-600" />
                <text class="text-[28rpx] text-black font-semibold">
                  用户评价
                </text>
                <text class="ml-[12rpx] text-[24rpx] text-gray-600">
                  ({{ reviewsTotal }})
                </text>
              </view>
              <text
                v-if="reviewsTotal > 5"
                class="text-[24rpx] text-purple-600"
                @tap="viewAllReviews"
              >
                查看全部
              </text>
            </view>

            <!-- 评价列表 -->
            <view v-if="reviews.length > 0" class="space-y-[24rpx]">
              <view
                v-for="review in reviews.slice(0, 5)"
                :key="review.reviewId"
                class="border-b border-gray-100 pb-[24rpx] last:border-b-0 last:pb-0"
              >
                <view class="mb-[12rpx] flex items-center">
                  <image
                    :src="review.userAvatar || '/static/images/default-avatar.png'"
                    class="h-[60rpx] w-[60rpx] rounded-full"
                  />
                  <view class="ml-[16rpx] flex-1">
                    <text class="block text-[24rpx] text-black font-medium">
                      {{ review.userName || '匿名用户' }}
                    </text>
                    <view class="mt-[4rpx] flex items-center">
                      <view class="mr-[12rpx] flex">
                        <text
                          v-for="i in 5"
                          :key="i"
                          class="i-material-symbols-star text-[20rpx]"
                          :class="i <= review.rating ? 'text-yellow-500' : 'text-gray-300'"
                        />
                      </view>
                      <text class="text-[20rpx] text-gray-500">
                        {{ formatDate(review.createTime) }}
                      </text>
                    </view>
                  </view>
                </view>
                <text class="text-[24rpx] text-gray-700 leading-[36rpx]">
                  {{ review.content }}
                </text>
              </view>
            </view>
            <!-- 暂无评价状态 -->
            <view v-else class="flex flex-col items-center py-[60rpx]">
              <text class="i-lets-icons-chat-plus-duotone text-[80rpx] text-slate-400" />
              <text class="mt-[16rpx] text-[24rpx] text-gray-500">
                暂无评价
              </text>
              <text class="mt-[8rpx] text-[20rpx] text-gray-400">
                快来成为第一个评价的用户吧~
              </text>
            </view>
          </view>

          <!-- 相似车辆推荐 -->
          <view v-if="similarVehicles.length > 0" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-recommend mr-[12rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                相似推荐
              </text>
            </view>

            <view class="space-y-[16rpx]">
              <view
                v-for="vehicle in similarVehicles"
                :key="vehicle.vehicleId"
                class="flex items-center rounded-[16rpx] bg-gray-50 p-[16rpx]"
                @tap="viewSimilarVehicle(vehicle)"
              >
                <image
                  :src="vehicle.imageUrl"
                  mode="aspectFill"
                  class="h-[80rpx] w-[120rpx] flex-shrink-0 rounded-[8rpx]"
                />
                <view class="ml-[16rpx] flex-1">
                  <text class="block text-[24rpx] text-black font-medium">
                    {{ vehicle.name }}
                  </text>
                  <view class="mt-[4rpx] flex items-center justify-between">
                    <text class="text-[22rpx] text-purple-600 font-medium">
                      ¥{{ vehicle.dailyPrice }}/天
                    </text>
                    <text class="text-[20rpx] text-gray-500">
                      {{ formatDistance(vehicle.distance) }}
                    </text>
                  </view>
                </view>
                <text class="i-material-symbols-chevron-right ml-[12rpx] text-[24rpx] text-gray-400" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 错误状态 -->
      <view v-else class="flex flex-col items-center justify-center py-[200rpx]">
        <text class="i-material-symbols-error text-[80rpx] text-gray-300" />
        <text class="mt-[24rpx] text-[28rpx] text-gray-500">
          车辆信息加载失败
        </text>
        <view
          class="mt-[32rpx] rounded-[20rpx] bg-purple-600 px-[32rpx] py-[16rpx] text-center text-[24rpx] text-white transition-colors active:bg-purple-700"
          @tap="loadVehicleDetail"
        >
          重新加载
        </view>
      </view>
    </scroll-view>

    <!-- 底部预订按钮 -->
    <view v-if="vehicleDetail" class="border-t border-gray-100 bg-white p-[24rpx] pb-[40rpx]">
      <view class="flex items-center">
        <view class="flex-1">
          <!-- 超值月租车辆 -->
          <template v-if="vehicleDetail.isMonthlyRental && vehicleDetail.monthlyPrice">
            <text class="text-[24rpx] text-gray-500">
              月租价格
            </text>
            <view class="flex items-baseline">
              <text class="text-[32rpx] text-purple-600 font-bold">
                ¥{{ vehicleDetail.monthlyPrice }}
              </text>
              <text class="ml-[4rpx] text-[22rpx] text-gray-500">
                /月起
              </text>
            </view>
          </template>
          <!-- 普通日租车辆 -->
          <template v-else>
            <text class="text-[24rpx] text-gray-500">
              日租价格
            </text>
            <view class="flex items-baseline">
              <text class="text-[32rpx] text-purple-600 font-bold">
                ¥{{ vehicleDetail.dailyPrice }}
              </text>
              <text class="ml-[4rpx] text-[22rpx] text-gray-500">
                /天起
              </text>
            </view>
          </template>
        </view>
        <view
          class="rounded-[20rpx] bg-purple-600 px-[48rpx] py-[24rpx] text-center text-[28rpx] text-white font-medium transition-colors active:bg-purple-700"
          @tap="bookNow"
        >
          立即预订
        </view>
      </view>
    </view>

    <!-- 时间范围选择器 -->
    <DateRangePicker
      v-model:visible="showDatePicker"
      :start-date="timeForm.startDate"
      :end-date="timeForm.endDate"
      :start-time="timeForm.startTime"
      :end-time="timeForm.endTime"
      @confirm="handleDateRangeConfirm"
    />

    <!-- 图片查看器 -->
    <view
      v-if="showImageViewer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black"
      @tap="showImageViewer = false"
    >
      <swiper
        :current="currentImageIndex"
        class="h-full w-full"
        @change="(e: any) => currentImageIndex = e.detail.current"
      >
        <swiper-item v-for="(image, index) in (vehicleDetail?.images || [])" :key="index">
          <view class="h-full w-full flex items-center justify-center">
            <image
              :src="image"
              mode="aspectFit"
              class="max-h-full max-w-full"
            />
          </view>
        </swiper-item>
      </swiper>

      <!-- 关闭按钮 -->
      <view class="absolute right-[32rpx] top-[60rpx] z-10">
        <text
          class="i-material-symbols-close text-[48rpx] text-white"
          @tap.stop="showImageViewer = false"
        />
      </view>

      <!-- 图片指示器 -->
      <view class="absolute bottom-[60rpx] left-0 right-0 text-center">
        <text class="text-[28rpx] text-white">
          {{ currentImageIndex + 1 }} / {{ vehicleDetail?.images?.length || 0 }}
        </text>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
