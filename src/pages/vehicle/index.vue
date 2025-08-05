<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import { type VehicleCategory, type VehicleBrand, getAllChildCategories, getChildCategories, getParentCategories } from '@/api/vehicle'

// 搜索参数 - 从首页传递过来
const searchParams = ref({
  city: '上海',
  address: '上海',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  startTime: '',
  endTime: '',
  keywords: '',
})

// 数据状态
const loading = ref(false)
const brandCategories = ref<VehicleBrand[]>([])
const modelCategories = ref<VehicleCategory[]>([])
const filteredModels = ref<VehicleCategory[]>([])
const selectedBrandId = ref<number | null>(null)
const searchKeyword = ref('')

// 排序状态
const sortType = ref<'default' | 'price' | 'distance' | 'rating'>('default')
const userLocation = ref<{latitude?: number, longitude?: number}>({})

// 抽屉状态
const showSortDrawer = ref(false)
const showPriceDrawer = ref(false)
const showDatePicker = ref(false)
const showMapPicker = ref(false)

// 价格区间状态
const priceRange = ref<{min?: number, max?: number, label?: string}>({})

// 当前地址显示
const currentAddress = ref('上海')

// 时间相关数据
const timeForm = ref({
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
})

// 排序选项配置
const sortOptions = [
  { value: 'default', label: '综合排序' },
  { value: 'price', label: '低价优先' },
  { value: 'distance', label: '距离优先' },
  { value: 'rating', label: '好评优先' }
]

// 价格区间选项
const priceRangeOptions = [
  { label: '不限价格', min: undefined, max: undefined },
  { label: '100元以下', min: 0, max: 100 },
  { label: '100-200元', min: 100, max: 200 },
  { label: '200-300元', min: 200, max: 300 },
  { label: '300-500元', min: 300, max: 500 },
  { label: '500元以上', min: 500, max: undefined }
]

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


// 初始化显示列表
function initializeFilteredModels() {
  filteredModels.value = modelCategories.value
  
  // 如果有搜索关键词，自动执行搜索
  if (searchKeyword.value.trim()) {
    searchModels()
  }
  
  // 应用价格筛选
  applyPriceFilter()
}

// 获取用户位置
function getUserLocation() {
  return new Promise<{latitude: number, longitude: number}>((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        userLocation.value = location
        resolve(location)
      },
      fail: (err) => {
        console.warn('获取位置失败:', err)
        reject(err)
      }
    })
  })
}

// 页面加载时获取参数
onLoad(() => {
  // 获取从首页传递的搜索参数
  const jumpData = getJumpData('searchParams')

  if (jumpData) {
    searchParams.value = {
      city: jumpData.city || '上海',
      address: jumpData.address || '上海',
      latitude: jumpData.latitude,
      longitude: jumpData.longitude,
      startTime: jumpData.startTime || '',
      endTime: jumpData.endTime || '',
      keywords: jumpData.keywords || '',
    }
    
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
    
    // 如果有关键词，设置到搜索框并执行搜索
    if (jumpData.keywords) {
      searchKeyword.value = jumpData.keywords
    }

    // 如果从首页带有位置信息，使用首页的位置
    if (jumpData.latitude && jumpData.longitude) {
      userLocation.value = {
        latitude: jumpData.latitude,
        longitude: jumpData.longitude
      }
    }
  }

  // 尝试获取用户当前位置（用于距离排序）
  getUserLocation().catch(() => {
    // 获取位置失败不影响正常使用
  })

  loadBrandCategories()
  loadAllModelCategories() // 默认加载所有车型
})

// 加载品牌分类
async function loadBrandCategories() {
  try {
    const response = await getParentCategories()
    if (response.code === 200 && response.data) {
      brandCategories.value = response.data
    }
  }
  catch (error) {
    console.error('获取品牌分类失败:', error)
  }
}

