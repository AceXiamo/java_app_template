<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import WalletHead from '@/components/page/my/wallet/Head.vue'
import { type CouponStats, type UserCoupon, getCouponStats, getUserCoupons, redeemCoupon } from '@/api/coupon'

// 优惠券统计数据
const couponStats = ref<CouponStats>({
  available: 0,
  used: 0,
  expired: 0,
})

// 优惠券列表
const coupons = ref<UserCoupon[]>([])

const activeTab = ref<'available' | 'used' | 'expired'>('available')

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

// 筛选优惠券（由于我们根据activeTab加载数据，这里直接返回）
const filteredCoupons = computed(() => {
  return coupons.value
})

// 切换标签
async function switchTab(tab: 'available' | 'used' | 'expired') {
  activeTab.value = tab
  await loadCoupons()
}

// 使用优惠券
function useCoupon(userCouponId: number) {
  const coupon = coupons.value.find(c => c.userCouponId === userCouponId)
  if (coupon?.status === 'available') {
    uni.showModal({
      title: '使用优惠券',
      content: `确定要使用 ${coupon.couponName} 优惠券吗？`,
      success: (res) => {
        if (res.confirm) {
          // 跳转到车辆列表页面
          uni.navigateTo({
            url: '/pages/cars/index',
          })
        }
      },
    })
  }
}

// 兑换码兑换优惠券
async function redeemCouponByCode() {
  uni.showModal({
    title: '兑换优惠券',
    content: '',
    editable: true,
    placeholderText: '请输入兑换码',
    success: async (res) => {
      if (res.confirm && res.content) {
        const redeemCode = res.content.trim()
        if (redeemCode) {
          try {
            uni.showLoading({
              title: '兑换中...',
            })
            const response = await redeemCoupon({ redeemCode })
            if (response.code === 200) {
              uni.showToast({
                title: '兑换成功',
                icon: 'success',
              })
              // 重新加载数据
              await loadCouponData()
            }
            else {
              uni.showToast({
                title: response.msg || '兑换失败',
                icon: 'error',
              })
            }
          }
          catch (error) {
            console.error('兑换优惠券失败:', error)
            uni.showToast({
              title: '兑换失败，请重试',
              icon: 'error',
            })
          }
          finally {
            uni.hideLoading()
          }
        }
        else {
          uni.showToast({
            title: '请输入有效的兑换码',
            icon: 'error',
          })
        }
      }
    },
  })
}

// 查看优惠券详情
function viewCouponDetail(coupon: UserCoupon) {
  const statusText = getCouponStatusStyle(coupon.status).text
  const expireDate = new Date(coupon.expireTime).toLocaleDateString()
  let content = `优惠金额：${coupon.discountAmount}元\n最低消费：满${coupon.minAmount}元可用\n适用范围：${coupon.applicableType === 'all' ? '全场通用' : coupon.applicableType === 'daily' ? '仅限日租' : '仅限月租'}\n有效期至：${expireDate}\n状态：${statusText}`

  if (coupon.usedTime) {
    const usedDate = new Date(coupon.usedTime).toLocaleDateString()
    content += `\n使用时间：${usedDate}`
  }

  uni.showModal({
    title: coupon.couponName,
    content,
    showCancel: false,
    confirmText: '知道了',
  })
}

// 加载优惠券统计数据
async function loadCouponStats() {
  try {
    const response = await getCouponStats()
    if (response.code === 200 && response.data) {
      couponStats.value = response.data
    }
  }
  catch (error) {
    console.error('加载优惠券统计失败:', error)
  }
}

// 加载优惠券列表
async function loadCoupons() {
  try {
    uni.showLoading({
      title: '加载中...',
    })
    const response = await getUserCoupons({
      status: activeTab.value,
      pageNum: 1,
      pageSize: 50,
    })
    if (response.code === 200 && response.rows) {
      coupons.value = response.rows
    }
  }
  catch (error) {
    console.error('加载优惠券列表失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'error',
    })
  }
  finally {
    uni.hideLoading()
  }
}

