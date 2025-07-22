<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import SelectBar from '@/components/SelectBar.vue'
import { useOwnerStore } from '@/store/owner'

// 使用 owner store
const ownerStore = useOwnerStore()
const { orderStatistics } = storeToRefs(ownerStore)

// 设置当前页面
ownerStore.setActive('orders')

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const currentFilter = ref('all')

// 订单列表
const orderList = reactive([
  {
    id: 'RO20250720001',
    date: '2025-07-20',
    time: '14:30-18:00',
    user: {
      name: '张三',
      phone: '139****5678',
      avatar: '/static/vite.png'
    },
    vehicle: {
      name: '特斯拉Model3',
      licensePlate: '沪A·12345'
    },
    amount: 299,
    commission: 254,
    status: 'completed',
    statusText: '已完成',
    location: '徐汇区漕河泾开发区'
  },
  {
    id: 'RO20250721001',
    date: '2025-07-21',
    time: '09:00-11:00',
    user: {
      name: '李四',
      phone: '138****1234',
      avatar: '/static/vite.png'
    },
    vehicle: {
      name: '比亚迪汉EV',
      licensePlate: '沪A·67890'
    },
    amount: 199,
    commission: 169,
    status: 'ongoing',
    statusText: '进行中',
    location: '浦东新区陆家嘴'
  },
  {
    id: 'RO20250719001',
    date: '2025-07-19',
    time: '16:00-20:00',
    user: {
      name: '王五',
      phone: '137****9999',
      avatar: '/static/vite.png'
    },
    vehicle: {
      name: '理想L7',
      licensePlate: '沪A·11111'
    },
    amount: 359,
    commission: 305,
    status: 'completed',
    statusText: '已完成',
    location: '静安区南京西路'
  }
])

// 导航方法
function goToOrderDetail(orderId: string) {
  uni.navigateTo({ url: `/pages/owner/order-detail?id=${orderId}` })
}

function goToTimeline(orderId: string) {
  uni.navigateTo({ url: `/pages/owner/order-timeline?id=${orderId}` })
}

function contactUser(phone: string) {
  uni.makePhoneCall({
    phoneNumber: phone.replace('*', '')
  })
}

// 筛选方法
function onFilterChange(value: string) {
  currentFilter.value = value
  // 这里可以添加筛选逻辑
  console.log('筛选条件:', value)
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap = {
    completed: 'text-green-600 bg-green-100',
    ongoing: 'text-orange-600 bg-orange-100',
    cancelled: 'text-red-600 bg-red-100',
    pending: 'text-blue-600 bg-blue-100'
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

// 下拉刷新
function onRefresh() {
  uni.showToast({
    title: '刷新成功',
    icon: 'success'
  })
}

// 搜索
function handleSearch() {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  })
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
    <!-- 头部导航栏 -->
    <HeadBar 
      title="订单管理" 
      :show-back="true"
      :show-right="true"
      right-icon="i-material-symbols-search"
      @right-click="handleSearch"
    />

    <!-- 订单统计 -->
    <view class="bg-white/70 backdrop-blur-sm shadow-md border-b border-white/20 px-[40rpx] py-[24rpx]">
      <view class="grid grid-cols-3 gap-[24rpx]">
        <view class="text-center">
          <text class="block text-[36rpx] font-bold text-orange-600">{{ orderStatistics.ongoing }}</text>
          <text class="text-[24rpx] text-gray-600">进行中</text>
        </view>
        <view class="text-center">
          <text class="block text-[36rpx] font-bold text-blue-600">{{ orderStatistics.todayNew }}</text>
          <text class="text-[24rpx] text-gray-600">今日新增</text>
        </view>
        <view class="text-center">
          <text class="block text-[36rpx] font-bold text-green-600">{{ orderStatistics.monthlyCompleted }}</text>
          <text class="text-[24rpx] text-gray-600">本月完成</text>
        </view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="bg-white/50 backdrop-blur-sm px-[40rpx] py-[16rpx]">
      <SelectBar 
        :options="filterOptions"
        :current="currentFilter"
        @change="onFilterChange"
      />
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      scroll-y 
      class="flex-1 px-[40rpx] pt-[24rpx]"
      enable-flex
      refresher-enabled
      @refresherrefresh="onRefresh"
    >
      <view class="space-y-[24rpx]">
        <view 
          v-for="order in orderList" 
          :key="order.id"
          class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden"
        >
          <!-- 订单头部 -->
          <view class="bg-gradient-to-r from-gray-50/50 to-gray-50/50 px-[24rpx] py-[16rpx] border-b border-white/10">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-calendar-today text-[24rpx] text-gray-600" />
                <text class="text-[24rpx] text-gray-800">{{ order.date }} {{ order.time }}</text>
              </view>
              <text 
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getStatusStyle(order.status)"
              >
                {{ order.statusText }}
              </text>
            </view>
          </view>

          <!-- 订单内容 -->
          <view class="p-[24rpx]">
            <!-- 用户信息 -->
            <view class="flex items-center space-x-[16rpx] mb-[16rpx]">
              <view class="h-[48rpx] w-[48rpx] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <image 
                  :src="order.user.avatar" 
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>
              <view class="flex-1 min-w-0">
                <text class="block text-[28rpx] font-medium text-gray-800">{{ order.user.name }}</text>
                <text class="text-[24rpx] text-gray-600">{{ order.user.phone }}</text>
              </view>
            </view>

            <!-- 车辆信息 -->
            <view class="flex items-center space-x-[16rpx] mb-[16rpx]">
              <text class="i-material-symbols-directions-car text-[24rpx] text-purple-600" />
              <text class="text-[26rpx] text-gray-800">{{ order.vehicle.name }}</text>
              <text class="text-[24rpx] text-gray-600">{{ order.vehicle.licensePlate }}</text>
            </view>

            <!-- 地点信息 -->
            <view class="flex items-center space-x-[16rpx] mb-[16rpx]">
              <text class="i-material-symbols-location-on text-[24rpx] text-red-500" />
              <text class="text-[24rpx] text-gray-600 flex-1">{{ order.location }}</text>
            </view>

            <!-- 金额信息 -->
            <view class="flex items-center justify-between mb-[16rpx]">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-payments text-[24rpx] text-green-600" />
                <text class="text-[24rpx] text-gray-600">订单金额</text>
              </view>
              <view class="text-right">
                <text class="text-[28rpx] font-semibold text-green-600">¥{{ order.commission }}</text>
                <text class="text-[20rpx] text-gray-500 ml-[8rpx]">(总额¥{{ order.amount }})</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="flex items-center justify-end space-x-[16rpx] pt-[16rpx] border-t border-gray-100">
              <view 
                class="border border-purple-200 rounded-lg bg-purple-50 px-[24rpx] py-[12rpx]"
                @tap="contactUser(order.user.phone)"
              >
                <text class="text-[24rpx] text-purple-600 font-medium">联系用户</text>
              </view>
              
              <view 
                class="border border-blue-200 rounded-lg bg-blue-50 px-[24rpx] py-[12rpx]"
                @tap="goToTimeline(order.id)"
              >
                <text class="text-[24rpx] text-blue-600 font-medium">时间线</text>
              </view>
              
              <view 
                class="bg-purple-600 rounded-lg px-[24rpx] py-[12rpx]"
                @tap="goToOrderDetail(order.id)"
              >
                <text class="text-[24rpx] text-white font-medium">查看详情</text>
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