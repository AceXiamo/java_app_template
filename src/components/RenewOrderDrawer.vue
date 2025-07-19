<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BottomDrawer from './BottomDrawer.vue'
import { getRenewalPricing } from '@/api/order'

interface Props {
  visible: boolean
  order: any
  onClose?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', data: { orderId: number, extendDays: number, newEndTime: string, amount: number }): void
}>()

// 预设续租天数选项 - 移除30天限制
const presetOptions = [
  { days: 1, label: '1天' },
  { days: 2, label: '2天' },
  { days: 3, label: '3天' },
  { days: 7, label: '1周' },
  { days: 15, label: '半月' },
  { days: 30, label: '1月' },
  { days: 60, label: '2月' },
  { days: 90, label: '3月' },
]

const selectedDays = ref(1)
const customDays = ref('')
const isCustom = ref(false)
const isSubmitting = ref(false)
const isLoadingPrice = ref(false)

// 动态定价信息
const pricingInfo = ref<any>(null)

// 获取当前选择的天数
const currentDays = computed(() => {
  if (isCustom.value) {
    const days = Number.parseInt(customDays.value)
    return Number.isNaN(days) || days <= 0 ? 1 : days
  }
  return selectedDays.value
})

// 计算总价（基于动态定价）
const totalAmount = computed(() => {
  if (pricingInfo.value?.finalPrice) {
    return Math.round(pricingInfo.value.finalPrice)
  }
  // fallback价格
  return currentDays.value * 680
})

// 获取定价信息
async function fetchPricing(days: number) {
  if (!props.order?.id || days <= 0)
    return

  isLoadingPrice.value = true
  try {
    const response = await getRenewalPricing(Number(props.order.id), days)
    pricingInfo.value = response.data
  }
  catch (error) {
    console.error('获取定价失败:', error)
    // 使用默认定价逻辑
    pricingInfo.value = {
      finalPrice: days * 680,
      discountDesc: '',
      priceType: 'daily',
    }
  }
  finally {
    isLoadingPrice.value = false
  }
}

// 监听天数变化，动态获取定价
watch(() => currentDays.value, (newDays) => {
  if (newDays > 0) {
    fetchPricing(newDays)
  }
}, { immediate: true })

// 监听弹框显示状态，重置数据
watch(() => props.visible, (visible) => {
  if (visible) {
    // 重置选择状态
    selectedDays.value = 1
    isCustom.value = false
    customDays.value = ''
    pricingInfo.value = null
    // 获取初始定价
    fetchPricing(1)
  }
})

// 计算新的结束时间
const newEndTime = computed(() => {
  if (!props.order?.rentPeriod?.endTime)
    return ''

  try {
    // 尝试解析时间，支持多种格式
    let currentEndTime: Date
    const endTimeStr = props.order.rentPeriod.endTime

    // 如果已经是标准格式，直接解析
    if (endTimeStr.includes('T') || endTimeStr.includes('Z')) {
      currentEndTime = new Date(endTimeStr)
    }
    else if (endTimeStr.includes('-') && endTimeStr.includes(':')) {
      // 如果是 'YYYY-MM-DD HH:MM' 或 'YYYY-MM-DD HH:MM:SS' 格式
      const isoString = endTimeStr.replace(' ', 'T')
      currentEndTime = new Date(isoString)
    }
    else {
      // 尝试直接解析
      currentEndTime = new Date(endTimeStr)
    }

    // 检查日期是否有效
    if (Number.isNaN(currentEndTime.getTime())) {
      console.error('Invalid date format:', endTimeStr)
      return ''
    }

    // 按天数扩展（每天 24 小时）
    const extendedTime = new Date(currentEndTime.getTime() + currentDays.value * 24 * 60 * 60 * 1000)

    // 检查扩展后的时间是否有效
    if (Number.isNaN(extendedTime.getTime())) {
      console.error('Invalid extended time calculation')
      return ''
    }

    return extendedTime.toISOString().slice(0, 19).replace('T', ' ')
  }
  catch (error) {
    console.error('Error calculating new end time:', error, props.order?.rentPeriod?.endTime)
    return ''
  }
})

