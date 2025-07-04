<script lang="ts" setup>
import { toRefs } from 'vue'
import { useUserStore } from '@/store/user'

const { userInfo, isLoggedIn } = toRefs(useUserStore())

// 导航方法
function goToProfile() {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

function goToWallet() {
  uni.navigateTo({ url: '/pages/wallet/index' })
}

function goToDocuments() {
  uni.navigateTo({ url: '/pages/documents/index' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

function goToService() {
  uni.navigateTo({ url: '/pages/service/index' })
}

function goToHelp() {
  uni.navigateTo({ url: '/pages/help/index' })
}

function goToAbout() {
  uni.navigateTo({ url: '/pages/about/index' })
}

function doLogin() {
  // userStore.wxLogin()
}

function doLogout() {
  // userStore.logout()
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto bg-gray-50>
    <!-- 顶部个人信息卡片 -->
    <view class="relative from-purple-600 to-purple-800 bg-gradient-to-br p-6 pb-8">
      <!-- 背景装饰 -->
      <view class="absolute inset-0 from-purple-600/80 to-purple-800/80 bg-gradient-to-br" />

      <view class="relative z-10">
        <view v-if="isLoggedIn" class="flex items-center space-x-4">
          <!-- 用户头像 -->
          <view class="h-16 w-16 overflow-hidden border-2 border-white/50 rounded-full bg-white/20">
            <image
              :src="userInfo?.avatar || 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=U'"
              class="h-full w-full object-cover" mode="aspectFill"
            />
          </view>

          <!-- 用户信息 -->
          <view class="flex-1">
            <text class="mb-1 block text-lg text-white font-semibold">
              {{ userInfo?.nickname || '租车用户' }}
            </text>
            <view class="flex items-center space-x-3">
              <view class="flex items-center space-x-1">
                <text class="i-material-symbols-verified text-sm text-green-400" />
                <text class="text-xs text-white/80">
                  已认证
                </text>
              </view>
              <view class="flex items-center space-x-1">
                <text class="i-material-symbols-star text-sm text-yellow-400" />
                <text class="text-xs text-white/80">
                  4.9分
                </text>
              </view>
            </view>
          </view>

          <!-- 设置按钮 -->
          <button @tap="goToSettings">
            <text class="i-material-symbols-settings text-xl text-white/80" />
          </button>
        </view>

        <!-- 未登录状态 -->
        <view v-else class="flex items-center justify-between">
          <view>
            <text class="mb-1 block text-lg text-white font-semibold">
              欢迎使用窍启租车
            </text>
            <text class="text-sm text-white/80">
              登录后享受更多服务
            </text>
          </view>
          <button class="border border-white/30 rounded-full bg-white/20 px-6 py-2 backdrop-blur-sm" @tap="doLogin">
            <text class="text-sm text-white font-medium">
              立即登录
            </text>
          </button>
        </view>
      </view>
    </view>

    <!-- 快捷操作卡片 -->
    <view class="relative z-10 mb-6 px-5 -mt-4">
      <view class="rounded-2xl bg-white p-5 shadow-lg">
        <view class="grid grid-cols-4 gap-4">
          <!-- 钱包 -->
          <view class="flex flex-col cursor-pointer items-center" @tap="goToWallet">
            <view class="mb-2 h-12 w-12 flex items-center justify-center rounded-xl bg-purple-100">
              <text class="i-material-symbols-wallet text-xl text-purple-600" />
            </view>
            <text class="text-xs text-gray-700">
              钱包
            </text>
          </view>

          <!-- 证件 -->
          <view class="flex flex-col cursor-pointer items-center" @tap="goToDocuments">
            <view class="mb-2 h-12 w-12 flex items-center justify-center rounded-xl bg-blue-100">
              <text class="i-material-symbols-badge text-xl text-blue-600" />
            </view>
            <text class="text-xs text-gray-700">
              证件
            </text>
          </view>

          <!-- 客服 -->
          <view class="flex flex-col cursor-pointer items-center" @tap="goToService">
            <view class="mb-2 h-12 w-12 flex items-center justify-center rounded-xl bg-green-100">
              <text class="i-material-symbols-support-agent text-xl text-green-600" />
            </view>
            <text class="text-xs text-gray-700">
              客服
            </text>
          </view>

          <!-- 帮助 -->
          <view class="flex flex-col cursor-pointer items-center" @tap="goToHelp">
            <view class="mb-2 h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
              <text class="i-material-symbols-help text-xl text-orange-600" />
            </view>
            <text class="text-xs text-gray-700">
              帮助
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主要功能列表 -->
    <view class="flex-1 px-5 space-y-6">
      <!-- 个人信息 -->
      <view class="border border-gray-100 rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-100 p-4">
          <text class="text-base text-black font-semibold">
            个人信息
          </text>
        </view>
        <view class="divide-y divide-gray-100">
          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToProfile">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-person text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                个人资料
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
          </button>

          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToDocuments">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-credit-card text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                驾驶证管理
              </text>
            </view>
            <view class="flex items-center space-x-2">
              <text class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
                已认证
              </text>
              <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
            </view>
          </button>
        </view>
      </view>

      <!-- 订单与服务 -->
      <view class="border border-gray-100 rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-100 p-4">
          <text class="text-base text-black font-semibold">
            订单与服务
          </text>
        </view>
        <view class="divide-y divide-gray-100">
          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToWallet">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-account-balance-wallet text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                我的钱包
              </text>
            </view>
            <view class="flex items-center space-x-2">
              <text class="text-xs text-purple-600">
                ¥128.50
              </text>
              <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
            </view>
          </button>

          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToService">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-headset-mic text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                联系客服
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
          </button>

          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToHelp">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-quiz text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                常见问题
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
          </button>
        </view>
      </view>

      <!-- 其他功能 -->
      <view class="border border-gray-100 rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-100 p-4">
          <text class="text-base text-black font-semibold">
            其他
          </text>
        </view>
        <view class="divide-y divide-gray-100">
          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToSettings">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-tune text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                设置
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
          </button>

          <button class="w-full flex items-center justify-between p-4 text-left" @tap="goToAbout">
            <view class="flex items-center space-x-3">
              <text class="i-material-symbols-info text-xl text-gray-600" />
              <text class="text-sm text-gray-900">
                关于我们
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-lg text-gray-400" />
          </button>
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="isLoggedIn" class="pb-6">
        <button
          class="w-full border border-red-200 rounded-xl bg-red-50 py-3 text-sm text-red-600 font-medium"
          @tap="doLogout"
        >
          退出登录
        </button>
      </view>
    </view>
  </view>
</template>
