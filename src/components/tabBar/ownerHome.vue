<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { useOwnerStore } from '@/store/owner'
import { useUserStore } from '@/store/user'
import { completeVehicleMaintenance, updateVehicleStatus } from '@/api/vehicle'

// 使用 owner store
const ownerStore = useOwnerStore()
const { revenueData, vehicles, loading, isDataLoaded } = storeToRefs(ownerStore)

// 使用 user store
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// 设置当前页面为首页
ownerStore.setActive('home')

// 车辆列表数据，现在从store获取
const vehicleList = computed(() => vehicles.value)

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 刷新数据（强制刷新）
async function handleRefresh() {
  // 使用专门的刷新方法，强制重新获取数据
  await ownerStore.refreshRevenueData()
}

// 导航方法（暂时不使用，但保留以备后续可能需要）
// function goToVehicleDetail(vehicleId: number) {
//   uni.navigateTo({ url: `/pages/owner/vehicle-detail?id=${vehicleId}` })
// }

function goToAddVehicle() {
  uni.navigateTo({ url: '/pages/owner-certification/index' })
}

function goToOrders() {
  ownerStore.setActive('orders')
}

function goToRevenue() {
  ownerStore.setActive('revenue')
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

// 检查用户是否为平台管理人员
function isPlatformManager() {
  return user.value?.userRole === 'platform_manager'
}

// 获取用户角色显示文本
function getUserRoleText() {
  if (isPlatformManager()) {
    return '平台管理员'
  }
  return '车主'
}

// 获取页面标题
function getPageTitle() {
  if (isPlatformManager()) {
    return '平台管理中心'
  }
  return '车主中心'
}

// 获取欢迎词
function getWelcomeMessage() {
  if (isPlatformManager()) {
    return `${getGreeting()}，欢迎使用平台管理系统！`
  }
  return `${getGreeting()}，欢迎回来！`
}

// 获取车辆列表标题
function getVehicleListTitle() {
  if (isPlatformManager()) {
    return '平台车辆'
  }
  return '我的车辆'
}

// 获取添加车辆按钮文本
function getAddVehicleText() {
  if (isPlatformManager()) {
    return '管理车辆'
  }
  return '添加车辆'
}

// 处理添加车辆点击事件
function handleAddVehicle() {
  if (isPlatformManager()) {
    // 平台管理员点击后可以跳转到车辆管理页面
    // 暂时保持和车主一样的逻辑，后续可以调整
    goToAddVehicle()
  }
  else {
    goToAddVehicle()
  }
}

// 获取空状态提示文本
function getEmptyVehicleText() {
  if (isPlatformManager()) {
    return {
      title: '暂无平台车辆',
      description: '当前平台还没有运营车辆',
    }
  }
  return {
    title: '暂无车辆',
    description: '点击右上角"添加"按钮，录入您的第一辆车吧！',
  }
}

// 获取车辆运营类型显示文本（根据用户角色）
function getVehicleOperationTypeText(vehicle: any) {
  if (isPlatformManager()) {
    // 平台管理员视角：平台运营的车辆显示为"平台自营"
    if (vehicle.operationType === 'platform') {
      return '平台自营'
    }
    else {
      return '车主代运营'
    }
  }
  else {
    // 车主视角：使用原有的显示逻辑
    return vehicle.operationTypeText || (vehicle.operationType === 'owner' ? '车主自运营' : '平台代运营')
  }
}

// 状态管理相关
const statusDrawerVisible = ref(false)
const currentVehicle = ref<any>(null)

// 状态选项定义
const statusOptions = computed(() => [
  {
    value: 'available',
    label: '可租用',
    colorClass: 'bg-green-500',
    description: '车辆可正常租用',
  },
  {
    value: 'maintenance',
    label: '维护中',
    colorClass: 'bg-red-500',
    description: '车辆正在维护',
  },
  {
    value: 'offline',
    label: '下线',
    colorClass: 'bg-gray-500',
    description: '车辆暂停服务',
  },
])

// 获取可用的状态选项（排除当前状态）
const availableStatusOptions = computed(() => {
  if (!currentVehicle.value)
    return statusOptions.value
  return statusOptions.value.filter(option => option.value !== currentVehicle.value.status)
})

// 打开状态变更抽屉
function openStatusDrawer(vehicle: any) {
  currentVehicle.value = vehicle
  statusDrawerVisible.value = true
}

// 快捷状态变更（不需要打开抽屉）
async function handleQuickStatusChange(vehicle: any, status: string) {
  currentVehicle.value = vehicle
  await changeVehicleStatus(status)
}

// 变更车辆状态
async function changeVehicleStatus(status: string) {
  if (!currentVehicle.value)
    return

  try {
    // 显示加载状态
    uni.showLoading({
      title: '变更中...',
    })

    // 调用对应的API
    if (status === 'available' && currentVehicle.value.status === 'maintenance') {
      // 如果是从维护中变为可用，调用完成维护接口
      await completeVehicleMaintenance(currentVehicle.value.vehicleId)
    }
    else {
      // 其他状态变更调用通用状态更新接口
      await updateVehicleStatus(currentVehicle.value.vehicleId, status)
    }

    uni.hideLoading()
    uni.showToast({
      title: '状态变更成功',
      icon: 'success',
    })

    statusDrawerVisible.value = false
    // 刷新数据
    await handleRefresh()
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '状态变更失败',
      icon: 'error',
    })
    console.error('状态变更失败:', error)
  }
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
            <text class="i-material-symbols:arrow-back-ios text-[28rpx] text-gray-700" />
          </view>
        </view>
        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          {{ getPageTitle() }}
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
            {{ user?.nickname || getUserRoleText() }}
          </text>
          <!-- 角色徽章 -->
          <text
            class="ml-[8rpx] rounded px-[10rpx] py-[2rpx] text-[18rpx] font-medium"
            :class="isPlatformManager() ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
          >
            {{ getUserRoleText() }}
          </text>
        </view>
        <text class="mt-[2rpx] block text-[22rpx] text-gray-500">
          {{ getWelcomeMessage() }}
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
          <view class="mb-[40rpx] border border-white/20 rounded-lg bg-white/80 p-[40rpx] shadow-md backdrop-blur-md" :class="{ 'opacity-50': loading && !isDataLoaded }">
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
                  {{ getVehicleListTitle() }}
                </text>
                <text class="rounded-full bg-purple-50/80 px-[16rpx] py-[6rpx] text-[20rpx] text-purple-600 shadow-sm backdrop-blur-sm">
                  {{ vehicleList.length }}辆
                </text>
              </view>
              <view
                class="flex items-center px-[16rpx] py-[8rpx] transition-all duration-200 active:scale-95 space-x-[6rpx] active:opacity-70"
                @tap="handleAddVehicle"
              >
                <text class="i-material-symbols-add-circle-outline text-[22rpx] text-gray-600" />
                <text class="text-[22rpx] text-gray-700 font-medium">
                  {{ getAddVehicleText() }}
                </text>
              </view>
            </view>
            <view class="px-[32rpx] pb-[32rpx] space-y-[24rpx]">
              <template v-if="vehicleList.length > 0">
                <view
                  v-for="vehicle in vehicleList"
                  :key="vehicle.vehicleId"
                  class="border border-gray-100/50 py-[24rpx] backdrop-blur-sm active:bg-gray-50/50"
                  @longpress="openStatusDrawer(vehicle)"
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
                            {{ getVehicleOperationTypeText(vehicle) }}
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

                      <!-- 快捷操作按钮 -->
                      <view class="mt-[12rpx] flex items-center justify-end space-x-[8rpx]">
                        <!-- 左侧：状态相关快捷按钮 -->
                        <view class="flex items-center space-x-[8rpx]">
                          <button
                            v-if="vehicle.status === 'maintenance'"
                            class="rounded-full bg-green-500/80 backdrop-blur-sm border border-green-300/30 px-[16rpx] py-[6rpx] text-[18rpx] text-white shadow-sm transition-all duration-200 active:bg-green-500/90 active:scale-95"
                            @tap.stop="handleQuickStatusChange(vehicle, 'available')"
                          >
                            <text class="i-material-symbols-build text-[16rpx] mr-[4rpx]" />
                            完成维护
                          </button>
                          <button
                            v-else-if="vehicle.status === 'available'"
                            class="rounded-full bg-orange-500/80 backdrop-blur-sm border border-orange-300/30 px-[16rpx] py-[6rpx] text-[18rpx] text-white shadow-sm transition-all duration-200 active:bg-orange-500/90 active:scale-95"
                            @tap.stop="handleQuickStatusChange(vehicle, 'maintenance')"
                          >
                            <text class="i-material-symbols-build text-[16rpx] mr-[4rpx]" />
                            设为维护
                          </button>
                        </view>

                        <!-- 右侧：状态管理按钮 -->
                        <button
                          class="rounded-full bg-blue-500/80 backdrop-blur-sm border border-blue-300/30 px-[16rpx] py-[6rpx] text-[18rpx] text-white shadow-sm transition-all duration-200 active:bg-blue-500/90 active:scale-95"
                          @tap.stop="openStatusDrawer(vehicle)"
                        >
                          <text class="i-material-symbols-settings text-[16rpx] mr-[4rpx]" />
                          状态管理
                        </button>
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              <template v-else>
                <view class="flex flex-col items-center justify-center py-[60rpx]">
                  <text class="i-fluent-emoji-oncoming-automobile mb-[16rpx] text-[64rpx] text-gray-300" />
                  <text class="mb-[8rpx] text-[24rpx] text-gray-400">
                    {{ getEmptyVehicleText().title }}
                  </text>
                  <text class="text-[20rpx] text-gray-400">
                    {{ getEmptyVehicleText().description }}
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

    <!-- 状态变更底部抽屉 -->
    <BottomDrawer
      v-model:visible="statusDrawerVisible"
      title="变更车辆状态"
      height="350rpx"
    >
      <view class="p-[20rpx]">
        <!-- 当前车辆信息 -->
        <view v-if="currentVehicle" class="mb-[20rpx] rounded-lg bg-gray-50 p-[16rpx]">
          <view class="flex items-center space-x-[12rpx]">
            <text class="text-[24rpx] text-gray-800 font-semibold">
              {{ currentVehicle.brand }} {{ currentVehicle.model }}
            </text>
            <text class="text-[20rpx] text-gray-500">
              {{ currentVehicle.licensePlate }}
            </text>
          </view>
          <view class="mt-[8rpx] flex items-center space-x-[8rpx]">
            <text class="text-[18rpx] text-gray-600">
              当前状态：
            </text>
            <text
              class="rounded-full px-[12rpx] py-[4rpx] text-[16rpx]"
              :class="getStatusStyle(currentVehicle.status)"
            >
              {{ currentVehicle.statusText }}
            </text>
          </view>
        </view>

        <!-- 状态选项列表 -->
        <view class="space-y-[12rpx]">
          <view
            v-for="option in availableStatusOptions"
            :key="option.value"
            class="flex items-center border border-gray-200 rounded-lg bg-white p-[16rpx] active:bg-gray-50"
            @tap="changeVehicleStatus(option.value)"
          >
            <view class="mr-[16rpx] h-[12rpx] w-[12rpx] rounded-full" :class="option.colorClass" />
            <view class="flex-1">
              <text class="text-[20rpx] text-gray-800 font-medium">
                {{ option.label }}
              </text>
              <text class="mt-[2rpx] block text-[16rpx] text-gray-500">
                {{ option.description }}
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-[20rpx] text-gray-400" />
          </view>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>
