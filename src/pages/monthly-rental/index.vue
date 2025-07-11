<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { LocationInfo } from '@/api/home'
import { getCurrentLocation } from '@/api/home'

// 页面数据状态
const currentLocation = ref<LocationInfo | null>(null)
const selectedPeriod = ref(30)

// 活动信息
const activityInfo = ref({
  title: '超值月租活动',
  subtitle: '30天起租，享受8折超值优惠',
  benefits: ['免费换车一次', '延期免手续费', '24小时道路救援'],
  badgeText: 'HOT',
})

// 租期选项
const periodOptions = ref([
  { period: 30, label: '30天', isActive: true },
  { period: 60, label: '60天', isActive: false },
  { period: 90, label: '90天', isActive: false },
  { period: 0, label: '自定义', isActive: false },
])

// 推荐车辆列表
const vehicles = ref([
  {
    id: 1,
    name: '特斯拉 Model 3',
    carType: '轿车',
    energyType: '电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 2.1,
    rating: 4.9,
    pricing: {
      originalPrice: 8970,
      discountPrice: 7176,
      savings: 1794,
      unit: '30天月租',
    },
    tags: ['平台优选', '免费换车'],
    badges: [
      { text: '超值月租', color: 'orange' },
      { text: '8折优惠', color: 'red' },
    ],
  },
  {
    id: 2,
    name: '比亚迪海豹',
    carType: '轿车',
    energyType: '电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 1.5,
    rating: 4.8,
    pricing: {
      originalPrice: 5970,
      discountPrice: 4478,
      savings: 1492,
      unit: '30天月租',
    },
    tags: ['平台自营', '新车上线'],
    badges: [
      { text: '超值月租', color: 'orange' },
      { text: '7.5折优惠', color: 'red' },
    ],
  },
  {
    id: 3,
    name: '宝马 iX3',
    carType: 'SUV',
    energyType: '电动',
    seats: 5,
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=96&q=80',
    distance: 3.2,
    rating: 4.7,
    pricing: {
      originalPrice: 11970,
      discountPrice: 8379,
      savings: 3591,
      unit: '30天月租',
    },
    tags: ['平台优选', '豪华车型'],
    badges: [
      { text: '超值月租', color: 'orange' },
      { text: '7折优惠', color: 'red' },
    ],
  },
])

// 月租须知
const monthlyRentalRules = ref([
  '最低租期30天，支持延期，延期免手续费',
  '月租期间享受一次免费换车服务',
  '24小时道路救援，保险理赔快速处理',
  '提前7天退租可退还剩余租金的70%',
])

// 计算显示的位置信息
const displayLocation = computed(() => {
  return currentLocation.value?.district || '人民广场'
})

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
function selectPeriod(period: number) {
  selectedPeriod.value = period
  periodOptions.value.forEach((option) => {
    option.isActive = option.period === period
  })
}

