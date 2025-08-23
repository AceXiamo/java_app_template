<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance } from 'vue'
import { debounce } from 'lodash'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { reverseGeocode } from '@/api/map'
import type { ServiceAreaValidation } from '@/api/map'

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

const props = withDefaults(defineProps<MapAddressPickerProps>(), {
  title: '选择位置',
  latitude: undefined,
  longitude: undefined,
})

const emit = defineEmits<MapAddressPickerEmits>()
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

// 服务状态信息
const serviceStatusInfo = computed(() => {
  if (!serviceAreaValidation.value) {
    return {
      text: '检查中',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: 'i-material-symbols:help'
    }
  }

  const validation = serviceAreaValidation.value
  
  if (validation.isSupported && validation.status === 'active') {
    return {
      text: '已开通',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'i-material-symbols:check-circle'
    }
  } else if (validation.status === 'coming_soon') {
    return {
      text: '即将开通',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: 'i-material-symbols:schedule'
    }
  } else if (validation.status === 'closed') {
    return {
      text: '暂时关闭',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'i-material-symbols:block'
    }
  } else {
    return {
      text: '暂未开通',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: 'i-material-symbols:location-off'
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
        getAddressFromLocation(props.latitude, props.longitude)
      }
      else {
        backToCurrentLocation()
      }
    }
  }, 300)
}

// 根据经纬度获取地址信息
async function getAddressFromLocation(latitude: number, longitude: number) {
  if (!latitude || !longitude)
    return

  try {
    loading.value = true
    addressInfo.value.formattedAddress = '正在获取地址...'
    serviceAreaValidation.value = null

    const response = await reverseGeocode({ latitude, longitude })

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

        debouncedGetAddressFromLocation(res.latitude, res.longitude)
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
      debouncedGetAddressFromLocation(res.latitude, res.longitude)
    },
    fail: () => {
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}
</script>

<template>
  <BottomDrawer
    :visible="visible"
    :title="title"
    @update:visible="handleClose"
  >
    <view class="h-max flex flex-col pt-[30rpx]">
      <!-- 地图容器 -->
      <view class="relative h-[500rpx]">
        <map
          id="addressPickerMap"
          class="h-full w-full"
          :latitude="currentLocation.latitude"
          :longitude="currentLocation.longitude"
          @updated="onMapReady"
          @regionchange="onMapMove"
        />

        <!-- 中心点标记 -->
        <view class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <view class="relative">
            <!-- 定位图标 -->
            <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full bg-purple-600 shadow-lg">
              <text class="i-material-symbols-location-on text-[24rpx] text-white" />
            </view>
            <!-- 定位线 -->
            <view class="absolute left-1/2 top-[48rpx] h-[32rpx] w-[2rpx] transform bg-purple-600 -translate-x-1/2" />
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
                {{ addressInfo.formattedAddress }}
              </text>

              <view v-if="addressInfo.poiName" class="mt-[8rpx] flex items-center">
                <text class="rounded-[8rpx] bg-purple-50 px-[12rpx] py-[4rpx] text-[20rpx] text-purple-600">
                  {{ addressInfo.poiName }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 服务状态显示 -->
        <view class="mb-[24rpx]">
          <view class="mb-[8rpx] flex items-center">
            <text class="i-material-symbols:verified mr-[8rpx] text-[24rpx] text-purple-600" />
            <text class="text-[24rpx] text-gray-600">
              服务状态
            </text>
          </view>

          <view class="box-border rounded-[16rpx] p-[16rpx]" :class="serviceStatusInfo.bgColor">
            <view class="flex items-center">
              <view class="mr-[8rpx] text-[24rpx]" :class="`${serviceStatusInfo.icon} ${serviceStatusInfo.color}`" />
              <text class="text-[26rpx] font-medium" :class="serviceStatusInfo.color">
                {{ serviceStatusInfo.text }}
              </text>
            </view>
            
            <view v-if="serviceAreaValidation?.message" class="mt-[8rpx]">
              <text class="text-[22rpx] text-gray-600 leading-[32rpx]">
                {{ serviceAreaValidation.message }}
              </text>
            </view>

            <!-- 服务提示 -->
            <view v-if="serviceAreaValidation" class="mt-[12rpx]">
              <view v-if="serviceAreaValidation.isSupported && serviceAreaValidation.status === 'active'" 
                    class="flex items-center text-[20rpx] text-green-600">
                <text class="i-material-symbols:check-circle mr-[4rpx] text-[16rpx]" />
                <text>该城市已开通服务，可正常租车</text>
              </view>
              <view v-else-if="serviceAreaValidation.status === 'coming_soon'" 
                    class="flex items-center text-[20rpx] text-orange-600">
                <text class="i-material-symbols:schedule mr-[4rpx] text-[16rpx]" />
                <text>服务即将开通，敬请期待</text>
              </view>
              <view v-else class="flex items-center text-[20rpx] text-gray-600">
                <text class="i-material-symbols:info mr-[4rpx] text-[16rpx]" />
                <text>暂时无法在该区域提供服务</text>
              </view>
            </view>
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
