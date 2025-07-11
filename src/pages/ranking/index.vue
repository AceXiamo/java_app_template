<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { DailyRankingResponse, MonthlyRankingResponse, RankingVehicle } from '@/api/ranking'
import { getDailyRanking, getMonthlyRanking, getFullRanking } from '@/api/ranking'
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

// 获取排行榜角标类型对应的样式
function getRankBadgeStyle(rankBadge: RankingVehicle['rankBadge']) {
  const baseClasses = 'absolute -top-[8rpx] -right-[8rpx] w-[48rpx] h-[48rpx] rounded-full flex items-center justify-center shadow-lg border-2 border-white'
  
  switch (rankBadge.type) {
    case 'champion':
      return `${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600`
    case 'runner_up':
      return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600`
    case 'third_place':
      return `${baseClasses} bg-gradient-to-br from-orange-400 to-orange-600`
    default:
      return `${baseClasses} bg-gray-200`
  }
}

// 获取badge样式
function getBadgeStyle(badge: RankingVehicle['badge']) {
  const colorMap: Record<string, string> = {
    'green': 'text-green-600 bg-green-100',
    'tech-purple': 'text-purple-600 bg-purple-100',
    'blue': 'text-blue-600 bg-blue-100',
    'red': 'text-red-600 bg-red-100',
  }
  
  return colorMap[badge.color] || 'text-gray-600 bg-gray-100'
}

// 获取车辆详情
function goToVehicleDetail(vehicleId: number) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicleId}`,
  })
}

