<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageBookingHead from '@/components/page/booking/Head.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import { type Vehicle, getVehicleDetail } from '@/api/vehicle'
import { type Coupon, applyCoupon, getAvailableCoupons } from '@/api/coupon'
import { calculateBookingPrice, createBooking } from '@/api/booking'

// 页面参数
interface BookingPageParams {
  vehicleId: string
  startTime?: string
  endTime?: string
}

const pageParams = ref<BookingPageParams>({
  vehicleId: '',
})

// 车辆信息
const vehicleInfo = ref<Vehicle>({
  vehicleId: 0,
  name: '',
  brand: '',
  model: '',
  licensePlate: '',
  imageUrl: '',
  images: [] as string[],
  dailyPrice: 0,
  monthlyPrice: 0,
  seats: 5,
  energyType: '',
  carType: '',
  rating: 0,
  ratingCount: 0,
  rangeKm: 0,
  isMonthlyRental: false,
  location: {
    address: '',
    city: '',
    district: '',
    latitude: 0,
    longitude: 0,
  },
  tags: [],
  deliveryEnabled: true,
  deliveryBaseFee: 0,
  deliveryFreeDistance: 5,
  deliveryPricePerKm: 2,
  maxDeliveryDistance: 20,
  operationType: 'platform',
})

// 预订信息
const bookingInfo = ref({
  startTime: '',
  endTime: '',
  rentalDays: 1,
  pickupMethod: 'self', // self自取、delivery送车
  pickupLocation: '',
  deliveryAddress: '',
  deliveryDistance: 0,
  userLocation: {
    latitude: 0,
    longitude: 0,
    address: '',
  },
})

// 费用计算
const priceCalculation = ref({
  isMonthlyRental: false,
  basePrice: 0,
  deliveryFee: 0,
  totalAmount: 0,
  discountAmount: 0,
  finalAmount: 0,
})

// 优惠券
const selectedCoupon = ref<Coupon | null>(null)
const availableCoupons = ref<Coupon[]>([])

// 弹窗状态
const showPickupMethodDialog = ref(false)
const showLocationPicker = ref(false)
const showCouponList = ref(false)
const showTermsDialog = ref(false)
const showTimeSelector = ref(false)
const showDeliveryServices = ref(false)
const showDatePicker = ref(false)
const showMapPicker = ref(false)

// 页面状态
const loading = ref(false)
const submitLoading = ref(false)

// 用户协议同意状态
const agreedToTerms = ref(false)

// 时间表单数据
const timeForm = ref({
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
})

// 交付标准选项
const deliveryServices = ref({
  carWash: false, // 专业洗车
  detailing: false, // 深度精洗
})

// 交付标准费用
const deliveryServicePrices = {
  carWash: 30, // 专业洗车
  detailing: 80, // 深度精洗
}

// 车辆类型（用于判断是否显示增值服务）
const vehicleOperationType = computed(() => {
  // 根据车辆信息判断运营类型
  // 这里简化处理，实际应该从后端获取
  return vehicleInfo.value.operationType || 'platform' // platform: 平台自营, owner: 车主优选
})

// 获取能源类型文本
const energyTypeText = computed(() => {
  const energyMap: Record<string, string> = {
    gasoline: '汽油',
    electric: '电动',
    hybrid: '混动',
  }
  return energyMap[vehicleInfo.value.energyType] || '燃油'
})

// 获取默认交付标准说明
const defaultStandardText = computed(() => {
  const energyType = vehicleInfo.value.energyType
  if (energyType === 'electric') {
    return '满电、车身整洁、车况良好'
  }
  else {
    return '满油、车身整洁、车况良好'
  }
})

// 获取归还要求说明
const returnRequirementText = computed(() => {
  const energyType = vehicleInfo.value.energyType
  if (energyType === 'electric') {
    return '归还时请保持满电、车身整洁状态'
  }
  else {
    return '归还时请保持满油、车身整洁状态'
  }
})

// 时间选择器状态
const timeSelector = ref({
  type: 'start', // start | end
  minDate: '',
  maxDate: '',
  currentDate: '',
  currentTime: '',
})

// 地址选择器状态
const addressSelector = ref({
  searchKeyword: '',
  searchResults: [] as any[],
  recentAddresses: [] as any[],
})

