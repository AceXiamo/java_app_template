<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatAmount, withdrawDeposit } from '@/api/deposit'
import { getPlatformDisplayName } from '@/utils/platform'
import BottomDrawer from '@/components/BottomDrawer.vue'

interface Props {
  show: boolean
  availableAmount: number
}

interface Emits {
  'update:show': [value: boolean]
  'success': []
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const withdrawAmount = ref('')
const remark = ref('')
const submitting = ref(false)

const quickAmounts = [25, 50, 75, 100]

const isValidAmount = computed(() => {
  const amount = Number(withdrawAmount.value)
  return amount > 0 && amount <= props.availableAmount
})

function getQuickAmount(percent: number) {
  return Math.floor(props.availableAmount * percent / 100 * 100) / 100
}

watch(() => props.show, (show) => {
  if (show) {
    // 重置表单
    withdrawAmount.value = ''
    remark.value = ''
    submitting.value = false
  }
})

async function handleSubmit() {
  const amount = Number(withdrawAmount.value)

  if (!amount || amount <= 0) {
    uni.showToast({
      title: '请输入提现金额',
      icon: 'none',
    })
    return
  }

  if (amount > props.availableAmount) {
    uni.showToast({
      title: '提现金额超过可用余额',
      icon: 'none',
    })
    return
  }

  try {
    submitting.value = true
    const platformName = getPlatformDisplayName()

    await withdrawDeposit({
      amount,
      remark: remark.value,
    })

    uni.showToast({
      title: `${platformName}提现申请已提交`,
      icon: 'success',
    })
    
    emits('success')
    handleClose()
  }
  catch (error: any) {
    console.error('提现失败:', error)
    const platformName = getPlatformDisplayName()
    uni.showToast({
      title: `${platformName}提现失败，请重试`,
      icon: 'error',
    })
  }
  finally {
    submitting.value = false
  }
}

function handleClose() {
  emits('update:show', false)
}
</script>

<template>
  <BottomDrawer :visible="show" title="申请提现" @update:visible="emits('update:show', $event)">
    <view class="p-4">
      <!-- 可提现余额显示 -->
      <view class="mb-4 rounded-lg bg-green-50 p-3">
        <view class="flex items-center justify-between">
          <text class="text-sm text-green-700">
            可提现余额
          </text>
          <text class="text-xl text-green-600 font-bold">
            ¥{{ formatAmount(availableAmount) }}
          </text>
        </view>
      </view>

      <!-- 提现金额输入 -->
      <view class="mb-4">
        <text class="mb-2 block text-sm text-gray-900 font-medium">
          提现金额
        </text>
        <view class="relative mb-2">
          <input
            v-model="withdrawAmount"
            type="number"
            placeholder="请输入提现金额"
            class="focus:border-blue-500 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none"
            :class="withdrawAmount ? 'border-blue-500 bg-blue-50' : ''"
            :max="availableAmount"
          >
          <span class="absolute right-2 top-1/2 transform text-gray-400 -translate-y-1/2 text-sm">元</span>
        </view>

        <!-- 快捷金额按钮 -->
        <view class="flex space-x-2">
          <view
            v-for="percent in quickAmounts"
            :key="percent"
            class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs font-medium text-center"
            :class="Number(withdrawAmount) === getQuickAmount(percent) ? 'border-blue-500 bg-blue-100 text-blue-600' : 'text-gray-600'"
            @tap="withdrawAmount = String(getQuickAmount(percent))"
          >
            {{ percent === 100 ? '全部' : `${percent}%` }}
          </view>
        </view>
      </view>

      <!-- 提现备注 -->
      <view class="mb-4">
        <text class="mb-2 block text-sm text-gray-900 font-medium">
          提现备注（可选）
        </text>
        <textarea
          v-model="remark"
          placeholder="请输入提现备注"
          maxlength="100"
          class="focus:border-blue-500 w-full resize-none border border-gray-200 rounded-md px-3 py-2 focus:outline-none text-sm"
          rows="3"
        />
        <text class="mt-1 block text-xs text-gray-500">
          {{ remark.length }}/100
        </text>
      </view>

      <!-- 提现说明 -->
      <view class="mb-6 rounded-lg bg-yellow-50 p-4">
        <view class="flex items-start">
          <uni-icons type="info" size="16" color="#F59E0B" class="mr-2 mt-0.5 flex-shrink-0" />
          <view class="text-xs text-yellow-700 space-y-1">
            <text class="block">
              • 提现申请提交后，资金将在1-3个工作日内到账
            </text>
            <text class="block">
              • 提现金额将退回到您的原支付账户
            </text>
            <text class="block">
              • 如有疑问，请联系客服咨询
            </text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="flex space-x-2">
        <view
          class="flex-1 border border-gray-200 rounded-md px-3 py-2.5 text-gray-700 font-medium text-center text-sm"
          @tap="handleClose"
        >
          取消
        </view>
        <view
          class="bg-blue-600 flex-1 rounded-md px-3 py-2.5 text-white font-medium text-center text-sm"
          :class="(!isValidAmount || submitting) ? 'opacity-50' : ''"
          @tap="(!isValidAmount || submitting) ? null : handleSubmit"
        >
          {{ submitting ? '处理中...' : `确认提现 ¥${formatAmount(Number(withdrawAmount) || 0)}` }}
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
