<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useProfileStore } from '@/store/profile'
import { useUserStore } from '@/store/user'
import { createDepositPayOrder } from '@/api/deposit-payment'

// 使用 profile store
const profileStore = useProfileStore()
const { profileData } = storeToRefs(profileStore)
const userStore = useUserStore()
const { openId } = storeToRefs(userStore)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await profileStore.loadProfileData()
      if (profileData.value?.userInfo) {
        userStore.updateUserInfo(profileData.value.userInfo)
      }
    }
    catch (error) {
      console.error('加载个人信息失败:', error)
    }
  }
})

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

function goToOwnerCenter() {
  uni.navigateTo({ url: '/pages/owner/index' })
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

function goToInvoice() {
  uni.navigateTo({ url: '/pages/my/invoice' })
}

function goToDeposit() {
  uni.navigateTo({ url: '/pages/deposit/index' })
}

// 扫码功能
function scanCode() {
  uni.scanCode({
    success: (res) => {
      console.log('扫码结果:', res.result)
      handleScanResult(res.result)
    },
    fail: (err) => {
      console.error('扫码失败:', err)
      uni.showToast({
        title: '扫码失败',
        icon: 'none',
      })
    },
  })
}

// 处理扫码结果
async function handleScanResult(scanResult: string) {
  try {
    // 检查二维码前缀并处理相应的业务逻辑
    if (scanResult.startsWith('ORDER_DEPOSIT#')) {
      // 押金支付二维码
      const orderNo = scanResult.replace('ORDER_DEPOSIT#', '')
      await handleDepositPayment(orderNo)
    }
    else if (scanResult.startsWith('ORDER_RETURN#')) {
      // 还车二维码
      const orderNo = scanResult.replace('ORDER_RETURN#', '')
      await handleReturnPayment(orderNo)
    }
    else {
      // 其他类型的二维码
      uni.showToast({
        title: '不支持的二维码类型',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('处理扫码结果失败:', error)
    uni.showToast({
      title: '处理失败，请重试',
      icon: 'none',
    })
  }
}

// 处理押金支付
async function handleDepositPayment(orderNo: string) {
  try {
    uni.showLoading({ title: '处理中...' })

    // 检查用户是否已登录
    if (!openId.value) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
      })
      return
    }

    // 调用后端API获取微信支付参数
    const response = await createDepositPayOrder(orderNo, openId.value)

    if (response.code === 200) {
      const payData = response.data

      // 调用微信支付
      uni.requestPayment({
        appId: payData.appId,
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType,
        paySign: payData.paySign,
        success: () => {
          uni.showToast({
            title: '支付成功',
            icon: 'success',
          })

          setTimeout(() => {
            uni.navigateTo({ url: `/pages/order/detail?orderId=${payData.orderNo}` })
          }, 1000)
        },
      })
    }
    else {
      throw new Error(response.msg || '获取支付参数失败')
    }
  }
  catch (error) {
    console.error('处理押金支付失败:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '支付处理失败',
      icon: 'none',
    })
  }
  finally {
    uni.hideLoading()
  }
}

// 处理还车支付（预留）
async function handleReturnPayment(orderNo: string) {
  uni.showToast({
    title: '还车功能开发中',
    icon: 'none',
  })
}

// 联系客服 - 使用button的open-type='contact'实现

