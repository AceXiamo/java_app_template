<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageSearchHead from '@/components/page/search/Head.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import { getVehicleCategories, getVehicleFilters, getVehicleTagTypes, searchVehicles } from '@/api/vehicle'
import type { Vehicle, VehicleCategory, VehicleFilterOptions, VehicleSearchParams, VehicleSearchResult, VehicleTagType } from '@/api/vehicle'

// 搜索参数
const searchParams = ref<VehicleSearchParams>({
  city: '上海',
  keywords: '',
  startTime: undefined,
  endTime: undefined,
  page: 1,
  limit: 20,
  sortBy: 'hot',
  latitude: undefined,
  longitude: undefined,
})

// 当前地址显示
const currentAddress = ref('上海')

// 数据状态
const vehicles = ref<Vehicle[]>([])
const total = ref(0)
const loading = ref(false)
const noMore = ref(false)
const showFilters = ref(false)
const showDatePicker = ref(false)
const showMapPicker = ref(false)
const filterOptions = ref<VehicleFilterOptions>({
  brands: [],
  carTypes: [],
  energyTypes: [],
  seats: [],
  priceRange: [0, 999],
})

// 筛选参数
const filters = ref({
  vehicleTypes: [] as string[],
  energyTypes: [] as string[],
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  seats: [] as number[],
})

// 已移除分类选项

// 快捷标签
const quickTags = ref<VehicleTagType[]>([])

// 价格范围选项
const priceRanges = ref([
  { label: '100以下', value: [0, 100] },
  { label: '100-200', value: [100, 200] },
  { label: '200-300', value: [200, 300] },
  { label: '300-500', value: [300, 500] },
  { label: '500以上', value: [500, 9999] },
])


// 排序选项
const sortOptions = [
  { label: '综合排序', value: 'hot' },
  { label: '距离最近', value: 'distance' },
  { label: '高配优先', value: 'price' },
]

// 选中状态
const selectedTags = ref<string[]>([])
const selectedPriceRange = ref<number[] | null>(null)

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
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    } else {
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
    
    // 更新地址显示
    if (jumpData.address) {
      currentAddress.value = jumpData.address
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
  loadTagTypes()
  searchVehicleList()
})