// 加载所有数据
async function loadCouponData() {
  await Promise.all([
    loadCouponStats(),
    loadCoupons(),
  ])
}

// 页面加载时获取数据
onMounted(() => {
  loadCouponData()
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <WalletHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 优惠券头部卡片 -->
        <view class="rounded-[32rpx] from-orange-500 to-orange-600 bg-gradient-to-r p-[40rpx] text-white">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view>
              <text class="mb-[8rpx] block text-[28rpx] text-white/90">
                我的优惠券
              </text>
              <text class="text-[48rpx] font-bold">
                {{ couponStats.available }}
              </text>
              <text class="ml-[8rpx] text-[24rpx] text-white/80">
                张可用
              </text>
            </view>

            <view class="flex flex-col items-end space-y-[8rpx]">
              <view
                class="border border-white/30 rounded-[16rpx] bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm"
                @tap="redeemCouponByCode"
              >
                <text class="text-[24rpx] text-white font-medium">
                  兑换码
                </text>
              </view>
              <text class="text-[20rpx] text-white/70">
                输入兑换码获取优惠券
              </text>
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
                {{ couponStats.available }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                可使用
              </text>
            </view>
            <view class="rounded-[16rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-gray-600 font-bold">
                {{ couponStats.used }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                已使用
              </text>
            </view>
            <view class="rounded-[16rpx] bg-red-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-red-600 font-bold">
                {{ couponStats.expired }}
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
            <view v-if="filteredCoupons.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
              <text class="i-material-symbols-inbox mb-[16rpx] block text-[80rpx] text-gray-400" />
              <text class="text-[28rpx] text-gray-500">
                暂无{{ activeTab === 'available' ? '可用' : activeTab === 'used' ? '已使用' : '过期' }}优惠券
              </text>
            </view>

            <view v-else class="space-y-[24rpx]">
              <view
                v-for="coupon in filteredCoupons"
                :key="coupon.userCouponId"
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
                      ¥{{ coupon.discountAmount }}
                    </text>
                    <text class="text-[20rpx] opacity-90">
                      {{ coupon.couponType === 'discount' ? '优惠券' : '代金券' }}
                    </text>

                    <!-- 右侧锯齿边 -->
                    <view class="absolute h-[16rpx] w-[16rpx] rounded-full bg-gray-50 -right-[8rpx]" />
                  </view>

                  <!-- 右侧信息区域 -->
                  <view class="flex-1 bg-white p-[24rpx]">
                    <view class="mb-[16rpx] flex items-start justify-between">
                      <view class="flex-1">
                        <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
                          {{ coupon.couponName }}
                        </text>
                        <text class="text-[24rpx] text-gray-600">
                          来源：{{ coupon.source }}
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
                        使用条件：满{{ coupon.minAmount }}元可用
                      </text>
                      <text class="block">
                        适用范围：{{ coupon.applicableType === 'all' ? '全场通用' : coupon.applicableType === 'daily' ? '仅限日租' : '仅限月租' }}
                      </text>
                      <view class="flex items-center justify-between">
                        <text>有效期至：{{ new Date(coupon.expireTime).toLocaleDateString() }}</text>
                        <view
                          v-if="coupon.status === 'available'"
                          class="rounded-[12rpx] bg-orange-600 px-[16rpx] py-[8rpx] text-[20rpx] text-white"
                          @tap.stop="useCoupon(coupon.userCouponId)"
                        >
                          立即使用
                        </view>
                      </view>
                    </view>

                    <!-- 已使用时间 -->
                    <text v-if="coupon.usedTime" class="mt-[8rpx] block text-[22rpx] text-gray-400">
                      使用时间：{{ new Date(coupon.usedTime).toLocaleDateString() }}
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
              • 可通过兑换码获取优惠券，兑换后立即生效
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
