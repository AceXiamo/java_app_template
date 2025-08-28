<template>
  <CenterDialog :show="show" title="押金不足" @close="handleClose">
    <div class="p-6">
      <!-- 押金不足提示 -->
      <div class="flex items-center justify-center mb-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <uni-icons type="wallet" size="32" color="#EF4444" />
        </div>
      </div>
      
      <div class="text-center mb-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">押金余额不足</h3>
        <p class="text-sm text-gray-600 mb-4">当前订单需要押金，请先充值押金后再进行预订</p>
      </div>

      <!-- 押金详情 -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">车辆押金</span>
          <span class="text-sm font-medium">¥{{ formatAmount(vehicleDeposit) }}</span>
        </div>
        
        <div v-if="creditDeduction > 0" class="flex justify-between items-center">
          <span class="text-sm text-gray-600">信用抵扣</span>
          <span class="text-sm font-medium text-green-600">-¥{{ formatAmount(creditDeduction) }}</span>
        </div>
        
        <div class="flex justify-between items-center pt-3 border-t border-gray-200">
          <span class="text-sm text-gray-900 font-medium">实际需要押金</span>
          <span class="text-lg font-bold text-red-600">¥{{ formatAmount(actualDeposit) }}</span>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">当前押金余额</span>
          <span class="text-sm font-medium">¥{{ formatAmount(userBalance) }}</span>
        </div>
        
        <div class="flex justify-between items-center pt-3 border-t border-gray-200">
          <span class="text-sm text-red-600 font-medium">需要充值</span>
          <span class="text-lg font-bold text-red-600">¥{{ formatAmount(needRecharge) }}</span>
        </div>
      </div>

      <!-- 推荐充值金额 -->
      <div class="mb-6">
        <div class="text-sm text-gray-700 font-medium mb-3">推荐充值金额</div>
        <div class="grid grid-cols-3 gap-3">
          <button 
            v-for="amount in recommendAmounts" 
            :key="amount"
            class="py-3 px-4 border border-gray-200 rounded-lg text-center transition-colors"
            :class="selectedAmount === amount ? 'border-primary bg-primary/10 text-primary' : 'hover:border-gray-300'"
            @click="selectedAmount = amount"
          >
            <div class="text-lg font-bold">¥{{ amount }}</div>
          </button>
        </div>
      </div>

      <!-- 自定义金额输入 -->
      <div class="mb-6">
        <div class="text-sm text-gray-700 font-medium mb-2">或输入自定义金额</div>
        <div class="relative">
          <input
            v-model="customAmount"
            type="number"
            placeholder="请输入充值金额"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            :class="customAmount ? 'border-primary bg-primary/5' : ''"
            @input="handleCustomAmountInput"
          />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">元</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex space-x-3">
        <button 
          class="flex-1 py-3 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          @click="handleClose"
        >
          取消
        </button>
        <button 
          class="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          :disabled="!finalAmount || finalAmount < needRecharge"
          @click="handleRecharge"
        >
          立即充值 ¥{{ formatAmount(finalAmount) }}
        </button>
      </div>

      <!-- 温馨提示 -->
      <div class="mt-4 p-3 bg-blue-50 rounded-lg">
        <div class="flex items-start">
          <uni-icons type="info" size="16" color="#3B82F6" class="mt-0.5 mr-2 flex-shrink-0" />
          <div class="text-xs text-blue-700">
            <p>• 押金将在订单完成后自动解冻</p>
            <p>• 支持微信支付、支付宝等多种支付方式</p>
            <p>• 未使用的押金可随时提现</p>
          </div>
        </div>
      </div>
    </div>
  </CenterDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatAmount, getRecommendedRechargeAmount } from '@/api/deposit'
import type { DepositCalculation } from '@/api/deposit'

interface Props {
  show: boolean
  calculation: DepositCalculation | null
}

interface Emits {
  close: []
  recharge: [amount: number]
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const selectedAmount = ref(0)
const customAmount = ref('')

const vehicleDeposit = computed(() => props.calculation?.vehicleDeposit || 0)
const creditDeduction = computed(() => props.calculation?.creditDeduction || 0)
const actualDeposit = computed(() => props.calculation?.actualDeposit || 0)
const userBalance = computed(() => props.calculation?.userBalance || 0)
const needRecharge = computed(() => props.calculation?.needRecharge || 0)

const recommendAmounts = computed(() => {
  if (!props.calculation) return [50, 100, 200]
  
  const recommended = getRecommendedRechargeAmount(props.calculation)
  const amounts = [recommended]
  
  if (recommended < 200) {
    amounts.push(200, 500)
  } else if (recommended < 500) {
    amounts.push(recommended + 100, 500)
  } else {
    amounts.push(recommended + 200, recommended + 500)
  }
  
  return amounts.slice(0, 3)
})

const finalAmount = computed(() => {
  if (customAmount.value && Number(customAmount.value) > 0) {
    return Number(customAmount.value)
  }
  return selectedAmount.value
})

watch(() => props.show, (show) => {
  if (show && props.calculation) {
    const recommended = getRecommendedRechargeAmount(props.calculation)
    selectedAmount.value = recommended
    customAmount.value = ''
  }
})

const handleCustomAmountInput = () => {
  if (customAmount.value) {
    selectedAmount.value = 0
  }
}

const handleRecharge = () => {
  if (finalAmount.value >= needRecharge.value) {
    emits('recharge', finalAmount.value)
  }
}

const handleClose = () => {
  emits('close')
}
</script>