// 点击车辆卡片
function selectVehicle(vehicle: any) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.id}`,
  })
}

onMounted(() => {
  getLocation()
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
              {{ activityInfo.title }}
            </text>
            <text class="rounded-full bg-orange-100 px-[16rpx] py-[8rpx] text-[22rpx] text-orange-600">
              {{ activityInfo.badgeText }}
            </text>
          </view>
          <text class="mb-[16rpx] block text-[28rpx] text-gray-700">
            {{ activityInfo.subtitle }}
          </text>
          <view class="flex items-center text-[24rpx] text-gray-600 space-x-[32rpx]">
            <text v-for="benefit in activityInfo.benefits" :key="benefit">
              ✓ {{ benefit }}
            </text>
          </view>
        </view>
      </view>

      <!-- 租期选择栏 -->
      <view class="flex-shrink-0 border-b border-gray-100 bg-white px-[40rpx] py-[32rpx]">
        <view class="space-y-[32rpx]">
          <!-- 地址和起租信息 -->
          <view class="flex items-center space-x-[24rpx]">
            <view class="flex flex-1 items-center rounded-[24rpx] bg-gray-100 px-[32rpx] py-[24rpx] space-x-[16rpx]">
              <view
                i-material-symbols:location-on
                class="text-purple-600"
              />
              <text class="text-[28rpx] text-gray-700">
                {{ displayLocation }}
              </text>
            </view>
            <view class="flex-1 rounded-[24rpx] bg-gray-100 px-[32rpx] py-[24rpx]">
              <text class="text-[28rpx] text-gray-700">
                30天起租
              </text>
            </view>
          </view>

          <!-- 租期选择 -->
          <view>
            <view class="mb-[16rpx] text-[28rpx] text-gray-600">
              选择租期
            </view>
            <view class="flex space-x-[16rpx]">
              <view
                v-for="option in periodOptions"
                :key="option.period"
                class="rounded-[16rpx] px-[32rpx] py-[16rpx] text-[28rpx] transition-all"
                :class="option.isActive
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

      <!-- 推荐车辆列表 -->
      <view class="flex-1 bg-gray-50">
        <view class="p-[32rpx] space-y-[32rpx]">
          <!-- 推荐车辆卡片 -->
          <view
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="border border-gray-100 rounded-[32rpx] bg-white p-[40rpx] shadow-sm"
            @tap="selectVehicle(vehicle)"
          >
            <view class="mb-[32rpx] flex items-center justify-between">
              <text class="rounded-full bg-orange-100 px-[16rpx] py-[8rpx] text-[22rpx] text-orange-600 font-medium">
                超值月租
              </text>
              <text
                class="rounded-full px-[16rpx] py-[8rpx] text-[22rpx]"
                :class="vehicle.badges[1].color === 'red' ? 'text-red-500 bg-red-100' : 'text-orange-600 bg-orange-100'"
              >
                {{ vehicle.badges[1].text }}
              </text>
            </view>

            <!-- 车辆图片区域 -->
            <view class="mb-[32rpx] h-[192rpx] w-full overflow-hidden rounded-[24rpx]">
              <image
                :src="vehicle.imageUrl"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>

            <!-- 车辆信息区域 -->
            <view class="space-y-[24rpx]">
              <view class="flex items-center justify-between">
                <view>
                  <text class="block text-[36rpx] text-black font-semibold">
                    {{ vehicle.name }}
                  </text>
                  <text class="text-[26rpx] text-gray-600">
                    {{ vehicle.energyType }} · {{ vehicle.carType }} · {{ vehicle.seats }}座
                  </text>
                </view>
                <view class="text-right">
                  <view class="flex items-baseline space-x-[16rpx]">
                    <text class="text-[28rpx] text-gray-400 line-through">
                      ¥{{ vehicle.pricing.originalPrice.toLocaleString() }}
                    </text>
                    <text class="text-[40rpx] text-red-500 font-bold">
                      ¥{{ vehicle.pricing.discountPrice.toLocaleString() }}
                    </text>
                  </view>
                  <view class="text-[24rpx] text-gray-500">
                    {{ vehicle.pricing.unit }}
                  </view>
                </view>
              </view>

              <view class="flex items-center justify-between border-t border-gray-100 py-[16rpx] text-[28rpx] text-gray-600">
                <text class="flex items-center space-x-[8rpx]">
                  <view
                    i-material-symbols:savings
                    class="text-green-600"
                  />
                  <text>节省 ¥{{ vehicle.pricing.savings.toLocaleString() }}</text>
                </text>
                <text class="flex items-center space-x-[8rpx]">
                  <view
                    i-material-symbols:location-on
                    class="text-purple-600"
                  />
                  <text>距离 {{ vehicle.distance }}km</text>
                </text>
                <view class="flex items-center text-yellow-500 space-x-[8rpx]">
                  <view
                    i-material-symbols:star
                    class="text-[28rpx]"
                  />
                  <text class="text-[28rpx] text-gray-700 font-medium">
                    {{ vehicle.rating }}
                  </text>
                </view>
              </view>

              <view class="flex flex-wrap gap-[16rpx] pt-[16rpx]">
                <text
                  v-for="tag in vehicle.tags"
                  :key="tag"
                  class="rounded-full px-[24rpx] py-[8rpx] text-[22rpx]"
                  :class="tag.includes('平台') ? 'text-purple-600 bg-purple-100' : 'text-green-600 bg-green-100'"
                >
                  {{ tag }}
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
                v-for="rule in monthlyRentalRules"
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
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
