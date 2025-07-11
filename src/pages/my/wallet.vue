<script setup lang="ts">
import { onMounted, ref } from 'vue'
import WalletHead from '@/components/page/my/wallet/Head.vue'

// 钱包数据
const walletData = ref({
  balance: 128.50,
  points: 2680,
  coupons: {
    available: 5,
    used: 12,
    expired: 3,
  },
})

// 优惠券列表
const coupons = ref([
  {
    id: 1,
    title: '新用户专享',
    description: '首次租车立减',
    amount: 50,
    type: 'discount',
    status: 'available',
    expireDate: '2024-12-31',
    conditions: '满200元可用',
    scope: '全场通用',
  },
  {
    id: 2,
    title: '周末特惠',
    description: '周末租车优惠',
    amount: 30,
    type: 'discount',
    status: 'available',
    expireDate: '2024-03-15',
    conditions: '满100元可用',
    scope: '仅限周末',
  },
  {
    id: 3,
    title: '月租专享',
    description: '月租订单优惠',
    amount: 100,
    type: 'discount',
    status: 'available',
    expireDate: '2024-06-30',
    conditions: '仅限月租订单',
    scope: '月租车型',
  },
  {
    id: 4,
    title: '春节大礼包',
    description: '节日专属优惠',
    amount: 80,
    type: 'discount',
    status: 'used',
    expireDate: '2024-02-18',
    conditions: '满300元可用',
    scope: '全场通用',
    usedDate: '2024-01-20',
  },
  {
    id: 5,
    title: '限时特惠',
    description: '限时优惠券',
    amount: 20,
    type: 'discount',
    status: 'expired',
    expireDate: '2024-01-31',
    conditions: '满50元可用',
    scope: '全场通用',
  },
])

const activeTab = ref<'available' | 'used' | 'expired'>('available')
const loading = ref(false)

// 获取优惠券状态样式
function getCouponStatusStyle(status: string) {
  const statusMap: Record<string, { text: string, class: string, bgClass: string }> = {
    available: {
      text: '可使用',
      class: 'text-green-600',
      bgClass: 'bg-gradient-to-r from-orange-400 to-orange-500',
    },
    used: {
      text: '已使用',
      class: 'text-gray-500',
      bgClass: 'bg-gray-300',
    },
    expired: {
      text: '已过期',
      class: 'text-red-500',
      bgClass: 'bg-gray-300',
    },
  }
  return statusMap[status] || statusMap.available
}

// 筛选优惠券
const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => coupon.status === activeTab.value)
})

// 切换标签
function switchTab(tab: 'available' | 'used' | 'expired') {
  activeTab.value = tab
}

// 使用优惠券
function useCoupon(couponId: number) {
  const coupon = coupons.value.find(c => c.id === couponId)
  if (coupon?.status === 'available') {
    uni.showModal({
      title: '使用优惠券',
      content: `确定要使用 ${coupon.title} 优惠券吗？`,
      success: (res) => {
        if (res.confirm) {
          // 这里应该跳转到选择车辆或订单页面
          uni.showToast({
            title: '请先选择车辆',
            icon: 'none',
          })
        }
      },
    })
  }
}

// 充值余额
function recharge() {
  uni.showActionSheet({
    itemList: ['充值50元', '充值100元', '充值200元', '充值500元', '自定义金额'],
    success: (res) => {
      const amounts = [50, 100, 200, 500]
      if (res.tapIndex < 4) {
        const amount = amounts[res.tapIndex]
        uni.showModal({
          title: '确认充值',
          content: `确定要充值 ${amount} 元吗？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 模拟充值
              walletData.value.balance += amount
              uni.showToast({
                title: '充值成功',
                icon: 'success',
              })
            }
          },
        })
      }
      else {
        // 自定义金额
        uni.showToast({
          title: '跳转充值页面',
          icon: 'none',
        })
      }
    },
  })
}

// 积分兑换
function exchangePoints() {
  uni.showActionSheet({
    itemList: ['兑换5元优惠券 (500积分)', '兑换10元优惠券 (1000积分)', '兑换20元优惠券 (2000积分)'],
    success: (res) => {
      const exchanges = [
        { amount: 5, points: 500 },
        { amount: 10, points: 1000 },
        { amount: 20, points: 2000 },
      ]

      const exchange = exchanges[res.tapIndex]
      if (walletData.value.points >= exchange.points) {
        uni.showModal({
          title: '确认兑换',
          content: `确定要用 ${exchange.points} 积分兑换 ${exchange.amount} 元优惠券吗？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              walletData.value.points -= exchange.points
              walletData.value.coupons.available += 1

              uni.showToast({
                title: '兑换成功',
                icon: 'success',
              })
            }
          },
        })
      }
      else {
        uni.showToast({
          title: '积分不足',
          icon: 'error',
        })
      }
    },
  })
}

