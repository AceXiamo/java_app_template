<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { reverseGeocode, searchAddress } from '@/api/map'
import type { ServiceAreaValidation } from '@/api/map'

const props = withDefaults(defineProps<MapAddressPickerProps>(), {
  title: '选择位置',
  latitude: undefined,
  longitude: undefined,
})

const emit = defineEmits<MapAddressPickerEmits>()

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface MapAddressPickerProps {
  visible: boolean
  title?: string
  latitude?: number
  longitude?: number
}

interface MapAddressPickerEmits {
  (e: 'update:visible', visible: boolean): void
  (
    e: 'confirm',
    data: {
      latitude: number
      longitude: number
      address: string
      formattedAddress: string
      poiName?: string
      serviceAreaValidation?: ServiceAreaValidation
    },
  ): void
}

// 当前组件实例
const instance = getCurrentInstance()

// 地图相关状态
const mapContext = ref<any>(null)
const currentLocation = ref({
  latitude: props.latitude || 31.230416, // 上海默认坐标
  longitude: props.longitude || 121.473701,
})

// 地址信息
const addressInfo = ref({
  formattedAddress: '正在获取地址...',
  address: '',
  poiName: '',
  province: '',
  city: '',
  district: '',
  streetName: '',
})

// 服务区域验证信息
const serviceAreaValidation = ref<ServiceAreaValidation | null>(null)

// 加载状态
const loading = ref(false)
const confirming = ref(false)

// 地图是否已准备好
const mapReady = ref(false)

// 是否已经初始化过地址
const addressInitialized = ref(false)

// 搜索相关状态
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const showSearchResults = ref(false)
const searchInputFocused = ref(false)
// 搜索面板是否展开
const searchPanelExpanded = ref(false)

// 服务状态信息
const serviceStatusInfo = computed(() => {
  if (!serviceAreaValidation.value) {
    return {
      text: '检查中',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: 'i-material-symbols:help',
    }
  }

  const validation = serviceAreaValidation.value

  if (validation.isSupported && validation.status === 'active') {
    return {
      text: '已开通',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'i-material-symbols:check-circle',
    }
  }
  else if (validation.status === 'coming_soon') {
    return {
      text: '即将开通',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: 'i-material-symbols:schedule',
    }
  }
  else if (validation.status === 'closed') {
    return {
      text: '暂时关闭',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'i-material-symbols:block',
    }
  }
  else {
    return {
      text: '暂未开通',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: 'i-material-symbols:location-off',
    }
  }
})

// 确认按钮可用性
const confirmDisabled = computed(() => {
  return confirming.value
    || loading.value
    || !currentLocation.value.latitude
    || !addressInfo.value.formattedAddress
    || addressInfo.value.formattedAddress.includes('失败')
})

// 监听props变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // 重置初始化状态
      // addressInitialized.value = false
      // serviceAreaValidation.value = null
      // 重置搜索状态
      collapseSearchPanel()

      // 如果传入了坐标则使用传入的坐标
      if (props.latitude && props.longitude) {
        currentLocation.value = {
          latitude: props.latitude,
          longitude: props.longitude,
        }
        // 重置地址信息
        // addressInfo.value.formattedAddress = '正在获取地址...'
      }
      else {
        // 如果没有传入坐标，自动获取当前位置
        backToCurrentLocation()
      }
    }
    else {
      // 关闭时重置搜索状态
      collapseSearchPanel()
    }
  },
)

// 地图初始化
function onMapReady() {
  console.log('地图初始化完成')
  mapContext.value = uni.createMapContext('addressPickerMap', instance)
  mapReady.value = true

  // 延迟一下确保上下文创建完成，然后获取当前地址
  setTimeout(() => {
    // 地图ready后，如果弹窗是打开状态且尚未初始化地址，才获取地址
    if (props.visible && !addressInitialized.value) {
      addressInitialized.value = true
      // 如果传入了坐标则使用传入的坐标，否则获取当前位置
      if (props.latitude && props.longitude) {
        currentLocation.value = {
          latitude: props.latitude,
          longitude: props.longitude,
        }
        getAddressFromLocation()
      }
      else {
        backToCurrentLocation()
      }
    }
  }, 300)
}

