<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/store/profile'
import Head from '@/components/page/my/Head.vue'

// 使用 profile store
const profileStore = useProfileStore()
const { profileData } = storeToRefs(profileStore)

// 导航方法
function goToProfile() {
  uni.navigateTo({ url: '/pages/my/profile' })
}

function goToWallet() {
  uni.navigateTo({ url: '/pages/my/wallet' })
}

function goToDocuments() {
  uni.navigateTo({ url: '/pages/my/documents' })
}

function goToOwnerCertification() {
  uni.navigateTo({ url: '/pages/owner-certification/index' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

function goToNotifications() {
  uni.navigateTo({ url: '/pages/my/notifications' })
}

function goToAbout() {
  uni.navigateTo({ url: '/pages/my/about' })
}

// 联系客服
async function handleContactService() {
  try {
    const serviceData = await profileStore.handleContactService()
    const serviceOptions = serviceData.serviceOptions.map(option => option.title)

    uni.showActionSheet({
      itemList: serviceOptions,
      success: (res) => {
        const selectedOption = serviceData.serviceOptions[res.tapIndex]
        if (selectedOption.type === 'phone') {
          uni.makePhoneCall({
            phoneNumber: selectedOption.phoneNumber || '400-123-4567',
          })
        }
        else if (selectedOption.type === 'wechat') {
          uni.showToast({
            title: '正在跳转微信客服',
            icon: 'none',
          })
        }
        else if (selectedOption.type === 'online') {
          uni.navigateTo({
            url: '/pages/service/chat',
          })
        }
      },
    })
  }
  catch (error) {
    console.error('获取客服信息失败:', error)
    uni.showToast({
      title: '获取客服信息失败',
      icon: 'none',
    })
  }
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await profileStore.handleLogout()
          uni.showToast({
            title: '已退出登录',
            icon: 'success',
          })
          // 这里可以跳转到登录页面或重置用户状态
        }
        catch (error) {
          console.error('退出登录失败:', error)
          uni.showToast({
            title: '退出登录失败',
            icon: 'none',
          })
        }
      }
    },
  })
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-y-auto bg-gray-50">
    <!-- 头部占位组件 -->
    <Head />

    <!-- 顶部个人信息卡片 -->
    <view class="relative bg-[#8D30E0] px-[40rpx] pb-[72rpx] pt-[32rpx]">
      <!-- 背景装饰 -->
      <view class="absolute bg-[#8D30E0]" />

      <view class="relative z-10">
        <view v-if="profileData?.userInfo" class="flex items-center space-x-[32rpx]">
          <!-- 用户头像 -->
          <view class="relative" @tap="goToProfile">
            <view class="h-[128rpx] w-[128rpx] overflow-hidden border-4 border-white/50 rounded-full bg-white/20">
              <image
                :src="profileData.userInfo.avatar"
                class="h-full w-full object-cover"
                mode="aspectFill"
                :alt="profileData.userInfo.nickname"
              />
            </view>
            <view class="absolute h-[48rpx] w-[48rpx] flex items-center justify-center border-2 border-white rounded-full bg-purple-600 -bottom-[8rpx] -right-[8rpx]">
              <text class="i-material-symbols-edit text-[24rpx] text-white" />
            </view>
          </view>

          <!-- 用户信息 -->
          <view class="flex-1">
            <view class="mb-[8rpx] flex items-center space-x-[16rpx]">
              <text class="text-[36rpx] text-white font-semibold">
                {{ profileData.userInfo.nickname }}
              </text>
              <text
                v-if="profileData.userInfo.isVerified"
                class="rounded-full bg-green-100 px-[16rpx] py-[4rpx] text-[20rpx] text-green-600"
              >
                已认证
              </text>
            </view>
            <text class="mb-[16rpx] block text-[24rpx] text-white/80">
              手机号：{{ profileData.userInfo.phone }}
            </text>
          </view>

          <!-- 设置按钮 -->
          <view class="flex flex-col items-center space-y-[24rpx]">
            <text
              class="i-material-symbols-settings text-[32rpx] text-white/80"
              @tap="goToSettings"
            />
            <text
              class="i-material-symbols-qr-code-scanner text-[32rpx] text-white/80"
              @tap="goToProfile"
            />
          </view>
        </view>

        <!-- 未登录状态 -->
        <view v-else class="flex items-center justify-between">
          <view>
            <text class="mb-[8rpx] block text-[36rpx] text-white font-semibold">
              欢迎使用窍启租车
            </text>
            <text class="text-[24rpx] text-white/80">
              登录后享受更多服务
            </text>
          </view>
          <view
            class="border border-white/30 rounded-full bg-white/20 px-[48rpx] py-[16rpx] backdrop-blur-sm"
            @tap="goToProfile"
          >
            <text class="text-[24rpx] text-white font-medium">
              立即登录
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷数据统计 -->
    <view class="relative z-10 mb-[48rpx] px-[40rpx] -mt-[32rpx]">
      <view class="rounded-[32rpx] bg-white p-[40rpx] shadow-lg">
        <view v-if="profileData?.statistics" class="grid grid-cols-3 divide-x divide-gray-100">
          <view class="text-center">
            <text class="block text-[36rpx] text-black font-semibold">
              {{ profileData.statistics.totalOrders }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              累计订单
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-black font-semibold">
              ¥{{ profileData.statistics.totalSpent.toLocaleString() }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              累计消费
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-black font-semibold">
              {{ profileData.statistics.availableCoupons }}
            </text>
            <text class="text-[24rpx] text-gray-600">
              优惠券
            </text>
          </view>
        </view>
        <view v-else class="grid grid-cols-3 divide-x divide-gray-100">
          <view class="text-center">
            <text class="block text-[36rpx] text-gray-400 font-semibold">
              --
            </text>
            <text class="text-[24rpx] text-gray-600">
              累计订单
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-gray-400 font-semibold">
              --
            </text>
            <text class="text-[24rpx] text-gray-600">
              累计消费
            </text>
          </view>
          <view class="text-center">
            <text class="block text-[36rpx] text-gray-400 font-semibold">
              --
            </text>
            <text class="text-[24rpx] text-gray-600">
              优惠券
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主要功能列表 -->
    <view class="flex-1 px-[40rpx] space-y-[32rpx]">
      <!-- 我的服务 -->
      <view class="rounded-[32rpx] bg-white shadow-sm">
        <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
          <text class="text-[32rpx] text-black font-semibold">
            我的服务
          </text>
        </view>

        <view class="p-[32rpx] space-y-[32rpx]">
          <!-- 证件管理 -->
          <view class="flex items-center justify-between" @tap="goToDocuments">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-badge text-[36rpx] text-purple-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  证件管理
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ profileData?.services.certification.drivingLicense.description || '驾驶证管理' }}
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text
                v-if="profileData?.services.certification.drivingLicense.status === 'verified'"
                class="rounded-full bg-green-100 px-[16rpx] py-[8rpx] text-[20rpx] text-green-600"
              >
                已认证
              </text>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 卡包 -->
          <view class="flex items-center justify-between" @tap="goToWallet">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-wallet text-[36rpx] text-orange-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  卡包
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ profileData?.services.wallet.description || '优惠券管理' }}
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text
                v-if="profileData?.services.wallet.availableCoupons"
                class="rounded-full bg-orange-100 px-[16rpx] py-[8rpx] text-[20rpx] text-orange-600"
              >
                {{ profileData.services.wallet.statusText }}
              </text>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 车主认证入口 -->
          <view class="flex items-center justify-between" @tap="goToOwnerCertification">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-verified-user text-[36rpx] text-green-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  车主认证
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ profileData?.services.certification.ownerCertification.description || '成为车主赚收益' }}
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text
                class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[20rpx] text-purple-600"
              >
                {{ profileData?.services.certification.ownerCertification.statusText || '立即认证' }}
              </text>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 消息通知 -->
          <view class="flex items-center justify-between" @tap="goToNotifications">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-notifications text-[36rpx] text-purple-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  消息通知
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ profileData?.services.notifications.description || '订单提醒、活动推送' }}
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="profileData?.services.notifications.enabled ? 'bg-purple-600' : 'bg-gray-300'"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="profileData?.services.notifications.enabled ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>
        </view>
      </view>

      <!-- 设置 -->
      <view class="mb-[48rpx] rounded-[32rpx] bg-white shadow-sm">
        <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
          <text class="text-[32rpx] text-black font-semibold">
            设置
          </text>
        </view>

        <view class="p-[32rpx] space-y-[32rpx]">
          <!-- 个人资料 -->
          <view class="flex items-center justify-between" @tap="goToProfile">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-person text-[36rpx] text-indigo-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  个人资料
                </text>
                <text class="text-[24rpx] text-gray-500">
                  头像、昵称修改
                </text>
              </view>
            </view>
            <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
          </view>

          <!-- 联系客服 -->
          <view class="flex items-center justify-between" @tap="handleContactService">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-support-agent text-[36rpx] text-purple-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系客服
                </text>
                <text class="text-[24rpx] text-gray-500">
                  小程序客服
                </text>
              </view>
            </view>
            <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
          </view>

          <!-- 关于我们 -->
          <view class="flex items-center justify-between" @tap="goToAbout">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-info text-[36rpx] text-blue-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  关于我们
                </text>
                <text class="text-[24rpx] text-gray-500">
                  版本信息、隐私政策
                </text>
              </view>
            </view>
            <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="profileData?.userInfo" class="pb-[48rpx]">
        <view
          class="w-full border border-red-200 rounded-[24rpx] bg-red-50 py-[24rpx] text-center text-[28rpx] text-red-600 font-medium"
          @tap="handleLogout"
        >
          退出登录
        </view>
      </view>

      <view class="h-[1rpx]" />
    </view>
  </view>
</template>
