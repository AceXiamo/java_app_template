<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  type LocationInfo,
  type MonthlyRentalActivity,
  getActivityInfo,
  getMonthlyVehicles,
} from '@/api/monthly-rental'
import { getCurrentLocation } from '@/api/home'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'

// 页面数据状态
const loading = ref(false)
const currentLocation = ref<LocationInfo | null>(null)
const selectedPeriod = ref(30)

// 活动信息
const activityInfo = ref<MonthlyRentalActivity | null>(null)
const activityRules = ref<string[]>([])

// 租期选项 - 静态数据
const periodOptions = ref([
  { period: 30, label: '30天', discountRate: 0.8, discountText: '8折优惠', isRecommended: true },
  { period: 60, label: '60天', discountRate: 0.75, discountText: '7.5折优惠', isRecommended: false },
  { period: 90, label: '90天', discountRate: 0.7, discountText: '7折优惠', isRecommended: false },
])

// 推荐车辆列表
const vehicles = ref<any[]>([])
const vehicleTotal = ref(0)

// 分页信息
const currentPage = ref(1)
const pageSize = ref(10)

// 地址选择相关
const showAddressPicker = ref(false)
const selectedLocation = ref({
  latitude: 31.2317,
  longitude: 121.4658,
  address: '人民广场',
  formattedAddress: '上海市黄浦区人民广场',
})

// 筛选和排序相关
const showFilters = ref(false)
const sortBy = ref('distance')
const filterOptions = ref({
  brands: ['特斯拉', '比亚迪', '宝马', '奔驰', '奥迪'],
  carTypes: ['轿车', 'SUV', 'MPV', '跑车'],
  energyTypes: ['纯电动', '混合动力', '汽油', '柴油'],
  seats: [2, 4, 5, 7],
  priceRange: [0, 20000],
})

// 筛选参数
const filters = ref({
  vehicleTypes: [] as string[],
  energyTypes: [] as string[],
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  seats: [] as number[],
})

// 快捷标签（暂未使用，保留供后续功能扩展）
const _quickTags = ref([
  { label: '平台自营', value: 'platform', color: '#3b82f6' },
  { label: '超值月租', value: 'monthly', color: '#ef4444' },
  { label: '新车上线', value: 'new', color: '#10b981' },
  { label: '高分好评', value: 'rating', color: '#8b5cf6' },
])

// 排序选项
const sortOptions = [
  { label: '距离最近', value: 'distance' },
  { label: '价格最低', value: 'price' },
  { label: '评分最高', value: 'rating' },
  { label: '综合排序', value: 'hot' },
]

// 价格范围选项
const priceRanges = ref([
  { label: '3000以下', value: [0, 3000] },
  { label: '3000-5000', value: [3000, 5000] },
  { label: '5000-8000', value: [5000, 8000] },
  { label: '8000-12000', value: [8000, 12000] },
  { label: '12000以上', value: [12000, 99999] },
])

// 选中状态
const selectedTags = ref<string[]>([])
const selectedPriceRange = ref<number[] | null>(null)

// 静态占位数据（API失败时使用） - 使用搜索页面格式
const _placeholderVehicles = ref([])

// 默认月租须知
const defaultRules = [
  '最低租期30天，支持延期，延期免手续费',
  '月租期间享受一次免费换车服务',
  '24小时道路救援，保险理赔快速处理',
  '提前7天退租可退还剩余租金的70%',
]

// 计算显示的位置信息
const displayLocation = computed(() => {
  return selectedLocation.value.address || '选择位置'
})

// 能源类型显示中文
function getEnergyTypeText(energyType: string) {
  const energyTypeMap: Record<string, string> = {
    ELECTRIC: '纯电动',
    HYBRID: '混合动力',
    GASOLINE: '汽油',
    DIESEL: '柴油',
    纯电动: '纯电动',
    混合动力: '混合动力',
    汽油: '汽油',
    柴油: '柴油',
    电动: '纯电动',
  }
  return energyTypeMap[energyType.toUpperCase()] || energyType
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

// 距离格式化
function formatDistance(distance?: number) {
  if (!distance)
    return ''
  if (distance < 1)
    return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
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

// 获取位置信息
async function getLocation() {
  try {
    const location = await uni.getLocation({
      type: 'wgs84',
    })

    const response = await getCurrentLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    })

    if (response.code === 200 && response.data) {
      currentLocation.value = response.data
    }
  }
  catch (error) {
    console.error('获取位置失败:', error)
  }
}