// 页面加载
onLoad(async () => {
  // 使用 getJumpData 获取预订参数
  const jumpData = getJumpData('bookingParams')

  if (jumpData) {
    pageParams.value.vehicleId = jumpData.vehicleId || ''
    pageParams.value.startTime = jumpData.startTime
    pageParams.value.endTime = jumpData.endTime

    // 初始化时间数据
    if (jumpData.startTime && jumpData.endTime) {
      bookingInfo.value.startTime = jumpData.startTime
      bookingInfo.value.endTime = jumpData.endTime

      // 解析时间参数到timeForm
      const startDateTime = new Date(jumpData.startTime)
      const endDateTime = new Date(jumpData.endTime)

      timeForm.value.startDate = startDateTime.toISOString().split('T')[0]
      timeForm.value.endDate = endDateTime.toISOString().split('T')[0]
      timeForm.value.startTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`
      timeForm.value.endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`

      // 计算租赁天数
      const timeDiff = endDateTime.getTime() - startDateTime.getTime()
      bookingInfo.value.rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
    }
    else {
      // 默认时间（明天9点到后天18点）
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)

      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      dayAfterTomorrow.setHours(18, 0, 0, 0)

      bookingInfo.value.startTime = tomorrow.toISOString()
      bookingInfo.value.endTime = dayAfterTomorrow.toISOString()
      bookingInfo.value.rentalDays = 1

      timeForm.value.startDate = tomorrow.toISOString().split('T')[0]
      timeForm.value.endDate = dayAfterTomorrow.toISOString().split('T')[0]
      timeForm.value.startTime = '09:00'
      timeForm.value.endTime = '18:00'
    }
  }
  else {
    // 如果没有跳转数据，设置默认值
    pageParams.value.vehicleId = ''

    // 默认时间（明天9点到后天18点）
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(18, 0, 0, 0)

    bookingInfo.value.startTime = tomorrow.toISOString()
    bookingInfo.value.endTime = dayAfterTomorrow.toISOString()
    bookingInfo.value.rentalDays = 1

    timeForm.value.startDate = tomorrow.toISOString().split('T')[0]
    timeForm.value.endDate = dayAfterTomorrow.toISOString().split('T')[0]
    timeForm.value.startTime = '09:00'
    timeForm.value.endTime = '18:00'
  }

  await loadVehicleInfo()
  await loadBookingInfo()
  await loadAvailableCoupons()
})

// 加载车辆信息
async function loadVehicleInfo() {
  try {
    loading.value = true
    const vehicleId = Number.parseInt(pageParams.value.vehicleId)
    if (!vehicleId) {
      throw new Error('无效的车辆ID')
    }

    const response = await getVehicleDetail(vehicleId)
    if (response.code === 200 && response.data) {
      vehicleInfo.value = response.data
    }
    else {
      throw new Error(response.msg || '获取车辆信息失败')
    }
  }
  catch (error) {
    console.error('加载车辆信息失败:', error)
    uni.showToast({
      title: '加载车辆信息失败',
      icon: 'error',
    })
    // 可以考虑返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  finally {
    loading.value = false
  }
}

// 加载预订信息
async function loadBookingInfo() {
  if (pageParams.value.startTime && pageParams.value.endTime) {
    bookingInfo.value.startTime = pageParams.value.startTime
    bookingInfo.value.endTime = pageParams.value.endTime
    calculateRentalDays()
    await calculatePrice()
  }

  // 默认取车地点为车辆位置
  bookingInfo.value.pickupLocation = vehicleInfo.value.location.address
}

// 加载可用优惠券
async function loadAvailableCoupons() {
  try {
    if (!vehicleInfo.value.vehicleId || !bookingInfo.value.startTime || !bookingInfo.value.endTime) {
      return
    }

    const response = await getAvailableCoupons({
      vehicleId: vehicleInfo.value.vehicleId,
      startTime: bookingInfo.value.startTime,
      endTime: bookingInfo.value.endTime,
      totalAmount: priceCalculation.value.totalAmount,
    })

    if (response.code === 200 && response.data) {
      availableCoupons.value = response.data
    }
  }
  catch (error) {
    console.error('加载优惠券失败:', error)
  }
}

// 计算租赁天数
function calculateRentalDays() {
  if (bookingInfo.value.startTime && bookingInfo.value.endTime) {
    const start = new Date(bookingInfo.value.startTime)
    const end = new Date(bookingInfo.value.endTime)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    bookingInfo.value.rentalDays = Math.max(1, diffDays)
  }
}

// 计算价格
async function calculatePrice() {
  try {
    if (!vehicleInfo.value.vehicleId || !bookingInfo.value.startTime || !bookingInfo.value.endTime) {
      return
    }

    const response = await calculateBookingPrice({
      vehicleId: vehicleInfo.value.vehicleId,
      startTime: bookingInfo.value.startTime,
      endTime: bookingInfo.value.endTime,
      pickupMethod: bookingInfo.value.pickupMethod,
      deliveryLatitude: bookingInfo.value.userLocation.latitude,
      deliveryLongitude: bookingInfo.value.userLocation.longitude,
      deliveryServices: {
        carWash: deliveryServices.value.carWash,
        detailing: deliveryServices.value.detailing,
      },
      couponId: selectedCoupon.value?.couponId,
    })

    if (response.code === 200 && response.data) {
      const data = response.data
      priceCalculation.value.basePrice = data.basePrice
      priceCalculation.value.deliveryFee = data.deliveryFee
      priceCalculation.value.totalAmount = data.totalAmount
      priceCalculation.value.discountAmount = data.discountAmount
      priceCalculation.value.finalAmount = data.finalAmount
      bookingInfo.value.rentalDays = data.rentalDays
      priceCalculation.value.isMonthlyRental = data.rentalDays >= 30 && vehicleInfo.value.monthlyPrice > 0
    }
  }
  catch (error) {
    console.error('计算价格失败:', error)
    // 降级到本地计算
    calculatePriceLocally()
  }
}

