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
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
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
  (e: 'confirm', data: {
    latitude: number
    longitude: number
    address: string
    formattedAddress: string
    poiName?: string
    serviceAreaValidation?: ServiceAreaValidation
  }): void
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

// 监听props变化
watch(() => props.visible, (visible) => {
  if (visible) {
    // 重置初始化状态
    addressInitialized.value = false

    // 如果传入了坐标则使用传入的坐标
    if (props.latitude && props.longitude) {
      currentLocation.value = {
        latitude: props.latitude,
        longitude: props.longitude,
      }
      // 重置地址信息
      addressInfo.value.formattedAddress = '正在获取地址...'
    }
    else {
      // 如果没有传入坐标，自动获取当前位置
      backToCurrentLocation()
    }
  }
})

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

    const response: any = await reverseGeocode({ latitude: currentLocation.value.latitude, longitude: currentLocation.value.longitude })

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
          serviceAreaValidation.value = validationData
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
  if (confirming.value)
    return

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
function onSearchInput(value: string) {
  searchKeyword.value = value
  debouncedSearchAddress(value)
}

// 搜索输入框获得焦点
function onSearchFocus() {
  searchInputFocused.value = true
  if (searchKeyword.value.trim() && searchResults.value.length > 0) {
    showSearchResults.value = true
  }
}

// 搜索输入框失去焦点
function onSearchBlur() {
  searchInputFocused.value = false
  // 延迟隐藏搜索结果，以便用户可以点击搜索结果
  setTimeout(() => {
    if (!searchInputFocused.value) {
      showSearchResults.value = false
    }
  }, 200)
}

