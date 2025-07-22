<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import { useOwnerStore } from '@/store/owner'

// 使用 owner store
const ownerStore = useOwnerStore()
const { ownerInfo, revenueData, vehicles } = storeToRefs(ownerStore)

// 设置当前页面为首页
ownerStore.setActive('home')

// 示例车辆数据
const vehicleList = ref([
  {
    id: 1,
    name: '特斯拉 Model 3',
    licensePlate: '沪A·12345',
    image: '/static/vite.png',
    status: 'available',
    statusText: '可租用',
    pricePerDay: 299,
    todayOrders: 1,
    monthlyOrders: 12,
    operationType: 'owner',
  },
  {
    id: 2,
    name: '比亚迪汉EV',
    licensePlate: '沪A·67890',
    image: '/static/vite.png',
    status: 'rented',
    statusText: '租用中',
    pricePerDay: 199,
    remainingTime: '2天3小时',
    operationType: 'platform',
  },
  {
    id: 3,
    name: '理想L7',
    licensePlate: '沪A·11111',
    image: '/static/vite.png',
    status: 'maintenance',
    statusText: '维护中',
    pricePerDay: 359,
    todayOrders: 0,
    monthlyOrders: 8,
    operationType: 'owner',
  },
])

// 导航方法
function goToVehicleDetail(vehicleId: number) {
  uni.navigateTo({ url: `/pages/owner/vehicle-detail?id=${vehicleId}` })
}

function goToAddVehicle() {
  uni.navigateTo({ url: '/pages/owner/add-vehicle' })
}

function goToOrders() {
  uni.navigateTo({ url: '/pages/owner/orders' })
}

