<script setup lang="ts">
import { ref } from 'vue'
import AboutHead from '@/components/page/my/about/Head.vue'

// 公司信息
const companyInfo = ref({
  name: '智享出行',
  founded: '2020年',
  version: '2.1.0',
  slogan: '让出行更智能，让生活更美好',
  description: '智享出行是一家专注于智能出行服务的科技公司，致力于为用户提供便捷、安全、高效的出行解决方案。我们通过创新的技术和优质的服务，让每一次出行都成为美好的体验。',
})

// 核心价值观
const coreValues = ref([
  {
    icon: 'security',
    title: '安全第一',
    description: '严格的车辆检测和保险保障',
    color: 'text-green-600',
  },
  {
    icon: 'speed',
    title: '高效便捷',
    description: '智能匹配，快速响应用户需求',
    color: 'text-blue-600',
  },
  {
    icon: 'favorite',
    title: '用户至上',
    description: '以用户体验为核心的服务理念',
    color: 'text-red-600',
  },
  {
    icon: 'eco',
    title: '绿色环保',
    description: '推广共享出行，减少碳排放',
    color: 'text-purple-600',
  },
])

// 发展历程
const milestones = ref([
  {
    year: '2020',
    title: '公司成立',
    description: '智享出行正式成立，开始专注于智能出行领域',
  },
  {
    year: '2021',
    title: '业务拓展',
    description: '推出车辆租赁服务，覆盖10个主要城市',
  },
  {
    year: '2022',
    title: '技术升级',
    description: '引入AI智能匹配系统，提升用户体验',
  },
  {
    year: '2023',
    title: '平台扩张',
    description: '用户突破100万，服务范围扩展至全国',
  },
  {
    year: '2024',
    title: '持续创新',
    description: '推出新能源车辆共享，打造绿色出行生态',
  },
])

// 团队成员
const teamMembers = ref([
  {
    name: '张总',
    position: 'CEO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150',
    description: '10年出行行业经验，致力于智能出行生态建设',
  },
  {
    name: '李总',
    position: 'CTO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150',
    description: '技术专家，专注于AI和大数据应用',
  },
  {
    name: '王总',
    position: 'COO',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c9cc?w=150&h=150',
    description: '运营专家，负责全国业务拓展和运营管理',
  },
])

// 联系方式
const contactInfo = ref({
  phone: '400-800-8888',
  email: 'contact@zhixiang.com',
  address: '北京市朝阳区智享大厦888号',
  website: 'https://www.zhixiang.com',
  wechat: 'zhixiang_official',
})

// 法律信息
const legalInfo = ref([
  { label: '隐私政策', action: () => showPrivacyPolicy() },
  { label: '用户协议', action: () => showUserAgreement() },
  { label: '服务条款', action: () => showServiceTerms() },
  { label: '免责声明', action: () => showDisclaimer() },
])

// 显示隐私政策
function showPrivacyPolicy() {
  uni.showModal({
    title: '隐私政策',
    content: '我们承诺保护您的个人隐私安全，详细政策请访问官网查看。',
    showCancel: false,
  })
}

// 显示用户协议
function showUserAgreement() {
  uni.showModal({
    title: '用户协议',
    content: '使用本应用即表示您同意我们的用户协议，详细条款请访问官网查看。',
    showCancel: false,
  })
}

// 显示服务条款
function showServiceTerms() {
  uni.showModal({
    title: '服务条款',
    content: '请仔细阅读我们的服务条款，详细内容请访问官网查看。',
    showCancel: false,
  })
}

// 显示免责声明
function showDisclaimer() {
  uni.showModal({
    title: '免责声明',
    content: '本应用提供的信息仅供参考，详细声明请访问官网查看。',
    showCancel: false,
  })
}

// 复制联系方式
function copyContact(type: 'phone' | 'email' | 'wechat', value: string) {
  uni.setClipboardData({
    data: value,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success',
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'error',
      })
    },
  })
}

// 打开官网
function openWebsite() {
  uni.showModal({
    title: '访问官网',
    content: '是否要在浏览器中打开官网？',
    success: (res) => {
      if (res.confirm) {
        // 在小程序中可能需要通过其他方式处理
        uni.showToast({
          title: '即将跳转到官网',
          icon: 'success',
        })
      }
    },
  })
}

