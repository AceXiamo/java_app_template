<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageSearchHead from '@/components/page/search/Head.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import { getAllChildCategories, getVehicleFilters, searchVehicles } from '@/api/vehicle'
import type { Vehicle, VehicleCategory, VehicleFilterOptions, VehicleSearchParams } from '@/api/vehicle'

// 搜索参数
const searchParams = ref<VehicleSearchParams>({
  city: '上海',
  keywords: '',
  startTime: undefined,
  endTime: undefined,
  page: 1,
  limit: 10,
  sortBy: 'hot',
  latitude: undefined,
  longitude: undefined,
  categoryId: undefined,
})

// 当前地址显示
const currentAddress = ref('上海')

// 选中的分类名称
const selectedCategoryName = ref('')

// 选中分类的轮播图
const categoryGalleryImages = ref<string[]>([])

// 选中分类的特征标签
const categoryFeatureTags = ref<{ tagName: string, tagType: string, tagColor: string, tagIcon?: string }[]>([])

// 数据状态
const vehicles = ref<Vehicle[]>([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const showDatePicker = ref(false)
const showMapPicker = ref(false)
const filterOptions = ref<VehicleFilterOptions>({
  brands: [],
  carTypes: [],
  energyTypes: [],
  seats: [],
  priceRange: [0, 999],
})

// 排序选项
const sortOptions = [
  { label: '综合排序', value: 'hot' },
  { label: '低价优先', value: 'price' },
  { label: '高配优先', value: 'priceDesc' },
  { label: '新款优先', value: 'year' },
]

// 时间相关数据
const timeForm = ref({
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
})

// 格式化时间显示
const displayTimeRange = computed(() => {
  if (!searchParams.value.startTime || !searchParams.value.endTime) {
    return '请选择时间'
  }

  const start = new Date(searchParams.value.startTime)
  const end = new Date(searchParams.value.endTime)

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    }
    else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    }
    else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  const startDateText = formatDate(start)
  const endDateText = formatDate(end)
  const startTimeText = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
  const endTimeText = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`

  return `${startDateText} ${startTimeText} - ${endDateText} ${endTimeText}`
})

// 页面加载时获取参数
onLoad(() => {
  // 使用 getJumpData 获取搜索参数
  const jumpData = getJumpData('searchParams')

  if (jumpData) {
    searchParams.value.city = '上海' // 固定上海区域
    searchParams.value.keywords = jumpData.keywords || ''
    searchParams.value.startTime = jumpData.startTime
    searchParams.value.endTime = jumpData.endTime
    searchParams.value.latitude = jumpData.latitude
    searchParams.value.longitude = jumpData.longitude
    searchParams.value.categoryId = jumpData.categoryId

    // 更新地址显示
    if (jumpData.address) {
      currentAddress.value = jumpData.address
    }

    // 更新分类显示
    if (jumpData.categoryName) {
      selectedCategoryName.value = jumpData.categoryName
    }

    // 解析时间参数到timeForm
    if (jumpData.startTime && jumpData.endTime) {
      const startDateTime = new Date(jumpData.startTime)
      const endDateTime = new Date(jumpData.endTime)

      timeForm.value.startDate = startDateTime.toISOString().split('T')[0]
      timeForm.value.endDate = endDateTime.toISOString().split('T')[0]
      timeForm.value.startTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`
      timeForm.value.endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
    }
  }

  // 如果没有位置信息，尝试获取当前位置
  if (!searchParams.value.latitude || !searchParams.value.longitude) {
    getCurrentLocation()
  }

  loadFilterOptions()
  searchVehicleList()

  // 如果有选中的分类，加载分类轮播图
  if (searchParams.value.categoryId) {
    loadCategoryGallery(searchParams.value.categoryId)
  }
})