function goToRevenue() {
  uni.navigateTo({ url: '/pages/owner/revenue' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/owner/settings' })
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap = {
    available: 'text-green-600 bg-green-100',
    rented: 'text-orange-600 bg-orange-100',
    maintenance: 'text-red-600 bg-red-100',
    offline: 'text-gray-600 bg-gray-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}
</script>

<template>
  <view class="relative h-full flex flex-col from-slate-50 via-purple-50/30 to-pink-50/20 bg-gradient-to-br">
    <!-- 头部导航栏 -->
    <HeadBar bg-color="transparent">
      <template #right>
        <text class="i-material-symbols-notifications text-[48rpx] text-gray-800" />
        <text class="text-[24rpx] text-gray-800">
          设置
        </text>
      </template>
    </HeadBar>

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="flex-1 px-[40rpx] pt-[32rpx]">
      <!-- 收益概览卡片 -->
      <view class="mb-[32rpx] border border-white/20 rounded-xl bg-white/70 p-[32rpx] shadow-md backdrop-blur-sm">
        <view class="mb-[24rpx] flex items-center justify-between">
          <text class="text-[32rpx] text-gray-800 font-bold">
            收益概览
          </text>
          <text class="i-material-symbols-trending-up text-[32rpx] text-purple-600" />
        </view>

        <view class="grid grid-cols-3 gap-[24rpx]">
          <view class="text-center">
            <text class="block text-[36rpx] text-purple-600 font-bold">
              ¥{{ revenueData.revenue.today }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              今日收益
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-blue-600 font-bold">
              ¥{{ revenueData.revenue.thisMonth.toLocaleString() }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              本月收益
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-green-600 font-bold">
              ¥{{ revenueData.revenue.total.toLocaleString() }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              累计收益
            </text>
          </view>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="grid grid-cols-2 mb-[32rpx] gap-[24rpx]">
        <view
          class="border border-white/20 rounded-xl bg-white/70 p-[32rpx] text-center shadow-md backdrop-blur-sm"
          @tap="goToOrders"
        >
          <text class="i-material-symbols-assignment mb-[16rpx] block text-[48rpx] text-orange-600" />
          <text class="text-[28rpx] text-gray-800 font-medium">
            订单管理
          </text>
          <text class="text-[24rpx] text-gray-600">
            查看订单状态
          </text>
        </view>

        <view
          class="border border-white/20 rounded-xl bg-white/70 p-[32rpx] text-center shadow-md backdrop-blur-sm"
          @tap="goToRevenue"
        >
          <text class="i-material-symbols-account-balance-wallet mb-[16rpx] block text-[48rpx] text-green-600" />
          <text class="text-[28rpx] text-gray-800 font-medium">
            收益管理
          </text>
          <text class="text-[24rpx] text-gray-600">
            提现与明细
          </text>
        </view>
      </view>

      <!-- 我的车辆 -->
      <view class="mb-[32rpx] border border-white/20 rounded-xl bg-white/70 shadow-md backdrop-blur-sm">
        <view class="flex items-center justify-between p-[32rpx] pb-[24rpx]">
          <view class="flex items-center space-x-[16rpx]">
            <text class="text-[32rpx] text-gray-800 font-bold">
              我的车辆
            </text>
            <text class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[20rpx] text-purple-600">
              {{ vehicleList.length }}辆
            </text>
          </view>
          <view
            class="flex items-center rounded-lg bg-purple-600 px-[24rpx] py-[12rpx] space-x-[8rpx]"
            @tap="goToAddVehicle"
          >
            <text class="i-material-symbols-add text-[24rpx] text-white" />
            <text class="text-[24rpx] text-white font-medium">
              添加
            </text>
          </view>
        </view>

        <view class="px-[32rpx] pb-[32rpx] space-y-[24rpx]">
          <view
            v-for="vehicle in vehicleList"
            :key="vehicle.id"
            class="border border-white/30 rounded-xl bg-white/50 p-[24rpx] backdrop-blur-sm"
            @tap="goToVehicleDetail(vehicle.id)"
          >
            <view class="flex items-start space-x-[24rpx]">
              <!-- 车辆图片 -->
              <view class="h-[120rpx] w-[120rpx] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <image
                  :src="vehicle.image"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>

              <!-- 车辆信息 -->
              <view class="min-w-0 flex-1">
                <view class="mb-[8rpx] flex items-center justify-between">
                  <text class="truncate text-[28rpx] text-gray-800 font-semibold">
                    {{ vehicle.name }}
                  </text>
                  <text
                    class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                    :class="getStatusStyle(vehicle.status)"
                  >
                    {{ vehicle.statusText }}
                  </text>
                </view>

                <text class="mb-[8rpx] block text-[24rpx] text-gray-600">
                  {{ vehicle.licensePlate }}
                </text>

                <view class="flex items-center justify-between">
                  <text class="text-[24rpx] text-purple-600 font-medium">
                    ¥{{ vehicle.pricePerDay }}/天
                  </text>
                  <view class="flex items-center space-x-[8rpx]">
                    <text
                      class="rounded-full px-[12rpx] py-[4rpx] text-[18rpx]"
                      :class="vehicle.operationType === 'owner' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'"
                    >
                      {{ vehicle.operationType === 'owner' ? '自运营' : '平台代运营' }}
                    </text>
                  </view>
                </view>

                <!-- 运营数据 -->
                <view v-if="vehicle.status !== 'rented'" class="mt-[12rpx] flex items-center space-x-[32rpx]">
                  <text class="text-[20rpx] text-gray-500">
                    今日订单: {{ vehicle.todayOrders }}个
                  </text>
                  <text class="text-[20rpx] text-gray-500">
                    本月: {{ vehicle.monthlyOrders }}个
                  </text>
                </view>

                <!-- 租用中剩余时间 -->
                <view v-else class="mt-[12rpx]">
                  <text class="text-[20rpx] text-orange-600">
                    剩余时间: {{ vehicle.remainingTime }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部TabBar占位 -->
      <view class="h-[120rpx]" />
    </scroll-view>
  </view>
</template>
