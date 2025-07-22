<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import { useOwnerStore } from '@/store/owner'

// 使用 owner store
const ownerStore = useOwnerStore()
const { ownerInfo } = storeToRefs(ownerStore)

// 设置当前页面
ownerStore.setActive('settings')

// 设置数据
const settings = reactive({
  notifications: {
    orderAlerts: true,
    revenueAlerts: true,
    systemMessages: true,
    promotions: false
  },
  privacy: {
    showPhone: false,
    showLocation: true,
    autoAcceptOrders: false
  }
})

// 导航方法
function goToProfile() {
  uni.navigateTo({ url: '/pages/owner/profile' })
}

function goToNotificationSettings() {
  uni.navigateTo({ url: '/pages/owner/notification-settings' })
}

function goToPrivacySettings() {
  uni.navigateTo({ url: '/pages/owner/privacy-settings' })
}

function goToHelp() {
  uni.navigateTo({ url: '/pages/owner/help' })
}

function goToAbout() {
  uni.navigateTo({ url: '/pages/owner/about' })
}

function goToFeedback() {
  uni.navigateTo({ url: '/pages/feedback-form/index' })
}

// 切换通知设置
function toggleNotification(type: string) {
  settings.notifications[type] = !settings.notifications[type]
  uni.showToast({
    title: settings.notifications[type] ? '已开启' : '已关闭',
    icon: 'success'
  })
}

// 联系客服
function contactService() {
  uni.showActionSheet({
    itemList: ['电话客服', '在线客服'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.makePhoneCall({
          phoneNumber: '400-123-4567'
        })
      } else {
        uni.showToast({
          title: '正在连接在线客服',
          icon: 'none'
        })
      }
    }
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/main/index' })
        }, 1500)
      }
    }
  })
}

// 版本检查
function checkVersion() {
  uni.showToast({
    title: '已是最新版本',
    icon: 'success'
  })
}