// 加载所有车型分类
async function loadAllModelCategories() {
  if (loading.value)
    return

  try {
    loading.value = true

    // 准备请求参数
    const params = {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude,
      ...(sortType.value !== 'default' && { sortType: sortType.value })
    }

    // 直接获取所有二级分类，避免遍历查询
    const response = await getAllChildCategories(params)
    if (response.code === 200 && response.data) {
      modelCategories.value = response.data
      initializeFilteredModels()
    }
    else {
      modelCategories.value = []
      filteredModels.value = []
    }
  }
  catch (error) {
    console.error('获取车型分类失败:', error)
    modelCategories.value = []
    filteredModels.value = []
  }
  finally {
    loading.value = false
  }
}

// 加载指定品牌的车型分类
async function loadModelCategories(brandId: number) {
  if (loading.value)
    return

  try {
    loading.value = true

    // 准备请求参数
    const params = {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude,
      ...(sortType.value !== 'default' && { sortType: sortType.value })
    }

    const response = await getChildCategories(brandId, params)
    if (response.code === 200 && response.data) {
      modelCategories.value = response.data
      initializeFilteredModels()
    }
    else {
      modelCategories.value = []
      filteredModels.value = []
    }
  }
  catch (error) {
    console.error('获取车型分类失败:', error)
    modelCategories.value = []
    filteredModels.value = []
  }
  finally {
    loading.value = false
  }
}

// 选择品牌
function selectBrand(brandId: number | null) {
  selectedBrandId.value = brandId

  if (brandId === null) {
    // 选择"全部"，加载所有车型
    loadAllModelCategories()
  }
  else {
    // 选择特定品牌，加载该品牌的车型
    loadModelCategories(brandId)
  }
}

// 解析特征标签并用·连接
function getFeatureTags(model: VehicleCategory): string {
  if (!model.feature_tags) return ''
  try {
    const tags = JSON.parse(model.feature_tags)
    return Array.isArray(tags) ? tags.join('·') : ''
  } catch {
    return ''
  }
}

// 选择车型，跳转到搜索页面
function selectModel(model: VehicleCategory) {
  // 将搜索参数和选中的车型ID传递给搜索页面
  const searchData = {
    ...searchParams.value,
    categoryId: model.category_id,
    categoryName: model.category_name,
  }

  setJumpData('searchParams', searchData)

  uni.navigateTo({
    url: '/pages/search/index',
  })
}

// 搜索车型功能（支持特征标签搜索）
function searchModels() {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    // 如果搜索词为空，显示所有车型
    filteredModels.value = modelCategories.value
    return
  }

  // 执行搜索过滤
  const lowerKeyword = keyword.toLowerCase()
  filteredModels.value = modelCategories.value.filter(model => {
    const matchName = model.category_name.toLowerCase().includes(lowerKeyword)
    const matchCode = model.category_code.toLowerCase().includes(lowerKeyword)
    const matchFeatures = getFeatureTags(model).toLowerCase().includes(lowerKeyword)
    
    return matchName || matchCode || matchFeatures
  })
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = ''
  filteredModels.value = modelCategories.value
}

// 跳过选择，直接搜索（不选择车型）
function skipToSearch() {
  // 传递搜索参数但不包含categoryId
  setJumpData('searchParams', searchParams.value)

  uni.navigateTo({
    url: '/pages/search/index',
  })
}


// 应用价格区间筛选
function applyPriceFilter() {
  if (!priceRange.value.min && !priceRange.value.max) {
    return
  }
  
  filteredModels.value = filteredModels.value.filter(model => {
    const price = model.actual_min_price || model.min_price
    if (!price) return true
    
    const min = priceRange.value.min
    const max = priceRange.value.max
    
    if (min !== undefined && max !== undefined) {
      return price >= min && price <= max
    } else if (min !== undefined) {
      return price >= min
    } else if (max !== undefined) {
      return price <= max
    }
    
    return true
  })
}

// 打开排序抽屉
function openSortDrawer() {
  showSortDrawer.value = true
}


// 打开价格抽屉
function openPriceDrawer() {
  showPriceDrawer.value = true
}

// 选择排序类型
function selectSortType(type: 'default' | 'price' | 'distance' | 'rating') {
  setSortType(type)
  showSortDrawer.value = false
}

