<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { DailyRankingResponse, MonthlyRankingResponse } from '@/api/ranking'
import { getDailyRanking, getMonthlyRanking } from '@/api/ranking'
import RankingHead from '@/components/page/ranking/Head.vue'

// 当前激活的tab
const activeTab = ref<'daily' | 'monthly'>('daily')

// 排行榜数据
const dailyRanking = ref<DailyRankingResponse | null>(null)
const monthlyRanking = ref<MonthlyRankingResponse | null>(null)
const loading = ref(false)

// 切换tab
function switchTab(tab: 'daily' | 'monthly') {
  activeTab.value = tab
}

// 获取排名样式
function getRankStyle(rank: number) {
  if (rank <= 3) {
    const colors = {
      1: 'bg-yellow-500 text-white',
      2: 'bg-gray-400 text-white',
      3: 'bg-orange-500 text-white',
    }
    return colors[rank as keyof typeof colors] || 'bg-purple-100 text-purple-600'
  }
  return 'bg-purple-100 text-purple-600'
}

// 能源类型显示中文
function getEnergyTypeText(energyType: string) {
  const energyTypeMap: Record<string, string> = {
    ELECTRIC: '纯电动',
    HYBRID: '混合动力',
    GASOLINE: '汽油',
    DIESEL: '柴油',
    electric: '纯电动',
    hybrid: '混合动力',
    gasoline: '汽油',
    diesel: '柴油',
    纯电动: '纯电动',
    混合动力: '混合动力',
    汽油: '汽油',
    柴油: '柴油',
    电动: '纯电动',
  }
  return energyTypeMap[energyType] || energyType
}

// 车型类型显示中文
function getCarTypeText(carType: string) {
  const carTypeMap: Record<string, string> = {
    SEDAN: '轿车',
    SUV: 'SUV',
    MPV: 'MPV',
    SPORTS: '跑车',
    HATCHBACK: '两厢车',
    PICKUP: '皮卡',
    sedan: '轿车',
    suv: 'SUV',
    mpv: 'MPV',
    sports: '跑车',
    hatchback: '两厢车',
    pickup: '皮卡',
    轿车: '轿车',
    跑车: '跑车',
    两厢车: '两厢车',
    皮卡: '皮卡',
  }
  return carTypeMap[carType] || carType
}