// 搜索车辆
async function searchVehicleList(isLoadMore = false) {
  if (loading.value)
    return

  try {
    loading.value = true

    if (!isLoadMore) {
      searchParams.value.page = 1
      vehicles.value = []
      noMore.value = false
      total.value = 0 // 重置总数
    }

    // 合并筛选参数
    const params = {
      ...searchParams.value,
      ...filters.value,
    }

    const response = await searchVehicles(params)

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

// 已移除分类加载功能

// 加载标签类型
async function loadTagTypes() {
  try {
    const response = await getVehicleTagTypes()
    if (response.code === 200 && response.data) {
      quickTags.value = response.data
    }
  }
  catch (error) {
    console.error('获取标签类型失败:', error)
  }
}

// 排序切换
function handleSortChange(sortBy: string) {
  searchParams.value.sortBy = sortBy as 'hot' | 'price' | 'distance'
  searchVehicleList()
}

// 应用筛选
function applyFilters() {
  showFilters.value = false
  searchVehicleList()
}

// 重置筛选
function resetFilters() {
  filters.value = {
    vehicleTypes: [],
    energyTypes: [],
    minPrice: undefined,
    maxPrice: undefined,
    seats: [],
  }
  selectedPriceRange.value = null
  searchVehicleList()
}

// 触底加载更多
function onReachBottom() {
  if (!loading.value && !noMore.value) {
    searchParams.value.page = (searchParams.value.page || 0) + 1
    searchVehicleList(true)
  }
}

// 车辆详情跳转
function goToVehicleDetail(vehicleId: number) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicleId}`,
  })
}

// 距离格式化
function formatDistance(distance?: number) {
  if (!distance)
    return ''
  if (distance < 1)
    return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

// 切换数组筛选项
function toggleArrayFilter(key: keyof typeof filters.value, value: any) {
  const array = filters.value[key] as any[]
  const index = array.indexOf(value)
  if (index > -1) {
    array.splice(index, 1)
  }
  else {
    array.push(value)
  }
}

// 已移除分类选择功能

// 切换标签
function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
  else {
    selectedTags.value.push(tag)
  }
  // 根据标签更新筛选条件
  searchVehicleList()
}

// 选择价格范围
function selectPriceRange(range: number[]) {
  selectedPriceRange.value = range
  filters.value.minPrice = range[0]
  filters.value.maxPrice = range[1] === 9999 ? undefined : range[1]
}

// 获取标签样式
function getTagStyle(tagType: string) {
  const styles: Record<string, string> = {
    hot: 'bg-red-500',
    new: 'bg-green-500',
    luxury: 'bg-purple-500',
    discount: 'bg-orange-500',
    featured: 'bg-blue-500',
  }
  return styles[tagType] || 'bg-gray-500'
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

// 格式化时间范围
function formatTimeRange() {
  if (!searchParams.value.startTime || !searchParams.value.endTime)
    return ''
  const start = new Date(searchParams.value.startTime)
  const end = new Date(searchParams.value.endTime)
  return `${start.getMonth() + 1}月${start.getDate()}日 ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getMonth() + 1}月${end.getDate()}日 ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
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
    }
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
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageSearchHead />

    <!-- 主要内容区域 -->
    <view class="flex flex-1 flex-col overflow-hidden">
        <!-- 搜索条件栏 -->
        <view class="border-b border-gray-100 bg-white px-[32rpx] py-[24rpx]">
          <!-- 地址和时间信息 -->
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center cursor-pointer min-w-0 flex-1" @tap="showMapSelector">
              <text class="i-material-symbols-location-on mr-[8rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-medium truncate">
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

          <!-- 排序和筛选控制 -->
          <view class="flex items-center justify-between">
            <view class="flex items-center space-x-[16rpx]">
              <!-- 排序选择 -->
              <picker
                mode="selector"
                :range="sortOptions"
                range-key="label"
                :value="sortOptions.findIndex(item => item.value === searchParams.sortBy)"
                @change="(e: any) => handleSortChange(sortOptions[e.detail.value].value)"
              >
                <view class="flex items-center border border-gray-200 rounded-[16rpx] bg-gray-50 px-[20rpx] py-[12rpx]">
                  <text class="mr-[8rpx] text-[26rpx] text-gray-700">
                    {{ sortOptions.find(item => item.value === searchParams.sortBy)?.label }}
                  </text>
                  <text class="i-material-symbols-keyboard-arrow-down text-[28rpx] text-gray-400" />
                </view>
              </picker>

              <!-- 筛选按钮 -->
              <view class="flex items-center border border-gray-200 rounded-[16rpx] bg-gray-50 px-[20rpx] py-[12rpx]" @tap="showFilters = true">
                <text class="i-material-symbols-tune text-[26rpx] text-gray-700" />
                <text class="ml-[8rpx] text-[26rpx] text-gray-700">
                  筛选
                </text>
              </view>
            </view>

            <!-- 搜索结果数量 -->
            <text class="text-[24rpx] text-gray-500">
              共{{ total }}辆车
            </text>
          </view>

          <!-- 标签栏（支持横向滚动） -->
          <scroll-view
            v-if="quickTags.length > 0"
            scroll-x
            class="mt-[24rpx]"
            show-scrollbar="false"
          >
            <view class="flex px-[2rpx] space-x-[16rpx]">
              <view
                v-for="tag in quickTags"
                :key="tag.value"
                class="flex-shrink-0 whitespace-nowrap rounded-full px-[24rpx] py-[8rpx] text-[24rpx] transition-all"
                :class="selectedTags.includes(tag.value)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'"
                :style="selectedTags.includes(tag.value) ? { backgroundColor: tag.color } : {}"
                @tap="toggleTag(tag.value)"
              >
                {{ tag.label }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 车辆列表 -->
        <scroll-view
          scroll-y
          class="flex-1 overflow-y-auto"
          @scrolltolower="onReachBottom"
        >
          <view class="p-[24rpx] space-y-[16rpx]">
            <view
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleId"
              class="flex flex-col overflow-hidden rounded-[24rpx] bg-white shadow-sm"
              @tap="goToVehicleDetail(vehicle.vehicleId)"
            >
              <!-- 上半部分：图片和车辆信息 -->
              <view class="flex">
                <!-- 车辆图片 -->
                <view class="relative h-[180rpx] w-[240rpx] flex-shrink-0">
                  <image :src="vehicle.imageUrl" mode="aspectFill" class="h-full w-full rounded-tl-[24rpx]" />
                  <!-- 促销标签 -->
                  <view class="absolute left-[12rpx] top-[12rpx] flex flex-col space-y-[6rpx]">
                    <view
                      v-for="tag in vehicle.tags.slice(0, 2)"
                      :key="tag.tagName"
                      class="w-max rounded-[12rpx] px-[12rpx] py-[4rpx] text-[18rpx] text-white font-medium"
                      :class="getTagStyle(tag.tagType)"
                    >
                      {{ tag.tagName }}
                    </view>
                  </view>
                </view>

                <!-- 车辆基本信息 -->
                <view class="flex flex-1 flex-col justify-center p-[20rpx]">
                  <text class="block text-[28rpx] text-black font-semibold leading-[40rpx]">
                    {{ getVehicleDisplayName(vehicle) }}
                  </text>

                  <!-- 车牌和基本信息分两行显示 -->
                  <view class="mt-[8rpx] flex flex-col gap-[8rpx] text-[22rpx] text-gray-600">
                    <text class="flex-shrink-0">
                      {{ formatLicensePlate(vehicle.licensePlate) }}
                    </text>
                    <view class="flex items-center space-x-[12rpx]">
                      <text class="flex-shrink-0">
                        {{ vehicle.seats }}座
                      </text>
                      <text class="flex-shrink-0">
                        {{ getEnergyTypeText(vehicle.energyType) }}
                      </text>
                    </view>
                  </view>

                  <!-- 车辆特性 -->
                  <view class="mt-[12rpx] flex flex-wrap items-center gap-[16rpx]">
                    <view v-if="vehicle.rangeKm" class="flex items-center">
                      <text class="i-material-symbols-battery-charging-full mr-[6rpx] text-[20rpx] text-green-500" />
                      <text class="text-[20rpx] text-gray-600">
                        {{ vehicle.rangeKm }}km
                      </text>
                    </view>
                    <view v-if="vehicle.distance" class="flex items-center">
                      <text class="i-material-symbols-location-on mr-[6rpx] text-[20rpx] text-purple-500" />
                      <text class="text-[20rpx] text-gray-600">
                        {{ formatDistance(vehicle.distance) }}
                      </text>
                    </view>
                    <view class="flex items-center">
                      <text class="i-material-symbols-star mr-[6rpx] text-[20rpx] text-yellow-500" />
                      <text class="text-[20rpx] text-gray-600">
                        {{ vehicle.rating }}({{ vehicle.ratingCount }})
                      </text>
                    </view>
                  </view>
                </view>
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
                <view class="flex rounded-[20rpx] bg-purple-600 px-[24rpx] py-[12rpx]" @tap.stop="quickBook(vehicle.vehicleId)">
                  <text class="text-[24rpx] text-white font-medium">
                    立即预订
                  </text>
                </view>
              </view>
            </view>

            <!-- 加载状态 -->
            <view class="py-[48rpx] text-center text-[28rpx] text-gray-500">
              <text v-if="loading">
                加载中...
              </text>
              <text v-else-if="noMore && vehicles.length > 0">
                没有更多了
              </text>
              <text v-else-if="vehicles.length === 0 && !loading">
                暂无搜索结果
              </text>
            </view>
          </view>
        </scroll-view>
    </view>

    <!-- 筛选弹窗 -->
    <BottomDrawer v-model:visible="showFilters" title="筛选条件">
      <view class="mt-[32rpx]">
        <!-- 操作按钮 -->
        <view class="mb-[32rpx] flex items-center justify-end border-b border-gray-100 pb-[24rpx] space-x-[32rpx]">
          <text class="text-[28rpx] text-gray-600" @tap="resetFilters">
            重置
          </text>
          <text class="text-[28rpx] text-purple-600 font-medium" @tap="applyFilters">
            确定
          </text>
        </view>

        <scroll-view scroll-y class="h-max">
          <!-- 价格范围 -->
          <view class="mb-[48rpx]">
            <text class="mb-[24rpx] block text-[28rpx] text-black font-semibold">
              价格范围
            </text>
            <view class="flex flex-wrap gap-[16rpx]">
              <view
                v-for="range in priceRanges"
                :key="range.label"
                class="border-2 rounded-[20rpx] px-[24rpx] py-[12rpx] text-[24rpx] transition-all"
                :class="selectedPriceRange && selectedPriceRange[0] === range.value[0] && selectedPriceRange[1] === range.value[1]
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 bg-gray-50 text-gray-600'"
                @tap="selectPriceRange(range.value)"
              >
                {{ range.label }}
              </view>
            </view>
          </view>

          <!-- 车型筛选 -->
          <view class="mb-[48rpx]">
            <text class="mb-[24rpx] block text-[28rpx] text-black font-semibold">
              车型
            </text>
            <view class="flex flex-wrap gap-[16rpx]">
              <view
                v-for="type in filterOptions.carTypes"
                :key="type"
                class="border-2 rounded-[20rpx] px-[24rpx] py-[12rpx] text-[24rpx] transition-all"
                :class="filters.vehicleTypes.includes(type)
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 bg-gray-50 text-gray-600'"
                @tap="toggleArrayFilter('vehicleTypes', type)"
              >
                {{ type }}
              </view>
            </view>
          </view>

          <!-- 能源类型 -->
          <view class="mb-[48rpx]">
            <text class="mb-[24rpx] block text-[28rpx] text-black font-semibold">
              能源类型
            </text>
            <view class="flex flex-wrap gap-[16rpx]">
              <view
                v-for="energy in filterOptions.energyTypes"
                :key="energy"
                class="border-2 rounded-[20rpx] px-[24rpx] py-[12rpx] text-[24rpx] transition-all"
                :class="filters.energyTypes.includes(energy)
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 bg-gray-50 text-gray-600'"
                @tap="toggleArrayFilter('energyTypes', energy)"
              >
                {{ energy }}
              </view>
            </view>
          </view>

          <!-- 座位数 -->
          <view class="mb-[48rpx]">
            <text class="mb-[24rpx] block text-[28rpx] text-black font-semibold">
              座位数
            </text>
            <view class="flex flex-wrap gap-[16rpx]">
              <view
                v-for="seat in filterOptions.seats"
                :key="seat"
                class="border-2 rounded-[20rpx] px-[24rpx] py-[12rpx] text-[24rpx] transition-all"
                :class="filters.seats.includes(seat)
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 bg-gray-50 text-gray-600'"
                @tap="toggleArrayFilter('seats', seat)"
              >
                {{ seat }}座
              </view>
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