// 搜索车辆
async function searchVehicleList(isLoadMore = false) {
  if (loading.value || loadingMore.value)
    return

  try {
    if (isLoadMore) {
      loadingMore.value = true
    }
    else {
      loading.value = true
    }

    if (!isLoadMore) {
      searchParams.value.page = 1
      vehicles.value = []
      noMore.value = false
      total.value = 0 // 重置总数
    }

    const response = await searchVehicles(searchParams.value)

    if (response.code === 200 && response.data) {
      const newVehicles = response.data.vehicles || []

      if (isLoadMore) {
        vehicles.value.push(...newVehicles)
      }
      else {
        vehicles.value = newVehicles
      }

      // 确保 total 有正确的值
      total.value = response.data.total || 0

      // 检查是否还有更多数据
      if (newVehicles.length < (searchParams.value.limit || 0)) {
        noMore.value = true
      }

      // 搜索成功
    }
    else {
      console.error('搜索失败:', response)
      total.value = 0
      vehicles.value = []
      toastRef.value?.error(response.msg || '搜索失败')
    }
  }
  catch (error) {
    console.error('搜索车辆失败:', error)
    total.value = 0
    vehicles.value = []
    toastRef.value?.error('搜索失败，请重试')
  }
  finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载筛选选项
async function loadFilterOptions() {
  try {
    const response = await getVehicleFilters()
    if (response.code === 200 && response.data) {
      filterOptions.value = response.data
    }
  }
  catch (error) {
    console.error('获取筛选选项失败:', error)
  }
}

// 加载分类轮播图和特征标签
async function loadCategoryGallery(categoryId: number) {
  try {
    // 获取单个分类的详细信息
    // 这里我们需要通过父分类来获取子分类信息
    // 由于我们只有子分类ID，我们需要调用获取所有子分类的接口
    const response = await getAllChildCategories() // 获取所有子分类
    if (response.code === 200 && response.data) {
      const category = response.data.find((cat: VehicleCategory) => cat.category_id === categoryId)
      if (category) {
        // 处理轮播图
        if (category.gallery_images) {
          try {
            const images = JSON.parse(category.gallery_images) as string[]
            categoryGalleryImages.value = images.filter(img => img && img.trim() !== '')
          }
          catch (e) {
            console.warn('解析gallery_images失败:', e)
            categoryGalleryImages.value = []
          }
        }
        else {
          categoryGalleryImages.value = []
        }

        // 处理特征标签
        if (category.feature_tags) {
          try {
            const tags = JSON.parse(category.feature_tags) as { tagName: string, tagType: string, tagColor: string, tagIcon?: string }[]
            categoryFeatureTags.value = tags.filter(tag => tag.tagName && tag.tagName.trim() !== '')
          }
          catch (e) {
            console.warn('解析feature_tags失败:', e)
            categoryFeatureTags.value = []
          }
        }
        else {
          categoryFeatureTags.value = []
        }
      }
      else {
        categoryGalleryImages.value = []
        categoryFeatureTags.value = []
      }
    }
  }
  catch (error) {
    console.error('获取分类信息失败:', error)
    categoryGalleryImages.value = []
    categoryFeatureTags.value = []
  }
}

// 排序切换
function handleSortChange(sortBy: string) {
  searchParams.value.sortBy = sortBy as 'hot' | 'price' | 'priceDesc' | 'year'
  searchVehicleList()
}

// 触底加载更多
function onReachBottom() {
  if (!loading.value && !loadingMore.value && !noMore.value) {
    searchParams.value.page = (searchParams.value.page || 0) + 1
    searchVehicleList(true)
  }
}

// 能源类型显示（后端已返回中文，直接使用）
function getEnergyTypeText(energyType: string) {
  return energyType
}

// 格式化车牌号
function formatLicensePlate(plate: string) {
  if (!plate)
    return '待定'
  // 如果是完整车牌号，进行脱敏处理
  if (plate.length >= 7) {
    return `${plate.substring(0, 2)}·${plate.substring(2, 5)}***`
  }
  return plate
}

// 获取车辆显示名称
function getVehicleDisplayName(vehicle: Vehicle) {
  // 如果是车主自运营且有车主昵称，显示"xxx的Model3"格式
  if (vehicle.operationType === 'owner' && vehicle.ownerNickname) {
    return `${vehicle.ownerNickname}的${vehicle.model || vehicle.name}`
  }
  // 否则直接显示车辆名称
  return vehicle.name
}

// 计算月租折扣信息
function getMonthlyDiscount(dailyPrice: number, monthlyPrice?: number) {
  if (!monthlyPrice || monthlyPrice <= 0) {
    return null
  }

  // 计算按日租30天的总价
  const monthlyByDaily = dailyPrice * 30

  // 计算折扣
  const discount = monthlyPrice / monthlyByDaily

  // 如果月租价格比日租30天还贵，就不显示折扣了
  if (discount >= 0.95) { // 95%以上就不显示折扣了
    return null
  }

  // 计算折扣百分比，四舍五入到整数
  const discountPercent = Math.round(discount * 10)

  // 计算节省金额
  const savings = monthlyByDaily - monthlyPrice

  return {
    discountPercent,
    savings,
    originalPrice: monthlyByDaily,
    monthlyPrice,
  }
}

// 快速预订
function quickBook(vehicleId: number) {
  // 使用 setJumpData 传递预订参数
  const bookingData = {
    vehicleId: vehicleId.toString(),
    ...(searchParams.value.startTime && { startTime: searchParams.value.startTime }),
    ...(searchParams.value.endTime && { endTime: searchParams.value.endTime }),
  }

  setJumpData('bookingParams', bookingData)

  uni.navigateTo({
    url: '/pages/booking/index',
  })
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

  // 更新搜索参数
  searchParams.value.startTime = data.startDateTime
  searchParams.value.endTime = data.endDateTime

  // 重新搜索
  searchVehicleList()
}

// 获取当前位置
function getCurrentLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      searchParams.value.latitude = res.latitude
      searchParams.value.longitude = res.longitude

      // 获取位置成功后重新搜索
      searchVehicleList()
    },
    fail: (err) => {
      console.warn('获取位置失败:', err)
      // 使用默认位置（上海市中心）
      searchParams.value.latitude = 31.2304
      searchParams.value.longitude = 121.4737
    },
  })
}