// 本地价格计算（API失败时的降级方案）
function calculatePriceLocally() {
  const days = bookingInfo.value.rentalDays

  // 判断是否月租
  priceCalculation.value.isMonthlyRental = days >= 30 && vehicleInfo.value.monthlyPrice > 0

  // 计算基础价格
  if (priceCalculation.value.isMonthlyRental) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    priceCalculation.value.basePrice
      = months * vehicleInfo.value.monthlyPrice
      + remainingDays * vehicleInfo.value.dailyPrice
  }
  else {
    priceCalculation.value.basePrice = days * vehicleInfo.value.dailyPrice
  }

  // 计算送车费用
  if (bookingInfo.value.pickupMethod === 'delivery') {
    const distance = bookingInfo.value.deliveryDistance
    const baseFee = vehicleInfo.value.deliveryBaseFee
    const freeDistance = vehicleInfo.value.deliveryFreeDistance
    const pricePerKm = vehicleInfo.value.deliveryPricePerKm

    priceCalculation.value.deliveryFee = baseFee
    + Math.max(0, distance - freeDistance) * pricePerKm
  }
  else {
    priceCalculation.value.deliveryFee = 0
  }

  // 计算交付标准费用
  const serviceFee = Object.entries(deliveryServices.value)
    .filter(([_, enabled]) => enabled)
    .reduce((total, [service, _]) => {
      return total + (deliveryServicePrices[service as keyof typeof deliveryServicePrices] || 0)
    }, 0)

  // 计算总金额
  priceCalculation.value.totalAmount
    = priceCalculation.value.basePrice + priceCalculation.value.deliveryFee + serviceFee

  // 应用优惠券
  if (selectedCoupon.value) {
    priceCalculation.value.discountAmount = calculateCouponDiscount()
  }
  else {
    priceCalculation.value.discountAmount = 0
  }

  // 最终金额
  priceCalculation.value.finalAmount
    = priceCalculation.value.totalAmount - priceCalculation.value.discountAmount
}

// 计算优惠券折扣
function calculateCouponDiscount() {
  if (!selectedCoupon.value)
    return 0

  const coupon = selectedCoupon.value
  const totalAmount = priceCalculation.value.totalAmount

  if (totalAmount < coupon.minAmount)
    return 0

  if (coupon.type === 'discount') {
    return Math.min(coupon.discountAmount, totalAmount)
  }

  return 0
}

// 选择取车方式
async function selectPickupMethod(method: string) {
  bookingInfo.value.pickupMethod = method
  showPickupMethodDialog.value = false
  await calculatePrice()
}

// 选择优惠券
async function selectCoupon(coupon: Coupon) {
  selectedCoupon.value = coupon
  showCouponList.value = false
  await calculatePrice()
}

// 移除优惠券
async function removeCoupon() {
  selectedCoupon.value = null
  await calculatePrice()
}

// 选择位置
function selectLocation() {
  showMapPicker.value = true
}

// 处理地图地址选择确认
function handleMapAddressConfirm(data: {
  latitude: number
  longitude: number
  address: string
  formattedAddress: string
  poiName?: string
}) {
  bookingInfo.value.deliveryAddress = data.formattedAddress
  bookingInfo.value.userLocation = {
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.formattedAddress,
  }

  // 计算送车距离
  calculateDeliveryDistance()
}