// 选择搜索结果
function selectSearchResult(result: any) {
  const locationCoords = result.location.split(',')
  const longitude = Number.parseFloat(locationCoords[0])
  const latitude = Number.parseFloat(locationCoords[1])

  // 更新当前位置
  currentLocation.value = {
    latitude,
    longitude,
  }

  // 更新地址信息
  addressInfo.value = {
    formattedAddress: result.formatted_address,
    address: result.formatted_address,
    poiName: result.name || '',
    province: result.province || '',
    city: result.city || '',
    district: result.district || '',
    streetName: result.street?.join(',') || '',
  }

  // 移动地图到选中位置
  if (mapContext.value) {
    mapContext.value.moveToLocation({
      latitude,
      longitude,
    })
  }

  // 清空搜索
  searchKeyword.value = ''
  searchResults.value = []
  showSearchResults.value = false

  // 获取详细地址信息和服务区域验证
  getAddressFromLocation()
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

// 获取地理层级文本
function getLevelText(level: string): string {
  const levelMap: Record<string, string> = {
    住宅区: '住宅区',
    兴趣点: 'POI',
    道路: '道路',
    建筑物: '建筑',
    公司企业: '企业',
    政府机构: '机构',
    商务住宅: '商住',
    生活服务: '服务',
    餐饮服务: '餐饮',
    购物服务: '购物',
    体育休闲服务: '休闲',
    医疗保健服务: '医疗',
    住宿服务: '住宿',
    风景名胜: '景点',
    交通设施服务: '交通',
  }
  return levelMap[level] || level
}

// 获取地址路径
function getLocationPath(result: any): string {
  const pathParts = []

  if (result.province && result.province !== result.city) {
    pathParts.push(result.province)
  }

  if (result.city) {
    pathParts.push(result.city)
  }

  if (result.district && result.district !== result.city) {
    pathParts.push(result.district)
  }

  return pathParts.join(' · ')
}
</script>

<template>
  <BottomDrawer
    :visible="visible"
    :title="title"
    @update:visible="handleClose"
  >
    <view class="h-max flex flex-col pt-[30rpx]">
      <!-- 搜索框 -->
      <view class="relative mb-[24rpx]">
        <view class="relative flex items-center">
          <input
            v-model="searchKeyword"
            class="w-full border border-gray-200 rounded-[16rpx] border-solid bg-white px-[48rpx] py-[24rpx] text-[28rpx] focus:border-purple-600 placeholder-gray-400"
            placeholder="搜索地址、建筑或地标"
            @input="onSearchInput($event.detail.value)"
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
            class="absolute right-[16rpx] h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-gray-300"
            @tap="clearSearch"
          >
            <text class="i-material-symbols-close text-[20rpx] text-white" />
          </view>
          <!-- 加载指示器 -->
          <view
            v-if="searchLoading"
            class="absolute right-[16rpx]"
          >
            <view class="h-[24rpx] w-[24rpx] animate-spin border-2 border-gray-300 border-t-purple-600 rounded-full" />
          </view>
        </view>

        <!-- 搜索结果列表 -->
        <view
          v-if="showSearchResults && searchResults.length > 0"
          class="absolute top-full z-10 mt-[8rpx] max-h-[400rpx] w-full overflow-y-auto border border-gray-200 rounded-[16rpx] bg-white shadow-lg"
        >
          <view
            v-for="(result, index) in searchResults"
            :key="index"
            class="border-b border-gray-100 p-[24rpx] transition-colors last:border-b-0 active:bg-gray-50"
            @tap="selectSearchResult(result)"
          >
            <view class="flex items-start">
              <!-- 位置图标 -->
              <view class="mr-[16rpx] mt-[4rpx] flex-shrink-0">
                <view class="h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-purple-100">
                  <text class="i-material-symbols-location-on text-[20rpx] text-purple-600" />
                </view>
              </view>

              <!-- 地址信息 -->
              <view class="min-w-0 flex-1">
                <!-- 主要地址名称 -->
                <text class="block text-[28rpx] text-black font-medium leading-[40rpx]">
                  {{ result.formatted_address }}
                </text>

                <!-- 地理层级信息 -->
                <view class="mt-[8rpx] flex flex-wrap items-center gap-[8rpx]">
                  <!-- 地点类型标签 -->
                  <view
                    v-if="result.level"
                    class="flex rounded-[8rpx] bg-blue-50 px-[12rpx] py-[2rpx]"
                  >
                    <text class="text-[20rpx] text-blue-600 font-medium">
                      {{ getLevelText(result.level) }}
                    </text>
                  </view>

                  <!-- 地址路径 -->
                  <text class="text-[22rpx] text-gray-500">
                    {{ getLocationPath(result) }}
                  </text>
                </view>
              </view>

              <!-- 选择箭头 -->
              <view class="ml-[8rpx] flex-shrink-0 self-center">
                <text class="i-material-symbols-chevron-right text-[24rpx] text-gray-400" />
              </view>
            </view>
          </view>
        </view>

        <!-- 无搜索结果提示 -->
        <view
          v-if="showSearchResults && searchResults.length === 0 && !searchLoading && searchKeyword.trim()"
          class="absolute top-full z-10 mt-[8rpx] w-full border border-gray-200 rounded-[16rpx] bg-white p-[48rpx] text-center shadow-lg"
        >
          <text class="i-material-symbols-search-off mb-[16rpx] block text-[48rpx] text-gray-300" />
          <text class="text-[26rpx] text-gray-500">
            未找到相关地址
          </text>
          <text class="mt-[8rpx] block text-[22rpx] text-gray-400">
            试试其他关键词
          </text>
        </view>
      </view>

      <!-- 地图容器 -->
      <view class="relative h-[500rpx] flex justify-center items-center">
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
            <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full bg-purple-600 shadow-lg" />
            <!-- 定位线 -->
            <view class="absolute top-[48rpx] h-[32rpx] w-[2rpx] transform bg-purple-600" />
          </view>
        </view>

        <!-- 回到当前位置按钮 -->
        <view class="absolute bottom-[24rpx] right-[24rpx]">
          <view
            class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-full bg-white shadow-lg"
            @tap="backToCurrentLocation"
          >
            <text class="i-material-symbols-my-location translate-x-[1px] text-[32rpx] text-purple-600" />
          </view>
        </view>
      </view>

      <!-- 地址信息面板 -->
      <view class="border-t border-gray-100 bg-white p-[24rpx]">
        <!-- 地址显示 -->
        <view class="mb-[24rpx]">
          <view class="mb-[8rpx] flex items-center">
            <text class="i-material-symbols-location-on mr-[8rpx] text-[24rpx] text-purple-600" />
            <text class="text-[24rpx] text-gray-600">
              选中位置
            </text>
          </view>

          <view class="box-border min-h-[120rpx] rounded-[16rpx] bg-gray-50 p-[16rpx]">
            <view v-if="loading" class="flex items-center">
              <view class="mr-[8rpx] h-[24rpx] w-[24rpx] animate-spin border-2 border-gray-300 border-t-purple-600 rounded-full" />
              <text class="text-[26rpx] text-gray-600">
                正在获取地址...
              </text>
            </view>

            <view v-else>
              <text class="text-[28rpx] text-black font-medium leading-[40rpx]">
                {{ addressInfo.poiName || addressInfo.formattedAddress }}
              </text>

              <view v-if="addressInfo.poiName && addressInfo.streetName !== addressInfo.poiName" class="mt-[8rpx]">
                <text class="text-[24rpx] text-gray-500 leading-[32rpx]">
                  {{ addressInfo.streetName }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 服务状态显示 -->
        <view class="mb-[24rpx] flex items-center justify-between">
          <view class="flex items-center">
            <text class="i-material-symbols:verified mr-[8rpx] text-[24rpx] text-purple-600" />
            <text class="text-[24rpx] text-gray-600">
              服务状态
            </text>
          </view>

          <view class="flex items-center rounded-[12rpx] px-[12rpx] py-[6rpx]" :class="serviceStatusInfo.bgColor">
            <view class="mr-[6rpx] text-[20rpx]" :class="`${serviceStatusInfo.icon} ${serviceStatusInfo.color}`" />
            <text class="text-[22rpx] font-medium" :class="serviceStatusInfo.color">
              {{ serviceStatusInfo.text }}
            </text>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view
          class="w-full rounded-[16rpx] py-[24rpx] text-center text-[28rpx] font-medium"
          :class="loading || confirming
            ? 'bg-gray-300 text-gray-500'
            : 'bg-purple-600 text-white shadow-sm'"
          :disabled="loading || confirming"
          @tap="handleConfirm"
        >
          <view v-if="confirming" class="flex items-center justify-center">
            <view class="mr-[8rpx] h-[24rpx] w-[24rpx] animate-spin border-2 border-gray-400 border-t-white rounded-full" />
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