// 显示地图选择器
function showMapSelector() {
  showMapPicker.value = true
}

// 处理地址选择确认
function handleAddressConfirm(data: {
  latitude: number
  longitude: number
  address: string
  formattedAddress: string
  poiName?: string
}) {
  searchParams.value.latitude = data.latitude
  searchParams.value.longitude = data.longitude

  // 更新地址显示
  currentAddress.value = data.formattedAddress || data.address

  // 重新搜索
  searchVehicleList()
}

// 计算两点间距离（球面距离公式，单位：公里）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radLat1 = (lat1 * Math.PI) / 180
  const radLat2 = (lat2 * Math.PI) / 180
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180 - (lng2 * Math.PI) / 180
  const s = 2 * Math.asin(Math.sqrt(Math.sin(a / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(b / 2) ** 2))
  return Number((s * 6378.137).toFixed(2)) // 地球半径为6378.137km
}

// 计算车辆距离当前位置的距离
function getVehicleDistance(vehicle: Vehicle): string {
  if (!searchParams.value.latitude || !searchParams.value.longitude
    || !vehicle.location?.latitude || !vehicle.location?.longitude) {
    return '距离未知'
  }

  const distance = calculateDistance(
    searchParams.value.latitude,
    searchParams.value.longitude,
    vehicle.location.latitude,
    vehicle.location.longitude,
  )

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageSearchHead :selected-category-name="selectedCategoryName" />

    <!-- 主要滚动区域 -->
    <scroll-view
      scroll-y
      class="flex-1 overflow-y-auto"
      @scrolltolower="onReachBottom"
    >
      <!-- 车型轮播图 -->
      <view v-if="categoryGalleryImages.length > 0" class="bg-white">
        <swiper
          class="h-[350rpx]"
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          indicator-color="rgba(255, 255, 255, 0.5)"
          indicator-active-color="#8b5cf6"
        >
          <swiper-item v-for="image in categoryGalleryImages" :key="image">
            <image
              :src="image"
              mode="aspectFill"
              class="h-full w-full object-cover"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 车型特征标签 -->
      <view v-if="categoryFeatureTags.length > 0" class="bg-white px-[32rpx] py-[24rpx] border-b border-gray-50">
        <view class="flex flex-wrap gap-[12rpx]">
          <template v-for="tag in categoryFeatureTags" :key="tag.tagName">
            <!-- 图片标签：直接展示完整的UI设计图片 -->
            <image
              v-if="tag.tagType === 'image' && tag.tagIcon"
              :src="tag.tagIcon"
              class="h-[40rpx] object-contain"
              mode="heightFix"
            />
            <!-- 文字标签：带背景和圆点的传统样式 -->
            <view
              v-else
              class="flex items-center rounded-[20rpx] px-[16rpx] py-[8rpx] text-[22rpx] font-medium"
              :style="{
                backgroundColor: tag.tagColor ? `${tag.tagColor}15` : '#f3f4f6',
                borderColor: tag.tagColor || '#d1d5db',
                color: tag.tagColor || '#6b7280',
              }"
              style="border-width: 1px;"
            >
              <view
                class="mr-[8rpx] h-[10rpx] w-[10rpx] rounded-full"
                :style="{ backgroundColor: tag.tagColor || '#9ca3af' }"
              />
              {{ tag.tagName }}
            </view>
          </template>
        </view>
      </view>

      <!-- 搜索条件栏 (Sticky) -->
      <view class="sticky top-0 z-10 border-b border-gray-100 bg-white px-[32rpx] py-[24rpx] shadow-sm">
        <!-- 地址和时间信息 -->
        <view class="mb-[24rpx] flex items-center justify-between">
          <view class="min-w-0 flex flex-1 cursor-pointer items-center" @tap="showMapSelector">
            <text class="i-material-symbols-location-on mr-[8rpx] text-[28rpx] text-purple-600 flex-none" />
            <text class="truncate text-[28rpx] text-black font-medium">
              {{ currentAddress }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down ml-[4rpx] text-[24rpx] text-gray-400" />
          </view>
          <view class="flex items-center" @tap="showTimePicker">
            <text class="i-material-symbols-schedule mr-[8rpx] text-[24rpx] text-gray-500" />
            <text class="text-[24rpx] text-gray-600">
              {{ displayTimeRange }}
            </text>
          </view>
        </view>

        <!-- 排序控制 -->
        <view class="flex items-center justify-between">
          <!-- 排序选项 -->
          <view class="relative flex items-center space-x-[32rpx]">
            <view
              v-for="option in sortOptions"
              :key="option.value"
              class="relative px-[8rpx] py-[12rpx] text-[26rpx] font-medium transition-all"
              :class="searchParams.sortBy === option.value
                ? 'text-purple-600'
                : 'text-gray-600'"
              @tap="handleSortChange(option.value)"
            >
              {{ option.label }}
              <!-- 选中下划线 -->
              <view
                v-if="searchParams.sortBy === option.value"
                class="absolute bottom-0 left-0 right-0 h-[4rpx] bg-purple-600 rounded-full"
              />
            </view>
          </view>

          <!-- 搜索结果数量 -->
          <text class="text-[24rpx] text-gray-500">
            共{{ total }}辆车
          </text>
        </view>
      </view>

      <!-- 车辆列表 -->
      <view class="p-[24rpx] space-y-[16rpx]">
        <view
          v-for="(vehicle, index) in vehicles"
          :key="vehicle.vehicleId"
          class="mb-[24rpx] flex flex-col overflow-hidden rounded-[28rpx] bg-white shadow-[0_8rpx_24rpx_rgba(139,92,246,0.08)] animate-fade-in"
          :style="{ 'animation-delay': `${index * 50}ms` }"
        >
          <!-- 上半部分：图片和车辆信息 -->
          <view class="relative flex">
            <!-- 车辆图片 -->
            <view class="relative h-[180rpx] w-[240rpx] flex-shrink-0">
              <image :src="vehicle.imageUrl" mode="aspectFill" class="h-full w-full rounded-tl-[28rpx]" />
              <!-- 距离信息（右下角，真实距离） -->
              <view class="absolute bottom-[12rpx] right-[12rpx] flex items-center rounded-full bg-white/80 px-[12rpx] py-[4rpx]">
                <text class="i-material-symbols-location-on mr-[4rpx] text-[20rpx] text-purple-500" />
                <text class="text-[20rpx] text-gray-600">
                  {{ getVehicleDistance(vehicle) }}
                </text>
              </view>
            </view>

            <!-- 车辆基本信息 -->
            <view class="flex flex-1 flex-col justify-center p-[20rpx] pr-[120rpx]">
              <view class="mb-[8rpx] flex items-center justify-between">
                <text class="block text-[30rpx] text-black font-bold">
                  {{ getVehicleDisplayName(vehicle) }}
                </text>
              </view>
              <view class="mb-[8rpx] flex flex-wrap items-center gap-[16rpx] text-[22rpx] text-gray-600">
                <text>{{ formatLicensePlate(vehicle.licensePlate) }}</text>
                <text>{{ vehicle.seats }}座</text>
                <text>{{ getEnergyTypeText(vehicle.energyType) }}</text>
              </view>
              <!-- 车辆特性 -->
              <view class="mt-auto flex flex-wrap items-center gap-[16rpx]">
                <view v-if="vehicle.year" class="flex items-center rounded-[8rpx] bg-blue-50 px-[8rpx] py-[2rpx]">
                  <text class="i-material-symbols-calendar-today mr-[4rpx] text-[18rpx] text-blue-600" />
                  <text class="text-[20rpx] text-blue-700 font-medium">
                    {{ vehicle.year }}
                  </text>
                </view>
                <view v-if="vehicle.rangeKm" class="flex items-center rounded-[8rpx] bg-green-50 px-[8rpx] py-[2rpx]">
                  <text class="i-material-symbols-battery-charging-full mr-[4rpx] text-[18rpx] text-green-600" />
                  <text class="text-[20rpx] text-green-700 font-medium">
                    续航{{ vehicle.rangeKm }}km
                  </text>
                </view>
              </view>
            </view>

            <!-- 评价信息（与名字平齐） -->
            <view v-if="vehicle.rating" class="absolute top-[20rpx] right-[20rpx] flex items-center">
              <text class="i-material-symbols-star mr-[4rpx] text-[18rpx] text-yellow-500" />
              <text class="text-[20rpx] text-gray-700 font-medium">
                {{ vehicle.rating }}
              </text>
              <text class="ml-[6rpx] text-[18rpx] text-gray-500">
                {{ vehicle.ratingCount }}条评价
              </text>
            </view>
          </view>
          <!-- 标签栏（图片和价格栏之间，换行展示） -->
          <view v-if="vehicle.tags && vehicle.tags.length" class="flex flex-row flex-wrap gap-[8rpx] px-[20rpx] pt-[16rpx]">
            <template v-for="tag in vehicle.tags" :key="tag.tagName">
              <!-- 图片标签：直接展示完整的UI设计图片 -->
              <image
                v-if="tag.tagType === 'image' && tag.tagIcon"
                :src="tag.tagIcon"
                class="h-[32rpx] object-contain"
                mode="heightFix"
              />
              <!-- 文字标签：带背景和圆点的传统样式 -->
              <view
                v-else
                class="flex items-center rounded-[16rpx] px-[12rpx] py-[4rpx] text-[18rpx] font-medium"
                :style="{
                  backgroundColor: tag.tagColor ? `${tag.tagColor}15` : '#f3f4f6',
                  borderColor: tag.tagColor || '#d1d5db',
                  color: tag.tagColor || '#6b7280',
                }"
                style="border-width: 1px;"
              >
                <view
                  class="mr-[6rpx] h-[8rpx] w-[8rpx] rounded-full"
                  :style="{ backgroundColor: tag.tagColor || '#9ca3af' }"
                />
                {{ tag.tagName }}
              </view>
            </template>
          </view>

          <!-- 下半部分：价格信息和预订按钮 -->
          <view class="flex items-center justify-between border-t border-gray-100 px-[20rpx] py-[16rpx]">
            <view>
              <view class="flex items-baseline">
                <text class="text-[32rpx] text-purple-600 font-bold">
                  ¥{{ vehicle.dailyPrice }}
                </text>
                <text class="ml-[4rpx] text-[20rpx] text-gray-500">
                  /天
                </text>
              </view>
              <template v-if="vehicle.monthlyPrice">
                <view
                  v-if="getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)"
                  class="mt-[4rpx] flex items-center"
                >
                  <text class="mr-[8rpx] text-[20rpx] text-gray-400 line-through">
                    ¥{{ (vehicle.dailyPrice * 30).toFixed(0) }}
                  </text>
                  <text class="rounded-full bg-red-50 px-[8rpx] py-[2rpx] text-[20rpx] text-red-500 font-medium">
                    月租{{ getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)?.discountPercent }}折
                  </text>
                  <text class="ml-[8rpx] text-[18rpx] text-green-600">
                    省{{ getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)?.savings.toFixed(0) }}元
                  </text>
                </view>
              </template>
            </view>

            <!-- 快速预订按钮 -->
            <view class="flex rounded-[20rpx] from-purple-500 to-purple-400 bg-gradient-to-r px-[24rpx] py-[12rpx]" @tap="quickBook(vehicle.vehicleId)">
              <text class="i-material-symbols-bolt mr-[8rpx] text-[24rpx] text-white" />
              <text class="text-[24rpx] text-white font-medium">
                立即预订
              </text>
            </view>
          </view>
        </view>

        <!-- 加载更多时的骨架屏 -->
        <template v-if="loadingMore">
          <view
            v-for="n in 2"
            :key="`skeleton-${n}`"
            class="mb-[24rpx] mx-[24rpx] flex flex-col overflow-hidden rounded-[28rpx] bg-white shadow-[0_8rpx_24rpx_rgba(139,92,246,0.08)] animate-pulse"
          >
            <!-- 骨架屏上半部分 -->
            <view class="relative flex">
              <!-- 骨架屏图片 -->
              <view class="h-[180rpx] w-[240rpx] flex-shrink-0 bg-gray-200 rounded-tl-[28rpx]" />

              <!-- 骨架屏车辆信息 -->
              <view class="flex flex-1 flex-col justify-center p-[20rpx] pr-[120rpx]">
                <!-- 骨架屏车辆名称 -->
                <view class="mb-[12rpx] h-[36rpx] bg-gray-200 rounded-[8rpx]" />

                <!-- 骨架屏车辆基本信息 -->
                <view class="mb-[12rpx] flex gap-[16rpx]">
                  <view class="h-[24rpx] w-[80rpx] bg-gray-200 rounded-[6rpx]" />
                  <view class="h-[24rpx] w-[60rpx] bg-gray-200 rounded-[6rpx]" />
                  <view class="h-[24rpx] w-[70rpx] bg-gray-200 rounded-[6rpx]" />
                </view>

                <!-- 骨架屏车辆特性 -->
                <view class="flex gap-[16rpx]">
                  <view class="h-[28rpx] w-[90rpx] bg-gray-200 rounded-[8rpx]" />
                  <view class="h-[28rpx] w-[110rpx] bg-gray-200 rounded-[8rpx]" />
                </view>
              </view>

              <!-- 骨架屏评分 -->
              <view class="absolute top-[20rpx] right-[20rpx] h-[24rpx] w-[100rpx] bg-gray-200 rounded-[12rpx]" />
            </view>

            <!-- 骨架屏标签 -->
            <view class="flex gap-[8rpx] px-[20rpx] pt-[16rpx]">
              <view class="h-[32rpx] w-[60rpx] bg-gray-200 rounded-[16rpx]" />
              <view class="h-[32rpx] w-[80rpx] bg-gray-200 rounded-[16rpx]" />
              <view class="h-[32rpx] w-[70rpx] bg-gray-200 rounded-[16rpx]" />
            </view>

            <!-- 骨架屏价格和按钮 -->
            <view class="flex items-center justify-between border-t border-gray-100 px-[20rpx] py-[16rpx]">
              <view>
                <view class="h-[36rpx] w-[120rpx] bg-gray-200 rounded-[8rpx] mb-[8rpx]" />
                <view class="h-[20rpx] w-[180rpx] bg-gray-200 rounded-[6rpx]" />
              </view>
              <view class="h-[48rpx] w-[120rpx] bg-gray-200 rounded-[20rpx]" />
            </view>
          </view>
        </template>

        <!-- 加载状态 -->
        <view class="py-[48rpx] flex flex-col items-center justify-center">
          <!-- 初次加载动画 -->
          <view v-if="loading && !loadingMore" class="flex flex-col items-center space-y-[24rpx]">
            <!-- 旋转加载动画 -->
            <view class="relative">
              <view class="w-[60rpx] h-[60rpx] border-[4rpx] border-gray-200 border-t-purple-500 rounded-full animate-spin" />
            </view>
            <!-- 加载文字 -->
            <text class="text-[26rpx] text-gray-600 font-medium">
              正在搜索车辆...
            </text>
            <!-- 加载进度点 -->
            <view class="flex items-center space-x-[8rpx]">
              <view class="w-[8rpx] h-[8rpx] bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0ms;" />
              <view class="w-[8rpx] h-[8rpx] bg-purple-400 rounded-full animate-pulse" style="animation-delay: 200ms;" />
              <view class="w-[8rpx] h-[8rpx] bg-purple-400 rounded-full animate-pulse" style="animation-delay: 400ms;" />
            </view>
          </view>

          <!-- 加载更多动画 (简化版) -->
          <view v-else-if="loadingMore" class="flex flex-col items-center space-y-[16rpx]">
            <view class="flex items-center space-x-[12rpx]">
              <view class="w-[24rpx] h-[24rpx] border-[2rpx] border-gray-300 border-t-purple-500 rounded-full animate-spin" />
              <text class="text-[24rpx] text-gray-600">
                加载更多...
              </text>
            </view>
          </view>

          <!-- 无更多数据 -->
          <view v-else-if="noMore && vehicles.length > 0" class="flex flex-col items-center space-y-[16rpx]">
            <view class="w-[48rpx] h-[48rpx] flex items-center justify-center rounded-full bg-gray-100">
              <text class="i-material-symbols-check-circle text-[32rpx] text-gray-400" />
            </view>
            <text class="text-[26rpx] text-gray-500">
              已显示全部车辆
            </text>
          </view>

          <!-- 暂无数据 -->
          <view v-else-if="vehicles.length === 0 && !loading && !loadingMore" class="flex flex-col items-center space-y-[24rpx]">
            <view class="w-[80rpx] h-[80rpx] flex items-center justify-center rounded-full bg-gray-50">
              <text class="i-material-symbols-search-off text-[48rpx] text-gray-300" />
            </view>
            <view class="text-center">
              <text class="block text-[28rpx] text-gray-600 font-medium mb-[8rpx]">
                暂无搜索结果
              </text>
              <text class="text-[24rpx] text-gray-400">
                试试调整搜索条件或位置
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 时间范围选择器 -->
    <DateRangePicker
      v-model:visible="showDatePicker"
      :start-date="timeForm.startDate"
      :end-date="timeForm.endDate"
      :start-time="timeForm.startTime"
      :end-time="timeForm.endTime"
      @confirm="handleDateRangeConfirm"
    />

    <!-- 地址选择器 -->
    <MapAddressPicker
      v-model:visible="showMapPicker"
      :latitude="searchParams.latitude"
      :longitude="searchParams.longitude"
      title="选择位置"
      @confirm="handleAddressConfirm"
    />
  </view>
</template>

<route lang="yaml">
layout: home
</route>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

/* 覆盖默认的 animate-pulse，使其更流畅 */
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* 旋转动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