// 选择租期
async function selectPeriod(period: number) {
  selectedPeriod.value = period
  // 重新获取车辆列表
  await fetchVehicles()
}

// 显示地址选择器
function showLocationSelector() {
  showAddressPicker.value = true
}

// 处理地址选择确认
function handleAddressConfirm(data: any) {
  selectedLocation.value = {
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.poiName || data.formattedAddress,
    formattedAddress: data.formattedAddress,
  }

  // 重新获取车辆列表
  fetchVehicles()
}

// 点击车辆卡片
function selectVehicle(vehicle: any) {
  // 生成默认时间参数
  const today = new Date()
  const startTime = new Date(today)
  startTime.setHours(9, 0, 0, 0) // 默认开始时间为今天9:00

  const endTime = new Date(today)
  endTime.setDate(today.getDate() + selectedPeriod.value) // 加上选中的租期天数
  endTime.setHours(18, 0, 0, 0) // 默认结束时间为18:00

  // 传递时间参数到车辆详情页
  const vehicleDetailParams = {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }

  setJumpData('vehicleDetailParams', vehicleDetailParams)

  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.vehicleId}`,
  })
}

// 快速预订 - 跳转到车辆详情页面
function quickBook(vehicleId: number) {
  // 生成默认时间参数
  const today = new Date()
  const startTime = new Date(today)
  startTime.setHours(9, 0, 0, 0) // 默认开始时间为今天9:00

  const endTime = new Date(today)
  endTime.setDate(today.getDate() + selectedPeriod.value) // 加上选中的租期天数
  endTime.setHours(18, 0, 0, 0) // 默认结束时间为18:00

  // 传递时间参数到车辆详情页
  const vehicleDetailParams = {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }

  setJumpData('vehicleDetailParams', vehicleDetailParams)

  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicleId}`,
  })
}

// 排序切换
function handleSortChange(value: string) {
  sortBy.value = value
  fetchVehicles()
}