// 查看完整榜单
function viewFullRanking() {
  getFullRanking({
    type: activeTab.value,
    period: activeTab.value === 'daily' ? 'day' : 'month',
  }).then((res) => {
    uni.showModal({
      title: '完整榜单',
      content: `共有 ${res.pagination?.total || 0} 个车型参与排行`,
      showCancel: false,
    })
  }).catch(() => {
    uni.showToast({
      title: '获取失败',
      icon: 'error',
    })
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
    <view class="px-[40rpx] py-[32rpx] bg-white border-b border-gray-100 flex-shrink-0">
      <view class="flex space-x-[8rpx] bg-gray-100 rounded-xl p-[8rpx]">
        <view
          class="flex-1 py-[16rpx] px-[32rpx] rounded-lg text-[28rpx] font-medium transition-all duration-200 text-center cursor-pointer"
          :class="activeTab === 'daily' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('daily')"
        >
          日租排行
        </view>
        <view
          class="flex-1 py-[16rpx] px-[32rpx] rounded-lg text-[28rpx] font-medium transition-all duration-200 text-center cursor-pointer"
          :class="activeTab === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-600'"
          @tap="switchTab('monthly')"
        >
          月租排行
        </view>
      </view>
      <text class="text-center text-[24rpx] text-gray-500 mt-[16rpx] block">
        数据每日更新，按{{ activeTab === 'daily' ? '日' : '月' }}销量排序
      </text>
    </view>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <!-- 日租排行内容 -->
      <view v-if="activeTab === 'daily'" class="p-[32rpx] space-y-[24rpx]">
        <!-- 排行榜头部 -->
        <view class="bg-white rounded-2xl p-[32rpx] border border-gray-200">
          <view class="flex items-center space-x-[16rpx] mb-[16rpx]">
            <text class="i-material-symbols-trending-up text-green-600 text-[40rpx]" />
            <text class="text-black font-semibold text-[32rpx]">
              {{ dailyRanking?.periodText || '本周热门日租车型' }}
            </text>
            <text class="text-green-600 text-[22rpx] bg-green-100 px-[16rpx] py-[8rpx] rounded-full">
              实时更新
            </text>
          </view>
          <text class="text-gray-700 text-[28rpx]">
            数据统计：{{ dailyRanking?.statisticsDate || '加载中...' }}
          </text>
        </view>

        <!-- 前三名详细展示 -->
        <view v-if="dailyRanking" class="space-y-[24rpx]">
          <view
            v-for="(vehicle, index) in dailyRanking.rankings.slice(0, 3)"
            :key="vehicle.vehicleId"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-[40rpx] cursor-pointer relative"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <!-- 排名角标 -->
            <view
              v-if="vehicle.rankBadge.icon"
              :class="getRankBadgeStyle(vehicle.rankBadge)"
            >
              <text
                :class="`i-material-symbols-${vehicle.rankBadge.icon} text-white text-[36rpx]`"
              />
            </view>

            <!-- 车辆图片 -->
            <view class="w-full h-[192rpx] rounded-xl mb-[32rpx] overflow-hidden">
              <image
                :src="vehicle.imageUrl"
                class="w-full h-full object-cover"
                mode="aspectFill"
                :alt="vehicle.name"
              />
            </view>

            <!-- 车辆信息 -->
            <view class="space-y-[24rpx]">
              <view class="flex items-center justify-between">
                <view>
                  <text class="text-black font-semibold text-[36rpx]">{{ vehicle.name }}</text>
                  <text class="text-gray-600 text-[26rpx] block mt-[8rpx]">
                    {{ vehicle.energyType }} · {{ vehicle.carType }}
                  </text>
                </view>
                <view class="text-right">
                  <text class="text-red-500 font-bold text-[40rpx]">¥{{ vehicle.dailyPrice }}</text>
                  <text class="text-gray-500 text-[24rpx] block">日租</text>
                </view>
              </view>

              <view class="flex items-center justify-between py-[16rpx] border-t border-gray-100">
                <view class="flex items-center space-x-[32rpx] text-[28rpx]">
                  <view class="flex items-center space-x-[8rpx] text-red-600">
                    <text class="i-material-symbols-local-fire-department text-[32rpx]" />
                    <text>{{ vehicle.rentalCountText }}</text>
                  </view>
                  <view class="flex items-center space-x-[8rpx] text-orange-500">
                    <text class="i-material-symbols-star text-[32rpx]" />
                    <text>{{ vehicle.rating }}分</text>
                  </view>
                </view>
                <text
                  class="text-[22rpx] px-[24rpx] py-[8rpx] rounded-full font-medium"
                  :class="getBadgeStyle(vehicle.badge)"
                >
                  {{ vehicle.badge.text }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 第4-10名简化展示 -->
        <view v-if="dailyRanking && dailyRanking.rankings.length > 3" class="space-y-[24rpx]">
          <view
            v-for="vehicle in dailyRanking.rankings.slice(3, 10)"
            :key="vehicle.vehicleId"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-[32rpx] cursor-pointer"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <view class="flex items-center space-x-[24rpx]">
              <text class="w-[56rpx] h-[56rpx] bg-gray-200 rounded-full flex items-center justify-center text-[24rpx] font-bold text-gray-600">
                {{ vehicle.rank }}
              </text>
              <view class="w-[112rpx] h-[80rpx] rounded-md flex-shrink-0 overflow-hidden">
                <image
                  :src="vehicle.imageUrl"
                  class="w-full h-full object-cover"
                  mode="aspectFill"
                  :alt="vehicle.name"
                />
              </view>
              <view class="flex-1">
                <view class="flex items-center justify-between">
                  <text class="text-black font-medium text-[30rpx]">{{ vehicle.name }}</text>
                  <text class="text-red-500 font-bold text-[32rpx]">¥{{ vehicle.dailyPrice }}</text>
                </view>
                <view class="flex items-center justify-between text-[24rpx] text-gray-600 mt-[8rpx]">
                  <text>{{ vehicle.rentalCountText }}</text>
                  <text>⭐ {{ vehicle.rating }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 查看更多 -->
          <view class="text-center py-[32rpx]">
            <view
              class="text-purple-600 text-[28rpx] font-medium flex items-center justify-center space-x-[8rpx] cursor-pointer"
              @tap="viewFullRanking"
            >
              <text>查看完整榜单</text>
              <text class="i-material-symbols-keyboard-arrow-down" />
            </view>
          </view>
        </view>
      </view>

      <!-- 月租排行内容 -->
      <view v-if="activeTab === 'monthly'" class="p-[32rpx] space-y-[24rpx]">
        <!-- 排行榜头部 -->
        <view class="bg-white rounded-2xl p-[32rpx] border border-gray-200">
          <view class="flex items-center space-x-[16rpx] mb-[16rpx]">
            <text class="i-material-symbols-calendar-month text-purple-600 text-[40rpx]" />
            <text class="text-black font-semibold text-[32rpx]">
              {{ monthlyRanking?.periodText || '本月热门月租车型' }}
            </text>
            <text class="text-purple-600 text-[22rpx] bg-purple-100 px-[16rpx] py-[8rpx] rounded-full">
              月度统计
            </text>
          </view>
          <text class="text-gray-700 text-[28rpx]">
            数据统计：{{ monthlyRanking?.statisticsDate || '加载中...' }}
          </text>
        </view>

        <!-- 月租前三名 -->
        <view v-if="monthlyRanking" class="space-y-[24rpx]">
          <view
            v-for="vehicle in monthlyRanking.rankings.slice(0, 3)"
            :key="vehicle.vehicleId"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-[40rpx] cursor-pointer relative"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <!-- 排名角标 -->
            <view
              v-if="vehicle.rankBadge.icon"
              :class="getRankBadgeStyle(vehicle.rankBadge)"
            >
              <text
                :class="`i-material-symbols-${vehicle.rankBadge.icon} text-white text-[36rpx]`"
              />
            </view>

            <!-- 车辆图片 -->
            <view class="w-full h-[192rpx] rounded-xl mb-[32rpx] overflow-hidden">
              <image
                :src="vehicle.imageUrl"
                class="w-full h-full object-cover"
                mode="aspectFill"
                :alt="vehicle.name"
              />
            </view>

            <!-- 车辆信息 -->
            <view class="space-y-[24rpx]">
              <view class="flex items-center justify-between">
                <view>
                  <text class="text-black font-semibold text-[36rpx]">{{ vehicle.name }}</text>
                  <text class="text-gray-600 text-[26rpx] block mt-[8rpx]">
                    {{ vehicle.energyType }} · {{ vehicle.carType }}
                  </text>
                </view>
                <view class="text-right">
                  <text class="text-red-500 font-bold text-[40rpx]">¥{{ vehicle.monthlyPrice }}</text>
                  <text class="text-gray-500 text-[24rpx] block">月租</text>
                </view>
              </view>

              <view class="flex items-center justify-between py-[16rpx] border-t border-gray-100">
                <view class="flex items-center space-x-[32rpx] text-[28rpx]">
                  <view class="flex items-center space-x-[8rpx] text-red-600">
                    <text class="i-material-symbols-local-fire-department text-[32rpx]" />
                    <text>{{ vehicle.rentalCountText }}</text>
                  </view>
                  <view class="flex items-center space-x-[8rpx] text-green-600">
                    <text class="i-material-symbols-savings text-[32rpx]" />
                    <text>{{ vehicle.savingsText }}</text>
                  </view>
                </view>
                <text
                  class="text-[22rpx] px-[24rpx] py-[8rpx] rounded-full font-medium"
                  :class="getBadgeStyle(vehicle.badge)"
                >
                  {{ vehicle.badge.text }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 查看更多月租 -->
        <view class="text-center py-[48rpx]">
          <view
            class="text-purple-600 text-[28rpx] font-medium flex items-center justify-center space-x-[8rpx] cursor-pointer"
            @tap="viewFullRanking"
          >
            <text>查看完整月租榜单</text>
            <text class="i-material-symbols-keyboard-arrow-down" />
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-[80rpx]">
        <text class="text-gray-500 text-[28rpx]">加载中...</text>
      </view>
    </view>
  </view>
</template> 

<route lang="yaml">
  layout: home
</route>