// 检查用户是否有车主权限（车主或平台管理员）
function isOwnerOrManager() {
  if (!profileData.value?.userInfo)
    return false

  console.log(profileData.value.userInfo)
  const userRole = profileData.value.userInfo.userRole
  return userRole === 'owner' || userRole === 'platform_manager'
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
  <view class="relative h-full flex flex-col overflow-y-auto bg-[#f6f7fb]">
    <!-- 顶部个人信息卡片 -->
    <view class="relative overflow-hidden from-[#f7f5ff] to-[#ede9fe] bg-gradient-to-b px-[40rpx] pb-[72rpx] table">
      <!-- 撑开头部，保持原有占位 -->
      <HeadBar bg-color="transparent">
      <!-- 空内容，仅作占位用途 -->
      </HeadBar>

      <!-- 点缀背景元素 - 优化后更加微妙 -->
      <view class="pointer-events-none absolute h-[180rpx] w-[180rpx] rounded-full bg-[#8b5cf6]/6 blur-[40rpx] -right-[80rpx] -top-[40rpx]" />
      <view class="pointer-events-none absolute left-[20rpx] top-[160rpx] h-[100rpx] w-[100rpx] rounded-full bg-[#A78BFA]/5 blur-[35rpx]" />
      <view class="pointer-events-none absolute right-[60rpx] top-[240rpx] h-[60rpx] w-[60rpx] border border-[#8b5cf6]/12 rounded-full" />

      <view class="relative z-10 mt-[32rpx]">
        <view v-if="profileData?.userInfo" class="flex items-center space-x-[32rpx]">
          <!-- 用户头像 -->
          <view class="relative" @tap="goToProfile">
            <view class="h-[128rpx] w-[128rpx] overflow-hidden border-4 border-white rounded-full bg-gray-100">
              <image
                :src="profileData.userInfo.avatar"
                class="h-full w-full"
                mode="aspectFill"
              />
            </view>
            <view class="absolute h-[48rpx] w-[48rpx] flex items-center justify-center border-2 border-white rounded-full bg-[#8b5cf6] -bottom-[8rpx] -right-[8rpx]">
              <text class="i-solar:pen-new-square-bold text-[24rpx] text-white" />
            </view>
          </view>

          <!-- 用户信息 -->
          <view class="flex-1">
            <view class="mb-[8rpx] flex items-center space-x-[16rpx]">
              <text class="text-[36rpx] text-[#111827] font-semibold">
                {{ profileData.userInfo.nickname }}
              </text>
            </view>
            <text class="mb-[16rpx] block text-[24rpx] text-[#475569]">
              手机号：{{ profileData.userInfo.phone }}
            </text>
          </view>

          <!-- 设置按钮 -->
          <view class="flex flex-col items-center space-y-[24rpx]">
            <text
              class="i-solar:settings-bold text-[32rpx] text-[#8b5cf6]"
              @tap="goToSettings"
            />
            <text
              class="i-solar:qr-code-bold text-[32rpx] text-[#8b5cf6]"
              @tap="scanCode"
            />
          </view>
        </view>

        <!-- 未登录状态 -->
        <view v-else class="flex items-center justify-between">
          <view>
            <text class="mb-[8rpx] block text-[36rpx] text-[#111827] font-semibold">
              欢迎使用窍启租车
            </text>
            <text class="text-[24rpx] text-[#475569]">
              登录后享受更多服务
            </text>
          </view>
          <view
            class="border border-[#8b5cf6]/40 rounded-full bg-white/80 px-[48rpx] py-[16rpx] backdrop-blur-sm"
            @tap="goToProfile"
          >
            <text class="text-[24rpx] text-[#8b5cf6] font-medium">
              立即登录
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷数据统计 -->
    <view class="relative z-10 mb-[48rpx] px-[40rpx] -mt-[32rpx]">
      <view class="border border-white/50 rounded-[28rpx] bg-white p-[40rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
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
      <view class="border border-white/50 rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
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
                <text class="i-solar:diploma-verified-bold text-[36rpx] text-[#8b5cf6]" />
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
              <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 卡包 -->
          <view class="flex items-center justify-between" @tap="goToWallet">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-solar:wallet-bold text-[36rpx] text-[#FF7A1A]" />
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
              <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 我的押金 -->
          <!-- <view class="flex items-center justify-between" @tap="goToDeposit">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-account-balance-wallet text-[36rpx] text-green-600" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  我的押金
                </text>
                <text class="text-[24rpx] text-gray-500">
                  押金充值、提现和信用管理
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view> -->

          <!-- 发票管理 -->
          <view class="flex items-center justify-between" @tap="goToInvoice">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-solar:bill-list-bold text-[36rpx] text-[#3B82F6]" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  发票管理
                </text>
                <text class="text-[24rpx] text-gray-500">
                  申请开具发票，下载电子发票
                </text>
              </view>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 车主中心 - 仅车主和平台管理员可见 -->
          <view v-if="isOwnerOrManager()" class="flex items-center justify-between" @tap="goToOwnerCenter">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-solar:transmission-circle-bold text-[36rpx] text-[#8b5cf6]" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  车主中心
                </text>
                <text class="text-[24rpx] text-gray-500">
                  管理我的车辆，查看收益情况
                </text>
              </view>
            </view>
            <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
          </view>

          <!-- 车辆挂靠入口 -->
          <view class="flex items-center justify-between" @tap="goToOwnerCertification">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-solar:shield-check-bold text-[36rpx] text-[#10B981]" />
              </view>
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  车辆挂靠
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ profileData?.services.certification.ownerCertification.description || '将车辆挂靠至平台，轻松获得收益' }}
                </text>
              </view>
            </view>
            <view class="w-max flex flex-none items-center space-x-[16rpx]">
              <text
                class="rounded-full bg-[#f4eefe] px-[16rpx] py-[8rpx] text-[20rpx] text-[#8b5cf6]"
              >
                {{ profileData?.services.certification.ownerCertification.statusText || '立即申请' }}
              </text>
              <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
            </view>
          </view>

          <!-- 消息通知 -->
          <!-- <view class="flex items-center justify-between" @tap="goToNotifications">
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-material-symbols-notifications text-[36rpx] text-[#8b5cf6]" />
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
                :class="profileData?.services.notifications.enabled ? 'bg-[#8b5cf6]' : 'bg-gray-300'"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="profileData?.services.notifications.enabled ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view> -->
        </view>
      </view>

      <!-- 设置 -->
      <view class="mb-[48rpx] border border-white/50 rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
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
                <text class="i-solar:user-circle-bold text-[36rpx] text-[#6366F1]" />
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
            <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
          </view>

          <!-- 联系客服 -->
          <view class="relative flex items-center justify-between">
            <button open-type="contact" class="absolute inset-0 z-1 opacity-0">
              联系客服
            </button>
            <view class="relative z-1 flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center border border-gray-100 rounded-[24rpx] bg-white">
                <text class="i-solar:headphones-round-sound-bold text-[36rpx] text-[#8b5cf6]" />
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
            <text class="i-solar:alt-arrow-right-bold text-[32rpx] text-gray-400" />
          </view>

          <!-- 关于我们 -->
          <!-- <view class="flex items-center justify-between" @tap="goToAbout">
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
          </view> -->
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="profileData?.userInfo" class="pb-[48rpx]">
        <view
          class="w-full border border-red-200 rounded-[28rpx] bg-red-50 py-[24rpx] text-center text-[28rpx] text-red-600 font-medium transition-all active:scale-98"
          @tap="handleLogout"
        >
          退出登录
        </view>
      </view>

      <view class="h-[1rpx]" />
    </view>
  </view>
</template>