// 检查更新
function checkUpdate() {
  uni.showLoading({
    title: '检查中...',
  })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '已是最新版本',
      icon: 'success',
    })
  }, 1500)
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <AboutHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 公司简介 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] text-center shadow-sm">
          <image
            src="/static/logo.svg"
            class="mx-auto mb-[24rpx] h-[120rpx] w-[120rpx]"
            mode="aspectFit"
          />
          <text class="mb-[16rpx] block text-[36rpx] text-black font-bold">
            {{ companyInfo.name }}
          </text>
          <text class="mb-[24rpx] block text-[24rpx] text-purple-600 font-medium">
            {{ companyInfo.slogan }}
          </text>
          <text class="text-[26rpx] text-gray-700 leading-relaxed">
            {{ companyInfo.description }}
          </text>

          <view class="mt-[32rpx] flex items-center justify-center border-t border-gray-100 pt-[24rpx] space-x-[48rpx]">
            <view class="text-center">
              <text class="block text-[32rpx] text-purple-600 font-bold">
                {{ companyInfo.founded }}
              </text>
              <text class="text-[24rpx] text-gray-500">
                成立时间
              </text>
            </view>
            <view class="text-center">
              <text class="block text-[32rpx] text-purple-600 font-bold">
                100万+
              </text>
              <text class="text-[24rpx] text-gray-500">
                注册用户
              </text>
            </view>
            <view class="text-center">
              <text class="block text-[32rpx] text-purple-600 font-bold">
                50+
              </text>
              <text class="text-[24rpx] text-gray-500">
                覆盖城市
              </text>
            </view>
          </view>
        </view>

        <!-- 核心价值观 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-diamond text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                核心价值观
              </text>
            </view>
          </view>

          <view class="grid grid-cols-2 gap-[24rpx] p-[32rpx]">
            <view
              v-for="value in coreValues"
              :key="value.title"
              class="border border-gray-100 rounded-[24rpx] p-[24rpx] text-center"
            >
              <text :class="`i-material-symbols-${value.icon} ${value.color} text-[48rpx] block mb-[16rpx]`" />
              <text class="mb-[8rpx] block text-[26rpx] text-black font-semibold">
                {{ value.title }}
              </text>
              <text class="text-[22rpx] text-gray-600 leading-relaxed">
                {{ value.description }}
              </text>
            </view>
          </view>
        </view>

        <!-- 发展历程 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-timeline text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                发展历程
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <view
              v-for="(milestone, index) in milestones"
              :key="milestone.year"
              class="flex items-start space-x-[24rpx]"
            >
              <view class="flex flex-col items-center">
                <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-purple-600">
                  <text class="text-[24rpx] text-white font-bold">
                    {{ milestone.year }}
                  </text>
                </view>
                <view
                  v-if="index < milestones.length - 1"
                  class="mt-[16rpx] h-[64rpx] w-[2rpx] bg-gray-300"
                />
              </view>

              <view class="flex-1 pb-[32rpx]">
                <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
                  {{ milestone.title }}
                </text>
                <text class="text-[26rpx] text-gray-700 leading-relaxed">
                  {{ milestone.description }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 团队介绍 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-groups text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                核心团队
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <view
              v-for="member in teamMembers"
              :key="member.name"
              class="flex items-center border border-gray-100 rounded-[24rpx] p-[24rpx] space-x-[24rpx]"
            >
              <view class="h-[120rpx] w-[120rpx] flex-shrink-0 overflow-hidden rounded-full">
                <image
                  :src="member.avatar"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>

              <view class="flex-1">
                <view class="mb-[8rpx] flex items-center space-x-[16rpx]">
                  <text class="text-[28rpx] text-black font-semibold">
                    {{ member.name }}
                  </text>
                  <text class="rounded-full bg-purple-100 px-[16rpx] py-[4rpx] text-[20rpx] text-purple-600">
                    {{ member.position }}
                  </text>
                </view>
                <text class="text-[24rpx] text-gray-700 leading-relaxed">
                  {{ member.description }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系我们 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-contact-phone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                联系我们
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[24rpx]">
            <!-- 客服电话 -->
            <view class="flex items-center justify-between" @tap="copyContact('phone', contactInfo.phone)">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-green-100">
                  <text class="i-material-symbols-phone text-[36rpx] text-green-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    客服电话
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    {{ contactInfo.phone }}
                  </text>
                </view>
              </view>
              <text class="text-[22rpx] text-purple-600">
                点击复制
              </text>
            </view>

            <!-- 邮箱地址 -->
            <view class="flex items-center justify-between" @tap="copyContact('email', contactInfo.email)">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-blue-100">
                  <text class="i-material-symbols-email text-[36rpx] text-blue-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    邮箱地址
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    {{ contactInfo.email }}
                  </text>
                </view>
              </view>
              <text class="text-[22rpx] text-purple-600">
                点击复制
              </text>
            </view>

            <!-- 公司地址 -->
            <view class="flex items-center space-x-[24rpx]">
              <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-orange-100">
                <text class="i-material-symbols-location-on text-[36rpx] text-orange-600" />
              </view>
              <view class="flex-1">
                <text class="block text-[28rpx] text-black font-medium">
                  公司地址
                </text>
                <text class="text-[24rpx] text-gray-500">
                  {{ contactInfo.address }}
                </text>
              </view>
            </view>

            <!-- 官方微信 -->
            <view class="flex items-center justify-between" @tap="copyContact('wechat', contactInfo.wechat)">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-purple-100">
                  <text class="i-material-symbols-wechat text-[36rpx] text-purple-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    官方微信
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    {{ contactInfo.wechat }}
                  </text>
                </view>
              </view>
              <text class="text-[22rpx] text-purple-600">
                点击复制
              </text>
            </view>

            <!-- 官方网站 -->
            <view class="flex items-center justify-between" @tap="openWebsite">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx] bg-gray-100">
                  <text class="i-material-symbols-language text-[36rpx] text-gray-600" />
                </view>
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    官方网站
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    {{ contactInfo.website }}
                  </text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>
        </view>

        <!-- 法律信息 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-gavel text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                法律信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[16rpx]">
            <view
              v-for="item in legalInfo"
              :key="item.label"
              class="flex items-center justify-between py-[16rpx]"
              @tap="item.action"
            >
              <text class="text-[28rpx] text-black font-medium">
                {{ item.label }}
              </text>
              <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
            </view>
          </view>
        </view>

        <!-- 版本信息 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-info text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                版本信息
              </text>
            </view>
            <view
              class="border border-purple-600 rounded-[16rpx] px-[24rpx] py-[8rpx] text-[24rpx] text-purple-600"
              @tap="checkUpdate"
            >
              检查更新
            </view>
          </view>

          <view class="flex items-center justify-between">
            <text class="text-[28rpx] text-gray-700">
              当前版本
            </text>
            <text class="text-[28rpx] text-black font-medium">
              v{{ companyInfo.version }}
            </text>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
