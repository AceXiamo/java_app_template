<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
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
const selectedPeriod = ref(30) // 默认30天，保留用于API调用
const isSticky = ref(false)
let observer: UniApp.IntersectionObserver | null = null

// 活动信息
const activityInfo = ref<MonthlyRentalActivity | null>(null)
const activityRules = ref<string[]>([])

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
    hot: 'bg-[#fff7ed] text-[#ff7a1a]', // Orange
    new: 'bg-[#f0fdf4] text-[#10b981]', // Green
    luxury: 'bg-[#f4eefe] text-[#8b5cf6]', // Purple
    discount: 'bg-[#fff1f2] text-[#f43f5e]', // Red
    featured: 'bg-[#eff6ff] text-[#3b82f6]', // Blue
  }
  return styles[tagType] || 'bg-[#f1f5f9] text-[#64748b]'
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
      currentLocation.value = response.data as unknown as LocationInfo
    }
  }
  catch (error) {
    console.error('获取位置失败:', error)
  }
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
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startTime = new Date(tomorrow)
  startTime.setHours(9, 0, 0, 0) // 默认开始时间为明天9:00

  // Calculate end time: start time + selected period days - 1 day
  const endTime = new Date(startTime)
  endTime.setDate(startTime.getDate() + selectedPeriod.value - 1)
  endTime.setHours(18, 0, 0, 0) // 结束时间设为当天18:00

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