// 选择价格区间
function selectPriceRange(min?: number, max?: number, label?: string) {
  priceRange.value = { min, max, label }
  initializeFilteredModels()
  showPriceDrawer.value = false
}


// 清除价格筛选
function clearPriceFilter() {
  priceRange.value = {}
  initializeFilteredModels()
  showPriceDrawer.value = false
}

// 清除所有筛选
function clearAllFilters() {
  priceRange.value = {}
  initializeFilteredModels()
}

// 切换排序类型
function setSortType(type: 'default' | 'price' | 'distance' | 'rating') {
  if (type === 'distance' && !userLocation.value.latitude) {
    // 如果选择距离排序但没有位置信息，尝试获取位置
    getUserLocation().then(() => {
      sortType.value = type
      // 重新加载数据
      if (selectedBrandId.value === null) {
        loadAllModelCategories()
      } else {
        loadModelCategories(selectedBrandId.value)
      }
    }).catch(() => {
      uni.showToast({
        title: '需要位置权限才能按距离排序',
        icon: 'none'
      })
    })
    return
  }
  
  sortType.value = type
  // 重新加载数据
  if (selectedBrandId.value === null) {
    loadAllModelCategories()
  } else {
    loadModelCategories(selectedBrandId.value)
  }
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
  userLocation.value.latitude = data.latitude
  userLocation.value.longitude = data.longitude

  // 更新地址显示
  currentAddress.value = data.formattedAddress || data.address
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          选择车型
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex flex-1 flex-col overflow-hidden">
      <!-- 搜索条件栏 -->
      <view class="border-b border-gray-100 bg-white px-[32rpx] py-[24rpx]">
        <!-- 搜索框区域 -->
        <view class="mb-[24rpx]">
          <view class="relative flex items-center gap-[16rpx]">
            <!-- 搜索输入框 -->
            <view class="relative flex-1">
              <text class="i-material-symbols-search absolute left-[24rpx] text-[28rpx] text-gray-400" style="top: 50%; transform: translateY(-50%);" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索车型"
                :class="[
                  'w-full box-border h-[80rpx] border-0 rounded-[24rpx] bg-gray-50 pl-[72rpx] text-[28rpx] text-black placeholder-gray-500',
                  searchKeyword.trim() ? 'pr-[72rpx]' : 'pr-[32rpx]'
                ]"
                style="line-height: 80rpx; padding-top: 0; padding-bottom: 0;"
                @confirm="searchModels"
              >
              <!-- 清空按钮（仅在有搜索内容时显示） -->
              <view
                v-if="searchKeyword.trim()"
                class="absolute right-[24rpx] h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-gray-300"
                style="top: 50%; transform: translateY(-50%);"
                @tap="clearSearch"
              >
                <text class="i-material-symbols-close text-[20rpx] text-gray-600" />
              </view>
            </view>

            <!-- 搜索按钮 -->
            <view
              class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[24rpx] bg-purple-600"
              @tap="searchModels"
            >
              <text class="i-material-symbols-search text-[32rpx] text-white" />
            </view>
          </view>
        </view>

        <!-- 地址和时间信息 -->
        <view class="mb-[24rpx] flex items-center justify-between">
          <view class="min-w-0 flex flex-1 cursor-pointer items-center" @tap="showMapSelector">
            <text class="i-material-symbols-location-on mr-[8rpx] text-[28rpx] text-purple-600" />
            <text class="truncate text-[24rpx] text-black font-medium">
              {{ currentAddress }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down ml-[4rpx] text-[20rpx] text-gray-400" />
          </view>
          <view class="flex items-center" @tap="showTimePicker">
            <text class="i-material-symbols-schedule mr-[8rpx] text-[20rpx] text-gray-500" />
            <text class="text-[20rpx] text-gray-600">
              {{ displayTimeRange }}
            </text>
          </view>
        </view>

        <!-- 品牌标签栏（支持横向滚动） -->
        <scroll-view
          scroll-x
          show-scrollbar="false"
          class="whitespace-nowrap"
        >
          <view class="flex px-[2rpx] space-x-[16rpx]">
            <!-- 全部标签 -->
            <view
              class="flex-shrink-0 whitespace-nowrap rounded-full px-[24rpx] py-[8rpx] text-[24rpx] transition-all"
              :class="selectedBrandId === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'"
              @tap="selectBrand(null)"
            >
              全部
            </view>

            <!-- 品牌标签 -->
            <view
              v-for="brand in brandCategories"
              :key="brand.categoryId"
              class="flex-shrink-0 whitespace-nowrap rounded-full px-[24rpx] py-[8rpx] text-[24rpx] transition-all"
              :class="selectedBrandId === brand.categoryId
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'"
              @tap="selectBrand(brand.categoryId)"
            >
              {{ brand.categoryName }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 排序和筛选工具栏 -->
      <view class="flex items-center px-[32rpx] py-[16rpx] bg-white border-b border-gray-100">
        <!-- 排序和筛选选择器 -->
        <view class="flex items-center space-x-[16rpx]">
          <!-- 排序选择器 -->
          <view 
            class="flex items-center px-[20rpx] py-[8rpx] rounded-[24rpx] bg-gray-50 border border-gray-200"
            @tap="openSortDrawer"
          >
            <text class="text-[24rpx] text-gray-700 mr-[8rpx]">
              {{ sortOptions.find(opt => opt.value === sortType)?.label || '排序' }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down text-[20rpx] text-gray-500" />
          </view>

          <!-- 价格筛选选择器 -->
          <view 
            class="flex items-center px-[20rpx] py-[8rpx] rounded-[24rpx] border"
            :class="priceRange.label ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'"
            @tap="openPriceDrawer"
          >
            <text class="text-[24rpx] mr-[8rpx]"
                  :class="priceRange.label ? 'text-purple-700' : 'text-gray-700'">
              {{ priceRange.label || '价格' }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down text-[20rpx] text-gray-500" />
          </view>
        </view>
      </view>

      <!-- 车型列表 -->
      <scroll-view scroll-y class="flex-1 overflow-y-auto">
        <view class="p-[24rpx] space-y-[16rpx]">
          <!-- 加载状态 -->
          <view v-if="loading" class="space-y-[16rpx]">
            <view v-for="i in 6" :key="i" class="animate-pulse rounded-[28rpx] bg-white p-[32rpx] shadow-[0_8rpx_24rpx_rgba(139,92,246,0.08)]">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[120rpx] flex-shrink-0 rounded-[16rpx] bg-gray-200" />
                <view class="flex-1 space-y-[16rpx]">
                  <view class="h-[32rpx] w-3/4 rounded bg-gray-200" />
                  <view class="h-[24rpx] w-1/2 rounded bg-gray-200" />
                </view>
                <view class="h-[32rpx] w-[32rpx] flex-shrink-0 rounded bg-gray-200" />
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else-if="filteredModels.length === 0" class="py-[48rpx] text-center text-[28rpx] text-gray-500">
            <text class="i-material-symbols-directions-car mx-auto mb-[24rpx] block h-[128rpx] w-[128rpx] text-gray-300" />
            <text>
              {{ searchKeyword ? '没有找到相关车型' : '暂无车型数据' }}
            </text>
          </view>

          <!-- 车型列表 -->
          <view v-else class="space-y-[12rpx]">
            <view
              v-for="model in filteredModels"
              :key="model.category_id"
              class="mb-[12rpx] rounded-[20rpx] bg-white border border-gray-100 transition-colors active:bg-gray-50 overflow-hidden"
              @tap="selectModel(model)"
            >
              <!-- 上半部分：左侧车辆图片，右侧车型名称和标签 -->
              <view class="flex items-start p-[24rpx] pb-[16rpx]">
                <!-- 车型图标 -->
                <view class="h-[100rpx] w-[140rpx] flex flex-shrink-0 items-center justify-center rounded-[16rpx] bg-gray-100 mr-[20rpx]">
                  <image
                    v-if="model.icon_url"
                    :src="model.icon_url"
                    :alt="model.category_name"
                    class="h-full w-full rounded-[16rpx] object-cover"
                  />
                  <text v-else class="i-material-symbols-directions-car text-[60rpx] text-gray-400" />
                </view>

                <!-- 右侧：车型名称和标签 -->
                <view class="flex-1 min-w-0">
                  <!-- 车型名称 -->
                  <text class="block text-[32rpx] text-black font-bold mb-[12rpx] truncate">
                    {{ model.category_name }}
                  </text>
                  
                  <!-- 特征标签 -->
                  <text v-if="getFeatureTags(model)" class="block text-[24rpx] text-gray-500 leading-relaxed">
                    {{ getFeatureTags(model) }}
                  </text>
                </view>
              </view>

              <!-- 下半部分：距离评分 vs 价格 -->
              <view class="flex items-center justify-between px-[24rpx] pb-[24rpx] pt-[8rpx] border-t border-gray-50">
                <!-- 左侧：距离和评分信息 -->
                <view class="flex items-center space-x-[12rpx]">
                  <text v-if="model.min_distance" class="text-[22rpx] text-gray-400">
                    <text class="i-material-symbols-location-on mr-[4rpx]" />{{ model.min_distance.toFixed(1) }}km
                  </text>
                  <text v-if="model.avg_rating" class="text-[22rpx] text-gray-400">
                    <text class="i-material-symbols-star mr-[4rpx] text-yellow-400" />{{ model.avg_rating.toFixed(1) }}分
                  </text>
                  <text v-if="model.review_count" class="text-[22rpx] text-gray-400">
                    ({{ model.review_count }}条)
                  </text>
                </view>
                
                <!-- 右侧：价格显示 -->
                <view class="flex items-center space-x-[8rpx]">
                  <!-- 原价（划线） - 仅在有折扣价且折扣价小于原价时显示 -->
                  <text v-if="model.actual_min_price && model.actual_min_price < model.min_price" 
                        class="text-[22rpx] text-gray-400 line-through">
                    ¥{{ model.min_price }}
                  </text>
                  
                  <!-- 折扣价或原价 -->
                  <text class="text-[28rpx] text-purple-600 font-bold">
                    ¥{{ model.actual_min_price || model.min_price }}元/天起
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 排序选择抽屉 -->
    <BottomDrawer 
      :visible="showSortDrawer" 
      @update:visible="showSortDrawer = $event"
      title="选择排序方式"
      height="400rpx"
    >
      <view class="mt-[24rpx] space-y-[8rpx]">
        <view 
          v-for="option in sortOptions" 
          :key="option.value"
          class="flex items-center justify-between py-[20rpx] px-[16rpx] rounded-[16rpx] transition-colors"
          :class="sortType === option.value ? 'bg-purple-50' : ''"
          @tap="selectSortType(option.value)"
        >
          <text class="text-[26rpx]"
                :class="sortType === option.value ? 'text-purple-700 font-medium' : 'text-gray-700'">
            {{ option.label }}
          </text>
          <text v-if="sortType === option.value" 
                class="text-[24rpx] text-purple-600">✓</text>
        </view>
      </view>
    </BottomDrawer>

    <!-- 价格筛选抽屉 -->
    <BottomDrawer 
      :visible="showPriceDrawer" 
      @update:visible="showPriceDrawer = $event"
      title="价格区间"
      height="450rpx"
    >
      <view class="mt-[24rpx] space-y-[12rpx]">
        <view 
          v-for="option in priceRangeOptions" 
          :key="option.label"
          class="flex items-center justify-between py-[16rpx] px-[16rpx] rounded-[16rpx] transition-colors"
          :class="(priceRange.min === option.min && priceRange.max === option.max) ? 'bg-purple-50' : ''"
          @tap="selectPriceRange(option.min, option.max, option.label)"
        >
          <text class="text-[26rpx]"
                :class="(priceRange.min === option.min && priceRange.max === option.max) 
                  ? 'text-purple-700 font-medium' : 'text-gray-700'">
            {{ option.label }}
          </text>
          <text v-if="priceRange.min === option.min && priceRange.max === option.max" 
                class="text-[24rpx] text-purple-600">✓</text>
        </view>
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