// 清除缓存
function clearCache() {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '缓存清除成功',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gradient-to-br from-slate-50 via-gray-50/30 to-blue-50/20">
    <!-- 头部导航栏 -->
    <HeadBar 
      title="设置" 
      :show-back="true"
    />

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="flex-1">
      <!-- 用户信息卡片 -->
      <view class="bg-gradient-to-r from-purple-500 to-purple-600 px-[40rpx] py-[48rpx]">
        <view class="flex items-center space-x-[24rpx]" @tap="goToProfile">
          <view class="h-[120rpx] w-[120rpx] overflow-hidden border-4 border-white/50 rounded-full bg-white/20">
            <image
              :src="ownerInfo.avatar"
              class="h-full w-full object-cover"
              mode="aspectFill"
            />
          </view>
          
          <view class="flex-1">
            <view class="flex items-center space-x-[16rpx] mb-[8rpx]">
              <text class="text-[32rpx] text-white font-semibold">{{ ownerInfo.nickname }}</text>
              <view v-if="ownerInfo.isOwner" class="rounded-full bg-green-500 px-[12rpx] py-[4rpx]">
                <text class="text-[18rpx] text-white">已认证</text>
              </view>
            </view>
            <text class="block text-[24rpx] text-white/80">{{ ownerInfo.phone }}</text>
            <text class="block text-[20rpx] text-white/70 mt-[8rpx]">
              入驻时间：{{ ownerInfo.joinDate }}
            </text>
          </view>
          
          <text class="i-material-symbols-chevron-right text-[32rpx] text-white/80" />
        </view>
      </view>

      <!-- 设置选项 -->
      <view class="px-[40rpx] py-[32rpx] space-y-[32rpx]">
        <!-- 通知设置 -->
        <view class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <text class="text-[32rpx] text-black font-semibold">通知设置</text>
          </view>
          
          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 订单提醒 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-orange-50">
                  <text class="i-material-symbols-assignment text-[28rpx] text-orange-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">订单提醒</text>
                  <text class="text-[24rpx] text-gray-500">新订单、取车、还车提醒</text>
                </view>
              </view>
              <view 
                class="relative h-[48rpx] w-[80rpx] rounded-full transition-colors duration-200"
                :class="settings.notifications.orderAlerts ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('orderAlerts')"
              >
                <view
                  class="absolute top-[8rpx] h-[32rpx] w-[32rpx] rounded-full bg-white transition-all duration-200"
                  :class="settings.notifications.orderAlerts ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 收益提醒 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-green-50">
                  <text class="i-material-symbols-account-balance-wallet text-[28rpx] text-green-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">收益提醒</text>
                  <text class="text-[24rpx] text-gray-500">收益到账、提现状态提醒</text>
                </view>
              </view>
              <view 
                class="relative h-[48rpx] w-[80rpx] rounded-full transition-colors duration-200"
                :class="settings.notifications.revenueAlerts ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('revenueAlerts')"
              >
                <view
                  class="absolute top-[8rpx] h-[32rpx] w-[32rpx] rounded-full bg-white transition-all duration-200"
                  :class="settings.notifications.revenueAlerts ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 系统消息 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-blue-50">
                  <text class="i-material-symbols-notifications text-[28rpx] text-blue-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">系统消息</text>
                  <text class="text-[24rpx] text-gray-500">系统公告、政策更新</text>
                </view>
              </view>
              <view 
                class="relative h-[48rpx] w-[80rpx] rounded-full transition-colors duration-200"
                :class="settings.notifications.systemMessages ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleNotification('systemMessages')"
              >
                <view
                  class="absolute top-[8rpx] h-[32rpx] w-[32rpx] rounded-full bg-white transition-all duration-200"
                  :class="settings.notifications.systemMessages ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 功能设置 -->
        <view class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <text class="text-[32rpx] text-black font-semibold">功能设置</text>
          </view>
          
          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 隐私设置 -->
            <view class="flex items-center justify-between" @tap="goToPrivacySettings">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-indigo-50">
                  <text class="i-material-symbols-privacy-tip text-[28rpx] text-indigo-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">隐私设置</text>
                  <text class="text-[24rpx] text-gray-500">个人信息展示控制</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>

            <!-- 帮助中心 -->
            <view class="flex items-center justify-between" @tap="goToHelp">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-teal-50">
                  <text class="i-material-symbols-help text-[28rpx] text-teal-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">帮助中心</text>
                  <text class="text-[24rpx] text-gray-500">常见问题、使用教程</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>

            <!-- 意见反馈 -->
            <view class="flex items-center justify-between" @tap="goToFeedback">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-pink-50">
                  <text class="i-material-symbols-feedback text-[28rpx] text-pink-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">意见反馈</text>
                  <text class="text-[24rpx] text-gray-500">问题反馈、建议提交</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>

            <!-- 联系客服 -->
            <view class="flex items-center justify-between" @tap="contactService">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-purple-50">
                  <text class="i-material-symbols-support-agent text-[28rpx] text-purple-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">联系客服</text>
                  <text class="text-[24rpx] text-gray-500">7×24小时在线客服</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>
        </view>

        <!-- 应用信息 -->
        <view class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <text class="text-[32rpx] text-black font-semibold">应用信息</text>
          </view>
          
          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 版本检查 -->
            <view class="flex items-center justify-between" @tap="checkVersion">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-blue-50">
                  <text class="i-material-symbols-system-update text-[28rpx] text-blue-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">版本检查</text>
                  <text class="text-[24rpx] text-gray-500">当前版本 v1.0.0</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>

            <!-- 清除缓存 -->
            <view class="flex items-center justify-between" @tap="clearCache">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-orange-50">
                  <text class="i-material-symbols-cleaning-services text-[28rpx] text-orange-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">清除缓存</text>
                  <text class="text-[24rpx] text-gray-500">清理应用缓存数据</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>

            <!-- 关于我们 -->
            <view class="flex items-center justify-between" @tap="goToAbout">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50">
                  <text class="i-material-symbols-info text-[28rpx] text-gray-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">关于我们</text>
                  <text class="text-[24rpx] text-gray-500">用户协议、隐私政策</text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>
        </view>

        <!-- 退出登录 -->
        <view class="pb-[48rpx]">
          <view
            class="w-full border border-red-200 rounded-xl bg-red-50 py-[32rpx] text-center text-[32rpx] text-red-600 font-medium"
            @tap="handleLogout"
          >
            退出登录
          </view>
        </view>
      </view>
      
      <!-- 底部TabBar占位 -->
      <view class="h-[120rpx]" />
    </scroll-view>
  </view>
</template>