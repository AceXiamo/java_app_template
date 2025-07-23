<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import { useOwnerStore } from '@/store/owner'
import { useUserStore } from '@/store/user'

// 使用 owner store
const ownerStore = useOwnerStore()
const { revenueData, vehicles, loading } = storeToRefs(ownerStore)

// 使用 user store
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// 设置当前页面为首页
ownerStore.setActive('home')

// 车辆列表数据，现在从store获取
const vehicleList = computed(() => vehicles.value)

// 页面加载时获取数据
onMounted(async () => {
  await ownerStore.loadOwnerData()
})

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 刷新数据
async function handleRefresh() {
  await ownerStore.loadOwnerData()
}

// 导航方法
function goToVehicleDetail(vehicleId: number) {
  uni.navigateTo({ url: `/pages/owner/vehicle-detail?id=${vehicleId}` })
}

function goToAddVehicle() {
  uni.navigateTo({ url: '/pages/owner-certification/index' })
}

function goToOrders() {
  ownerStore.setActive('orders')
}

function goToRevenue() {
  ownerStore.setActive('revenue')
}

function _goToSettings() {
  ownerStore.setActive('settings')
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    available: 'text-green-600 bg-green-100',
    rented: 'text-orange-600 bg-orange-100',
    maintenance: 'text-red-600 bg-red-100',
    offline: 'text-gray-600 bg-gray-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6)
    return '凌晨好'

  if (hour < 9)
    return '早安'

  if (hour < 12)
    return '上午好'

  if (hour < 14)
    return '中午好'

  if (hour < 18)
    return '下午好'

  if (hour < 21)
    return '晚上好'

  return '夜深了'
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-[#fafbfc]" style="background-image: url('https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/owner_home_bg.png'); background-size: cover; background-position: center;">
    <!-- 头部导航栏（保持不变） -->
    <HeadBar bg-color="transparent">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-[32rpx] z-10 h-full flex items-center justify-center" @tap="goBack">
          <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-gray-50 transition-colors active:bg-gray-100">
            <text class="i-material-symbols-arrow-back text-[28rpx] text-gray-700" />
          </view>
        </view>
        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          车主中心
        </text>
      </view>
    </HeadBar>

    <!-- 用户信息区 -->
    <view class="flex items-center px-[32rpx] pb-[8rpx] pt-[24rpx] space-x-[20rpx]">
      <image
        :src="user?.avatar || '/static/logo.svg'"
        class="h-[80rpx] w-[80rpx] border border-gray-100 rounded-full bg-gray-200 object-cover"
        mode="aspectFill"
      />
      <view class="min-w-0 flex-1">
        <view class="flex items-center space-x-[12rpx]">
          <text class="truncate text-[28rpx] text-gray-900 font-bold">
            {{ user?.nickname || '车主' }}
          </text>
          <template v-if="user?.certificationStatusText">
            <text class="i-fluent-emoji-check-mark-button ml-[2rpx] align-middle text-[22rpx] text-green-500" />
            <text class="ml-[2rpx] text-[18rpx] text-green-500">
              {{ user.certificationStatusText }}
            </text>
          </template>
          <template v-if="user?.isOwner">
            <text class="ml-[8rpx] rounded bg-purple-50 px-[10rpx] py-[2rpx] text-[18rpx] text-purple-600 font-medium">
              车主
            </text>
          </template>
        </view>
        <text class="mt-[2rpx] block text-[22rpx] text-gray-500">
          {{ getGreeting() }}，欢迎回来！
        </text>
      </view>
    </view>

    <view class="relative h-0 flex flex-1 flex-col">
      <!-- 蒙版层 -->
      <view class="pointer-events-none absolute inset-0 from-transparent via-white/40 to-white bg-gradient-to-b" />

      <!-- 滚动内容区域 -->
      <scroll-view
        scroll-y
        class="h-full w-full"
        refresher-enabled
        :refresher-triggered="loading"
        @refresherrefresh="handleRefresh"
      >
        <view class="content px-[32rpx] pt-[32rpx]">
          <!-- 收益概览卡片 -->
          <view class="mb-[40rpx] border border-white/20 rounded-lg bg-white/80 p-[40rpx] shadow-md backdrop-blur-md">
            <!-- 标题区 -->
            <view class="mb-[32rpx] flex items-start justify-between">
              <view>
                <view class="mb-[4rpx] flex items-center space-x-[8rpx]">
                  <text class="i-material-symbols-trending-up text-[28rpx] text-purple-600" />
                  <text class="text-[32rpx] text-gray-900 font-bold">
                    收益概览
                  </text>
                </view>
                <text class="text-[20rpx] text-gray-500">
                  收益数据实时更新
                </text>
              </view>
            </view>

            <!-- 数据区 -->
            <view class="flex justify-between">
              <!-- 今日收益 - 主要突出 -->
              <view class="flex-1 text-center">
                <view class="mb-[8rpx]">
                  <text class="text-[42rpx] text-purple-600 font-bold">
                    {{ revenueData.revenue.today }}
                  </text>
                  <text class="ml-[4rpx] text-[20rpx] text-gray-400">
                    元
                  </text>
                </view>
                <text class="mb-[6rpx] block text-[22rpx] text-gray-600">
                  今日收益
                </text>
                <view class="flex items-center justify-center space-x-[4rpx]">
                  <text class="i-material-symbols-trending-up text-[16rpx] text-green-500" />
                  <text class="text-[18rpx] text-green-500 font-medium">
                    +12.5%
                  </text>
                </view>
              </view>

              <!-- 分隔线 -->
              <view class="mx-[24rpx] w-[1px] bg-gray-200" />

              <!-- 本月收益 -->
              <view class="flex-1 text-center">
                <view class="mb-[8rpx]">
                  <text class="text-[36rpx] text-gray-800 font-bold">
                    {{ revenueData.revenue.thisMonth.toLocaleString() }}
                  </text>
                  <text class="ml-[4rpx] text-[18rpx] text-gray-400">
                    元
                  </text>
                </view>
                <text class="mb-[6rpx] block text-[22rpx] text-gray-600">
                  本月收益
                </text>
                <view class="flex items-center justify-center space-x-[4rpx]">
                  <text class="i-material-symbols-trending-up text-[16rpx] text-green-500" />
                  <text class="text-[18rpx] text-green-500 font-medium">
                    +8.3%
                  </text>
                </view>
              </view>

              <!-- 分隔线 -->
              <view class="mx-[24rpx] w-[1px] bg-gray-200" />

              <!-- 累计收益 -->
              <view class="flex-1 text-center">
                <view class="mb-[8rpx]">
                  <text class="text-[36rpx] text-gray-800 font-bold">
                    {{ revenueData.revenue.total.toLocaleString() }}
                  </text>
                  <text class="ml-[4rpx] text-[18rpx] text-gray-400">
                    元
                  </text>
                </view>
                <text class="mb-[6rpx] block text-[22rpx] text-gray-600">
                  累计收益
                </text>
                <view class="flex items-center justify-center space-x-[4rpx]">
                  <text class="i-material-symbols-trending-up text-[16rpx] text-green-500" />
                  <text class="text-[18rpx] text-green-500 font-medium">
                    总览
                  </text>
                </view>
              </view>
            </view>
          </view>

          <!-- 快捷操作 -->
          <view class="grid grid-cols-2 mb-[40rpx] gap-[32rpx]">
            <view
              class="relative min-h-[120rpx] flex flex-col items-start justify-start overflow-hidden border border-white/20 rounded-lg bg-white/90 p-[24rpx] shadow-sm backdrop-blur-sm transition-all duration-200 active:scale-95 active:bg-white/95"
              style="background-image: url('https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/order_card_bg.png'); background-size: cover; background-position: center;"
              @tap="goToOrders"
            >
              <!-- 内容区域，左对齐 -->
              <view class="relative z-10 flex flex-col items-start">
                <text class="i-fluent-emoji-clipboard mb-[8rpx] text-[36rpx] text-purple-600" />
                <text class="mb-[2rpx] block text-[26rpx] text-gray-900 font-bold">
                  订单管理
                </text>
                <text class="text-[20rpx] text-gray-600">
                  查看订单状态
                </text>
              </view>
            </view>
            <view
              class="relative min-h-[120rpx] flex flex-col items-start justify-start overflow-hidden border border-white/20 rounded-lg bg-white/90 p-[24rpx] shadow-sm backdrop-blur-sm transition-all duration-200 active:scale-95 active:bg-white/95"
              style="background-image: url('https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/profit_card_bg.png'); background-size: cover; background-position: center;"
              @tap="goToRevenue"
            >
              <!-- 内容区域，左对齐 -->
              <view class="relative z-10 flex flex-col items-start">
                <text class="i-fluent-emoji-money-with-wings mb-[8rpx] text-[36rpx] text-purple-600" />
                <text class="mb-[2rpx] block text-[26rpx] text-gray-900 font-bold">
                  收益管理
                </text>
                <text class="text-[20rpx] text-gray-600">
                  提现与明细
                </text>
              </view>
            </view>
          </view>

          <!-- 我的车辆 -->
          <view class="mb-[40rpx] border border-white/20 rounded-lg bg-white/90 shadow-md backdrop-blur-sm">
            <view class="flex items-center justify-between p-[32rpx] pb-[20rpx]">
              <view class="flex items-center space-x-[12rpx]">
                <text class="text-[32rpx] text-gray-900 font-bold">
                  我的车辆
                </text>
                <text class="rounded-full bg-purple-50/80 px-[16rpx] py-[6rpx] text-[20rpx] text-purple-600 shadow-sm backdrop-blur-sm">
                  {{ vehicleList.length }}辆
                </text>
              </view>
              <view
                class="flex items-center px-[16rpx] py-[8rpx] transition-all duration-200 active:scale-95 space-x-[6rpx] active:opacity-70"
                @tap="goToAddVehicle"
              >
                <text class="i-material-symbols-add-circle-outline text-[22rpx] text-gray-600" />
                <text class="text-[22rpx] text-gray-700 font-medium">
                  添加车辆
                </text>
              </view>
            </view>
            <view class="px-[32rpx] pb-[32rpx] space-y-[24rpx]">
              <template v-if="vehicleList.length > 0">
                <view
                  v-for="vehicle in vehicleList"
                  :key="vehicle.vehicleId"
                  class="border border-gray-100/50 py-[24rpx] backdrop-blur-sm"
                  @tap="goToVehicleDetail(vehicle.vehicleId)"
                >
                  <view class="flex items-start space-x-[20rpx]">
                    <!-- 车辆图片 -->
                    <view class="relative h-[100rpx] w-[100rpx] flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 shadow-md">
                      <image
                        :src="vehicle.imageUrl"
                        class="h-full w-full object-cover"
                        mode="aspectFill"
                      />
                      <!-- 能源类型角标 -->
                      <view
                        class="absolute left-[4rpx] top-[4rpx] rounded px-[6rpx] py-[2rpx] text-[14rpx] text-white font-medium"
                        :class="{
                          'bg-green-500': vehicle.energyType === '电动',
                          'bg-blue-500': vehicle.energyType === '混动',
                          'bg-gray-500': vehicle.energyType === '汽油',
                        }"
                      >
                        {{ vehicle.energyType }}
                      </view>
                    </view>
                    <!-- 车辆信息 -->
                    <view class="min-w-0 flex-1">
                      <view class="mb-[6rpx] flex items-center justify-between">
                        <view class="min-w-0 flex flex-1 items-center space-x-[8rpx]">
                          <text class="truncate text-[26rpx] text-gray-900 font-semibold">
                            {{ vehicle.brand }} {{ vehicle.model }}
                          </text>
                          <!-- 座位数 -->
                          <text class="shrink-0 text-[18rpx] text-gray-400">
                            {{ vehicle.seats }}座
                          </text>
                        </view>
                        <text
                          class="shrink-0 rounded-full px-[14rpx] py-[4rpx] text-[18rpx] font-medium shadow-sm"
                          :class="getStatusStyle(vehicle.status)"
                        >
                          {{ vehicle.statusText }}
                        </text>
                      </view>
                      <!-- 车牌号和评分 -->
                      <view class="mb-[6rpx] flex items-center justify-between">
                        <text class="text-[22rpx] text-gray-500">
                          {{ vehicle.licensePlate }}
                        </text>
                        <view class="flex items-center space-x-[4rpx]">
                          <text class="i-fluent-emoji-star text-[16rpx] text-yellow-500" />
                          <text class="text-[18rpx] text-gray-600 font-medium">
                            {{ vehicle.rating }}
                          </text>
                          <text class="text-[16rpx] text-gray-400">
                            ({{ vehicle.ratingCount }})
                          </text>
                        </view>
                      </view>
                      <!-- 价格和运营类型 -->
                      <view class="flex items-center justify-between">
                        <view class="flex items-center space-x-[12rpx]">
                          <text class="text-[22rpx] text-purple-600 font-medium">
                            ¥{{ vehicle.dailyPrice }}/天
                          </text>
                          <text v-if="vehicle.isMonthlyRental" class="text-[18rpx] text-gray-400">
                            月租¥{{ vehicle.monthlyPrice }}
                          </text>
                        </view>
                        <view class="flex items-center space-x-[8rpx]">
                          <!-- 送车服务标识 -->
                          <text v-if="vehicle.deliveryEnabled" class="i-fluent-emoji-delivery-truck text-[16rpx] text-green-500" />
                          <text
                            class="rounded-full px-[10rpx] py-[2rpx] text-[16rpx] shadow-sm"
                            :class="vehicle.operationType === 'owner' ? 'bg-blue-50/80 text-blue-600' : 'bg-green-50/80 text-green-600'"
                          >
                            {{ vehicle.operationTypeText }}
                          </text>
                        </view>
                      </view>
                      <!-- 运营数据或续航信息 -->
                      <view class="mt-[8rpx]">
                        <template v-if="vehicle.status !== 'rented'">
                          <view class="flex items-center justify-between">
                            <view class="flex items-center space-x-[24rpx]">
                              <text class="text-[18rpx] text-gray-400">
                                今日: {{ vehicle.todayOrders }}单
                              </text>
                              <text class="text-[18rpx] text-gray-400">
                                本月: {{ vehicle.monthlyOrders }}单
                              </text>
                            </view>
                            <text v-if="vehicle.rangeKm" class="text-[18rpx] text-gray-400">
                              续航{{ vehicle.rangeKm }}km
                            </text>
                          </view>
                        </template>
                        <template v-else>
                          <text class="text-[18rpx] text-orange-600">
                            剩余时间: {{ vehicle.remainingTime }}
                          </text>
                        </template>
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              <template v-else>
                <view class="flex flex-col items-center justify-center py-[60rpx]">
                  <text class="i-fluent-emoji-oncoming-automobile mb-[16rpx] text-[64rpx] text-gray-300" />
                  <text class="mb-[8rpx] text-[24rpx] text-gray-400">
                    暂无车辆
                  </text>
                  <text class="text-[20rpx] text-gray-400">
                    点击右上角"添加"按钮，录入您的第一辆车吧！
                  </text>
                </view>
              </template>
            </view>
          </view>

          <!-- 占位 -->
          <view class="h-[1rpx]" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>