// 快速预订 - 直接跳转到预订页面
function quickBook(vehicleId: number) {
  // 生成默认时间参数
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startTime = new Date(tomorrow)
  startTime.setHours(9, 0, 0, 0) // 默认开始时间为明天9:00

  // Calculate end time: start time + selected period days - 1 day
  // For 30 days rental: tomorrow 9:00 + 29 days = 30th day 9:00, then set to 18:00 on same day
  const endTime = new Date(startTime)
  endTime.setDate(startTime.getDate() + selectedPeriod.value - 1)
  endTime.setHours(18, 0, 0, 0) // 结束时间设为当天18:00

  // 传递预订参数到预订页面
  const bookingParams = {
    vehicleId: vehicleId.toString(),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }

  setJumpData('bookingParams', bookingParams)

  uni.navigateTo({
    url: '/pages/booking/index',
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
      // 添加排序参数
      sortBy: sortBy.value,
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
  // 创建 IntersectionObserver 监听吸顶状态
  observer = uni.createIntersectionObserver(getCurrentInstance())
  observer
    .relativeTo('#scroll-container')
    .observe('#sticky-sentinel', (res) => {
      // 当 sentinel 的顶部位置小于滚动容器的顶部位置时，说明已经滚出去了（到达顶部）
      if (res.boundingClientRect.top < res.relativeRect.top) {
        isSticky.value = true
      }
      else {
        isSticky.value = false
      }
    })

  // 并行获取初始数据
  await Promise.allSettled([
    getLocation(),
    fetchActivityInfo(),
  ])
  // 获取位置后再获取车辆列表
  await fetchVehicles()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-[#f6f7fb]">
    <!-- 头部组件 -->
    <PageMonthlyRentalHead />

    <!-- 主要内容区域 -->
    <view id="scroll-container" class="flex-1 overflow-y-auto">
      <!-- 活动说明区域 -->
      <view class="px-[32rpx] pb-[16rpx] pt-[24rpx]">
        <view class="overflow-hidden border border-[#e5e7eb] rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <!-- Banner 部分 -->
          <view class="relative h-[180rpx] overflow-hidden from-[#2e1a4f] to-[#3b1f6a] bg-gradient-to-r p-[32rpx]">
            <view class="absolute -right-[10rpx] -top-[20rpx] h-[220rpx] w-[220rpx] rotate-12 opacity-[0.15]">
              <view class="i-lets-icons:calendar-duotone h-full w-full text-white" />
            </view>
            <view class="relative z-10 h-full flex flex-col justify-center">
              <view class="mb-[12rpx] flex items-center gap-[16rpx]">
                <text class="text-[36rpx] text-white font-bold tracking-wide">
                  {{ activityInfo?.title || "超值月租" }}
                </text>
                <view class="flex rounded-full bg-[#ff7a1a] px-[16rpx] py-[4rpx] shadow-sm">
                  <text class="text-[20rpx] text-white font-bold">
                    {{ activityInfo?.badgeText || "HOT" }}
                  </text>
                </view>
              </view>
              <text class="text-[26rpx] text-white/80">
                {{ activityInfo?.subtitle || "30天起租，享受8折超值优惠" }}
              </text>
            </view>
          </view>

          <!-- 权益列表 -->
          <view class="flex items-center justify-between bg-white px-[32rpx] py-[24rpx]">
            <view
              v-for="(benefit, index) in (activityInfo?.benefits || ['免费换车', '免手续费', '道路救援'])"
              :key="index"
              class="flex items-center"
            >
              <view class="i-material-symbols:check-circle mr-[8rpx] text-[24rpx] text-[#10b981]" />
              <text class="text-[24rpx] text-[#475569]">
                {{ benefit }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 吸顶哨兵元素 -->
      <view id="sticky-sentinel" class="h-[1px] w-full" />

      <!-- 粘性筛选区域 -->
      <view
        class="sticky top-0 z-20 bg-[#f6f7fb] transition-all duration-300 pb-[20rpx]"
      >
        <view class="flex flex-col gap-[20rpx]">
          <!-- 地址卡片 (吸顶时变为通栏) -->
          <view
            class="bg-white transition-all duration-300 px-[32rpx]"
            :class="isSticky
              ? 'rounded-none p-[24rpx] border-b border-[#f1f5f9] mx-0'
              : 'rounded-[24rpx] p-[20rpx] shadow-[0_10rpx_30rpx_-20rpx_rgba(15,23,42,0.15)] mx-[32rpx]'"
          >
            <!-- 地址选择 -->
            <view
              class="flex items-center justify-between"
              @tap="showLocationSelector"
            >
              <view class="min-w-0 flex flex-1 items-center">
                <view class="i-material-symbols:location-on mr-[12rpx] text-[32rpx] text-[#8b5cf6]" />
                <view class="min-w-0 flex flex-col">
                  <text class="text-[22rpx] text-[#64748b]">
                    取还车地点
                  </text>
                  <text class="truncate text-[28rpx] text-[#0f172a] font-semibold">
                    {{ displayLocation }}
                  </text>
                </view>
              </view>
              <view class="i-material-symbols:chevron-right text-[32rpx] text-[#94a3b8]" />
            </view>
          </view>

          <!-- 排序筛选栏 -->
          <view class="flex items-center justify-between px-[12rpx] px-[32rpx]">
            <view class="flex items-center gap-[40rpx]">
              <picker
                mode="selector" :range="sortOptions" range-key="label"
                :value="sortOptions.findIndex((item) => item.value === sortBy)"
                @change="(e: any) => handleSortChange(sortOptions[e.detail.value].value)"
              >
                <view class="flex items-center gap-[8rpx]">
                  <text class="text-[26rpx] font-medium" :class="sortBy !== 'distance' ? 'text-[#8b5cf6]' : 'text-[#475569]'">
                    {{ sortOptions.find((item) => item.value === sortBy)?.label || '排序' }}
                  </text>
                  <view class="i-material-symbols:expand-more text-[24rpx] text-[#94a3b8]" />
                </view>
              </picker>

              <view
                class="flex items-center gap-[8rpx]"
                @tap="showFilters = true"
              >
                <text class="text-[26rpx] text-[#475569] font-medium">
                  筛选
                </text>
                <view class="i-material-symbols:tune text-[24rpx] text-[#94a3b8]" />
              </view>
            </view>

            <text class="text-[22rpx] text-[#94a3b8]">
              共 {{ vehicleTotal }} 辆车
            </text>
          </view>
        </view>
      </view>

      <!-- 车辆列表 -->
      <view class="px-[32rpx] pb-[40rpx] pt-[20rpx] flex flex-col gap-[28rpx]">
        <!-- Loading State -->
        <view v-if="loading" class="flex flex-col gap-[28rpx]">
          <view v-for="i in 3" :key="i" class="rounded-[28rpx] bg-white p-[24rpx] flex flex-col gap-[20rpx]">
            <view class="flex gap-[24rpx]">
              <view class="h-[180rpx] w-[240rpx] animate-pulse rounded-[20rpx] bg-[#f1f5f9]" />
              <view class="flex-1 py-[8rpx] flex flex-col gap-[16rpx]">
                <view class="h-[32rpx] w-[60%] animate-pulse rounded bg-[#f1f5f9]" />
                <view class="h-[24rpx] w-[40%] animate-pulse rounded bg-[#f1f5f9]" />
                <view class="mt-[12rpx] flex gap-[12rpx]">
                  <view class="h-[36rpx] w-[80rpx] animate-pulse rounded bg-[#f1f5f9]" />
                  <view class="h-[36rpx] w-[80rpx] animate-pulse rounded bg-[#f1f5f9]" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Vehicle List -->
        <template v-else>
          <template v-if="vehicles.length > 0">
            <view
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleId"
              class="group relative overflow-hidden border border-[#e5e7eb] rounded-[28rpx] bg-white shadow-[0_15rpx_40rpx_-20rpx_rgba(15,23,42,0.1)] transition-all active:scale-[0.98]"
              @tap="selectVehicle(vehicle)"
            >
              <view class="flex p-[24rpx]">
                <!-- 车辆图片 -->
                <view class="relative h-[180rpx] w-[240rpx] flex-shrink-0 overflow-hidden rounded-[20rpx] bg-[#f8fafc]">
                  <image :src="vehicle.imageUrl" mode="aspectFill" class="h-full w-full" />
                  <view class="absolute left-[12rpx] top-[12rpx] flex flex-col gap-[8rpx]">
                    <view
                      v-for="tag in vehicle.tags.slice(0, 2)"
                      :key="tag.tagName"
                      class="rounded-[8rpx] px-[10rpx] py-[4rpx] text-[18rpx] font-bold shadow-sm backdrop-blur-md"
                      :class="getTagStyle(tag.tagType)"
                    >
                      {{ tag.tagName }}
                    </view>
                  </view>
                </view>

                <!-- 车辆信息 -->
                <view class="ml-[24rpx] flex flex-1 flex-col justify-between py-[4rpx]">
                  <view>
                    <view class="flex items-start justify-between">
                      <text class="line-clamp-1 text-[30rpx] text-[#0f172a] font-bold leading-tight">
                        {{ vehicle.name }}
                      </text>
                    </view>
                    <text class="mt-[8rpx] text-[22rpx] text-[#64748b]">
                      {{ formatLicensePlate(vehicle.licensePlate) }} | {{ vehicle.seats }}座 | {{ getEnergyTypeText(vehicle.energyType) }}
                    </text>

                    <view class="mt-[16rpx] flex flex-wrap gap-[12rpx]">
                      <view class="flex items-center rounded-[8rpx] bg-[#f0fdf4] px-[10rpx] py-[4rpx] text-[20rpx] text-[#16a34a]">
                        <view class="i-material-symbols:battery-charging-full mr-[4rpx] text-[20rpx]" />
                        <text>{{ vehicle.rangeKm }}km</text>
                      </view>
                      <view v-if="vehicle.distance" class="flex items-center rounded-[8rpx] bg-[#eff6ff] px-[10rpx] py-[4rpx] text-[20rpx] text-[#3b82f6]">
                        <view class="i-material-symbols:location-on mr-[4rpx] text-[20rpx]" />
                        <text>{{ formatDistance(vehicle.distance) }}</text>
                      </view>
                      <view class="flex items-center rounded-[8rpx] bg-[#fff7ed] px-[10rpx] py-[4rpx] text-[20rpx] text-[#ea580c]">
                        <view class="i-material-symbols:star mr-[4rpx] text-[20rpx]" />
                        <text>{{ vehicle.rating }}</text>
                      </view>
                    </view>
                  </view>

                  <view class="mt-[16rpx] flex items-end justify-between">
                    <view>
                      <view class="flex items-baseline">
                        <text class="text-[24rpx] text-[#ff7a1a] font-bold">
                          ¥
                        </text>
                        <text class="mx-[2rpx] text-[36rpx] text-[#ff7a1a] font-bold">
                          {{ vehicle.monthlyPrice || (vehicle.dailyPrice * 30).toFixed(0) }}
                        </text>
                        <text class="text-[22rpx] text-[#94a3b8]">
                          /月
                        </text>
                      </view>
                      <view v-if="getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)" class="mt-[2rpx] flex items-center">
                        <text class="mr-[8rpx] text-[20rpx] text-[#94a3b8] line-through">
                          ¥{{ (vehicle.dailyPrice * 30).toFixed(0) }}
                        </text>
                        <text class="text-[20rpx] text-[#10b981] font-medium">
                          省¥{{ getMonthlyDiscount(vehicle.dailyPrice, vehicle.monthlyPrice)?.savings.toFixed(0) }}
                        </text>
                      </view>
                    </view>
                    <view
                      class="h-[56rpx] flex items-center justify-center rounded-full bg-[#8b5cf6] px-[24rpx] shadow-[#8b5cf6]/30 shadow-md active:opacity-90"
                      @tap.stop="quickBook(vehicle.vehicleId)"
                    >
                      <text class="text-[22rpx] text-white font-bold">
                        立即预订
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </template>

          <!-- Empty State -->
          <view v-else class="flex flex-col items-center justify-center py-[120rpx]">
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/empty_order.png"
              class="h-[240rpx] w-[240rpx] opacity-80"
              mode="aspectFit"
            />
            <text class="mt-[32rpx] text-[28rpx] text-[#64748b] font-medium">
              暂无符合条件的车辆
            </text>
            <text class="mt-[12rpx] text-[24rpx] text-[#94a3b8]">
              请尝试调整筛选条件
            </text>
          </view>
        </template>

        <!-- 须知模块 -->
        <view class="border border-[#e5e7eb] rounded-[28rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <view class="i-material-symbols:info mr-[12rpx] text-[32rpx] text-[#8b5cf6]" />
            <text class="text-[30rpx] text-[#0f172a] font-bold">
              月租须知
            </text>
          </view>
          <view class="flex flex-col gap-[20rpx]">
            <view
              v-for="rule in activityRules.length > 0 ? activityRules : defaultRules" :key="rule"
              class="flex items-start gap-[16rpx]"
            >
              <view class="mt-[12rpx] h-[8rpx] w-[8rpx] flex-shrink-0 rounded-full bg-[#8b5cf6]" />
              <text class="text-[26rpx] text-[#475569] leading-relaxed">
                {{ rule }}
              </text>
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
      <view class="h-full flex flex-col">
        <scroll-view scroll-y class="flex-1 px-[32rpx] py-[20rpx]">
          <view class="flex flex-col gap-[40rpx]">
            <!-- 价格范围 -->
            <view>
              <text class="mb-[24rpx] block text-[28rpx] text-[#0f172a] font-bold">
                价格范围(月租)
              </text>
              <view class="flex flex-wrap gap-[20rpx]">
                <view
                  v-for="range in priceRanges" :key="range.label"
                  class="rounded-full px-[28rpx] py-[14rpx] text-[24rpx] font-medium transition-all"
                  :class="selectedPriceRange && selectedPriceRange[0] === range.value[0] && selectedPriceRange[1] === range.value[1]
                    ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                    : 'bg-[#f1f5f9] text-[#475569]'"
                  @tap="selectPriceRange(range.value)"
                >
                  {{ range.label }}
                </view>
              </view>
            </view>

            <!-- 车型筛选 -->
            <view>
              <text class="mb-[24rpx] block text-[28rpx] text-[#0f172a] font-bold">
                车型
              </text>
              <view class="flex flex-wrap gap-[20rpx]">
                <view
                  v-for="type in filterOptions.carTypes" :key="type"
                  class="rounded-full px-[28rpx] py-[14rpx] text-[24rpx] font-medium transition-all"
                  :class="filters.vehicleTypes.includes(type)
                    ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                    : 'bg-[#f1f5f9] text-[#475569]'"
                  @tap="toggleArrayFilter('vehicleTypes', type)"
                >
                  {{ type }}
                </view>
              </view>
            </view>

            <!-- 能源类型 -->
            <view>
              <text class="mb-[24rpx] block text-[28rpx] text-[#0f172a] font-bold">
                能源类型
              </text>
              <view class="flex flex-wrap gap-[20rpx]">
                <view
                  v-for="energy in filterOptions.energyTypes" :key="energy"
                  class="rounded-full px-[28rpx] py-[14rpx] text-[24rpx] font-medium transition-all"
                  :class="filters.energyTypes.includes(energy)
                    ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                    : 'bg-[#f1f5f9] text-[#475569]'"
                  @tap="toggleArrayFilter('energyTypes', energy)"
                >
                  {{ energy }}
                </view>
              </view>
            </view>

            <!-- 座位数 -->
            <view>
              <text class="mb-[24rpx] block text-[28rpx] text-[#0f172a] font-bold">
                座位数
              </text>
              <view class="flex flex-wrap gap-[20rpx]">
                <view
                  v-for="seat in filterOptions.seats" :key="seat"
                  class="rounded-full px-[28rpx] py-[14rpx] text-[24rpx] font-medium transition-all"
                  :class="filters.seats.includes(seat)
                    ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                    : 'bg-[#f1f5f9] text-[#475569]'"
                  @tap="toggleArrayFilter('seats', seat)"
                >
                  {{ seat }}座
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部按钮 -->
        <view class="flex items-center justify-between border-t border-[#f1f5f9] bg-white px-[32rpx] py-[24rpx] pb-[calc(24rpx+env(safe-area-inset-bottom))]">
          <view
            class="h-[80rpx] w-[200rpx] flex items-center justify-center rounded-full bg-[#f1f5f9] text-[28rpx] text-[#475569] font-bold active:opacity-80"
            @tap="resetFilters"
          >
            重置
          </view>
          <view
            class="ml-[24rpx] h-[80rpx] flex flex-1 items-center justify-center rounded-full bg-[#8b5cf6] text-[28rpx] text-white font-bold shadow-[#8b5cf6]/30 shadow-lg active:opacity-90"
            @tap="applyFilters"
          >
            确定
          </view>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
