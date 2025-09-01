<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import { type VehicleBrand, type VehicleCategory, getAllChildCategories, getChildCategories, getParentCategories } from '@/api/vehicle'

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
const userLocation = ref<{ latitude?: number, longitude?: number }>({})

// 抽屉状态
const showSortDrawer = ref(false)
const showPriceDrawer = ref(false)
const showVehicleFilter = ref(false)
const showDatePicker = ref(false)
const showMapPicker = ref(false)

// 价格区间状态
const priceRange = ref<{ min?: number, max?: number, label?: string }>({})

// 车型筛选状态
const vehicleFilter = ref({
  selectedTags: [] as string[], // 选中的特征标签
  selectedBrandId: null as number | null, // 选中的品牌ID，移到筛选弹框内
})

// 所有可用的特征标签选项
const availableTags = ref<string[]>([])

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
  { value: 'rating', label: '好评优先' },
]

// 价格区间选项
const priceRangeOptions = [
  { label: '不限价格', min: undefined, max: undefined },
  { label: '100元以下', min: 0, max: 100 },
  { label: '100-200元', min: 100, max: 200 },
  { label: '200-300元', min: 200, max: 300 },
  { label: '300-500元', min: 300, max: 500 },
  { label: '500元以上', min: 500, max: undefined },
]

// 提取并生成可用的特征标签选项
function extractAvailableTags() {
  const tagSet = new Set<string>()

  modelCategories.value.forEach((model) => {
    if (model.feature_tags) {
      const tags = JSON.parse(model.feature_tags)
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (typeof tag === 'string' && tag.trim()) {
            tagSet.add(tag.trim())
          }
        })
      }
    }
  })

  availableTags.value = Array.from(tagSet).sort()
}

// 计算筛选项数量
const filterCount = computed(() => {
  let count = 0
  if (vehicleFilter.value.selectedTags.length > 0) {
    count += vehicleFilter.value.selectedTags.length
  }
  if (vehicleFilter.value.selectedBrandId !== null) {
    count += 1
  }
  return count
})

// 检查车型筛选是否激活（有选中的标签或品牌）
const isVehicleFilterActive = computed(() => {
  return filterCount.value > 0
})