// 根据经纬度获取地址信息
async function getAddressFromLocation() {
  if (!currentLocation.value.latitude || !currentLocation.value.longitude)
    return

  try {
    loading.value = true

    const response: any = await reverseGeocode({
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude,
    })

    if (response.code === 200 && response.data) {
      const addressData = response.data.address
      const validationData = response.data.serviceAreaValidation

      if (addressData) {
        addressInfo.value = {
          formattedAddress: addressData.formattedAddress || '未知地址',
          address: addressData.formattedAddress || '',
          poiName: addressData.poiName || '',
          province: addressData.province || '',
          city: addressData.city || '',
          district: addressData.district || '',
          streetName: addressData.streetName || '',
        }

        if (validationData) {
          serviceAreaValidation.value = {
            ...validationData,
            cityName: addressData.province || addressData.city || '',
          }
        }
      }
    }
    else {
      addressInfo.value.formattedAddress = '获取地址失败'
      console.error('获取地址失败:', response.msg)
    }
  }
  catch (error) {
    console.error('获取地址异常:', error)
    addressInfo.value.formattedAddress = '获取地址异常'
  }
  finally {
    loading.value = false
  }
}

// 防抖处理的地址获取函数
const debouncedGetAddressFromLocation = debounce(getAddressFromLocation, 300)

// 防抖处理的地图中心点获取函数
const debouncedGetCenterLocation = debounce(() => {
  if (mapContext.value) {
    mapContext.value.getCenterLocation({
      success: (res: any) => {
        currentLocation.value = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        debouncedGetAddressFromLocation()
      },
      fail: (error: any) => {
        console.error('获取地图中心点失败:', error)
      },
    })
  }
}, 500)

// 地图移动事件
function onMapMove(e: any) {
  if (loading.value)
    return

  // 只响应拖拽结束事件
  if (e.type === 'end' && e.causedBy === 'drag') {
    // 使用防抖函数处理
    debouncedGetCenterLocation()
  }
}

// 确认选择
function handleConfirm() {
  if (confirmDisabled.value) {
    uni.showToast({
      title: loading.value ? '正在获取地址...' : '地址信息不完整',
      icon: 'none',
    })
    return
  }

  confirming.value = true

  emit('confirm', {
    latitude: currentLocation.value.latitude,
    longitude: currentLocation.value.longitude,
    address: addressInfo.value.address,
    formattedAddress: addressInfo.value.formattedAddress,
    poiName: addressInfo.value.poiName,
    serviceAreaValidation: serviceAreaValidation.value || undefined,
  })

  setTimeout(() => {
    confirming.value = false
    emit('update:visible', false)
  }, 300)
}

// 关闭
function handleClose() {
  emit('update:visible', false)
}