// 格式化显示时间
function formatDisplayTime(timeStr: string) {
  if (!timeStr)
    return ''

  try {
    let date: Date

    // 支持多种日期格式
    if (timeStr.includes('T') || timeStr.includes('Z')) {
      date = new Date(timeStr)
    }
    else if (timeStr.includes('-') && timeStr.includes(':')) {
      // 如果是 'YYYY-MM-DD HH:MM' 或 'YYYY-MM-DD HH:MM:SS' 格式
      const isoString = timeStr.replace(' ', 'T')
      date = new Date(isoString)
    }
    else {
      // 尝试直接解析
      date = new Date(timeStr)
    }

    // 检查日期是否有效
    if (Number.isNaN(date.getTime())) {
      console.error('Invalid date format in formatDisplayTime:', timeStr)
      return timeStr // 返回原始字符串
    }

    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  catch (error) {
    console.error('Error formatting display time:', error, timeStr)
    return timeStr // 返回原始字符串
  }
}

// 选择预设天数
function selectPresetDays(days: number) {
  selectedDays.value = days
  isCustom.value = false
  customDays.value = ''
}

// 切换到自定义输入
function switchToCustom() {
  isCustom.value = true
  customDays.value = selectedDays.value.toString()
}

// 验证自定义天数输入
function validateCustomDays() {
  const days = Number.parseInt(customDays.value)
  if (Number.isNaN(days) || days <= 0) {
    customDays.value = '1'
  }
  else if (days > 365) {
    customDays.value = '365'
  }
}

// 关闭弹框
function handleClose() {
  emit('update:visible', false)
  props.onClose?.()
}

// 确认续租
async function handleConfirm() {
  if (isSubmitting.value || isLoadingPrice.value)
    return

  isSubmitting.value = true

  try {
    // 触发续租确认事件
    emit('confirm', {
      orderId: Number(props.order.id), // 确保是数字类型
      extendDays: currentDays.value,
      newEndTime: newEndTime.value,
      amount: totalAmount.value,
    })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BottomDrawer
    :visible="visible"
    title="续租订单"
    height="600"
    @update:visible="handleClose"
  >
    <view class="pt-[32rpx] space-y-[32rpx]">
      <!-- 订单信息 -->
      <view class="rounded-[16rpx] bg-gray-50 p-[24rpx]">
        <view class="mb-[16rpx] flex items-center">
          <text class="i-material-symbols-directions-car mr-[8rpx] text-[20rpx] text-gray-600" />
          <text class="text-[24rpx] font-medium">
            当前订单
          </text>
        </view>
        <view class="space-y-[8rpx]">
          <view class="flex justify-between">
            <text class="text-[22rpx] text-gray-600">
              车辆
            </text>
            <text class="text-[22rpx] text-gray-800">
              {{ order?.vehicle?.name || '暂无信息' }}
            </text>
          </view>
          <view class="flex justify-between">
            <text class="text-[22rpx] text-gray-600">
              当前结束时间
            </text>
            <text class="text-[22rpx] text-gray-800">
              {{ formatDisplayTime(order?.rentPeriod?.endTime) || '暂无信息' }}
            </text>
          </view>
          <view class="flex justify-between">
            <text class="text-[22rpx] text-gray-600">
              续租后结束时间
            </text>
            <view class="text-right">
              <text class="text-[22rpx] text-purple-600 font-medium">
                {{ formatDisplayTime(newEndTime) || '暂无信息' }}
              </text>
              <text class="mt-[4rpx] block text-[18rpx] text-purple-500">
                (延长{{ currentDays }}天)
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 续租天数选择 -->
      <view>
        <view class="mb-[20rpx] flex items-center">
          <text class="i-material-symbols-schedule mr-[8rpx] text-[20rpx] text-purple-600" />
          <text class="text-[24rpx] font-medium">
            选择续租天数
          </text>
        </view>

        <!-- 预设选项 Tag 形式 -->
        <view class="mb-[20rpx] flex flex-wrap gap-[12rpx]">
          <view
            v-for="option in presetOptions"
            :key="option.days"
            class="rounded-[20rpx] px-[20rpx] py-[12rpx] text-[22rpx] font-medium transition-all duration-200 active:scale-95"
            :class="!isCustom && selectedDays === option.days
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 border border-gray-200'"
            @tap="selectPresetDays(option.days)"
          >
            {{ option.label }}
          </view>

          <!-- 自定义选项 -->
          <view
            class="rounded-[20rpx] px-[20rpx] py-[12rpx] text-[22rpx] font-medium transition-all duration-200 active:scale-95"
            :class="isCustom
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 border border-gray-200'"
            @tap="switchToCustom"
          >
            自定义
          </view>
        </view>

        <!-- 自定义天数输入 -->
        <view v-if="isCustom" class="mb-[20rpx]">
          <view class="flex items-center border-2 border-purple-200 rounded-[16rpx] bg-purple-50/50 px-[20rpx] py-[16rpx] space-x-[16rpx]">
            <text class="i-material-symbols-edit text-[20rpx] text-purple-600" />
            <text class="text-[22rpx] text-purple-700 font-medium">
              自定义:
            </text>
            <input
              v-model="customDays"
              type="number"
              placeholder="输入天数"
              class="flex-1 border-0 bg-transparent py-[4rpx] text-center text-[24rpx] text-purple-800 font-bold placeholder:text-purple-400"
              :maxlength="3"
              @input="validateCustomDays"
              @blur="validateCustomDays"
            >
            <text class="text-[22rpx] text-purple-600 font-medium">
              天
            </text>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="rounded-[16rpx] bg-gray-50 p-[24rpx]">
        <view class="mb-[16rpx] flex items-center">
          <text class="i-material-symbols-receipt mr-[8rpx] text-[20rpx] text-gray-600" />
          <text class="text-[24rpx] font-medium">
            费用明细
          </text>
        </view>
        <view class="space-y-[16rpx]">
          <!-- 价格加载状态 -->
          <view v-if="isLoadingPrice" class="flex items-center justify-center py-[20rpx]">
            <text class="i-material-symbols-sync mr-[8rpx] animate-spin text-[20rpx] text-purple-600" />
            <text class="text-[20rpx] text-gray-600">
              计算价格中...
            </text>
          </view>

          <!-- 价格信息 -->
          <template v-else>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-700 font-medium">
                续租 {{ currentDays }}天
              </text>
              <view class="text-right">
                <text class="text-[32rpx] text-purple-600 font-bold">
                  ¥{{ totalAmount }}
                </text>
                <text v-if="pricingInfo?.discountDesc" class="mt-[4rpx] block text-[18rpx] text-green-600">
                  {{ pricingInfo.discountDesc }}
                </text>
                <text v-if="pricingInfo?.priceType === 'monthly_discount' && pricingInfo?.monthlyDailyPrice" class="mt-[2rpx] block text-[16rpx] text-blue-500">
                  月租等效: ¥{{ Math.round(pricingInfo.monthlyDailyPrice) }}/天
                </text>
              </view>
            </view>

            <view class="flex items-center justify-between text-[20rpx] text-gray-500">
              <text>平均每天 ¥{{ Math.round(totalAmount / currentDays) }}</text>
              <text v-if="pricingInfo?.priceType === 'monthly_discount'" class="text-blue-600">
                月租折扣价
              </text>
              <text v-else-if="pricingInfo?.priceType === 'daily'" class="text-gray-600">
                日租价
              </text>
            </view>
          </template>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="flex pt-[16rpx] space-x-[16rpx]">
        <view
          class="flex-1 border border-gray-300 rounded-[24rpx] py-[24rpx] text-center text-[28rpx] text-gray-600 font-medium transition-all duration-200 active:scale-95"
          @tap="handleClose"
        >
          取消
        </view>
        <view
          class="flex-1 rounded-[24rpx] py-[24rpx] text-center text-[28rpx] text-white font-medium transition-all duration-200"
          :class="isSubmitting || isLoadingPrice ? 'bg-gray-400' : 'bg-purple-600 active:scale-95'"
          @tap="handleConfirm"
        >
          {{
            isSubmitting ? '处理中...'
            : isLoadingPrice ? '计算中...'
              : `续租${currentDays}天 ¥${totalAmount}`
          }}
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