// 应用筛选
function applyFilters() {
  showFilters.value = false
  fetchVehicles()
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
  selectedTags.value = []
  fetchVehicles()
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

// 选择价格范围
function selectPriceRange(range: number[]) {
  selectedPriceRange.value = range
  filters.value.minPrice = range[0]
  filters.value.maxPrice = range[1] === 99999 ? undefined : range[1]
}

// 获取活动信息
async function fetchActivityInfo() {
  try {
    const result = await getActivityInfo()
    if (result.code === 200) {
      activityInfo.value = result.data.activity
      activityRules.value = result.data.rules
    }
  }
  catch (error) {
    console.error('获取活动信息失败:', error)
    // 使用默认活动信息
    activityInfo.value = {
      id: 0,
      title: '超值月租活动',
      subtitle: '30天起租，享受8折超值优惠',
      status: 'active',
      startTime: '',
      endTime: '',
      minDays: 30,
      maxDiscount: 0.8,
      badgeText: 'HOT',
      badgeColor: 'orange',
      benefits: ['免费换车一次', '延期免手续费', '24小时道路救援'],
    }
    activityRules.value = defaultRules
  }
}

// 初始化租期选择 - 设置默认选中第一个推荐选项
function initializePeriodSelection() {
  const recommended = periodOptions.value.find(option => option.isRecommended)
  if (recommended) {
    selectedPeriod.value = recommended.period
  }
}

// 映射车型到后端枚举值
function mapCarType(type: string): string {
  const map: Record<string, string> = {
    轿车: 'sedan',
    SUV: 'suv',
    MPV: 'mpv',
    跑车: 'sports',
  }
  return map[type] || type
}

// 映射能源类型到后端枚举值
function mapEnergyType(type: string): string {
  const map: Record<string, string> = {
    纯电动: 'electric',
    混合动力: 'hybrid',
    汽油: 'gasoline',
    柴油: 'diesel',
  }
  return map[type] || type
}

// 获取车辆列表
async function fetchVehicles() {
  try {
    loading.value = true
    const result = await getMonthlyVehicles({
      location: {
        latitude: selectedLocation.value.latitude,
        longitude: selectedLocation.value.longitude,
        address: selectedLocation.value.formattedAddress,
      },
      rentalPeriod: selectedPeriod.value,
      page: currentPage.value,
      size: pageSize.value,
      // 添加筛选参数
      vehicleTypes: filters.value.vehicleTypes.map(mapCarType),
      energyTypes: filters.value.energyTypes.map(mapEnergyType),
      seats: filters.value.seats,
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice,
    })

    if (result.code === 200) {
      // 将后端数据格式转换为前端格式
      const formattedVehicles = result.data.vehicles.map((vehicle: any) => ({
        ...vehicle,
        tags: vehicle.tags || [],
        ratingCount: vehicle.ratingCount || 0,
      }))
      vehicles.value = formattedVehicles
      vehicleTotal.value = result.data.total
    }
    else {
      throw new Error(result.message)
    }
  }
  catch (error) {
    console.error('获取车辆列表失败:', error)
    // 失败时清空列表，不使用占位数据
    vehicles.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 初始化租期选择
  initializePeriodSelection()

  // 并行获取初始数据
  await Promise.allSettled([
    getLocation(),
    fetchActivityInfo(),
  ])
  // 获取位置后再获取车辆列表
  await fetchVehicles()
})
</script>

<template>
  <view relative h-full flex flex-col overflow-hidden bg-gray-50>
    <!-- 头部组件 -->
    <PageMonthlyRentalHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <!-- 活动说明区域 - 按设计规范优化 -->
      <view class="flex-shrink-0 bg-gray-50 px-[24rpx] py-[24rpx]">
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <view i-material-symbols:calendar-month class="text-[40rpx] text-orange-600" />
            <text class="text-[32rpx] text-gray-900 font-semibold">
              {{ activityInfo?.title || "超值月租活动" }}
            </text>
            <view class="rounded-full bg-orange-50 px-[16rpx] py-[8rpx]">
              <text class="text-[20rpx] text-orange-600 font-medium">
                {{ activityInfo?.badgeText || "HOT" }}
              </text>
            </view>
          </view>
          <text class="mb-[24rpx] block text-[26rpx] text-gray-700 leading-normal">
            {{ activityInfo?.subtitle || "30天起租，享受8折超值优惠" }}
          </text>
          <view class="flex flex-wrap items-center gap-[24rpx] text-[22rpx] text-gray-600">
            <text
              v-for="benefit in activityInfo?.benefits || [
                '免费换车一次',
                '延期免手续费',
                '24小时道路救援',
              ]" :key="benefit" class="flex items-center"
            >
              <text class="i-material-symbols-check-circle mr-[8rpx] text-[16rpx] text-green-600" />
              {{ benefit }}
            </text>
          </view>
        </view>
      </view>

      <!-- 租期选择栏 - 按设计规范优化 -->
      <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[24rpx] py-[24rpx]">
        <view class="space-y-[24rpx]">
          <!-- 地址信息 -->
          <view
            class="flex items-center rounded-[12rpx] bg-gray-50 p-[16rpx] transition-colors space-x-[12rpx] active:bg-gray-100"
            @tap="showLocationSelector"
          >
            <view i-material-symbols:location-on class="text-[24rpx] text-purple-600" />
            <text class="flex-1 text-[26rpx] text-gray-700 font-medium">
              {{ displayLocation }}
            </text>
            <view i-material-symbols:chevron-right class="text-[20rpx] text-gray-400" />
          </view>

          <!-- 租期选择 -->
          <view>
            <view class="mb-[16rpx] flex items-center justify-between">
              <text class="text-[28rpx] text-gray-900 font-medium">
                选择租期
              </text>
              <text class="text-[22rpx] text-gray-500">
                30天起租
              </text>
            </view>
            <view class="flex space-x-[16rpx]">
              <view
                v-for="option in periodOptions" :key="option.period"
                class="flex-1 rounded-[16rpx] px-[16rpx] py-[16rpx] text-center transition-all duration-150 active:scale-95"
                :class="selectedPeriod === option.period
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
                " @tap="selectPeriod(option.period)"
              >
                <text class="block text-[24rpx] font-medium">
                  {{ option.label }}
                </text>
                <text
                  v-if="option.discountText" class="mt-[4rpx] block text-[20rpx]"
                  :class="selectedPeriod === option.period ? 'text-purple-100' : 'text-gray-500'"
                >
                  {{ option.discountText }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 排序和筛选控制栏 - 按设计规范优化 -->
      <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[24rpx] py-[16rpx]">
        <view class="flex items-center justify-between">
          <view class="flex items-center space-x-[16rpx]">
            <!-- 排序选择 -->
            <picker
              mode="selector" :range="sortOptions" range-key="label"
              :value="sortOptions.findIndex((item) => item.value === sortBy)"
              @change="(e: any) => handleSortChange(sortOptions[e.detail.value].value)"
            >
              <view
                class="flex items-center rounded-[20rpx] bg-purple-50 px-[16rpx] py-[12rpx] transition-colors active:bg-purple-100"
              >
                <text class="mr-[8rpx] text-[24rpx] text-purple-600 font-medium">
                  {{ sortOptions.find((item) => item.value === sortBy)?.label }}
                </text>
                <text class="i-material-symbols-expand-more text-[20rpx] text-purple-500" />
              </view>
            </picker>

            <!-- 筛选按钮 -->
            <view
              class="flex items-center rounded-[20rpx] bg-gray-50 px-[16rpx] py-[12rpx] transition-colors active:bg-gray-100"
              @tap="showFilters = true"
            >
              <text class="i-material-symbols-tune text-[20rpx] text-gray-600" />
              <text class="ml-[8rpx] text-[24rpx] text-gray-600 font-medium">
                筛选
              </text>
            </view>
          </view>

          <!-- 搜索结果数量 -->
          <view class="flex items-center space-x-[8rpx]">
            <text class="i-material-symbols-directions-car text-[20rpx] text-gray-400" />
            <text class="text-[22rpx] text-gray-500 font-medium">
              共{{ vehicleTotal }}辆
            </text>
          </view>
        </view>
      </view>

      <!-- 车辆列表 - 按设计规范优化 -->
      <view class="flex-1 bg-gray-50">
        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 骨架屏加载状态 -->
          <view v-if="loading" class="space-y-[24rpx]">
            <view v-for="i in 4" :key="i" class="overflow-hidden rounded-[24rpx] bg-white p-[24rpx] shadow-sm">
              <view class="flex space-x-[16rpx]">
                <!-- Image Skeleton -->
                <view class="h-[160rpx] w-[200rpx] flex-shrink-0 animate-pulse rounded-[16rpx] bg-gray-200" />
                <!-- Content Skeleton -->
                <view class="flex flex-1 flex-col justify-between">
                  <view>
                    <view class="mb-[16rpx] h-[32rpx] w-[60%] animate-pulse rounded bg-gray-200" />
                    <view class="mb-[12rpx] h-[24rpx] w-[40%] animate-pulse rounded bg-gray-200" />
                    <view class="flex space-x-[16rpx]">
                      <view class="h-[24rpx] w-[60rpx] animate-pulse rounded bg-gray-200" />
                      <view class="h-[24rpx] w-[60rpx] animate-pulse rounded bg-gray-200" />
                    </view>
                  </view>
                  <view class="flex gap-[12rpx]">
                    <view class="h-[32rpx] w-[80rpx] animate-pulse rounded bg-gray-200" />
                    <view class="h-[32rpx] w-[80rpx] animate-pulse rounded bg-gray-200" />
                  </view>
                </view>
              </view>
              <view class="mt-[20rpx] flex items-center justify-between border-t border-gray-100 pt-[20rpx]">
                <view class="h-[40rpx] w-[120rpx] animate-pulse rounded bg-gray-200" />
                <view class="h-[56rpx] w-[140rpx] animate-pulse rounded-[20rpx] bg-gray-200" />
              </view>
            </view>
          </view>

          <!-- 车辆卡片 -->
          <template v-else>
            <template v-if="vehicles.length > 0">
              <view
                v-for="vehicle in vehicles"
                :key="vehicle.vehicleId"
                class="overflow-hidden rounded-[24rpx] bg-white shadow-sm transition-all duration-150 active:scale-99"
                @tap="selectVehicle(vehicle)"
              >
                <!-- 车辆信息卡片 -->
                <view class="p-[24rpx]">
                  <view class="flex space-x-[16rpx]">
                    <!-- 车辆图片 -->
                    <view class="relative h-[160rpx] w-[200rpx] flex-shrink-0">
                      <image :src="vehicle.imageUrl" mode="aspectFill" class="h-full w-full rounded-[16rpx]" />
                      <!-- 促销标签 -->
                      <view class="absolute left-[8rpx] top-[8rpx] flex flex-col space-y-[4rpx]">
                        <view
                          v-for="tag in vehicle.tags.slice(0, 2)"
                          :key="tag.tagName"
                          class="rounded-[8rpx] px-[8rpx] py-[4rpx] text-[18rpx] text-white font-medium shadow-sm"
                          :class="getTagStyle(tag.tagType)"
                        >
                          {{ tag.tagName }}
                        </view>
                      </view>
                    </view>

                    <!-- 车辆基本信息 -->
                    <view class="flex flex-1 flex-col justify-between">
                      <view>
                        <text class="mb-[8rpx] block text-[28rpx] text-gray-900 font-semibold leading-tight">
                          {{ vehicle.name }}
                        </text>

                        <!-- 车牌和基本信息 -->
                        <view class="mb-[12rpx] space-y-[4rpx]">
                          <text class="block text-[22rpx] text-gray-600">
                            {{ formatLicensePlate(vehicle.licensePlate) }}
                          </text>
                          <view class="flex items-center text-[20rpx] text-gray-500 space-x-[16rpx]">
                            <text>{{ vehicle.seats }}座</text>
                            <text>{{ getEnergyTypeText(vehicle.energyType) }}</text>
                          </view>
                        </view>
                      </view>

                      <!-- 车辆特性 -->
                      <view class="flex flex-wrap items-center gap-[12rpx]">
                        <view
                          v-if="vehicle.rangeKm"
                          class="flex items-center rounded-[8rpx] bg-green-50 px-[8rpx] py-[4rpx]"
                        >
                          <text class="i-material-symbols-battery-charging-full mr-[4rpx] text-[16rpx] text-green-600" />
                          <text class="text-[18rpx] text-green-600 font-medium">
                            {{ vehicle.rangeKm }}km
                          </text>
                        </view>
                        <view
                          v-if="vehicle.distance"
                          class="flex items-center rounded-[8rpx] bg-purple-50 px-[8rpx] py-[4rpx]"
                        >
                          <text class="i-material-symbols-location-on mr-[4rpx] text-[16rpx] text-purple-600" />
                          <text class="text-[18rpx] text-purple-600 font-medium">
                            {{ formatDistance(vehicle.distance) }}
                          </text>
                        </view>
                        <view class="flex items-center rounded-[8rpx] bg-yellow-50 px-[8rpx] py-[4rpx]">
                          <text class="i-material-symbols-star mr-[4rpx] text-[16rpx] text-yellow-600" />
                          <text class="text-[18rpx] text-yellow-600 font-medium">
                            {{ vehicle.rating }}({{ vehicle.ratingCount }})
                          </text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 价格信息和预订按钮 -->
                <view class="border-t border-gray-100 px-[24rpx] py-[20rpx]">
                  <view class="flex items-center justify-between">
                    <view class="flex-1">
                      <view class="mb-[4rpx] flex items-baseline">
                        <text class="text-[36rpx] text-purple-600 font-bold">
                          ¥{{ vehicle.monthlyPrice || (vehicle.dailyPrice * 30).toFixed(0) }}
                        </text>
                        <text class="ml-[8rpx] text-[22rpx] text-gray-500 font-medium">
                          /月
                        </text>
                      </view>
                      <template v-if="vehicle.monthlyPrice">
                        <view
                          v-if="getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)"
                          class="flex items-center space-x-[8rpx]"
                        >
                          <text class="text-[20rpx] text-gray-400 line-through">
                            ¥{{ (vehicle.dailyPrice * 30).toFixed(0) }}
                          </text>
                          <view class="rounded-[8rpx] bg-red-50 px-[8rpx] py-[2rpx]">
                            <text class="text-[18rpx] text-red-600 font-medium">
                              {{
                                getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)
                                  ?.discountPercent
                              }}折
                            </text>
                          </view>
                          <text class="text-[18rpx] text-green-600 font-medium">
                            省{{
                              getMonthlyDiscount(
                                vehicle.dailyPrice,
                                vehicle.monthlyPrice,
                              )?.savings.toFixed(0)
                            }}元
                          </text>
                        </view>
                      </template>
                    </view>

                    <!-- 快速预订按钮 -->
                    <view
                      class="flex rounded-[20rpx] bg-purple-600 px-[32rpx] py-[16rpx] transition-colors active:bg-purple-700"
                      @tap.stop="quickBook(vehicle.vehicleId)"
                    >
                      <text class="text-[24rpx] text-white font-semibold">
                        立即预订
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </template>

            <!-- 空状态 -->
            <view v-else class="flex flex-col items-center justify-center py-[120rpx]">
              <view class="i-heroicons:face-frown h-[120rpx] w-[120rpx] text-gray-300" />
              <text class="mt-[24rpx] text-[28rpx] text-gray-500 font-medium">
                暂无符合条件的车辆
              </text>
              <text class="mt-[12rpx] text-[24rpx] text-gray-400">
                试试调整筛选条件或更换位置
              </text>
            </view>
          </template>

          <!-- 月租须知 - 按设计规范优化 -->
          <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
            <view class="mb-[24rpx] flex items-center">
              <view i-material-symbols:info class="mr-[12rpx] text-[32rpx] text-orange-600" />
              <text class="text-[28rpx] text-gray-900 font-semibold">
                月租须知
              </text>
            </view>
            <view class="space-y-[16rpx]">
              <view
                v-for="rule in activityRules.length > 0 ? activityRules : defaultRules" :key="rule"
                class="flex items-start space-x-[12rpx]"
              >
                <view class="mt-[8rpx] h-[8rpx] w-[8rpx] flex-shrink-0 rounded-full bg-orange-600" />
                <text class="text-[24rpx] text-gray-700 leading-normal">
                  {{ rule }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 地址选择器 -->
    <MapAddressPicker
      v-model:visible="showAddressPicker" title="选择取车位置" :latitude="selectedLocation.latitude"
      :longitude="selectedLocation.longitude" @confirm="handleAddressConfirm"
    />

    <!-- 筛选弹窗 -->
    <BottomDrawer v-model:visible="showFilters" title="筛选条件">
      <view class="mt-[24rpx]">
        <!-- 操作按钮 -->
        <view class="mb-[24rpx] flex items-center justify-end pb-[20rpx] space-x-[24rpx]">
          <view class="rounded-[20rpx] bg-gray-50 px-[20rpx] py-[10rpx] active:bg-gray-100" @tap="resetFilters">
            <text class="text-[26rpx] text-gray-600 font-medium">
              重置
            </text>
          </view>
          <view class="rounded-[20rpx] bg-purple-600 px-[20rpx] py-[10rpx] active:bg-purple-700" @tap="applyFilters">
            <text class="text-[26rpx] text-white font-medium">
              确定
            </text>
          </view>
        </view>

        <scroll-view scroll-y class="h-max">
          <!-- 价格范围 -->
          <view class="mb-[40rpx]">
            <text class="mb-[20rpx] block text-[26rpx] text-black font-semibold">
              价格范围(月租)
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="range in priceRanges" :key="range.label"
                class="rounded-[18rpx] px-[20rpx] py-[10rpx] text-[22rpx] font-medium transition-all active:scale-95"
                :class="selectedPriceRange
                  && selectedPriceRange[0] === range.value[0]
                  && selectedPriceRange[1] === range.value[1]
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                " @tap="selectPriceRange(range.value)"
              >
                {{ range.label }}
              </view>
            </view>
          </view>

          <!-- 车型筛选 -->
          <view class="mb-[40rpx]">
            <text class="mb-[20rpx] block text-[26rpx] text-black font-semibold">
              车型
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="type in filterOptions.carTypes" :key="type"
                class="rounded-[18rpx] px-[20rpx] py-[10rpx] text-[22rpx] font-medium transition-all active:scale-95"
                :class="filters.vehicleTypes.includes(type)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                " @tap="toggleArrayFilter('vehicleTypes', type)"
              >
                {{ type }}
              </view>
            </view>
          </view>

          <!-- 能源类型 -->
          <view class="mb-[40rpx]">
            <text class="mb-[20rpx] block text-[26rpx] text-black font-semibold">
              能源类型
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="energy in filterOptions.energyTypes" :key="energy"
                class="rounded-[18rpx] px-[20rpx] py-[10rpx] text-[22rpx] font-medium transition-all active:scale-95"
                :class="filters.energyTypes.includes(energy)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                " @tap="toggleArrayFilter('energyTypes', energy)"
              >
                {{ energy }}
              </view>
            </view>
          </view>

          <!-- 座位数 -->
          <view class="mb-[40rpx]">
            <text class="mb-[20rpx] block text-[26rpx] text-black font-semibold">
              座位数
            </text>
            <view class="flex flex-wrap gap-[12rpx]">
              <view
                v-for="seat in filterOptions.seats" :key="seat"
                class="rounded-[18rpx] px-[20rpx] py-[10rpx] text-[22rpx] font-medium transition-all active:scale-95"
                :class="filters.seats.includes(seat)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                " @tap="toggleArrayFilter('seats', seat)"
              >
                {{ seat }}座
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