// 格式化时间显示
function formatTime(timeStr: string) {
  if (!timeStr)
    return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 显示时间选择器
function showTimePicker() {
  showDatePicker.value = true
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
  bookingInfo.value.startTime = data.startDateTime
  bookingInfo.value.endTime = data.endDateTime

  // 重新计算租赁天数
  const startDateTime = new Date(data.startDateTime)
  const endDateTime = new Date(data.endDateTime)
  const timeDiff = endDateTime.getTime() - startDateTime.getTime()
  bookingInfo.value.rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // 重新计算价格
  calculatePrice()
}

// 提交预订
async function submitBooking() {
  if (!agreedToTerms.value) {
    uni.showToast({
      title: '请阅读并同意服务条款',
      icon: 'error',
    })
    return
  }

  try {
    submitLoading.value = true

    const bookingData = {
      vehicleId: vehicleInfo.value.vehicleId,
      startTime: bookingInfo.value.startTime,
      endTime: bookingInfo.value.endTime,
      pickupMethod: bookingInfo.value.pickupMethod,
      pickupLocation: bookingInfo.value.pickupLocation,
      deliveryAddress: bookingInfo.value.deliveryAddress,
      deliveryLatitude: bookingInfo.value.userLocation.latitude,
      deliveryLongitude: bookingInfo.value.userLocation.longitude,
      deliveryServices: {
        carWash: deliveryServices.value.carWash,
        detailing: deliveryServices.value.detailing,
      },
      couponId: selectedCoupon.value?.couponId,
      totalAmount: priceCalculation.value.totalAmount,
      finalAmount: priceCalculation.value.finalAmount,
      discountAmount: priceCalculation.value.discountAmount,
      remarks: '', // 可以添加备注字段
    }

    const response = await createBooking(bookingData)

    if (response.code === 200 && response.data) {
      uni.showToast({
        title: '预订成功',
        icon: 'success',
      })

      // 跳转到支付页面
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/payment/index?orderId=${response.data.orderId}`,
        })
      }, 1500)
    }
    else {
      throw new Error(response.msg || '预订失败')
    }
  }
  catch (error) {
    console.error('预订失败:', error)
    uni.showToast({
      title: '预订失败，请重试',
      icon: 'error',
    })
  }
  finally {
    submitLoading.value = false
  }
}

// 监听计算变化
async function handleCalculationChange() {
  calculateRentalDays()
  await calculatePrice()
  // 价格变化后重新加载优惠券
  await loadAvailableCoupons()
}

// 时间选择器相关函数
function openTimeSelector(type: 'start' | 'end') {
  timeSelector.value.type = type
  const now = new Date()
  const maxDate = new Date()
  maxDate.setFullYear(now.getFullYear() + 1) // 最多可选择一年后

  timeSelector.value.minDate = now.toISOString().split('T')[0]
  timeSelector.value.maxDate = maxDate.toISOString().split('T')[0]

  if (type === 'start') {
    timeSelector.value.currentDate = bookingInfo.value.startTime
      ? new Date(bookingInfo.value.startTime).toISOString().split('T')[0]
      : timeSelector.value.minDate
    timeSelector.value.currentTime = bookingInfo.value.startTime
      ? new Date(bookingInfo.value.startTime).toTimeString().slice(0, 5)
      : '09:00'
  }
  else {
    const minEndDate = bookingInfo.value.startTime
      ? new Date(new Date(bookingInfo.value.startTime).getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000)

    timeSelector.value.minDate = minEndDate.toISOString().split('T')[0]
    timeSelector.value.currentDate = bookingInfo.value.endTime
      ? new Date(bookingInfo.value.endTime).toISOString().split('T')[0]
      : timeSelector.value.minDate
    timeSelector.value.currentTime = bookingInfo.value.endTime
      ? new Date(bookingInfo.value.endTime).toTimeString().slice(0, 5)
      : '09:00'
  }

  showTimeSelector.value = true
}

function confirmTimeSelection() {
  const selectedDateTime = new Date(`${timeSelector.value.currentDate}T${timeSelector.value.currentTime}:00`)

  if (timeSelector.value.type === 'start') {
    bookingInfo.value.startTime = selectedDateTime.toISOString()
    // 如果结束时间早于开始时间，自动调整结束时间
    if (bookingInfo.value.endTime && new Date(bookingInfo.value.endTime) <= selectedDateTime) {
      const newEndTime = new Date(selectedDateTime.getTime() + 24 * 60 * 60 * 1000)
      bookingInfo.value.endTime = newEndTime.toISOString()
    }
  }
  else {
    bookingInfo.value.endTime = selectedDateTime.toISOString()
  }

  showTimeSelector.value = false
  handleCalculationChange()
}

// 地址选择相关函数
function searchAddress(keyword: string) {
  addressSelector.value.searchKeyword = keyword

  if (keyword.length < 2) {
    addressSelector.value.searchResults = []
    return
  }

  // TODO: 调用地址搜索API
  // 模拟搜索结果
  setTimeout(() => {
    addressSelector.value.searchResults = [
      {
        id: 1,
        address: `${keyword}相关地址1`,
        detail: '详细地址信息1',
        latitude: 31.2304,
        longitude: 121.4737,
        distance: 2.5,
      },
      {
        id: 2,
        address: `${keyword}相关地址2`,
        detail: '详细地址信息2',
        latitude: 31.2200,
        longitude: 121.4600,
        distance: 3.2,
      },
    ]
  }, 500)
}

function selectAddress(address: any) {
  bookingInfo.value.deliveryAddress = address.address
  bookingInfo.value.userLocation = {
    latitude: address.latitude,
    longitude: address.longitude,
    address: address.address,
  }

  // 计算送车距离
  calculateDeliveryDistance()

  // 保存到最近地址
  const existingIndex = addressSelector.value.recentAddresses.findIndex(item => item.id === address.id)
  if (existingIndex === -1) {
    addressSelector.value.recentAddresses.unshift(address)
    if (addressSelector.value.recentAddresses.length > 5) {
      addressSelector.value.recentAddresses.pop()
    }
  }

  showLocationPicker.value = false
}

// 计算送车距离（真实实现应该调用地图API）
async function calculateDeliveryDistance() {
  if (bookingInfo.value.userLocation.latitude && bookingInfo.value.userLocation.longitude) {
    // 模拟距离计算
    const vehicleLat = vehicleInfo.value.location.latitude
    const vehicleLng = vehicleInfo.value.location.longitude
    const userLat = bookingInfo.value.userLocation.latitude
    const userLng = bookingInfo.value.userLocation.longitude

    // 简单的直线距离计算（实际应该使用更精确的距离计算）
    const distance = Math.sqrt(
      (vehicleLat - userLat) ** 2 + (vehicleLng - userLng) ** 2,
    ) * 111 // 大概转换为公里

    bookingInfo.value.deliveryDistance = Math.max(0.5, Math.min(distance, vehicleInfo.value.maxDeliveryDistance))
    await calculatePrice()
  }
}

// 交付标准选择
async function toggleDeliveryService(service: keyof typeof deliveryServices.value) {
  deliveryServices.value[service] = !deliveryServices.value[service]
  await calculatePrice()
}

// 获取交付标准总费用
function getDeliveryServiceFee() {
  return Object.entries(deliveryServices.value)
    .filter(([_, enabled]) => enabled)
    .reduce((total, [service, _]) => {
      return total + (deliveryServicePrices[service as keyof typeof deliveryServicePrices] || 0)
    }, 0)
}

// 查看预订须知
function showBookingTerms() {
  showTermsDialog.value = true
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageBookingHead />

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 车辆信息卡片 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="flex">
            <!-- 车辆图片 -->
            <view class="h-[120rpx] w-[160rpx] flex-shrink-0">
              <image :src="vehicleInfo.imageUrl" mode="aspectFill" class="h-full w-full rounded-[12rpx]" />
            </view>

            <!-- 车辆信息 -->
            <view class="ml-[24rpx] flex flex-1 flex-col justify-center">
              <text class="text-[28rpx] text-black font-semibold">
                {{ vehicleInfo.name }}
              </text>
              <view class="mt-[8rpx] flex items-center text-[22rpx] text-gray-600 space-x-[16rpx]">
                <text>{{ vehicleInfo.licensePlate }}</text>
                <text>{{ vehicleInfo.seats }}座</text>
                <text>{{ vehicleInfo.energyType }}</text>
              </view>
              <view class="mt-[8rpx] flex items-center">
                <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                <text class="text-[20rpx] text-gray-600">
                  {{ vehicleInfo.rating }}({{ vehicleInfo.ratingCount }})
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 租赁时间 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              租赁时间
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between" @tap="showTimePicker">
              <text class="text-[24rpx] text-gray-600">
                租赁时间
              </text>
              <view class="flex items-center">
                <text class="text-[26rpx] text-black">
                  {{ bookingInfo.startTime && bookingInfo.endTime ? `${formatTime(bookingInfo.startTime)} - ${formatTime(bookingInfo.endTime)}` : '请选择时间' }}
                </text>
                <text class="i-material-symbols-chevron-right ml-[8rpx] text-[24rpx] text-gray-400" />
              </view>
            </view>
            <view v-if="bookingInfo.startTime && bookingInfo.endTime" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                租赁天数
              </text>
              <text class="text-[26rpx] text-purple-600 font-medium">
                {{ bookingInfo.rentalDays }}天
                <text v-if="priceCalculation.isMonthlyRental" class="ml-[8rpx] rounded-[8rpx] bg-purple-50 px-[8rpx] py-[2rpx] text-[20rpx] text-purple-600">
                  月租优惠
                </text>
              </text>
            </view>
          </view>
        </view>

        <!-- 取车方式 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-local-shipping mr-[12rpx] text-[24rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              取车方式
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <!-- 自取选项 -->
            <view
              class="border-2 rounded-[16rpx] p-[24rpx] transition-all"
              :class="bookingInfo.pickupMethod === 'self'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-gray-50'"
              @tap="selectPickupMethod('self')"
            >
              <view class="flex items-center justify-between">
                <view>
                  <text class="text-[26rpx] text-black font-medium">
                    用户自取
                  </text>
                  <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                    到指定地点取车
                  </text>
                </view>
                <text class="text-[24rpx] text-green-600 font-medium">
                  免费
                </text>
              </view>
              <view class="mt-[12rpx] flex items-center text-[22rpx] text-gray-600">
                <text class="i-material-symbols-location-on mr-[8rpx] text-[20rpx]" />
                <text>{{ vehicleInfo.location.address }}</text>
              </view>
            </view>

            <!-- 送车选项 -->
            <view
              v-if="vehicleInfo.deliveryEnabled"
              class="border-2 rounded-[16rpx] p-[24rpx] transition-all"
              :class="bookingInfo.pickupMethod === 'delivery'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-gray-50'"
              @tap="selectPickupMethod('delivery')"
            >
              <view class="flex items-center justify-between">
                <view>
                  <text class="text-[26rpx] text-black font-medium">
                    平台送车
                  </text>
                  <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                    送车上门，更便捷
                  </text>
                </view>
                <text class="text-[24rpx] text-purple-600 font-medium">
                  ¥{{ priceCalculation.deliveryFee }}
                </text>
              </view>
              <view v-if="bookingInfo.pickupMethod === 'delivery'" class="mt-[12rpx]">
                <view class="flex items-center text-[22rpx] text-gray-600" @tap.stop="selectLocation">
                  <text class="i-material-symbols-location-on mr-[8rpx] text-[20rpx]" />
                  <text class="flex-1">
                    {{ bookingInfo.deliveryAddress || '请在地图上选择地址' }}
                  </text>
                  <text class="i-material-symbols-chevron-right ml-[8rpx] text-[24rpx]" />
                </view>
                <text class="mt-[8rpx] block text-[20rpx] text-gray-500">
                  {{ vehicleInfo.deliveryFreeDistance }}公里内¥{{ vehicleInfo.deliveryBaseFee }}，超出¥{{ vehicleInfo.deliveryPricePerKm }}/公里
                </text>
                <view v-if="bookingInfo.deliveryDistance > 0" class="mt-[8rpx] flex items-center text-[20rpx] text-green-600">
                  <text class="i-material-symbols-info mr-[4rpx]" />
                  <text>预计送车距离：{{ bookingInfo.deliveryDistance.toFixed(1) }}公里</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 交付标准 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-car-wash mr-[12rpx] text-[24rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                交付标准
              </text>
            </view>
            <!-- 车辆类型标识 -->
            <view v-if="vehicleOperationType === 'owner'" class="flex items-center">
              <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-orange-500" />
              <text class="text-[22rpx] text-orange-600 font-medium">
                车主优选
              </text>
            </view>
            <text v-else-if="getDeliveryServiceFee() > 0" class="text-[24rpx] text-purple-600 font-medium">
              +¥{{ getDeliveryServiceFee() }}
            </text>
          </view>

          <!-- 默认交付标准说明 -->
          <view class="mb-[24rpx] rounded-[16rpx] bg-blue-50 p-[20rpx]">
            <view class="mb-[12rpx] flex items-center">
              <text class="i-material-symbols-info mr-[8rpx] text-[20rpx] text-blue-600" />
              <text class="text-[24rpx] text-blue-800 font-medium">
                默认交付标准
              </text>
            </view>
            <view class="mb-[8rpx]">
              <text class="text-[24rpx] text-blue-700 leading-[36rpx]">
                交付时：{{ defaultStandardText }}
              </text>
            </view>
            <view>
              <text class="text-[24rpx] text-blue-700 leading-[36rpx]">
                {{ returnRequirementText }}
              </text>
            </view>
          </view>

          <!-- 增值服务选项（仅限平台自营车辆） -->
          <!-- <view v-if="vehicleOperationType === 'platform'" class="space-y-[24rpx]"> -->
          <view v-if="false" class="space-y-[24rpx]">
            <view class="mb-[16rpx]">
              <text class="text-[26rpx] text-black font-medium">
                增值服务
              </text>
              <text class="ml-[8rpx] text-[22rpx] text-gray-500">
                （可选，收费项目）
              </text>
            </view>

            <!-- 专业洗车 -->
            <view class="flex items-center justify-between">
              <view class="flex-1">
                <view class="flex items-center">
                  <text class="text-[26rpx] text-black font-medium">
                    专业洗车
                  </text>
                  <text class="ml-[16rpx] text-[22rpx] text-purple-600">
                    +¥{{ deliveryServicePrices.carWash }}
                  </text>
                </view>
                <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
                  专业外观清洗服务
                </text>
              </view>
              <view class="flex items-center">
                <view
                  class="h-[36rpx] w-[36rpx] flex items-center justify-center border-2 rounded-[8rpx] transition-all"
                  :class="deliveryServices.carWash
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300 bg-white'"
                  @tap="toggleDeliveryService('carWash')"
                >
                  <text v-if="deliveryServices.carWash" class="i-material-symbols-check text-[20rpx] text-white" />
                </view>
              </view>
            </view>

            <!-- 深度精洗 -->
            <view class="flex items-center justify-between">
              <view class="flex-1">
                <view class="flex items-center">
                  <text class="text-[26rpx] text-black font-medium">
                    深度精洗
                  </text>
                  <text class="ml-[16rpx] text-[22rpx] text-purple-600">
                    +¥{{ deliveryServicePrices.detailing }}
                  </text>
                </view>
                <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
                  内外深度清洁，除味杀菌
                </text>
              </view>
              <view class="flex items-center">
                <view
                  class="h-[36rpx] w-[36rpx] flex items-center justify-center border-2 rounded-[8rpx] transition-all"
                  :class="deliveryServices.detailing
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300 bg-white'"
                  @tap="toggleDeliveryService('detailing')"
                >
                  <text v-if="deliveryServices.detailing" class="i-material-symbols-check text-[20rpx] text-white" />
                </view>
              </view>
            </view>
          </view>

          <!-- 车主优选提示 -->
          <!-- <view v-else class="rounded-[12rpx] bg-orange-50 p-[16rpx]">
            <view class="flex items-start">
              <text class="i-material-symbols-star mr-[8rpx] mt-[2rpx] text-[20rpx] text-orange-500" />
              <view class="flex-1">
                <text class="text-[24rpx] text-orange-700 leading-[36rpx]">
                  此为车主优选运营车辆，交付标准为默认标准，暂无增值服务可选。
                </text>
              </view>
            </view>
          </view> -->
        </view>

        <!-- 优惠券 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]" @tap="showCouponList = true">
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-local-offer mr-[12rpx] text-[24rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                优惠券
              </text>
            </view>
            <view class="flex items-center">
              <text v-if="selectedCoupon" class="mr-[8rpx] text-[24rpx] text-purple-600">
                -¥{{ selectedCoupon.discountAmount }}
              </text>
              <text v-else class="mr-[8rpx] text-[24rpx] text-gray-500">
                {{ availableCoupons.length }}张可用
              </text>
              <text class="i-material-symbols-chevron-right text-[24rpx] text-gray-400" />
            </view>
          </view>
          <text v-if="selectedCoupon" class="mt-[8rpx] block text-[22rpx] text-gray-600">
            {{ selectedCoupon.description }}
          </text>
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
                {{ priceCalculation.isMonthlyRental ? '月租费用' : '日租费用' }}
              </text>
              <text class="text-[26rpx] text-black">
                ¥{{ priceCalculation.basePrice }}
              </text>
            </view>

            <view v-if="priceCalculation.deliveryFee > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                送车服务费
              </text>
              <text class="text-[26rpx] text-black">
                ¥{{ priceCalculation.deliveryFee }}
              </text>
            </view>

            <view v-if="getDeliveryServiceFee() > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                交付标准费
              </text>
              <text class="text-[26rpx] text-black">
                ¥{{ getDeliveryServiceFee() }}
              </text>
            </view>

            <view v-if="priceCalculation.discountAmount > 0" class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                优惠券折扣
              </text>
              <text class="text-[26rpx] text-green-600">
                -¥{{ priceCalculation.discountAmount }}
              </text>
            </view>

            <view class="border-t border-gray-100 pt-[16rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[28rpx] text-black font-semibold">
                  实付金额
                </text>
                <text class="text-[32rpx] text-purple-600 font-bold">
                  ¥{{ priceCalculation.finalAmount }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 服务条款 -->
        <view class="flex items-center px-[8rpx]">
          <view
            class="mr-[16rpx] h-[32rpx] w-[32rpx] flex items-center justify-center border-2 rounded-[8rpx] transition-all"
            :class="agreedToTerms
              ? 'border-purple-600 bg-purple-600'
              : 'border-gray-300 bg-white'"
            @tap="agreedToTerms = !agreedToTerms"
          >
            <text v-if="agreedToTerms" class="i-material-symbols-check text-[20rpx] text-white" />
          </view>
          <view class="flex-1 text-[24rpx] text-gray-600">
            <text>我已阅读并同意</text>
            <text class="text-purple-600" @tap="showBookingTerms">
              《租车服务协议》
            </text>
            <text>和</text>
            <text class="text-purple-600" @tap="showBookingTerms">
              《预订须知》
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="border-t border-gray-100 bg-white p-[24rpx]">
      <view class="flex items-center">
        <view class="flex-1">
          <text class="text-[24rpx] text-gray-500">
            实付金额
          </text>
          <text class="ml-[8rpx] text-[32rpx] text-purple-600 font-bold">
            ¥{{ priceCalculation.finalAmount }}
          </text>
        </view>
        <view
          class="rounded-[20rpx] bg-purple-600 px-[48rpx] py-[24rpx] text-[28rpx] text-white font-medium"
          :class="{ 'opacity-50': submitLoading || !agreedToTerms }"
          :disabled="submitLoading || !agreedToTerms"
          @tap="submitBooking"
        >
          <text v-if="submitLoading">
            提交中...
          </text>
          <text v-else>
            立即预订
          </text>
        </view>
      </view>
    </view>

    <!-- 优惠券选择弹窗 -->
    <BottomDrawer v-model:visible="showCouponList" title="选择优惠券">
      <view class="mt-[32rpx] max-h-[800rpx]">
        <view class="space-y-[16rpx]">
          <view
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="border-2 rounded-[16rpx] p-[24rpx] transition-all"
            :class="selectedCoupon?.id === coupon.id
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 bg-white'"
            @tap="selectCoupon(coupon)"
          >
            <view class="flex items-center justify-between">
              <view>
                <text class="text-[26rpx] text-black font-medium">
                  {{ coupon.name }}
                </text>
                <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                  {{ coupon.description }}
                </text>
              </view>
              <text class="text-[28rpx] text-purple-600 font-bold">
                ¥{{ coupon.discountAmount }}
              </text>
            </view>
          </view>

          <view
            class="border-2 rounded-[16rpx] p-[24rpx] transition-all"
            :class="!selectedCoupon
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 bg-white'"
            @tap="removeCoupon"
          >
            <text class="text-[26rpx] text-black font-medium">
              不使用优惠券
            </text>
          </view>
        </view>
      </view>
    </BottomDrawer>

    <!-- 时间选择器弹窗 -->
    <BottomDrawer v-model:visible="showTimeSelector" :title="timeSelector.type === 'start' ? '选择开始时间' : '选择结束时间'">
      <view class="mt-[32rpx] p-[24rpx]">
        <view class="space-y-[24rpx]">
          <!-- 日期选择 -->
          <view>
            <text class="mb-[16rpx] block text-[26rpx] text-black font-medium">
              选择日期
            </text>
            <picker
              mode="date"
              :start="timeSelector.minDate"
              :end="timeSelector.maxDate"
              :value="timeSelector.currentDate"
              @change="(e: any) => timeSelector.currentDate = e.detail.value"
            >
              <view class="border border-gray-200 rounded-[12rpx] px-[24rpx] py-[16rpx] text-[26rpx] text-black">
                {{ timeSelector.currentDate || '请选择日期' }}
              </view>
            </picker>
          </view>

          <!-- 时间选择 -->
          <view>
            <text class="mb-[16rpx] block text-[26rpx] text-black font-medium">
              选择时间
            </text>
            <picker
              mode="time"
              :value="timeSelector.currentTime"
              @change="(e: any) => timeSelector.currentTime = e.detail.value"
            >
              <view class="border border-gray-200 rounded-[12rpx] px-[24rpx] py-[16rpx] text-[26rpx] text-black">
                {{ timeSelector.currentTime || '请选择时间' }}
              </view>
            </picker>
          </view>

          <!-- 确认按钮 -->
          <view
            class="w-full rounded-[20rpx] bg-purple-600 py-[24rpx] text-[28rpx] text-white font-medium"
            @tap="confirmTimeSelection"
          >
            确认选择
          </view>
        </view>
      </view>
    </BottomDrawer>

    <!-- 地址选择器弹窗 -->
    <BottomDrawer v-model:visible="showLocationPicker" title="选择送车地址">
      <view class="mt-[32rpx] max-h-[800rpx]">
        <!-- 搜索框 -->
        <view class="mb-[24rpx] px-[24rpx]">
          <view class="relative">
            <input
              v-model="addressSelector.searchKeyword"
              class="w-full border border-gray-200 rounded-[12rpx] bg-gray-50 py-[16rpx] pl-[48rpx] pr-[24rpx] text-[26rpx]"
              placeholder="搜索地址或地标"
              @input="(e: any) => searchAddress(e.detail.value)"
            >
            <text class="i-material-symbols-search absolute left-[16rpx] top-[50%] translate-y-[-50%] text-[24rpx] text-gray-400" />
          </view>
        </view>

        <!-- 最近使用地址 -->
        <view v-if="addressSelector.recentAddresses.length > 0 && !addressSelector.searchKeyword" class="mb-[24rpx] px-[24rpx]">
          <text class="mb-[16rpx] block text-[24rpx] text-gray-600">
            最近使用
          </text>
          <view class="space-y-[12rpx]">
            <view
              v-for="address in addressSelector.recentAddresses"
              :key="address.id"
              class="flex items-center rounded-[12rpx] bg-gray-50 p-[16rpx]"
              @tap="selectAddress(address)"
            >
              <text class="i-material-symbols-history mr-[12rpx] text-[20rpx] text-gray-500" />
              <view class="flex-1">
                <text class="block text-[24rpx] text-black">
                  {{ address.address }}
                </text>
                <text class="text-[20rpx] text-gray-500">
                  {{ address.detail }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 搜索结果 -->
        <view v-if="addressSelector.searchResults.length > 0" class="px-[24rpx]">
          <text class="mb-[16rpx] block text-[24rpx] text-gray-600">
            搜索结果
          </text>
          <view class="space-y-[12rpx]">
            <view
              v-for="address in addressSelector.searchResults"
              :key="address.id"
              class="flex items-center rounded-[12rpx] bg-white p-[16rpx]"
              @tap="selectAddress(address)"
            >
              <text class="i-material-symbols-location-on mr-[12rpx] text-[20rpx] text-purple-600" />
              <view class="flex-1">
                <text class="block text-[24rpx] text-black">
                  {{ address.address }}
                </text>
                <text class="text-[20rpx] text-gray-500">
                  {{ address.detail }}
                </text>
              </view>
              <text class="text-[20rpx] text-gray-500">
                {{ address.distance }}km
              </text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="addressSelector.searchKeyword && addressSelector.searchResults.length === 0" class="py-[48rpx] text-center">
          <text class="text-[24rpx] text-gray-500">
            未找到相关地址
          </text>
        </view>
      </view>
    </BottomDrawer>

    <!-- 预订须知弹窗 -->
    <BottomDrawer v-model:visible="showTermsDialog" title="预订须知">
      <view class="mt-[32rpx] max-h-[800rpx] px-[24rpx]">
        <scroll-view scroll-y class="h-[600rpx]">
          <view class="text-[24rpx] text-gray-700 leading-[36rpx] space-y-[24rpx]">
            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-semibold">
                取消规则
              </text>
              <text class="block">
                • 用车开始前24小时外：免费取消
              </text>
              <text class="block">
                • 用车开始前24小时内：扣除40%订单金额作为违约金
              </text>
              <text class="block">
                • 用车开始后：不支持取消，不退款
              </text>
            </view>

            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-semibold">
                押金政策
              </text>
              <text class="block">
                • 免押金服务，无需支付额外押金
              </text>
              <text class="block">
                • 如发生违章、损坏等情况，将从用户账户扣除相应费用
              </text>
            </view>

            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-semibold">
                保险政策
              </text>
              <text class="block">
                • 车辆已投保交强险、商业险
              </text>
              <text class="block">
                • 正常使用过程中的保险理赔由平台协助处理
              </text>
              <text class="block">
                • 违法违规使用导致的损失由用户承担
              </text>
            </view>

            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-semibold">
                取车要求
              </text>
              <text class="block">
                • 取车时需出示有效驾驶证
              </text>
              <text class="block">
                • 驾驶证须在有效期内，准驾车型相符
              </text>
              <text class="block">
                • 取车时需验证取车码
              </text>
            </view>

            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-semibold">
                还车要求
              </text>
              <text class="block">
                • 按时归还车辆到指定地点
              </text>
              <text class="block">
                • 车辆外观无明显损坏
              </text>
              <text class="block">
                • 车内无遗留物品，保持清洁
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </BottomDrawer>

    <!-- 时间范围选择器 -->
    <DateRangePicker
      v-model:visible="showDatePicker"
      :start-date="timeForm.startDate"
      :end-date="timeForm.endDate"
      :start-time="timeForm.startTime"
      :end-time="timeForm.endTime"
      @confirm="handleDateRangeConfirm"
    />

    <!-- 地图地址选择器 -->
    <MapAddressPicker
      v-model:visible="showMapPicker"
      title="选择送车地址"
      :latitude="bookingInfo.userLocation.latitude || vehicleInfo.location.latitude"
      :longitude="bookingInfo.userLocation.longitude || vehicleInfo.location.longitude"
      @confirm="handleMapAddressConfirm"
    />
  </view>
</template>

<route lang="yaml">
layout: home
</route>
