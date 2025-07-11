<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NotificationsHead from '@/components/page/my/notifications/Head.vue'

// 通知设置
const notificationSettings = ref({
  orderNotifications: true,
  promotionalNotifications: true,
  systemNotifications: true,
  smsNotifications: false,
  emailNotifications: false,
})

// 消息列表
const notifications = ref([
  {
    id: 1,
    type: 'order',
    title: '订单提醒',
    content: '您的租车订单已确认，请按时取车',
    time: '2024-01-20 14:30',
    read: false,
    icon: 'event_available',
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'promotion',
    title: '优惠活动',
    content: '春节特惠活动开始啦！新用户立减50元',
    time: '2024-01-19 10:15',
    read: true,
    icon: 'local-offer',
    color: 'text-orange-600',
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知',
    content: '系统将于今晚23:00-01:00进行维护升级',
    time: '2024-01-18 16:45',
    read: true,
    icon: 'settings',
    color: 'text-blue-600',
  },
  {
    id: 4,
    type: 'order',
    title: '还车提醒',
    content: '您的车辆租期即将到期，请及时还车',
    time: '2024-01-17 09:20',
    read: false,
    icon: 'schedule',
    color: 'text-red-600',
  },
  {
    id: 5,
    type: 'promotion',
    title: '积分到账',
    content: '恭喜您获得100积分奖励！',
    time: '2024-01-16 18:30',
    read: true,
    icon: 'stars',
    color: 'text-purple-600',
  },
])

const activeTab = ref<'all' | 'unread'>('all')
const loading = ref(false)

// 筛选消息
const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notifications.value.filter(item => !item.read)
  }
  return notifications.value
})

// 未读消息数量
const unreadCount = computed(() => {
  return notifications.value.filter(item => !item.read).length
})

// 切换标签
function switchTab(tab: 'all' | 'unread') {
  activeTab.value = tab
}

// 切换通知设置
function toggleNotification(key: keyof typeof notificationSettings.value) {
  notificationSettings.value[key] = !notificationSettings.value[key]

  uni.showToast({
    title: notificationSettings.value[key] ? '已开启' : '已关闭',
    icon: 'success',
  })
}

// 标记为已读
function markAsRead(notificationId: number) {
  const notification = notifications.value.find(item => item.id === notificationId)
  if (notification && !notification.read) {
    notification.read = true

    uni.showToast({
      title: '已标记为已读',
      icon: 'success',
    })
  }
}

// 删除消息
function deleteNotification(notificationId: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    success: (res) => {
      if (res.confirm) {
        const index = notifications.value.findIndex(item => item.id === notificationId)
        if (index > -1) {
          notifications.value.splice(index, 1)
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        }
      }
    },
  })
}