// 查看优惠券详情
function viewCouponDetail(coupon: any) {
  const statusText = getCouponStatusStyle(coupon.status).text
  let content = `优惠金额：${coupon.amount}元\n使用条件：${coupon.conditions}\n适用范围：${coupon.scope}\n有效期至：${coupon.expireDate}\n状态：${statusText}`

  if (coupon.usedDate) {
    content += `\n使用时间：${coupon.usedDate}`
  }

  uni.showModal({
    title: coupon.title,
    content,
    showCancel: false,
    confirmText: '知道了',
  })
}

// 页面加载时获取数据
onMounted(() => {
  // 这里可以加载真实数据
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <WalletHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 余额和积分卡片 -->
        <view class="rounded-[32rpx] from-purple-600 to-purple-800 bg-gradient-to-r p-[40rpx] text-white">
          <view class="mb-[32rpx]">
            <text class="mb-[8rpx] block text-[24rpx] text-white/80">
              账户余额
            </text>
            <text class="text-[48rpx] font-bold">
              ¥{{ walletData.balance.toFixed(2) }}
            </text>
          </view>

          <view class="flex items-center justify-between">
            <view>
              <text class="mb-[8rpx] block text-[24rpx] text-white/80">
                积分
              </text>
              <text class="text-[32rpx] font-semibold">
                {{ walletData.points.toLocaleString() }}
              </text>
            </view>

            <view class="flex space-x-[16rpx]">
              <view
                class="border border-white/30 rounded-[16rpx] bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm"
                @tap="recharge"
              >
                <text class="text-[24rpx] text-white font-medium">
                  充值
                </text>
              </view>
              <view
                class="border border-white/30 rounded-[16rpx] bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm"
                @tap="exchangePoints"
              >
                <text class="text-[24rpx] text-white font-medium">
                  兑换
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 优惠券概览 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-confirmation-number text-[40rpx] text-orange-600" />
            <text class="text-[32rpx] text-black font-semibold">
              优惠券
            </text>
          </view>

          <view class="grid grid-cols-3 gap-[24rpx]">
            <view class="rounded-[16rpx] bg-orange-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-orange-600 font-bold">
                {{ walletData.coupons.available }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                可使用
              </text>
            </view>
            <view class="rounded-[16rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-gray-600 font-bold">
                {{ walletData.coupons.used }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                已使用
              </text>
            </view>
            <view class="rounded-[16rpx] bg-red-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-red-600 font-bold">
                {{ walletData.coupons.expired }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                已过期
              </text>
            </view>
          </view>
        </view>

        <!-- 优惠券切换栏 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex rounded-xl bg-gray-100 p-[8rpx] space-x-[8rpx]">
              <view
                class="flex-1 rounded-lg px-[24rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-200"
                :class="activeTab === 'available' ? 'bg-orange-600 text-white' : 'text-gray-600'"
                @tap="switchTab('available')"
              >
                可使用
              </view>
              <view
                class="flex-1 rounded-lg px-[24rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-200"
                :class="activeTab === 'used' ? 'bg-orange-600 text-white' : 'text-gray-600'"
                @tap="switchTab('used')"
              >
                已使用
              </view>
              <view
                class="flex-1 rounded-lg px-[24rpx] py-[12rpx] text-center text-[26rpx] font-medium transition-all duration-200"
                :class="activeTab === 'expired' ? 'bg-orange-600 text-white' : 'text-gray-600'"
                @tap="switchTab('expired')"
              >
                已过期
              </view>
            </view>
          </view>

          <!-- 优惠券列表 -->
          <view class="p-[32rpx]">
            <view v-if="filteredCoupons.length === 0" class="py-[80rpx] text-center">
              <text class="i-material-symbols-inbox mb-[16rpx] block text-[80rpx] text-gray-400" />
              <text class="text-[28rpx] text-gray-500">
                暂无{{ activeTab === 'available' ? '可用' : activeTab === 'used' ? '已使用' : '过期' }}优惠券
              </text>
            </view>

            <view v-else class="space-y-[24rpx]">
              <view
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="relative overflow-hidden border border-gray-100 rounded-[24rpx] shadow-sm"
                @tap="viewCouponDetail(coupon)"
              >
                <!-- 优惠券主体 -->
                <view class="flex">
                  <!-- 左侧金额区域 -->
                  <view
                    class="relative w-[160rpx] flex flex-col items-center justify-center text-white"
                    :class="getCouponStatusStyle(coupon.status).bgClass"
                  >
                    <text class="text-[36rpx] font-bold">
                      ¥{{ coupon.amount }}
                    </text>
                    <text class="text-[20rpx] opacity-90">
                      {{ coupon.type === 'discount' ? '优惠券' : '代金券' }}
                    </text>

                    <!-- 右侧锯齿边 -->
                    <view class="absolute h-[16rpx] w-[16rpx] rounded-full bg-gray-50 -right-[8rpx]" />
                  </view>

                  <!-- 右侧信息区域 -->
                  <view class="flex-1 bg-white p-[24rpx]">
                    <view class="mb-[16rpx] flex items-start justify-between">
                      <view class="flex-1">
                        <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
                          {{ coupon.title }}
                        </text>
                        <text class="text-[24rpx] text-gray-600">
                          {{ coupon.description }}
                        </text>
                      </view>
                      <text
                        class="rounded-full px-[12rpx] py-[4rpx] text-[20rpx]"
                        :class="`${getCouponStatusStyle(coupon.status).class} bg-gray-100`"
                      >
                        {{ getCouponStatusStyle(coupon.status).text }}
                      </text>
                    </view>

                    <view class="text-[22rpx] text-gray-500 space-y-[8rpx]">
                      <text class="block">
                        使用条件：{{ coupon.conditions }}
                      </text>
                      <text class="block">
                        适用范围：{{ coupon.scope }}
                      </text>
                      <view class="flex items-center justify-between">
                        <text>有效期至：{{ coupon.expireDate }}</text>
                        <view
                          v-if="coupon.status === 'available'"
                          class="rounded-[12rpx] bg-orange-600 px-[16rpx] py-[8rpx] text-[20rpx] text-white"
                          @tap.stop="useCoupon(coupon.id)"
                        >
                          立即使用
                        </view>
                      </view>
                    </view>

                    <!-- 已使用时间 -->
                    <text v-if="coupon.usedDate" class="mt-[8rpx] block text-[22rpx] text-gray-400">
                      使用时间：{{ coupon.usedDate }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 使用说明 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-info text-[36rpx] text-blue-600" />
            <text class="text-[32rpx] text-black font-semibold">
              使用说明
            </text>
          </view>

          <view class="text-[26rpx] text-gray-700 space-y-[16rpx]">
            <text class="block">
              • 优惠券使用前请仔细阅读使用条件
            </text>
            <text class="block">
              • 每笔订单仅可使用一张优惠券
            </text>
            <text class="block">
              • 优惠券不可与其他活动同时使用
            </text>
            <text class="block">
              • 过期优惠券将自动失效，不可退换
            </text>
            <text class="block">
              • 积分可兑换优惠券，兑换后立即生效
            </text>
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
