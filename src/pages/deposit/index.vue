<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import RechargeDialog from '@/components/RechargeDialog.vue'
import WithdrawDialog from '@/components/WithdrawDialog.vue'
import DepositHead from '@/components/page/deposit/Head.vue'
import {
  type DepositTransaction,
  type UserCreditInfo,
  type UserDepositAccount,
  formatAmount,
  getDepositTransactions,
  getTransactionTypeText,
  getUserCreditInfo,
  getUserDepositAccount,
} from '@/api/deposit'

const accountInfo = ref<UserDepositAccount>()
const creditInfo = ref<UserCreditInfo>()
const recentTransactions = ref<DepositTransaction[]>([])
const balanceVisible = ref(true)
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)
const loading = reactive({
  account: false,
  transactions: false,
  credit: false,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  await Promise.all([
    loadAccountInfo(),
    loadRecentTransactions(),
    loadCreditInfo(),
  ])
}

async function loadAccountInfo() {
  try {
    loading.account = true
    const response = await getUserDepositAccount()
    if (response.data) {
      accountInfo.value = response.data
    }
  }
  catch (error) {
    console.error('加载账户信息失败:', error)
  }
  finally {
    loading.account = false
  }
}

async function loadRecentTransactions() {
  try {
    loading.transactions = true
    const response = await getDepositTransactions({ current: 1, size: 5 })
    if (response.data?.records) {
      recentTransactions.value = response.data.records
    }
  }
  catch (error) {
    console.error('加载交易记录失败:', error)
  }
  finally {
    loading.transactions = false
  }
}

async function loadCreditInfo() {
  try {
    loading.credit = true
    const response = await getUserCreditInfo()
    if (response.data) {
      creditInfo.value = response.data
    }
  }
  catch (error) {
    console.error('加载信用信息失败:', error)
  }
  finally {
    loading.credit = false
  }
}

function toggleBalanceVisible() {
  balanceVisible.value = !balanceVisible.value
}

function handleRecharge() {
  showRechargeDialog.value = true
}

function handleWithdraw() {
  if (!accountInfo.value?.availableAmount || accountInfo.value.availableAmount <= 0) {
    uni.showToast({
      title: '可提现余额不足',
      icon: 'none',
    })
    return
  }
  showWithdrawDialog.value = true
}

function handleRechargeSuccess() {
  loadData()
  uni.showToast({
    title: '充值成功',
    icon: 'success',
  })
}

function handleWithdrawSuccess() {
  loadData()
  uni.showToast({
    title: '提现申请已提交',
    icon: 'success',
  })
}

function getTransactionMaterialIcon(type: string) {
  switch (type) {
    case 'recharge': return 'i-material-symbols-add-circle text-green-600'
    case 'withdraw': return 'i-material-symbols-remove-circle text-red-600'
    case 'freeze': return 'i-material-symbols-lock text-orange-600'
    case 'unfreeze': return 'i-material-symbols-lock-open text-blue-600'
    case 'deduct': return 'i-material-symbols-remove text-gray-600'
    default: return 'i-material-symbols-receipt text-gray-600'
  }
}

function getTransactionIconClass(type: string) {
  switch (type) {
    case 'recharge': return 'bg-green-100'
    case 'withdraw': return 'bg-red-100'
    case 'freeze': return 'bg-orange-100'
    case 'unfreeze': return 'bg-blue-100'
    case 'deduct': return 'bg-gray-100'
    default: return 'bg-gray-100'
  }
}

function getTransactionAmountClass(type: string) {
  switch (type) {
    case 'recharge':
    case 'unfreeze':
      return 'text-green-600'
    case 'withdraw':
    case 'freeze':
    case 'deduct':
      return 'text-red-600'
    default:
      return 'text-gray-900'
  }
}

function formatTransactionAmount(type: string, amount: number) {
  const formattedAmount = formatAmount(amount)
  switch (type) {
    case 'recharge':
    case 'unfreeze':
      return `+¥${formattedAmount}`
    case 'withdraw':
    case 'freeze':
    case 'deduct':
      return `-¥${formattedAmount}`
    default:
      return `¥${formattedAmount}`
  }
}

function formatTime(time: string) {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  }
  else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  }
  else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  }
  else {
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <DepositHead />
    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 押金账户头部卡片 -->
        <view class="rounded-[32rpx] from-blue-500 to-blue-600 bg-gradient-to-r p-[40rpx] text-white">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view>
              <text class="mb-[8rpx] block text-[28rpx] text-white/90">
                我的押金
              </text>
              <view class="flex items-center">
                <text class="text-[48rpx] font-bold">
                  {{ balanceVisible ? `¥${formatAmount(accountInfo?.availableAmount || 0)}` : '****' }}
                </text>
                <view
                  class="ml-[16rpx] h-[32rpx] w-[32rpx] flex items-center justify-center"
                  @tap="toggleBalanceVisible"
                >
                  <text
                    class="text-[24rpx] text-white/80"
                    :class="balanceVisible ? 'i-material-symbols-visibility' : 'i-material-symbols-visibility-off'"
                  />
                </view>
              </view>
              <text class="text-[24rpx] text-white/80">
                可用余额
              </text>
            </view>

            <view class="flex flex-col items-end space-y-[8rpx]">
              <view
                class="border border-white/30 rounded-[16rpx] bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm"
                @tap="handleRecharge"
              >
                <text class="text-[24rpx] text-white font-medium">
                  充值
                </text>
              </view>
              <view
                class="border border-white/30 rounded-[16rpx] bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm"
                @tap="handleWithdraw"
              >
                <text class="text-[24rpx] text-white font-medium">
                  提现
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 押金账户概览 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-account-balance-wallet text-[40rpx] text-blue-600" />
            <text class="text-[32rpx] text-black font-semibold">
              账户概览
            </text>
          </view>

          <view class="grid grid-cols-3 gap-[24rpx]">
            <view class="rounded-[16rpx] bg-blue-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-blue-600 font-bold">
                ¥{{ formatAmount(accountInfo?.totalAmount || 0) }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                总押金
              </text>
            </view>
            <view class="rounded-[16rpx] bg-orange-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-orange-600 font-bold">
                ¥{{ formatAmount(accountInfo?.frozenAmount || 0) }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                冻结金额
              </text>
            </view>
            <view class="rounded-[16rpx] bg-green-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[36rpx] text-green-600 font-bold">
                {{ (creditInfo?.wechatScore || 0) + (creditInfo?.sesameScore || 0) }}
              </text>
              <text class="text-[24rpx] text-gray-600">
                信用总分
              </text>
            </view>
          </view>
        </view>

        <!-- 最近交易 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-receipt-long text-[40rpx] text-purple-600" />
                <text class="text-[32rpx] text-black font-semibold">
                  最近交易
                </text>
              </view>
              <text class="text-[24rpx] text-blue-600">
                查看全部
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <view v-if="recentTransactions.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
              <text class="i-material-symbols-inbox mb-[16rpx] block text-[80rpx] text-gray-400" />
              <text class="text-[28rpx] text-gray-500">
                暂无交易记录
              </text>
            </view>

            <view v-else class="space-y-[24rpx]">
              <view
                v-for="transaction in recentTransactions"
                :key="transaction.transactionId"
                class="border border-gray-100 rounded-[16rpx] p-[24rpx]"
              >
                <view class="flex items-center justify-between">
                  <view class="flex items-center space-x-[24rpx]">
                    <view
                      class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[20rpx]"
                      :class="getTransactionIconClass(transaction.transactionType)"
                    >
                      <text
                        class="text-[36rpx]"
                        :class="getTransactionMaterialIcon(transaction.transactionType)"
                      />
                    </view>
                    <view>
                      <text class="mb-[8rpx] block text-[28rpx] text-black font-medium">
                        {{ getTransactionTypeText(transaction.transactionType) }}
                      </text>
                      <text class="text-[24rpx] text-gray-500">
                        {{ formatTime(transaction.createTime) }}
                      </text>
                    </view>
                  </view>
                  <text
                    class="text-[32rpx] font-semibold"
                    :class="getTransactionAmountClass(transaction.transactionType)"
                  >
                    {{ formatTransactionAmount(transaction.transactionType, transaction.amount) }}
                  </text>
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
              押金说明
            </text>
          </view>

          <view class="text-[26rpx] text-gray-700 space-y-[16rpx]">
            <text class="block">
              • 押金用于保障车辆安全，租车时自动扣除
            </text>
            <text class="block">
              • 正常还车且订单完成后，押金会即刻退回
            </text>
            <text class="block">
              • 支持微信支付分和芝麻信用免押金租车
            </text>
            <text class="block">
              • 信用分达标用户可享受免押金服务
            </text>
            <text class="block">
              • 提现申请会在1-3个工作日内处理完成
            </text>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>
  </view>
  <!-- 充值弹框 -->
  <RechargeDialog
    v-model:show="showRechargeDialog"
    @success="handleRechargeSuccess"
  />

  <!-- 提现弹框 -->
  <WithdrawDialog
    v-model:show="showWithdrawDialog"
    :available-amount="accountInfo?.availableAmount || 0"
    @success="handleWithdrawSuccess"
  />
</template>

<route lang="yaml">
layout: home
</route>
