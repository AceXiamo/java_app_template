<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatAmount, rechargeDeposit } from '@/api/deposit'
import { requestPlatformPayment, processPaymentResponse, showPaymentSuccessToast, showPaymentFailedToast } from '@/utils/payment'
import { getCurrentPlatform, getPlatformDisplayName } from '@/utils/platform'
import BottomDrawer from '@/components/BottomDrawer.vue'

interface Props {
  show: boolean
}

interface Emits {
  'update:show': [value: boolean]
  'success': []
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const selectedAmount = ref(0)
const customAmount = ref('')
const submitting = ref(false)

const presetAmounts = [50, 100, 200, 500, 1000, 2000]

const finalAmount = computed(() => {
  if (customAmount.value && Number(customAmount.value) > 0) {
    return Number(customAmount.value)
  }
  return selectedAmount.value
})

watch(() => props.show, (show) => {
  if (show) {
    // 重置表单
    selectedAmount.value = 100
    customAmount.value = ''
    submitting.value = false
  }
})

function handleCustomAmountInput() {
  if (customAmount.value) {
    selectedAmount.value = 0
  }
}

async function handleSubmit() {
  if (!finalAmount.value || finalAmount.value <= 0) {
    uni.showToast({
      title: '请选择充值金额',
      icon: 'none',
    })
    return
  }

  try {
    submitting.value = true
    const platformName = getPlatformDisplayName()

    const response = await rechargeDeposit({
      amount: finalAmount.value,
      returnUrl: 'pages/deposit/index',
    })

    if (response.data) {
      // 使用统一支付接口
      const paymentData = processPaymentResponse(response)
      const result = await requestPlatformPayment(paymentData)
      
      if (result.success) {
        showPaymentSuccessToast()
        emits('success')
        handleClose()
      } else {
        showPaymentFailedToast(result.message)
      }
    }
  }
  catch (error: any) {
    console.error('充值失败:', error)
    const platformName = getPlatformDisplayName()
    showPaymentFailedToast(`${platformName}充值失败，请重试`)
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
  <BottomDrawer :visible="show" title="充值押金" @update:visible="emits('update:show', $event)">
    <!-- 充值金额选择 -->
    <view class="mb-4">
      <text class="mb-2 block text-sm text-gray-900 font-medium">
        选择充值金额
      </text>
      <view class="grid grid-cols-3 mb-3 gap-2">
        <view
          v-for="amount in presetAmounts"
          :key="amount"
          class="border border-gray-200 rounded-lg px-3 py-3 text-center"
          :class="selectedAmount === amount ? 'border-blue-500 bg-blue-100 text-blue-600' : ''"
          @tap="selectedAmount = amount"
        >
          <view class="text-base font-bold">
            ¥{{ amount }}
          </view>
        </view>
      </view>

      <!-- 自定义金额 -->
      <view class="mb-3">
        <text class="mb-2 block text-sm text-gray-700 font-medium">
          或输入自定义金额
        </text>
        <view class="relative">
          <input
            v-model="customAmount"
            type="number"
            placeholder="请输入充值金额"
            class="focus:border-blue-500 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none"
            :class="customAmount ? 'border-blue-500 bg-blue-50' : ''"
            @input="handleCustomAmountInput"
          >
          <span class="absolute right-2 top-1/2 transform text-gray-400 -translate-y-1/2 text-sm">元</span>
        </view>
      </view>
    </view>

    <!-- 充值说明 -->
    <view class="mb-6 rounded-lg bg-blue-50 p-4">
      <view class="flex items-start">
        <text class="i-material-symbols-info mr-2 mt-0.5 text-[16px] text-blue-600 flex-shrink-0" />
        <view class="text-xs text-blue-700 space-y-1">
          <text class="block">
            • 充值金额将存入您的押金账户
          </text>
          <text class="block">
            • 押金可用于支付车辆押金，订单完成后自动解冻
          </text>
          <text class="block">
            • 未使用的押金余额可随时申请提现
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
        :class="(!finalAmount || finalAmount <= 0 || submitting) ? 'opacity-50' : ''"
        @tap="(!finalAmount || finalAmount <= 0 || submitting) ? null : handleSubmit"
      >
        {{ submitting ? '处理中...' : `确认充值 ¥${formatAmount(finalAmount)}` }}
      </view>
    </view>
  </BottomDrawer>
</template>
