<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  type LocationInfo,
  type MonthlyRentalActivity,
  type MonthlyVehicle,
  type PeriodOption,
  getActivityInfo,
  getMonthlyVehicles,
  getPeriodOptions,
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

// 租期选项
const periodOptions = ref<PeriodOption[]>([])

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

// 快捷标签
const quickTags = ref([
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
const placeholderVehicles = ref([
  {
    vehicleId: 1,
    name: '特斯拉 Model 3',
    brand: '特斯拉',
    carType: '轿车',
    energyType: '纯电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 2.1,
    rating: 4.9,
    ratingCount: 156,
    licensePlate: '沪A12345',
    dailyPrice: 299,
    monthlyPrice: 7176,
    rangeKm: 468,
    tags: [
      { tagName: '平台优选', tagType: 'featured' },
      { tagName: '免费换车', tagType: 'hot' },
    ],
  },
  {
    vehicleId: 2,
    name: '比亚迪海豹',
    brand: '比亚迪',
    carType: '轿车',
    energyType: '纯电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 1.5,
    rating: 4.8,
    ratingCount: 89,
    licensePlate: '沪B67890',
    dailyPrice: 199,
    monthlyPrice: 4478,
    rangeKm: 550,
    tags: [
      { tagName: '平台自营', tagType: 'new' },
      { tagName: '新车上线', tagType: 'featured' },
    ],
  },
  {
    vehicleId: 3,
    name: '宝马 iX3',
    brand: '宝马',
    carType: 'SUV',
    energyType: '纯电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 3.2,
    rating: 4.7,
    ratingCount: 234,
    licensePlate: '沪C11111',
    dailyPrice: 399,
    monthlyPrice: 8379,
    rangeKm: 490,
    tags: [
      { tagName: '豪华车型', tagType: 'luxury' },
      { tagName: '热门推荐', tagType: 'hot' },
    ],
  },
])

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
  return energyTypeMap[energyType] || energyType
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
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.vehicleId}`,
  })
}

// 快速预订
function quickBook(vehicleId: number) {
  const bookingData = {
    vehicleId: vehicleId.toString(),
    rentalType: 'monthly',
    period: selectedPeriod.value,
  }

  uni.navigateTo({
    url: `/pages/booking/index?data=${encodeURIComponent(JSON.stringify(bookingData))}`,
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

// 切换标签
function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
  else {
    selectedTags.value.push(tag)
  }
  fetchVehicles()
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

// 获取租期选项
async function fetchPeriodOptions() {
  try {
    const result = await getPeriodOptions()
    if (result.code === 200) {
      periodOptions.value = result.data.options
      // 设置默认选中第一个推荐选项
      const recommended = periodOptions.value.find(option => option.isRecommended)
      if (recommended) {
        selectedPeriod.value = recommended.period
      }
    }
  }
  catch (error) {
    console.error('获取租期选项失败:', error)
    // 使用默认租期选项
    periodOptions.value = [
      { period: 30, label: '30天', discountRate: 0.8, discountText: '8折优惠', isRecommended: true, benefits: ['免费换车一次', '延期免手续费'] },
      { period: 60, label: '60天', discountRate: 0.75, discountText: '7.5折优惠', isRecommended: false, benefits: ['免费换车两次', '延期免手续费', '专属客服'] },
      { period: 90, label: '90天', discountRate: 0.7, discountText: '7折优惠', isRecommended: false, benefits: ['免费换车三次', '延期免手续费', '专属客服', '优先预订'] },
      { period: 0, label: '自定义', discountRate: 0, discountText: '面议', isRecommended: false, benefits: ['个性化服务'] },
    ]
  }
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
    // 使用占位数据
    vehicles.value = placeholderVehicles.value
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 并行获取初始数据
  await Promise.allSettled([
    getLocation(),
    fetchActivityInfo(),
    fetchPeriodOptions(),
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
      <!-- 活动说明区域 - 简化设计 -->
      <view class="flex-shrink-0 bg-gray-50 px-[40rpx] py-[32rpx]">
        <view class="border border-gray-200 rounded-[32rpx] bg-white p-[32rpx]">
          <view class="mb-[16rpx] flex items-center space-x-[16rpx]">
            <view
              i-material-symbols:calendar-month
              class="text-[40rpx] text-orange-600"
            />
            <text class="text-[32rpx] text-black font-semibold">
              {{ activityInfo?.title || '超值月租活动' }}
            </text>
            <text class="rounded-full bg-orange-100 px-[16rpx] py-[8rpx] text-[22rpx] text-orange-600">
              {{ activityInfo?.badgeText || 'HOT' }}
            </text>
          </view>
          <text class="mb-[16rpx] block text-[28rpx] text-gray-700">
            {{ activityInfo?.subtitle || '30天起租，享受8折超值优惠' }}
          </text>
          <view class="flex items-center text-[24rpx] text-gray-600 space-x-[32rpx]">
            <text v-for="benefit in (activityInfo?.benefits || ['免费换车一次', '延期免手续费', '24小时道路救援'])" :key="benefit">
              ✓ {{ benefit }}
            </text>
          </view>
        </view>
      </view>

      <!-- 租期选择栏 -->
      <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[40rpx] py-[32rpx]">
        <view>
          <!-- 地址信息 -->
          <view
            class="flex flex-1 items-center py-[24rpx] space-x-[16rpx]"
            @tap="showLocationSelector"
          >
            <view
              i-material-symbols:location-on
              class="text-purple-600"
            />
            <text class="text-[28rpx] text-gray-700">
              {{ displayLocation }}
            </text>
          </view>

          <!-- 租期选择 -->
          <view>
            <view class="mb-[16rpx] flex items-center justify-between">
              <text class="text-[28rpx] text-gray-600">
                选择租期
              </text>
              <text class="text-[24rpx] text-gray-500">
                30天起租
              </text>
            </view>
            <view class="flex space-x-[16rpx]">
              <view
                v-for="option in periodOptions"
                :key="option.period"
                class="rounded-[16rpx] px-[32rpx] py-[16rpx] text-[28rpx] transition-all"
                :class="selectedPeriod === option.period
                  ? 'bg-purple-50 text-purple-600 border border-purple-200 font-medium'
                  : 'bg-gray-100 text-gray-600'"
                @tap="selectPeriod(option.period)"
              >
                {{ option.label }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 排序和筛选控制栏 -->
      <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[40rpx] py-[24rpx]">
        <view class="flex items-center justify-between">
          <view class="flex items-center space-x-[16rpx]">
            <!-- 排序选择 -->
            <picker
              mode="selector"
              :range="sortOptions"
              range-key="label"
              :value="sortOptions.findIndex(item => item.value === sortBy)"
              @change="(e: any) => handleSortChange(sortOptions[e.detail.value].value)"
            >
              <view class="flex items-center border border-gray-200 rounded-[16rpx] bg-gray-50 px-[20rpx] py-[12rpx]">
                <text class="mr-[8rpx] text-[26rpx] text-gray-700">
                  {{ sortOptions.find(item => item.value === sortBy)?.label }}
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
            共{{ vehicleTotal }}辆车
          </text>
        </view>

        <!-- 快捷标签栏 -->
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

      <!-- 车辆列表 - 参考搜索页面样式 -->
      <view class="flex-1 bg-gray-50">
        <view class="p-[24rpx] space-y-[16rpx]">
          <!-- 车辆卡片 -->
          <view
            v-for="vehicle in vehicles"
            :key="vehicle.vehicleId"
            class="flex flex-col overflow-hidden rounded-[24rpx] bg-white shadow-sm"
            @tap="selectVehicle(vehicle)"
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
                  {{ vehicle.name }}
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
                    ¥{{ vehicle.monthlyPrice || (vehicle.dailyPrice * 30).toFixed(0) }}
                  </text>
                  <text class="ml-[4rpx] text-[20rpx] text-gray-500">
                    /月
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

          <!-- 月租须知 -->
          <view class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
            <text class="mb-[24rpx] flex items-center text-[32rpx] text-black font-semibold">
              <view
                i-material-symbols:info
                class="mr-[16rpx] text-orange-600"
              />
              月租须知
            </text>
            <view class="text-[28rpx] text-gray-600 space-y-[16rpx]">
              <view
                v-for="rule in (activityRules.length > 0 ? activityRules : defaultRules)"
                :key="rule"
                class="flex items-start space-x-[16rpx]"
              >
                <text class="text-orange-600">
                  •
                </text>
                <text>{{ rule }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 地址选择器 -->
    <MapAddressPicker
      v-model:visible="showAddressPicker"
      title="选择取车位置"
      :latitude="selectedLocation.latitude"
      :longitude="selectedLocation.longitude"
      @confirm="handleAddressConfirm"
    />

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
              价格范围(月租)
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
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