// 获取车辆详情
function goToVehicleDetail(vehicleId: number) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicleId}`,
  })
}

// 加载日租排行榜
async function loadDailyRanking() {
  try {
    loading.value = true
    const res = await getDailyRanking({ period: 'day', limit: 10 })
    dailyRanking.value = res
  }
  catch (error) {
    console.error('获取日租排行榜失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 加载月租排行榜
async function loadMonthlyRanking() {
  try {
    loading.value = true
    const res = await getMonthlyRanking({ period: 'month', limit: 10 })
    monthlyRanking.value = res
  }
  catch (error) {
    console.error('获取月租排行榜失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 刷新数据
function refreshData() {
  if (activeTab.value === 'daily') {
    loadDailyRanking()
  }
  else {
    loadMonthlyRanking()
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadDailyRanking()
  loadMonthlyRanking()
  // 监听头部组件的刷新事件
  uni.$on('rankingRefresh', refreshData)
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('rankingRefresh', refreshData)
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <RankingHead />

    <!-- 榜单切换栏 -->
    <view class="flex-shrink-0 bg-white px-[24rpx] py-[20rpx]">
      <view class="flex rounded-[16rpx] bg-gray-100 p-[6rpx]">
        <view
          class="flex-1 rounded-[12rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-150"
          :class="activeTab === 'daily' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('daily')"
        >
          日租排行
        </view>
        <view
          class="flex-1 rounded-[12rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-150"
          :class="activeTab === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('monthly')"
        >
          月租排行
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <!-- 日租排行内容 -->
      <view v-if="activeTab === 'daily'" class="p-[20rpx]">
        <!-- 排行榜列表 -->
        <view v-if="dailyRanking" class="space-y-[12rpx]">
          <view
            v-for="vehicle in dailyRanking.rankings.slice(0, 10)"
            :key="vehicle.vehicleId"
            class="bg-white rounded-[16rpx] p-[20rpx] transition-all duration-150 active:scale-[0.98]"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <view class="flex items-center space-x-[16rpx]">
              <!-- 排名 -->
              <view class="w-[44rpx] h-[44rpx] rounded-full flex items-center justify-center flex-shrink-0"
                    :class="getRankStyle(vehicle.rank)">
                <text class="text-[20rpx] font-bold">{{ vehicle.rank }}</text>
              </view>

              <!-- 车辆图片 -->
              <view class="w-[80rpx] h-[60rpx] rounded-[8rpx] overflow-hidden bg-gray-100 flex-shrink-0">
                <image
                  :src="vehicle.imageUrl"
                  class="w-full h-full object-cover"
                  mode="aspectFill"
                  lazy-load
                  :alt="vehicle.name"
                />
              </view>

              <!-- 车辆信息 -->
              <view class="flex-1 min-w-0">
                <view class="mb-[8rpx]">
                  <text class="text-[28rpx] font-semibold text-gray-900">
                    {{ vehicle.name }}
                  </text>
                </view>

                <view class="flex items-center justify-between text-[22rpx]">
                  <text class="text-gray-600 truncate flex-1 mr-[12rpx]">
                    {{ getEnergyTypeText(vehicle.energyType) }} · {{ getCarTypeText(vehicle.carType) }}
                  </text>
                  <view class="flex items-center space-x-[4rpx] flex-shrink-0">
                    <text class="i-material-symbols-star text-[18rpx] text-orange-500" />
                    <text class="text-gray-600">{{ vehicle.rating }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 月租排行内容 -->
      <view v-if="activeTab === 'monthly'" class="p-[20rpx]">
        <!-- 排行榜列表 -->
        <view v-if="monthlyRanking" class="space-y-[12rpx]">
          <view
            v-for="vehicle in monthlyRanking.rankings.slice(0, 10)"
            :key="vehicle.vehicleId"
            class="bg-white rounded-[16rpx] p-[20rpx] transition-all duration-150 active:scale-[0.98]"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <view class="flex items-center space-x-[16rpx]">
              <!-- 排名 -->
              <view class="w-[44rpx] h-[44rpx] rounded-full flex items-center justify-center flex-shrink-0"
                    :class="getRankStyle(vehicle.rank)">
                <text class="text-[20rpx] font-bold">{{ vehicle.rank }}</text>
              </view>

              <!-- 车辆图片 -->
              <view class="w-[80rpx] h-[60rpx] rounded-[8rpx] overflow-hidden bg-gray-100 flex-shrink-0">
                <image
                  :src="vehicle.imageUrl"
                  class="w-full h-full object-cover"
                  mode="aspectFill"
                  lazy-load
                  :alt="vehicle.name"
                />
              </view>

              <!-- 车辆信息 -->
              <view class="flex-1 min-w-0">
                <view class="mb-[8rpx]">
                  <text class="text-[28rpx] font-semibold text-gray-900">
                    {{ vehicle.name }}
                  </text>
                </view>

                <view class="flex items-center justify-between text-[22rpx]">
                  <text class="text-gray-600 truncate flex-1 mr-[12rpx]">
                    {{ getEnergyTypeText(vehicle.energyType) }} · {{ getCarTypeText(vehicle.carType) }}
                  </text>
                  <view class="flex items-center space-x-[4rpx] flex-shrink-0">
                    <text class="i-material-symbols-star text-[18rpx] text-orange-500" />
                    <text class="text-gray-600">{{ vehicle.rating }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-[100rpx]">
        <view class="flex flex-col items-center space-y-[16rpx]">
          <text class="i-material-symbols-sync animate-spin text-[48rpx] text-purple-600" />
          <text class="text-[24rpx] text-gray-500">加载中...</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && activeTab === 'daily' && !dailyRanking?.rankings?.length" class="flex flex-col items-center justify-center py-[120rpx] px-[40rpx]">
        <text class="i-material-symbols-trending-up text-[80rpx] text-gray-300 mb-[20rpx]" />
        <text class="text-[26rpx] text-gray-500 font-medium mb-[8rpx]">暂无排行数据</text>
        <text class="text-[22rpx] text-gray-400 text-center">当前暂无日租车辆排行信息</text>
      </view>

      <view v-if="!loading && activeTab === 'monthly' && !monthlyRanking?.rankings?.length" class="flex flex-col items-center justify-center py-[120rpx] px-[40rpx]">
        <text class="i-material-symbols-calendar-month text-[80rpx] text-gray-300 mb-[20rpx]" />
        <text class="text-[26rpx] text-gray-500 font-medium mb-[8rpx]">暂无排行数据</text>
        <text class="text-[22rpx] text-gray-400 text-center">当前暂无月租车辆排行信息</text>
      </view>
    </scroll-view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