// 全部标记为已读
function markAllAsRead() {
  if (unreadCount.value === 0) {
    uni.showToast({
      title: '没有未读消息',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '确认操作',
    content: `确定要将所有 ${unreadCount.value} 条消息标记为已读吗？`,
    success: (res) => {
      if (res.confirm) {
        notifications.value.forEach((item) => {
          item.read = true
        })

        uni.showToast({
          title: '全部标记为已读',
          icon: 'success',
        })
      }
    },
  })
}

// 清空所有消息
function clearAllNotifications() {
  if (notifications.value.length === 0) {
    uni.showToast({
      title: '没有消息可清空',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有消息吗？此操作不可恢复',
    success: (res) => {
      if (res.confirm) {
        notifications.value.splice(0)

        uni.showToast({
          title: '已清空所有消息',
          icon: 'success',
        })
      }
    },
  })
}

// 获取消息类型文本
function getNotificationTypeText(type: string) {
  const typeMap: Record<string, string> = {
    order: '订单',
    promotion: '活动',
    system: '系统',
  }
  return typeMap[type] || '其他'
}

// 页面加载时获取数据
onMounted(() => {
  // 这里可以加载真实数据
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <NotificationsHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 通知设置 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-tune text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                通知设置
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 订单通知 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-green-100">
                  <text class="i-material-symbols-event-available text-[36rpx] text-green-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    订单通知
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    订单状态变更提醒
                  </text>
                </view>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="notificationSettings.orderNotifications ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('orderNotifications')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="notificationSettings.orderNotifications ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 优惠活动通知 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-orange-100">
                  <text class="i-material-symbols-local-offer text-[36rpx] text-orange-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    优惠活动
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    活动推广信息
                  </text>
                </view>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="notificationSettings.promotionalNotifications ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('promotionalNotifications')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="notificationSettings.promotionalNotifications ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 系统通知 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-blue-100">
                  <text class="i-material-symbols-settings text-[36rpx] text-blue-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    系统通知
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    系统更新和维护信息
                  </text>
                </view>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="notificationSettings.systemNotifications ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('systemNotifications')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="notificationSettings.systemNotifications ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 短信通知 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-purple-100">
                  <text class="i-material-symbols-sms text-[36rpx] text-purple-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    短信通知
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    重要信息短信提醒
                  </text>
                </view>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="notificationSettings.smsNotifications ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('smsNotifications')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="notificationSettings.smsNotifications ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 消息筛选和操作 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-notifications text-[40rpx] text-purple-600" />
                <text class="text-[32rpx] text-black font-semibold">
                  消息中心
                </text>
                <text v-if="unreadCount > 0" class="rounded-full bg-red-500 px-[12rpx] py-[4rpx] text-[20rpx] text-white">
                  {{ unreadCount }}
                </text>
              </view>

              <view class="flex space-x-[16rpx]">
                <view
                  class="border border-purple-600 rounded-[12rpx] px-[16rpx] py-[8rpx] text-[22rpx] text-purple-600"
                  @tap="markAllAsRead"
                >
                  全部已读
                </view>
                <view
                  class="border border-red-600 rounded-[12rpx] px-[16rpx] py-[8rpx] text-[22rpx] text-red-600"
                  @tap="clearAllNotifications"
                >
                  清空
                </view>
              </view>
            </view>
          </view>

          <!-- 标签切换 -->
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex rounded-xl bg-gray-100 p-[8rpx] space-x-[8rpx]">
              <view
                class="flex-1 rounded-lg px-[24rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-200"
                :class="activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-600'"
                @tap="switchTab('all')"
              >
                全部消息
              </view>
              <view
                class="flex-1 rounded-lg px-[24rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-200"
                :class="activeTab === 'unread' ? 'bg-purple-600 text-white' : 'text-gray-600'"
                @tap="switchTab('unread')"
              >
                未读消息
              </view>
            </view>
          </view>

          <!-- 消息列表 -->
          <view class="p-[32rpx]">
            <view v-if="filteredNotifications.length === 0" class="py-[80rpx] text-center">
              <text class="i-material-symbols-inbox mb-[16rpx] block text-[80rpx] text-gray-400" />
              <text class="text-[28rpx] text-gray-500">
                {{ activeTab === 'unread' ? '暂无未读消息' : '暂无消息' }}
              </text>
            </view>

            <view v-else class="space-y-[24rpx]">
              <view
                v-for="notification in filteredNotifications"
                :key="notification.id"
                class="relative border border-gray-100 rounded-[24rpx] p-[24rpx]"
                :class="{ 'bg-blue-50 border-blue-200': !notification.read }"
              >
                <!-- 未读标识 -->
                <view v-if="!notification.read" class="absolute right-[24rpx] top-[24rpx] h-[16rpx] w-[16rpx] rounded-full bg-red-500" />

                <view class="flex items-start space-x-[24rpx]">
                  <!-- 消息图标 -->
                  <view class="h-[80rpx] w-[80rpx] flex flex-shrink-0 items-center justify-center rounded-[20rpx] bg-gray-100">
                    <text :class="`i-material-symbols-${notification.icon} ${notification.color} text-[36rpx]`" />
                  </view>

                  <!-- 消息内容 -->
                  <view class="min-w-0 flex-1">
                    <view class="mb-[8rpx] flex items-center justify-between">
                      <text class="text-[28rpx] text-black font-semibold">
                        {{ notification.title }}
                      </text>
                      <text class="rounded-full bg-gray-200 px-[12rpx] py-[4rpx] text-[20rpx] text-gray-600">
                        {{ getNotificationTypeText(notification.type) }}
                      </text>
                    </view>

                    <text class="mb-[16rpx] block text-[26rpx] text-gray-700 leading-relaxed">
                      {{ notification.content }}
                    </text>

                    <view class="flex items-center justify-between">
                      <text class="text-[24rpx] text-gray-500">
                        {{ notification.time }}
                      </text>

                      <view class="flex space-x-[16rpx]">
                        <view
                          v-if="!notification.read"
                          class="border border-green-600 rounded-[12rpx] px-[16rpx] py-[8rpx] text-[22rpx] text-green-600"
                          @tap="markAsRead(notification.id)"
                        >
                          标记已读
                        </view>
                        <view
                          class="border border-red-600 rounded-[12rpx] px-[16rpx] py-[8rpx] text-[22rpx] text-red-600"
                          @tap="deleteNotification(notification.id)"
                        >
                          删除
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
      <text class="text-[28rpx] text-gray-500">
        加载中...
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
