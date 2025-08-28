<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <DepositHead title="信用管理" />
    
    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 信用总览 -->
        <view class="rounded-[32rpx] from-green-500 to-green-600 bg-gradient-to-r p-[40rpx] text-white">
          <view class="mb-[24rpx] text-center">
            <text class="mb-[16rpx] block text-[32rpx] text-white font-bold">
              信用总分
            </text>
            <text class="text-[64rpx] font-bold">
              {{ totalCreditScore }}
            </text>
            <text class="mt-[8rpx] block text-[24rpx] text-white/80">
              最高信用分
            </text>
          </view>
          
          <view class="grid grid-cols-2 gap-[24rpx]">
            <view class="rounded-[16rpx] bg-white/20 p-[24rpx] text-center backdrop-blur-sm">
              <text class="mb-[8rpx] block text-[36rpx] text-white font-bold">
                ¥{{ formatAmount(maxDeductionAmount) }}
              </text>
              <text class="text-[20rpx] text-white/80">
                最高抵扣
              </text>
            </view>
            <view class="rounded-[16rpx] bg-white/20 p-[24rpx] text-center backdrop-blur-sm">
              <text class="mb-[8rpx] block text-[36rpx] text-white font-bold">
                {{ usedCreditCount }}
              </text>
              <text class="text-[20rpx] text-white/80">
                使用次数
              </text>
            </view>
          </view>
        </view>

        <!-- 信用详情卡片 -->
        <view class="space-y-[24rpx]">
          <!-- 微信支付分 -->
          <view class="rounded-[32rpx] bg-white shadow-sm">
            <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[16rpx]">
                  <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[16rpx] bg-green-100">
                    <text class="i-material-symbols-wechat text-[32rpx] text-green-600" />
                  </view>
                  <view>
                    <text class="block text-[28rpx] text-black font-semibold">
                      微信支付分
                    </text>
                    <text class="text-[22rpx] text-gray-500">
                      {{ creditInfo?.creditSyncTime ? formatTime(creditInfo.creditSyncTime) : '未同步' }}
                    </text>
                  </view>
                </view>
                
                <view class="text-right">
                  <text class="block text-[36rpx] text-green-600 font-bold">
                    {{ creditInfo?.wechatScore || '--' }}
                  </text>
                  <text class="text-[20rpx] text-green-600">分</text>
                </view>
              </view>
            </view>
            
            <view class="p-[32rpx]">
              <view class="mb-[24rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-700">
                  可抵扣金额
                </text>
                <text class="text-[28rpx] text-orange-600 font-semibold">
                  ¥{{ formatAmount(creditInfo?.wechatDeduction || 0) }}
                </text>
              </view>
              
              <button 
                class="w-full border border-green-600 rounded-[16rpx] py-[20rpx] text-center"
                :class="syncingWechat ? 'opacity-50' : ''"
                :disabled="syncingWechat"
                @tap="syncCredit('wechat')"
              >
                <text class="text-[24rpx] text-green-600 font-medium">
                  {{ syncingWechat ? '同步中...' : '同步微信支付分' }}
                </text>
              </button>
              
              <text class="mt-[16rpx] block text-[20rpx] text-gray-500 text-center">
                * 需要授权微信支付分服务
              </text>
            </view>
          </view>

          <!-- 芝麻信用 -->
          <view class="rounded-[32rpx] bg-white shadow-sm">
            <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[16rpx]">
                  <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[16rpx] bg-orange-100">
                    <text class="i-material-symbols-star text-[32rpx] text-orange-600" />
                  </view>
                  <view>
                    <text class="block text-[28rpx] text-black font-semibold">
                      芝麻信用分
                    </text>
                    <text class="text-[22rpx] text-gray-500">
                      {{ creditInfo?.creditSyncTime ? formatTime(creditInfo.creditSyncTime) : '未同步' }}
                    </text>
                  </view>
                </view>
                
                <view class="text-right">
                  <text class="block text-[36rpx] text-orange-600 font-bold">
                    {{ creditInfo?.sesameScore || '--' }}
                  </text>
                  <text class="text-[20rpx] text-orange-600">分</text>
                </view>
              </view>
            </view>
            
            <view class="p-[32rpx]">
              <view class="mb-[24rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-700">
                  可抵扣金额
                </text>
                <text class="text-[28rpx] text-orange-600 font-semibold">
                  ¥{{ formatAmount(creditInfo?.sesameDeduction || 0) }}
                </text>
              </view>
              
              <button 
                class="w-full border border-orange-600 rounded-[16rpx] py-[20rpx] text-center"
                :class="syncingSesame ? 'opacity-50' : ''"
                :disabled="syncingSesame"
                @tap="syncCredit('sesame')"
              >
                <text class="text-[24rpx] text-orange-600 font-medium">
                  {{ syncingSesame ? '同步中...' : '同步芝麻信用分' }}
                </text>
              </button>
              
              <text class="mt-[16rpx] block text-[20rpx] text-gray-500 text-center">
                * 需要授权芝麻信用服务
              </text>
            </view>
          </view>
        </view>

        <!-- 信用抵扣规则 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-rule text-[36rpx] text-blue-600" />
              <text class="text-[28rpx] text-black font-semibold">
                抵扣规则
              </text>
            </view>
          </view>
          
          <view class="p-[32rpx]">
            <view class="space-y-[24rpx]">
              <view v-for="rule in creditRules" :key="rule.ruleId" class="flex items-center justify-between">
                <view>
                  <text class="block text-[24rpx] text-black font-medium">
                    {{ rule.creditType === 'wechat' ? '微信支付分' : '芝麻信用分' }}
                  </text>
                  <text class="text-[22rpx] text-gray-500">
                    {{ rule.minScore }}-{{ rule.maxScore || '∞' }}分
                  </text>
                </view>
                <text class="text-[24rpx] text-orange-600 font-semibold">
                  抵扣¥{{ formatAmount(rule.deductionAmount) }}
                </text>
              </view>
            </view>
            
            <view class="mt-[32rpx] rounded-[16rpx] bg-blue-50 p-[24rpx]">
              <view class="flex items-start">
                <text class="i-material-symbols-info mr-[12rpx] mt-[4rpx] text-[20rpx] text-blue-600" />
                <view class="text-[22rpx] text-blue-700 space-y-[8rpx]">
                  <text class="block">• 系统会自动选择您的最高信用分进行抵扣</text>
                  <text class="block">• 信用抵扣金额会在下单时自动计算</text>
                  <text class="block">• 保持良好信用记录可享受更高抵扣</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 使用说明 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-help text-[36rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">
              使用说明
            </text>
          </view>
          
          <view class="text-[24rpx] text-gray-700 space-y-[16rpx]">
            <text class="block">
              • 信用分越高，可享受的押金抵扣金额越多
            </text>
            <text class="block">
              • 首次使用需要授权微信支付分或芝麻信用
            </text>
            <text class="block">
              • 信用分会定期更新，建议定期同步最新分数
            </text>
            <text class="block">
              • 信用抵扣不影响正常的还车押金流程
            </text>
            <text class="block">
              • 如有疑问请联系客服获取帮助
            </text>
          </view>
        </view>
        
        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DepositHead from '@/components/page/deposit/Head.vue'
import { 
  getUserCreditInfo,
  syncCreditInfo,
  getCreditDeductionRules,
  formatAmount,
  type UserCreditInfo
} from '@/api/deposit'

const creditInfo = ref<UserCreditInfo>()
const creditRules = ref<any[]>([])
const syncingWechat = ref(false)
const syncingSesame = ref(false)
const usedCreditCount = ref(0) // 这里应该从后端获取

const totalCreditScore = computed(() => {
  const wechatScore = creditInfo.value?.wechatScore || 0
  const sesameScore = creditInfo.value?.sesameScore || 0
  return Math.max(wechatScore, sesameScore)
})

const maxDeductionAmount = computed(() => {
  if (!creditInfo.value) return 0
  const wechatDeduction = creditInfo.value.wechatDeduction || 0
  const sesameDeduction = creditInfo.value.sesameDeduction || 0
  return Math.max(wechatDeduction, sesameDeduction)
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  await Promise.all([
    loadCreditInfo(),
    loadCreditRules()
  ])
}

const loadCreditInfo = async () => {
  try {
    const response = await getUserCreditInfo()
    if (response.data) {
      creditInfo.value = response.data
    }
  } catch (error) {
    console.error('加载信用信息失败:', error)
  }
}

const loadCreditRules = async () => {
  try {
    const response = await getCreditDeductionRules()
    if (response.data) {
      // 合并微信和芝麻信用规则，按抵扣金额排序
      const wechatRules = response.data.wechat || []
      const sesameRules = response.data.sesame || []
      creditRules.value = [...wechatRules, ...sesameRules]
        .sort((a, b) => b.deductionAmount - a.deductionAmount)
    }
  } catch (error) {
    console.error('加载信用规则失败:', error)
  }
}

const syncCredit = async (creditType: 'wechat' | 'sesame') => {
  try {
    if (creditType === 'wechat') {
      syncingWechat.value = true
    } else {
      syncingSesame.value = true
    }
    
    uni.showLoading({
      title: '同步中...'
    })
    
    await syncCreditInfo(creditType)
    await loadCreditInfo()
    
    uni.showToast({
      title: '同步成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('同步信用信息失败:', error)
    uni.showToast({
      title: '同步失败，请重试',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
    if (creditType === 'wechat') {
      syncingWechat.value = false
    } else {
      syncingSesame.value = false
    }
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'numeric', 
    day: 'numeric'
  })
}
</script>

<route lang="yaml">
layout: home
</route>