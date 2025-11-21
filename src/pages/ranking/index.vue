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
  <view class="relative h-full flex flex-col overflow-hidden bg-[#F6F7FB]">
    <!-- 头部导航 -->
    <RankingHead />

    <!-- 榜单切换栏 - 优化版 -->
    <view class="flex-shrink-0 bg-white/95 px-[40rpx] pb-[20rpx] pt-[16rpx] backdrop-blur-sm">
      <view class="flex rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-[4rpx]">
        <view
          class="relative flex-1 rounded-full py-[14rpx] text-center text-[26rpx] font-semibold transition-all duration-200 active:scale-98"
          :class="activeTab === 'daily' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_4rpx_12rpx_-2rpx_rgba(139,92,246,0.3)]' : 'text-[#6B7280]'"
          @tap="switchTab('daily')"
        >
          <text v-if="activeTab === 'daily'" class="i-lets-icons:trophy-light mr-[6rpx] text-[24rpx]" />
          日租排行
        </view>
        <view
          class="relative flex-1 rounded-full py-[14rpx] text-center text-[26rpx] font-semibold transition-all duration-200 active:scale-98"
          :class="activeTab === 'monthly' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_4rpx_12rpx_-2rpx_rgba(139,92,246,0.3)]' : 'text-[#6B7280]'"
          @tap="switchTab('monthly')"
        >
          <text v-if="activeTab === 'monthly'" class="i-lets-icons:calendar-duotone mr-[6rpx] text-[24rpx]" />
          月租排行
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <!-- 日租排行内容 -->
      <view v-if="activeTab === 'daily'" class="px-[40rpx] py-[24rpx]">
        <!-- 榜单说明卡片 -->
        <view class="mb-[24rpx] overflow-hidden rounded-[28rpx] border border-white/50 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] from-opacity-5 to-opacity-5 p-[24rpx]">
          <view class="mb-[16rpx] flex items-center">
            <view class="flex h-[40rpx] w-[40rpx] items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]">
              <text class="i-lets-icons:trophy-light text-[20rpx] text-[#8B5CF6]" />
            </view>
            <text class="ml-[12rpx] text-[26rpx] font-bold text-[#1F2937]">
              日租热门榜单
            </text>
            <view class="ml-auto flex items-center rounded-full bg-white/80 px-[12rpx] py-[4rpx]">
              <text class="i-lets-icons:clock-duotone mr-[4rpx] text-[16rpx] text-[#8B5CF6]" />
              <text class="text-[18rpx] text-[#6B7280]">
                实时更新
              </text>
            </view>
          </view>
          <view class="flex items-start">
            <text class="i-lets-icons:info-duotone mr-[8rpx] mt-[2rpx] text-[20rpx] text-[#8B5CF6]" />
            <text class="flex-1 text-[20rpx] text-[#6B7280] leading-relaxed">
              基于用户租用次数、评分等综合数据排序，每日动态更新
            </text>
          </view>
        </view>

        <!-- 排行榜列表 - 优化版 -->
        <view v-if="dailyRanking" class="space-y-[16rpx]">
          <view
            v-for="vehicle in dailyRanking.rankings.slice(0, 10)"
            :key="vehicle.vehicleId"
            class="relative overflow-hidden rounded-[24rpx] border border-white/50 bg-white p-[20rpx] shadow-[0_8rpx_24rpx_-8rpx_rgba(15,23,42,0.15)] transition-all duration-200 active:scale-98"
            :class="vehicle.rank <= 3 ? 'ring-2 ring-offset-2' : ''"
            :style="vehicle.rank === 1 ? 'ring-color: #F59E0B' : vehicle.rank === 2 ? 'ring-color: #9CA3AF' : vehicle.rank === 3 ? 'ring-color: #F97316' : ''"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <!-- 前三名装饰角标 -->
            <view v-if="vehicle.rank <= 3" class="absolute right-[-20rpx] top-[-20rpx] h-[80rpx] w-[80rpx] rotate-45 opacity-5" :class="vehicle.rank === 1 ? 'bg-[#F59E0B]' : vehicle.rank === 2 ? 'bg-[#9CA3AF]' : 'bg-[#F97316]'" />

            <view class="relative z-10 flex items-center">
              <!-- 排名徽章 - 增强版 -->
              <view class="relative mr-[16rpx] flex-shrink-0">
                <view
                  class="flex h-[56rpx] w-[56rpx] items-center justify-center rounded-full shadow-sm"
                  :class="vehicle.rank === 1 ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B]' : vehicle.rank === 2 ? 'bg-gradient-to-br from-[#E5E7EB] to-[#9CA3AF]' : vehicle.rank === 3 ? 'bg-gradient-to-br from-[#FDBA74] to-[#F97316]' : 'bg-[#EDE9FE]'"
                >
                  <text v-if="vehicle.rank <= 3" class="i-lets-icons:crown-duotone text-[24rpx]" :class="vehicle.rank <= 3 ? 'text-white' : 'text-[#8B5CF6]'" />
                  <text v-else class="text-[22rpx] font-bold text-[#8B5CF6]">
                    {{ vehicle.rank }}
                  </text>
                </view>
                <!-- 排名数字（前三名） -->
                <view v-if="vehicle.rank <= 3" class="absolute bottom-[-4rpx] right-[-4rpx] flex h-[24rpx] w-[24rpx] items-center justify-center rounded-full bg-white shadow-sm">
                  <text class="text-[16rpx] font-bold" :class="vehicle.rank === 1 ? 'text-[#F59E0B]' : vehicle.rank === 2 ? 'text-[#6B7280]' : 'text-[#F97316]'">
                    {{ vehicle.rank }}
                  </text>
                </view>
              </view>

              <!-- 车辆图片 - 优化版 -->
              <view class="mr-[16rpx] h-[80rpx] w-[100rpx] flex-shrink-0 overflow-hidden rounded-[16rpx] border border-[#F3F4F6] bg-[#FAFAFA] shadow-sm">
                <image
                  :src="vehicle.imageUrl"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                  lazy-load
                  :alt="vehicle.name"
                />
              </view>

              <!-- 车辆信息 - 优化版 -->
              <view class="min-w-0 flex-1">
                <view class="mb-[8rpx] flex items-center">
                  <text class="flex-1 truncate text-[26rpx] font-bold text-[#1F2937]">
                    {{ vehicle.name }}
                  </text>
                </view>

                <view class="mb-[6rpx] flex items-center text-[20rpx]">
                  <view class="flex items-center rounded-full bg-[#F3F4F6] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:bolt-duotone mr-[4rpx] text-[16rpx] text-[#10B981]" />
                    <text class="text-[#6B7280]">
                      {{ getEnergyTypeText(vehicle.energyType) }}
                    </text>
                  </view>
                  <text class="mx-[8rpx] text-[#D1D5DB]">·</text>
                  <view class="flex items-center rounded-full bg-[#F3F4F6] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:car-duotone mr-[4rpx] text-[16rpx] text-[#8B5CF6]" />
                    <text class="text-[#6B7280]">
                      {{ getCarTypeText(vehicle.carType) }}
                    </text>
                  </view>
                </view>

                <view class="flex items-center">
                  <view class="flex items-center rounded-full bg-[#FEF3C7] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:star-duotone mr-[4rpx] text-[16rpx] text-[#F59E0B]" />
                    <text class="text-[20rpx] font-semibold text-[#F59E0B]">
                      {{ vehicle.rating }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 月租排行内容 -->
      <view v-if="activeTab === 'monthly'" class="px-[40rpx] py-[24rpx]">
        <!-- 榜单说明卡片 -->
        <view class="mb-[24rpx] overflow-hidden rounded-[28rpx] border border-white/50 bg-gradient-to-br from-[#10B981] to-[#34D399] from-opacity-5 to-opacity-5 p-[24rpx]">
          <view class="mb-[16rpx] flex items-center">
            <view class="flex h-[40rpx] w-[40rpx] items-center justify-center rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399]">
              <text class="i-lets-icons:calendar-duotone text-[20rpx] text-[#10B981]" />
            </view>
            <text class="ml-[12rpx] text-[26rpx] font-bold text-[#1F2937]">
              月租热门榜单
            </text>
            <view class="ml-auto flex items-center rounded-full bg-white/80 px-[12rpx] py-[4rpx]">
              <text class="i-lets-icons:clock-duotone mr-[4rpx] text-[16rpx] text-[#10B981]" />
              <text class="text-[18rpx] text-[#6B7280]">
                每月更新
              </text>
            </view>
          </view>
          <view class="flex items-start">
            <text class="i-lets-icons:info-duotone mr-[8rpx] mt-[2rpx] text-[20rpx] text-[#10B981]" />
            <text class="flex-1 text-[20rpx] text-[#6B7280] leading-relaxed">
              基于用户租用时长、满意度等综合数据排序，每月定期更新
            </text>
          </view>
        </view>

        <!-- 排行榜列表 - 优化版 -->
        <view v-if="monthlyRanking" class="space-y-[16rpx]">
          <view
            v-for="vehicle in monthlyRanking.rankings.slice(0, 10)"
            :key="vehicle.vehicleId"
            class="relative overflow-hidden rounded-[24rpx] border border-white/50 bg-white p-[20rpx] shadow-[0_8rpx_24rpx_-8rpx_rgba(15,23,42,0.15)] transition-all duration-200 active:scale-98"
            :class="vehicle.rank <= 3 ? 'ring-2 ring-offset-2' : ''"
            :style="vehicle.rank === 1 ? 'ring-color: #F59E0B' : vehicle.rank === 2 ? 'ring-color: #9CA3AF' : vehicle.rank === 3 ? 'ring-color: #F97316' : ''"
            @tap="goToVehicleDetail(vehicle.vehicleId)"
          >
            <!-- 前三名装饰角标 -->
            <view v-if="vehicle.rank <= 3" class="absolute right-[-20rpx] top-[-20rpx] h-[80rpx] w-[80rpx] rotate-45 opacity-5" :class="vehicle.rank === 1 ? 'bg-[#F59E0B]' : vehicle.rank === 2 ? 'bg-[#9CA3AF]' : 'bg-[#F97316]'" />

            <view class="relative z-10 flex items-center">
              <!-- 排名徽章 - 增强版 -->
              <view class="relative mr-[16rpx] flex-shrink-0">
                <view
                  class="flex h-[56rpx] w-[56rpx] items-center justify-center rounded-full shadow-sm"
                  :class="vehicle.rank === 1 ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B]' : vehicle.rank === 2 ? 'bg-gradient-to-br from-[#E5E7EB] to-[#9CA3AF]' : vehicle.rank === 3 ? 'bg-gradient-to-br from-[#FDBA74] to-[#F97316]' : 'bg-[#EDE9FE]'"
                >
                  <text v-if="vehicle.rank <= 3" class="i-lets-icons:crown-duotone text-[24rpx]" :class="vehicle.rank <= 3 ? 'text-white' : 'text-[#8B5CF6]'" />
                  <text v-else class="text-[22rpx] font-bold text-[#8B5CF6]">
                    {{ vehicle.rank }}
                  </text>
                </view>
                <!-- 排名数字（前三名） -->
                <view v-if="vehicle.rank <= 3" class="absolute bottom-[-4rpx] right-[-4rpx] flex h-[24rpx] w-[24rpx] items-center justify-center rounded-full bg-white shadow-sm">
                  <text class="text-[16rpx] font-bold" :class="vehicle.rank === 1 ? 'text-[#F59E0B]' : vehicle.rank === 2 ? 'text-[#6B7280]' : 'text-[#F97316]'">
                    {{ vehicle.rank }}
                  </text>
                </view>
              </view>

              <!-- 车辆图片 - 优化版 -->
              <view class="mr-[16rpx] h-[80rpx] w-[100rpx] flex-shrink-0 overflow-hidden rounded-[16rpx] border border-[#F3F4F6] bg-[#FAFAFA] shadow-sm">
                <image
                  :src="vehicle.imageUrl"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                  lazy-load
                  :alt="vehicle.name"
                />
              </view>

              <!-- 车辆信息 - 优化版 -->
              <view class="min-w-0 flex-1">
                <view class="mb-[8rpx] flex items-center">
                  <text class="flex-1 truncate text-[26rpx] font-bold text-[#1F2937]">
                    {{ vehicle.name }}
                  </text>
                </view>

                <view class="mb-[6rpx] flex items-center text-[20rpx]">
                  <view class="flex items-center rounded-full bg-[#F3F4F6] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:bolt-duotone mr-[4rpx] text-[16rpx] text-[#10B981]" />
                    <text class="text-[#6B7280]">
                      {{ getEnergyTypeText(vehicle.energyType) }}
                    </text>
                  </view>
                  <text class="mx-[8rpx] text-[#D1D5DB]">·</text>
                  <view class="flex items-center rounded-full bg-[#F3F4F6] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:car-duotone mr-[4rpx] text-[16rpx] text-[#8B5CF6]" />
                    <text class="text-[#6B7280]">
                      {{ getCarTypeText(vehicle.carType) }}
                    </text>
                  </view>
                </view>

                <view class="flex items-center">
                  <view class="flex items-center rounded-full bg-[#FEF3C7] px-[10rpx] py-[3rpx]">
                    <text class="i-lets-icons:star-duotone mr-[4rpx] text-[16rpx] text-[#F59E0B]" />
                    <text class="text-[20rpx] font-semibold text-[#F59E0B]">
                      {{ vehicle.rating }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 - 优化版 -->
      <view v-if="loading" class="flex items-center justify-center py-[120rpx]">
        <view class="flex flex-col items-center">
          <view class="mb-[24rpx] flex h-[80rpx] w-[80rpx] items-center justify-center rounded-full bg-[#EDE9FE]">
            <text class="i-lets-icons:ring-duotone animate-spin text-[40rpx] text-[#8B5CF6]" />
          </view>
          <text class="text-[24rpx] text-[#6B7280] font-medium">
            加载中...
          </text>
        </view>
      </view>

      <!-- 空状态 - 优化版 -->
      <view v-if="!loading && activeTab === 'daily' && !dailyRanking?.rankings?.length" class="flex flex-col items-center justify-center px-[40rpx] py-[140rpx]">
        <view class="mb-[28rpx] flex h-[120rpx] w-[120rpx] items-center justify-center rounded-full bg-[#F9FAFB]">
          <text class="i-lets-icons:chart-up-duotone text-[64rpx] text-[#D1D5DB]" />
        </view>
        <text class="mb-[8rpx] text-[28rpx] text-[#1F2937] font-bold">
          暂无排行数据
        </text>
        <text class="text-center text-[22rpx] text-[#9CA3AF] leading-relaxed">
          当前暂无日租车辆排行信息
        </text>
      </view>

      <view v-if="!loading && activeTab === 'monthly' && !monthlyRanking?.rankings?.length" class="flex flex-col items-center justify-center px-[40rpx] py-[140rpx]">
        <view class="mb-[28rpx] flex h-[120rpx] w-[120rpx] items-center justify-center rounded-full bg-[#F9FAFB]">
          <text class="i-lets-icons:calendar-duotone text-[64rpx] text-[#D1D5DB]" />
        </view>
        <text class="mb-[8rpx] text-[28rpx] text-[#1F2937] font-bold">
          暂无排行数据
        </text>
        <text class="text-center text-[22rpx] text-[#9CA3AF] leading-relaxed">
          当前暂无月租车辆排行信息
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