// 筛选按钮显示文本
const filterButtonText = computed(() => {
  return filterCount.value > 0 ? `筛选(${filterCount.value})` : '筛选'
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

// 初始化显示列表
function initializeFilteredModels() {
  filteredModels.value = modelCategories.value

  // 提取特征标签选项
  extractAvailableTags()

  // 同步筛选弹框的品牌选择状态
  vehicleFilter.value.selectedBrandId = selectedBrandId.value

  // 应用所有筛选条件
  applyAllFilters()
}

// 获取用户位置
function getUserLocation() {
  return new Promise<{ latitude: number, longitude: number }>((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        userLocation.value = location
        resolve(location)
      },
      fail: (err) => {
        console.warn('获取位置失败:', err)
        reject(err)
      },
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
        longitude: jumpData.longitude,
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
      ...(sortType.value !== 'default' && { sortType: sortType.value }),
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
      ...(sortType.value !== 'default' && { sortType: sortType.value }),
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

// 选择品牌 (现在统一使用车型筛选弹框，此函数保留兼容性)
function selectBrand(brandId: number | null) {
  vehicleFilter.value.selectedBrandId = brandId
  selectedBrandId.value = brandId
  applyAllFilters()
}

// 解析特征标签并用·连接
function getFeatureTags(model: VehicleCategory): string {
  if (!model.feature_tags)
    return ''
  try {
    const tags = JSON.parse(model.feature_tags)
    return Array.isArray(tags) ? tags.join('·') : ''
  }
  catch (error) {
    console.error('解析特征标签失败:', error)
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
  applyAllFilters()
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = ''
  applyAllFilters()
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

  filteredModels.value = filteredModels.value.filter((model) => {
    const price = model.actual_min_price || model.min_price
    if (!price)
      return true

    const min = priceRange.value.min
    const max = priceRange.value.max

    if (min !== undefined && max !== undefined) {
      return price >= min && price <= max
    }
    else if (min !== undefined) {
      return price >= min
    }
    else if (max !== undefined) {
      return price <= max
    }

    return true
  })
}

// 应用特征标签筛选
function applyTagFilter() {
  if (vehicleFilter.value.selectedTags.length === 0) {
    return
  }

  filteredModels.value = filteredModels.value.filter((model) => {
    if (!model.feature_tags)
      return false

    try {
      const modelTags = JSON.parse(model.feature_tags)
      if (!Array.isArray(modelTags))
        return false

      // 检查是否包含所选标签中的任一个（OR逻辑）
      return vehicleFilter.value.selectedTags.some(selectedTag =>
        modelTags.includes(selectedTag),
      )
    }
    catch (error) {
      console.error('解析特征标签失败:', error)
      return false
    }
  })
}

// 应用品牌筛选（车型筛选弹框内的品牌选择）
function applyBrandFilter() {
  if (vehicleFilter.value.selectedBrandId === null) {
    return
  }

  filteredModels.value = filteredModels.value.filter((model) => {
    return model.parent_category_id === vehicleFilter.value.selectedBrandId
  })
}

// 应用所有筛选条件
function applyAllFilters() {
  // 从原始数据开始筛选
  filteredModels.value = modelCategories.value

  // 应用搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filteredModels.value = filteredModels.value.filter((model) => {
      const matchName = model.category_name.toLowerCase().includes(keyword)
      const matchCode = model.category_code.toLowerCase().includes(keyword)
      const matchFeatures = getFeatureTags(model).toLowerCase().includes(keyword)
      return matchName || matchCode || matchFeatures
    })
  }

  // 依次应用各种筛选条件
  applyTagFilter()
  applyBrandFilter()
  applyPriceFilter()
}

// 打开排序抽屉
function openSortDrawer() {
  showSortDrawer.value = true
}

// 打开价格抽屉
function openPriceDrawer() {
  showPriceDrawer.value = true
}

// 打开车型筛选抽屉
function openVehicleFilter() {
  showVehicleFilter.value = true
}

// 切换特征标签选择
function toggleTag(tag: string) {
  const index = vehicleFilter.value.selectedTags.indexOf(tag)
  if (index > -1) {
    vehicleFilter.value.selectedTags.splice(index, 1)
  }
  else {
    vehicleFilter.value.selectedTags.push(tag)
  }
}

// 选择品牌（在筛选弹框内）
function selectVehicleBrand(brandId: number | null) {
  vehicleFilter.value.selectedBrandId = brandId
}

// 重置车型筛选
function resetVehicleFilter() {
  vehicleFilter.value.selectedTags = []
  vehicleFilter.value.selectedBrandId = null
}

// 应用车型筛选
function applyVehicleFilter() {
  // 更新当前的品牌筛选状态
  selectedBrandId.value = vehicleFilter.value.selectedBrandId

  // 应用筛选并关闭弹框
  applyAllFilters()
  showVehicleFilter.value = false
}

// 选择排序类型
function selectSortType(type: 'default' | 'price' | 'distance' | 'rating') {
  setSortType(type)
  showSortDrawer.value = false
}

// 选择价格区间
function selectPriceRange(min?: number, max?: number, label?: string) {
  priceRange.value = { min, max, label }
  applyAllFilters()
  showPriceDrawer.value = false
}

// 清除价格筛选
function clearPriceFilter() {
  priceRange.value = {}
  applyAllFilters()
  showPriceDrawer.value = false
}

// 清除所有筛选
function clearAllFilters() {
  priceRange.value = {}
  vehicleFilter.value.selectedTags = []
  vehicleFilter.value.selectedBrandId = null
  selectedBrandId.value = null
  applyAllFilters()
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
      }
      else {
        loadModelCategories(selectedBrandId.value)
      }
    }).catch(() => {
      uni.showToast({
        title: '需要位置权限才能按距离排序',
        icon: 'none',
      })
    })
    return
  }

  sortType.value = type
  // 重新加载数据
  if (selectedBrandId.value === null) {
    loadAllModelCategories()
  }
  else {
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
      <view class="border-b border-gray-100 bg-white px-[32rpx] pt-[24rpx]">
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
                class="box-border h-[80rpx] w-full border-0 rounded-[24rpx] bg-gray-50 pl-[72rpx] text-[28rpx] text-black placeholder-gray-500" :class="[
                  searchKeyword.trim() ? 'pr-[72rpx]' : 'pr-[32rpx]',
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
      </view>

      <!-- 排序和筛选工具栏 -->
      <view class="flex items-center border-b border-gray-100 bg-white px-[32rpx] py-[16rpx]">
        <!-- 排序和筛选选择器 -->
        <view class="flex items-center space-x-[16rpx]">
          <!-- 排序选择器 -->
          <view
            class="flex items-center border border-gray-200 rounded-[24rpx] bg-gray-50 px-[20rpx] py-[8rpx]"
            @tap="openSortDrawer"
          >
            <text class="mr-[8rpx] text-[24rpx] text-gray-700">
              {{ sortOptions.find(opt => opt.value === sortType)?.label || '排序' }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down text-[20rpx] text-gray-500" />
          </view>

          <!-- 价格筛选选择器 -->
          <view
            class="flex items-center border rounded-[24rpx] px-[20rpx] py-[8rpx]"
            :class="priceRange.label ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'"
            @tap="openPriceDrawer"
          >
            <text
              class="mr-[8rpx] text-[24rpx]"
              :class="priceRange.label ? 'text-purple-700' : 'text-gray-700'"
            >
              {{ priceRange.label || '价格' }}
            </text>
            <text class="i-material-symbols-keyboard-arrow-down text-[20rpx] text-gray-500" />
          </view>

          <!-- 车型筛选选择器 -->
          <view
            class="flex items-center border rounded-[24rpx] px-[20rpx] py-[8rpx]"
            :class="isVehicleFilterActive ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'"
            @tap="openVehicleFilter"
          >
            <text
              class="mr-[8rpx] text-[24rpx]"
              :class="isVehicleFilterActive ? 'text-purple-700' : 'text-gray-700'"
            >
              {{ filterButtonText }}
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
              class="mb-[12rpx] overflow-hidden border border-gray-100 rounded-[20rpx] bg-white transition-colors active:bg-gray-50"
              @tap="selectModel(model)"
            >
              <!-- 上半部分：左侧车辆图片，右侧车型名称和标签 -->
              <view class="flex items-start p-[24rpx] pb-[16rpx]">
                <!-- 车型图标 -->
                <view class="mr-[20rpx] h-[100rpx] w-[140rpx] flex flex-shrink-0 items-center justify-center rounded-[16rpx] bg-gray-100">
                  <image
                    v-if="model.icon_url"
                    :src="model.icon_url"
                    :alt="model.category_name"
                    class="h-full w-full rounded-[16rpx] object-cover"
                  />
                  <text v-else class="i-material-symbols-directions-car text-[60rpx] text-gray-400" />
                </view>

                <!-- 右侧：车型名称和标签 -->
                <view class="min-w-0 flex-1">
                  <!-- 车型名称 -->
                  <text class="mb-[12rpx] block truncate text-[32rpx] text-black font-bold">
                    {{ model.category_name }}
                  </text>

                  <!-- 特征标签 -->
                  <text v-if="getFeatureTags(model)" class="block text-[24rpx] text-gray-500 leading-relaxed">
                    {{ getFeatureTags(model) }}
                  </text>
                </view>
              </view>

              <!-- 下半部分：距离评分 vs 价格 -->
              <view class="flex items-center justify-between border-t border-gray-50 px-[24rpx] pb-[24rpx] pt-[8rpx]">
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
                  <text
                    v-if="model.actual_min_price && model.actual_min_price < model.min_price"
                    class="text-[22rpx] text-gray-400 line-through"
                  >
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
      title="选择排序方式"
      height="400rpx"
      @update:visible="showSortDrawer = $event"
    >
      <view class="mt-[24rpx] space-y-[8rpx]">
        <view
          v-for="option in sortOptions"
          :key="option.value"
          class="flex items-center justify-between rounded-[16rpx] px-[16rpx] py-[20rpx] transition-colors"
          :class="sortType === option.value ? 'bg-purple-50' : ''"
          @tap="selectSortType(option.value)"
        >
          <text
            class="text-[26rpx]"
            :class="sortType === option.value ? 'text-purple-700 font-medium' : 'text-gray-700'"
          >
            {{ option.label }}
          </text>
          <text
            v-if="sortType === option.value"
            class="text-[24rpx] text-purple-600"
          >
            ✓
          </text>
        </view>
      </view>
    </BottomDrawer>

    <!-- 价格筛选抽屉 -->
    <BottomDrawer
      :visible="showPriceDrawer"
      title="价格区间"
      height="450rpx"
      @update:visible="showPriceDrawer = $event"
    >
      <view class="mt-[24rpx] space-y-[12rpx]">
        <view
          v-for="option in priceRangeOptions"
          :key="option.label"
          class="flex items-center justify-between rounded-[16rpx] px-[16rpx] py-[16rpx] transition-colors"
          :class="(priceRange.min === option.min && priceRange.max === option.max) ? 'bg-purple-50' : ''"
          @tap="selectPriceRange(option.min, option.max, option.label)"
        >
          <text
            class="text-[26rpx]"
            :class="(priceRange.min === option.min && priceRange.max === option.max)
              ? 'text-purple-700 font-medium' : 'text-gray-700'"
          >
            {{ option.label }}
          </text>
          <text
            v-if="priceRange.min === option.min && priceRange.max === option.max"
            class="text-[24rpx] text-purple-600"
          >
            ✓
          </text>
        </view>
      </view>
    </BottomDrawer>

    <!-- 车型筛选抽屉 -->
    <BottomDrawer
      :visible="showVehicleFilter"
      title="车型筛选"
      height="900rpx"
      @update:visible="showVehicleFilter = $event"
    >
      <view class="mt-[24rpx] space-y-[32rpx]">
        <!-- 特征标签筛选区域 -->
        <view v-if="availableTags.length > 0">
          <view class="mb-[16rpx] text-[28rpx] text-gray-900 font-medium">
            特征标签
          </view>
          <view class="grid grid-cols-3 gap-[12rpx]">
            <view
              v-for="tag in availableTags"
              :key="tag"
              class="flex items-center justify-center border rounded-[20rpx] px-[16rpx] py-[12rpx] text-[24rpx] transition-colors"
              :class="vehicleFilter.selectedTags.includes(tag)
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'"
              @tap="toggleTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <!-- 品牌筛选区域 -->
        <view v-if="brandCategories.length > 0">
          <view class="mb-[16rpx] text-[28rpx] text-gray-900 font-medium">
            品牌选择
          </view>
          <view class="max-h-[450rpx] overflow-y-auto space-y-[8rpx]" style="scroll-snap-type: y mandatory;">
            <!-- 全部选项 -->
            <view
              class="flex items-center rounded-[16rpx] px-[16rpx] py-[20rpx] transition-colors"
              :class="vehicleFilter.selectedBrandId === null ? 'bg-purple-50' : ''"
              style="scroll-snap-align: start;"
              @tap="selectVehicleBrand(null)"
            >
              <view class="mr-[16rpx] h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[8rpx] bg-gray-100">
                <text class="i-material-symbols-apps text-[28rpx] text-gray-500" />
              </view>
              <text
                class="flex-1 text-[28rpx]"
                :class="vehicleFilter.selectedBrandId === null ? 'text-purple-700 font-medium' : 'text-gray-700'"
              >
                全部品牌
              </text>
              <text
                v-if="vehicleFilter.selectedBrandId === null"
                class="text-[24rpx] text-purple-600"
              >
                ✓
              </text>
            </view>

            <!-- 品牌选项 -->
            <view
              v-for="brand in brandCategories"
              :key="brand.categoryId"
              class="flex items-center rounded-[16rpx] px-[16rpx] py-[20rpx] transition-colors"
              :class="vehicleFilter.selectedBrandId === brand.categoryId ? 'bg-purple-50' : ''"
              style="scroll-snap-align: start;"
              @tap="selectVehicleBrand(brand.categoryId)"
            >
              <!-- 品牌logo -->
              <view class="mr-[16rpx] h-[48rpx] w-[48rpx] flex items-center justify-center overflow-hidden rounded-[8rpx] bg-gray-100">
                <image
                  v-if="brand.iconUrl"
                  :src="brand.iconUrl"
                  :alt="brand.categoryName"
                  class="h-full w-full object-contain"
                />
                <text v-else class="i-material-symbols-directions-car text-[24rpx] text-gray-400" />
              </view>

              <text
                class="flex-1 text-[28rpx]"
                :class="vehicleFilter.selectedBrandId === brand.categoryId ? 'text-purple-700 font-medium' : 'text-gray-700'"
              >
                {{ brand.categoryName }}
              </text>
              <text
                v-if="vehicleFilter.selectedBrandId === brand.categoryId"
                class="text-[24rpx] text-purple-600"
              >
                ✓
              </text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="flex border-t border-gray-100 pt-[16rpx] space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-200 rounded-[24rpx] bg-white py-[16rpx] text-center"
            @tap="resetVehicleFilter"
          >
            <text class="text-[26rpx] text-gray-700">
              重置
            </text>
          </view>
          <view
            class="flex-1 rounded-[24rpx] bg-purple-600 py-[16rpx] text-center"
            @tap="applyVehicleFilter"
          >
            <text class="text-[26rpx] text-white">
              确认
            </text>
          </view>
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