// 回到当前位置
function backToCurrentLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      currentLocation.value = {
        latitude: res.latitude,
        longitude: res.longitude,
      }

      // 移动地图到当前位置
      if (mapContext.value) {
        mapContext.value.moveToLocation({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      }

      // 标记地址已初始化，避免重复调用
      addressInitialized.value = true
      debouncedGetAddressFromLocation()
    },
    fail: () => {
      currentLocation.value = {
        latitude: 31.230416,
        longitude: 121.473701,
      }
      addressInfo.value.formattedAddress = '定位失败，使用默认位置'
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}

// 搜索地址（防抖处理）
const debouncedSearchAddress = debounce(async (keyword: string) => {
  if (!keyword.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  try {
    searchLoading.value = true
    // const response = await searchAddress(keyword, addressInfo.value.city)
    const response = await searchAddress(keyword)

    if (response.code === 200 && response.data) {
      searchResults.value = response.data
      showSearchResults.value = true
      console.log('搜索结果:', response.data)
    }
    else {
      searchResults.value = []
      showSearchResults.value = false
    }
  }
  catch (error) {
    console.error('搜索地址失败:', error)
    searchResults.value = []
    showSearchResults.value = false
  }
  finally {
    searchLoading.value = false
  }
}, 300)

// 搜索输入变化
function onSearchInput(e: any) {
  // 修复：使用空值判断而不是逻辑或，避免空字符串被判定为false导致回退到事件对象
  const value = (e && e.detail !== undefined) ? e.detail.value : e
  searchKeyword.value = value
  
  // 有输入内容时展开面板
  if (typeof value === 'string' && value.trim()) {
    searchPanelExpanded.value = true
    // 立即设置为加载状态
    searchLoading.value = true
    showSearchResults.value = false
  }
  else {
    // 无内容时收起
    searchPanelExpanded.value = false
    showSearchResults.value = false
  }
  
  debouncedSearchAddress(value)
}

// 搜索输入框获得焦点
function onSearchFocus() {
  searchInputFocused.value = true
  // 如果有内容就展开，否则点击时不展开
  if (searchKeyword.value.trim()) {
    searchPanelExpanded.value = true
  }
}

// 搜索输入框失去焦点
function onSearchBlur() {
  // 延迟处理，给点击事件足够时间执行
  setTimeout(() => {
    searchInputFocused.value = false
  }, 300)
}

// 收起搜索面板
function collapseSearchPanel() {
  searchPanelExpanded.value = false
  searchInputFocused.value = false
  searchKeyword.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

// 选择搜索结果
function selectSearchResult(result: any) {
  console.log('选择搜索结果:', result)
  
  const locationCoords = result.location.split(',')
  const longitude = Number.parseFloat(locationCoords[0])
  const latitude = Number.parseFloat(locationCoords[1])

  console.log('解析坐标:', { latitude, longitude })

  // 更新当前位置（这会触发地图重新渲染到新坐标）
  currentLocation.value = {
    latitude,
    longitude,
  }

  // 同步地图中心点
  if (mapContext.value) {
    mapContext.value.moveToLocation({
      latitude,
      longitude,
    })
  }

  // 更新地址信息
  const formattedAddress = getFormattedAddressFromResult(result)
  const poiName = getNameFromResult(result)

  addressInfo.value = {
    formattedAddress: formattedAddress || poiName || '未识别地址',
    address: formattedAddress || poiName || '',
    poiName,
    province: result.province || '',
    city: result.city || '',
    district: result.district || '',
    streetName: formattedAddress || '',
  }

  console.log('地图中心点已更新:', currentLocation.value)

  // 收起搜索面板（延迟一下让用户看到地址更新）
  setTimeout(() => {
    collapseSearchPanel()
  }, 100)

  // 获取详细地址信息和服务区域验证
  getAddressFromLocation()
}

// 清空搜索输入
function clearSearch() {
  searchKeyword.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

// 获取地址路径
function getLocationPath(result: any): string {
  const safe = (value: any) => {
    if (typeof value === 'string')
      return value
    if (Array.isArray(value))
      return value.filter(Boolean).join(' ')
    if (value && typeof value === 'object') {
      return value.name || value.adcode || value.city || ''
    }
    return ''
  }

  const province = safe(result.province)
  const city = safe(result.city)
  const district = safe(result.district)
  const parts = []

  if (province && province !== city)
    parts.push(province)
  if (city)
    parts.push(city)
  if (district && district !== city)
    parts.push(district)

  return parts.join(' · ')
}

function getFormattedAddressFromResult(result: any): string {
  const candidates = [
    result.formattedAddress,
    result.formatted_address,
    result.address,
    result.addr,
    result.adDetail,
  ]

  for (const item of candidates) {
    if (typeof item === 'string' && item.trim())
      return item
    if (item && typeof item === 'object') {
      const nested = item.formattedAddress || item.name || item.address
      if (typeof nested === 'string' && nested.trim())
        return nested
    }
  }

  return ''
}

function getNameFromResult(result: any): string {
  if (typeof result.name === 'string' && result.name.trim())
    return result.name
  const formatted = getFormattedAddressFromResult(result)
  if (formatted)
    return formatted
  if (typeof result.title === 'string')
    return result.title
  return ''
}

function formatResultTitle(result: any) {
  return getNameFromResult(result) || '未知地点'
}

function formatResultSubtitle(result: any) {
  const formatted = getFormattedAddressFromResult(result)
  const path = getLocationPath(result)
  const parts = [path, formatted].filter(Boolean)
  if (parts.length === 0)
    return ''
  if (parts.length > 1 && parts[0] === parts[1])
    return parts[0]
  return parts.join(' · ')
}
</script>

<template>
  <BottomDrawer :visible="visible" :title="title" @update:visible="handleClose">
    <view class="relative flex h-max flex-col">
      <!-- 搜索框（固定在顶部） -->
      <view class="relative z-30 bg-white pb-[24rpx] pt-[30rpx]">
        <view class="relative flex items-center">
          <input
            v-model="searchKeyword"
            class="w-full border border-gray-200 rounded-[16rpx] border-solid bg-white px-[48rpx] py-[24rpx] text-[28rpx] placeholder-gray-400 transition-all"
            :class="searchPanelExpanded ? 'border-[#8b5cf6] shadow-[0_10rpx_30rpx_-18rpx_rgba(139,92,246,0.45)]' : ''"
            placeholder="搜索地址、建筑或地标"
            @input="onSearchInput"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          >

          <!-- 搜索图标 -->
          <view class="absolute left-[16rpx]">
            <text class="i-material-symbols-search text-[24rpx] text-gray-400" />
          </view>

          <!-- 清空按钮 -->
          <view
            v-if="searchKeyword"
            class="absolute right-[16rpx] z-10 h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-gray-300 active:scale-90"
            @tap.stop="clearSearch"
          >
            <text class="i-material-symbols-close text-[20rpx] text-white" />
          </view>

          <!-- 加载指示器 -->
          <view v-if="searchLoading" class="absolute right-[16rpx]">
            <view
              class="h-[24rpx] w-[24rpx] animate-spin rounded-full border-2 border-gray-300 border-t-[#8b5cf6]"
            />
          </view>
        </view>
      </view>

      <!-- 内容区域：地图 + 搜索结果浮层 -->
      <view class="relative">
        <!-- 地图容器（固定高度） -->
        <view class="relative h-[500rpx] overflow-hidden rounded-[16rpx] flex items-center justify-center">
          <map
            id="addressPickerMap"
            class="h-full w-full"
            :latitude="currentLocation.latitude"
            :longitude="currentLocation.longitude"
            @updated="onMapReady"
            @regionchange="onMapMove"
          />

          <!-- 中心点标记 -->
          <view class="absolute transform -translate-y-1/2">
            <view class="relative flex justify-center -translate-y-full">
              <!-- 定位图标 -->
              <view
                class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full bg-[#8b5cf6] shadow-lg"
              />
              <!-- 定位线 -->
              <view
                class="absolute top-[48rpx] h-[32rpx] w-[2rpx] transform bg-[#8b5cf6]"
              />
            </view>
          </view>

          <!-- 回到当前位置按钮 -->
          <view class="absolute bottom-[24rpx] right-[24rpx]">
            <view
              class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-full bg-white shadow-lg active:scale-90"
              @tap="backToCurrentLocation"
            >
              <text
                class="i-material-symbols-my-location translate-x-[1px] text-[32rpx] text-[#8b5cf6]"
              />
            </view>
          </view>
        </view>

        <!-- 搜索结果浮层（覆盖在地图上方） -->
        <view
          class="absolute left-0 right-0 top-0 z-20 overflow-hidden rounded-[16rpx] bg-white shadow-lg transition-all duration-300 ease-out"
          :class="searchPanelExpanded ? 'translate-y-0 opacity-100' : '-translate-y-[20rpx] opacity-0 pointer-events-none'"
          :style="{
            maxHeight: searchPanelExpanded ? '500rpx' : '0',
          }"
          @tap.stop
        >
          <!-- 搜索加载中 (骨架屏) -->
          <view
            v-show="searchLoading && searchKeyword.trim()"
            class="px-[30rpx] py-[20rpx]"
          >
            <view v-for="i in 3" :key="i" class="mb-[32rpx] flex items-start">
              <view class="mr-[12rpx] mt-[2rpx] h-[36rpx] w-[36rpx] flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
              <view class="flex-1">
                <view class="h-[28rpx] w-[60%] animate-pulse rounded bg-gray-200" />
                <view class="mt-[12rpx] h-[22rpx] w-[80%] animate-pulse rounded bg-gray-100" />
              </view>
            </view>
          </view>

          <!-- 搜索结果列表 -->
          <scroll-view
            v-show="showSearchResults && searchResults.length > 0 && !searchLoading"
            scroll-y
            class="max-h-[440rpx]"
          >
            <view
              v-for="(result, index) in searchResults"
              :key="index"
              class="mx-[30rpx] border-b border-gray-100 py-[20rpx] transition-colors last:border-b-0 active:bg-gray-50"
              @tap.stop="selectSearchResult(result)"
            >
              <view class="flex items-start">
                <!-- 位置图标 -->
                <view class="mr-[12rpx] mt-[2rpx] flex-shrink-0">
                  <view
                    class="h-[36rpx] w-[36rpx] flex items-center justify-center rounded-full bg-[#f4eefe]"
                  >
                    <text
                      class="i-material-symbols-location-on text-[20rpx] text-[#8b5cf6]"
                    />
                  </view>
                </view>

                <!-- 地址信息 -->
                <view class="min-w-0 flex-1">
                  <!-- 主要地址名称 -->
                  <text
                    class="block text-[28rpx] text-black font-medium leading-[40rpx]"
                  >
                    {{ formatResultTitle(result) }}
                  </text>

                  <!-- 地理层级信息 -->
                  <view class="mt-[4rpx]">
                    <!-- 地址路径 -->
                    <text class="text-[22rpx] text-gray-400">
                      {{ formatResultSubtitle(result) }}
                    </text>
                  </view>
                </view>

                <!-- 选择箭头 -->
                <view class="ml-[8rpx] flex-shrink-0 self-center">
                  <text
                    class="i-material-symbols-chevron-right text-[24rpx] text-gray-300"
                  />
                </view>
              </view>
            </view>
          </scroll-view>

          <!-- 无搜索结果提示 -->
          <view
            v-show="
              showSearchResults
                && searchResults.length === 0
                && !searchLoading
                && searchKeyword.trim()
            "
            class="flex flex-col items-center justify-center py-[100rpx]"
          >
            <text
              class="i-material-symbols-search-off mb-[16rpx] block text-[64rpx] text-gray-300"
            />
            <text class="text-[26rpx] text-gray-500">
              未找到相关地址
            </text>
            <text class="mt-[8rpx] block text-[22rpx] text-gray-400">
              试试其他关键词
            </text>
          </view>

          <!-- 收起按钮 -->
          <view
            v-show="searchPanelExpanded"
            class="border-t border-gray-100 bg-white py-[16rpx] text-center"
            @tap="collapseSearchPanel"
          >
            <view class="inline-flex items-center gap-[8rpx] active:opacity-70">
              <text class="text-[24rpx] text-gray-500">收起</text>
              <text class="i-material-symbols-keyboard-arrow-up text-[24rpx] text-gray-500" />
            </view>
          </view>
        </view>
      </view>

      <!-- 地址信息面板 -->
      <view class="border-t border-gray-100 bg-white py-[24rpx]">
        <!-- 地址显示 -->
        <view class="mb-[24rpx]">
          <view class="mb-[8rpx] flex items-center">
            <text
              class="i-material-symbols-location-on mr-[8rpx] text-[24rpx] text-[#8b5cf6]"
            />
            <text class="text-[24rpx] text-gray-600">
              选中位置
            </text>
          </view>

          <view
            class="box-border min-h-[128rpx] rounded-[16rpx] bg-gray-50 p-[16rpx]"
          >
            <view v-if="loading" class="flex flex-col space-y-[12rpx]">
              <view class="h-[28rpx] w-[70%] animate-pulse rounded bg-gray-200" />
              <view class="h-[24rpx] w-[50%] animate-pulse rounded bg-gray-200" />
            </view>

            <view v-else>
              <text class="text-[28rpx] text-black font-medium leading-[40rpx]">
                {{ addressInfo.poiName || addressInfo.formattedAddress }}
              </text>

              <view
                v-if="
                  addressInfo.formattedAddress
                    && addressInfo.formattedAddress !== addressInfo.poiName
                "
                class="mt-[8rpx]"
              >
                <text class="text-[24rpx] text-gray-500 leading-[32rpx]">
                  {{ addressInfo.formattedAddress }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 服务状态显示 -->
        <view class="mb-[24rpx] flex items-center justify-between">
          <view class="flex items-center">
            <text
              class="i-material-symbols:verified mr-[8rpx] text-[24rpx] text-[#8b5cf6]"
            />
            <text class="text-[24rpx] text-gray-600">
              服务状态
            </text>
          </view>

          <view
            class="flex items-center rounded-[12rpx] px-[12rpx] py-[6rpx]"
            :class="serviceStatusInfo.bgColor"
          >
            <view
              class="mr-[6rpx] text-[20rpx]"
              :class="`${serviceStatusInfo.icon} ${serviceStatusInfo.color}`"
            />
            <text
              class="text-[22rpx] font-medium"
              :class="serviceStatusInfo.color"
            >
              {{ serviceStatusInfo.text }}
            </text>
          </view>
        </view>

      <!-- 确认按钮 -->
      <view
        class="w-full rounded-[16rpx] py-[24rpx] text-center text-[28rpx] font-medium"
        :class="
            confirmDisabled
              ? 'bg-gray-300 text-gray-500'
              : 'bg-[#8b5cf6] text-white shadow-sm'
          "
          :disabled="confirmDisabled"
          @tap="handleConfirm"
        >
          <view v-if="confirming" class="flex items-center justify-center">
            <view
              class="mr-[8rpx] h-[24rpx] w-[24rpx] animate-spin border-2 border-gray-400 border-t-white rounded-full"
            />
            <text>确认中...</text>
          </view>
          <text v-else>
            确认位置
          </text>
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
