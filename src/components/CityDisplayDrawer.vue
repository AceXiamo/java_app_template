<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { getServiceCities } from '@/api/home'
import type { ServiceCity } from '@/api/home'

interface CityDisplayDrawerProps {
  visible: boolean
}

interface CityDisplayDrawerEmits {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<CityDisplayDrawerProps>()
const emit = defineEmits<CityDisplayDrawerEmits>()

// 数据状态
const cities = ref<ServiceCity[]>([])
const loading = ref(false)

// 按状态分组的城市
const activeCities = computed(() => 
  cities.value.filter(city => city.status === 'active')
)

const comingSoonCities = computed(() => 
  cities.value.filter(city => city.status === 'coming_soon')
)

const closedCities = computed(() => 
  cities.value.filter(city => city.status === 'closed')
)

// 获取城市列表数据
async function loadCities() {
  try {
    loading.value = true
    const response = await getServiceCities()
    
    if (response.code === 200 && response.data) {
      cities.value = response.data
    } else {
      throw new Error(`API返回错误: ${response.msg || '未知错误'}`)
    }
  } catch (error) {
    console.error('获取服务城市列表失败:', error)
    
    // 显示错误提示
    uni.showToast({
      title: '获取城市列表失败',
      icon: 'none',
      duration: 2000,
    })
  } finally {
    loading.value = false
  }
}

// 监听抽屉显示状态，打开时加载数据
watch(() => props.visible, (visible) => {
  if (visible && cities.value.length === 0) {
    loadCities()
  }
})

// 处理抽屉关闭
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <BottomDrawer 
    title="服务开通城市" 
    :visible="visible" 
    height="600rpx"
    @update:visible="handleClose"
  >
    <view class="mt-[40rpx] space-y-[32rpx]">
      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-[60rpx]">
        <view class="mr-[16rpx] h-[32rpx] w-[32rpx] animate-spin border-2 border-gray-300 border-t-purple-600 rounded-full" />
        <text class="text-[26rpx] text-gray-600">加载中...</text>
      </view>

      <!-- 城市列表 -->
      <view v-else class="space-y-[48rpx]">
        <!-- 已开通服务城市 -->
        <view v-if="activeCities.length > 0">
          <view class="mb-[24rpx] flex items-center">
            <view class="mr-[12rpx] h-[8rpx] w-[8rpx] rounded-full bg-green-500" />
            <text class="text-[32rpx] font-semibold text-gray-800">已开通服务</text>
            <text class="ml-[12rpx] rounded-full bg-green-100 px-[16rpx] py-[4rpx] text-[20rpx] text-green-600">
              {{ activeCities.length }}个城市
            </text>
          </view>
          <view class="grid grid-cols-2 gap-[20rpx]">
            <view 
              v-for="city in activeCities" 
              :key="city.areaId"
              class="flex items-center rounded-[16rpx] bg-green-50 p-[24rpx] border border-green-100"
            >
              <view class="mr-[12rpx] h-[12rpx] w-[12rpx] rounded-full bg-green-500 flex-none" />
              <text class="text-[26rpx] text-gray-800 font-medium">{{ city.cityName }}</text>
            </view>
          </view>
        </view>

        <!-- 即将开通城市 -->
        <view v-if="comingSoonCities.length > 0">
          <view class="mb-[24rpx] flex items-center">
            <view class="i-material-symbols:schedule mr-[12rpx] text-[20rpx] text-yellow-600" />
            <text class="text-[32rpx] font-semibold text-gray-800">即将开通</text>
            <text class="ml-[12rpx] rounded-full bg-yellow-100 px-[16rpx] py-[4rpx] text-[20rpx] text-yellow-600">
              {{ comingSoonCities.length }}个城市
            </text>
          </view>
          <view class="grid grid-cols-2 gap-[20rpx]">
            <view 
              v-for="city in comingSoonCities" 
              :key="city.areaId"
              class="flex items-center rounded-[16rpx] bg-yellow-50 p-[24rpx] border border-yellow-100"
            >
              <view class="i-material-symbols:schedule mr-[12rpx] text-[20rpx] text-yellow-600 flex-none" />
              <text class="text-[26rpx] text-gray-600 font-medium">{{ city.cityName }}</text>
            </view>
          </view>
        </view>

        <!-- 暂时关闭城市 -->
        <view v-if="closedCities.length > 0">
          <view class="mb-[24rpx] flex items-center">
            <view class="i-material-symbols:block mr-[12rpx] text-[20rpx] text-gray-500" />
            <text class="text-[32rpx] font-semibold text-gray-800">暂时关闭</text>
            <text class="ml-[12rpx] rounded-full bg-gray-100 px-[16rpx] py-[4rpx] text-[20rpx] text-gray-500">
              {{ closedCities.length }}个城市
            </text>
          </view>
          <view class="grid grid-cols-2 gap-[20rpx]">
            <view 
              v-for="city in closedCities" 
              :key="city.areaId"
              class="flex items-center rounded-[16rpx] bg-gray-50 p-[24rpx] border border-gray-100"
            >
              <view class="i-material-symbols:block mr-[12rpx] text-[20rpx] text-gray-500 flex-none" />
              <text class="text-[26rpx] text-gray-500 font-medium">{{ city.cityName }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && cities.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
          <view class="i-material-symbols:location-off mb-[24rpx] text-[80rpx] text-gray-300" />
          <text class="text-[28rpx] text-gray-500">暂无服务城市信息</text>
        </view>

        <!-- 底部提示信息 -->
        <view v-if="cities.length > 0" class="rounded-[16rpx] bg-gray-50 p-[24rpx] border border-gray-100">
          <view class="mb-[12rpx] flex items-center">
            <view class="i-material-symbols:info mr-[8rpx] text-[20rpx] text-gray-500" />
            <text class="text-[24rpx] font-medium text-gray-700">服务提示</text>
          </view>
          <text class="text-[22rpx] text-gray-600 leading-[32rpx]">
            我们正在不断扩展服务覆盖范围，敬请期待更多城市的加入！如有疑问，请联系客服。
          </text>
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>