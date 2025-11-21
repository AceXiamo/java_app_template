<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import {
  type CarTypeOption,
  type EnergyTypeOption,
  type MysteryBoxActivity,
  type MysteryBoxPricing,
  createMysteryBoxOrder,
  getMysteryBoxActivity,
  getMysteryBoxOptions,
  getMysteryBoxPricing,
} from '@/api/mysteryBox'
import { queryPaymentStatus } from '@/api/booking'
import { requestMysteryBoxPayment } from '@/api/mysteryBox'
import DateTimePicker from '@/components/DateTimePicker.vue'

// 页面状态
const loading = ref(false)
const priceLoading = ref(false)
const orderLoading = ref(false)

// 活动信息
const activityInfo = ref<MysteryBoxActivity>({
  id: 0,
  title: '神秘盲盒体验',
  subtitle: '¥99 起，惊喜车型等你解锁',
  description: '超值体验价，取车时揭晓，品质保证',
  status: 'active',
  startPrice: 99,
  badgeText: 'NEW',
  badgeColor: 'tech-purple',
  benefits: ['超值体验价', '取车时揭晓', '品质保证'],
  features: ['免押金', '保险齐全', '满油交付'],
})

// 选项配置
const energyTypes = ref<EnergyTypeOption[]>([])
const carTypes = ref<CarTypeOption[]>([])
const rules = ref<string[]>([])

// 用户选择
const selectedEnergyType = ref<string>('')
const selectedCarType = ref<string>('')

const timeForm = ref({
  startDate: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
})

// 价格信息
const priceInfo = ref<MysteryBoxPricing | null>(null)

// 无车辆可用状态
const noVehicleAvailable = ref(false)

// 弹窗状态
const showDatePicker = ref(false)

// 计算属性
const canPurchase = computed(() => {
  return selectedEnergyType.value && selectedCarType.value && priceInfo.value && !noVehicleAvailable.value
})

// 计算显示的取车时间
const displayPickupTime = computed(() => {
  const pickup = dayjs(`${timeForm.value.startDate} ${timeForm.value.startTime}`)

  const formatDate = (date: any) => {
    const today = dayjs().format('YYYY-MM-DD')
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

    if (date.format('YYYY-MM-DD') === today) {
      return '今天'
    }
    else if (date.format('YYYY-MM-DD') === tomorrow) {
      return '明天'
    }
    else {
      return date.format('MM月DD日')
    }
  }

  return `${formatDate(pickup)} ${pickup.format('HH:mm')}`
})

// 选择方法
function selectEnergyType(type: string) {
  selectedEnergyType.value = type
  // 重新计算价格
  if (selectedCarType.value) {
    loadPricing()
  }
}

function selectCarType(type: string) {
  selectedCarType.value = type
  // 重新计算价格
  if (selectedEnergyType.value) {
    loadPricing()
  }
}

// 显示取车时间选择器
function showTimePicker() {
  showDatePicker.value = true
}

// 处理取车时间选择确认
function handleDateTimeConfirm(data: {
  startDate: string
  startTime: string
}) {
  timeForm.value.startDate = data.startDate
  timeForm.value.startTime = data.startTime

  // 重新计算价格
  if (selectedEnergyType.value && selectedCarType.value) {
    loadPricing()
  }
}

// 样式辅助函数 - 简化颜色映射，使用设计规范颜色
function getIconColor(color: string, isActive: boolean) {
  // 选中时使用主色，未选中时使用灰色
  if (!isActive)
    return 'rgb(156, 163, 175)' // text-gray-400

  // 特殊颜色映射，保持品牌感但更克制
  const colorMap: Record<string, string> = {
    'green': 'rgb(16, 185, 129)', // success
    'red': 'rgb(239, 68, 68)', // danger
    'orange': 'rgb(245, 158, 11)', // warning
    'blue': 'rgb(59, 130, 246)',
    'tech-purple': 'rgb(139, 92, 246)', // primary
  }
  return colorMap[color] || 'rgb(139, 92, 246)'
}

// 加载价格信息
async function loadPricing() {
  if (!selectedEnergyType.value || !selectedCarType.value) {
    priceInfo.value = null
    noVehicleAvailable.value = false
    return
  }

  try {
    priceLoading.value = true
    noVehicleAvailable.value = false

    const result = await getMysteryBoxPricing({
      energyType: selectedEnergyType.value,
      carType: selectedCarType.value,
    })

    if (result.code === 200 && result.data) {
      priceInfo.value = result.data
      noVehicleAvailable.value = false
    }
    else if (result.code === 500 || (result.msg && result.msg.includes('该组合暂无可用车辆'))) {
      // Handle no vehicle available case (500 error)
      noVehicleAvailable.value = true
      priceInfo.value = null
    }
    else {
      throw new Error(result.msg || '获取价格失败')
    }
  }
  catch (error: any) {
    console.error('加载价格信息失败:', error)
    noVehicleAvailable.value = true
    priceInfo.value = null
  }
  finally {
    priceLoading.value = false
  }
}

// 购买盲盒
async function purchaseMysteryBox() {
  if (!canPurchase.value || orderLoading.value)
    return

  if (!canPurchase.value) {
    uni.showToast({
      title: '请先完成所有选择',
      icon: 'none',
    })
    return
  }

  try {
    orderLoading.value = true

    const startDateTime = dayjs(`${timeForm.value.startDate} ${timeForm.value.startTime}`).format('YYYY-MM-DD HH:mm')

    const orderParams = {
      preferences: {
        energyType: selectedEnergyType.value,
        carType: selectedCarType.value,
      },
      rentalInfo: {
        startTime: startDateTime,
      },
    }

    const result = await createMysteryBoxOrder(orderParams)

    if (result.code === 200 && result.data) {
      const order = result.data

      // 检查是否有支付数据
      if (order.payData) {
        // 调用统一平台支付
        try {
          await requestMysteryBoxPayment(order)

          // 支付成功，查询支付状态确认
          await verifyPaymentStatus(order.orderNo)

          // 支付成功，跳转到订单详情
          uni.showToast({
            title: '支付成功！',
            icon: 'success',
            duration: 2000,
          })

          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/order/detail?orderId=${order.orderNo}&type=mystery_box`,
            })
          }, 2000)
        }
        catch (payError: any) {
          console.error('支付失败:', payError)

          // 支付失败处理
          if (payError.errMsg && payError.errMsg.includes('cancel')) {
            uni.showToast({
              title: '支付已取消',
              icon: 'none',
              duration: 2000,
            })
          }
          else {
            uni.showToast({
              title: '支付失败，请重试',
              icon: 'none',
              duration: 2000,
            })
          }
        }
      }
      else {
        // 没有支付数据，可能是免费或其他情况
        uni.showModal({
          title: '盲盒预订成功！',
          content: `订单号：${order.orderNo}\n取车码：${order.pickupCode}\n\n选择偏好：\n${order.preferences.energyTypeName} · ${order.preferences.carTypeName}\n\n${order.mysteryVehicle.revealMessage}`,
          showCancel: false,
          confirmText: '查看订单',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/order/detail?orderId=${order.orderNo}&type=mystery_box`,
              })
            }
          },
        })
      }
    }
    else {
      throw new Error(result.msg || '创建订单失败')
    }
  }
  catch (error: any) {
    console.error('购买失败:', error)

    let errorMessage = '购买失败，请重试'

    // 处理具体的错误信息
    if (error.message) {
      if (error.message.includes('该组合暂无可用车辆')) {
        errorMessage = '该组合暂无可用车辆，请选择其他类型'
      }
      else if (error.message.includes('未找到对应的盲盒池子配置')) {
        errorMessage = '暂不支持此组合，请选择其他类型'
      }
      else if (error.message.includes('分配的车辆不存在')) {
        errorMessage = '车辆分配异常，请重试'
      }
      else {
        errorMessage = error.message
      }
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000,
    })
  }
  finally {
    orderLoading.value = false
  }
}

// 验证支付状态
async function verifyPaymentStatus(orderNo: string) {
  try {
    const statusResult = await queryPaymentStatus(orderNo)
    if (statusResult.code === 200 && statusResult.data?.tradeState === 'SUCCESS') {
      return true
    }
    else {
      throw new Error('支付状态异常')
    }
  }
  catch (error) {
    console.error('查询支付状态失败:', error)
    // 即使查询失败，也认为支付可能成功，让用户进入订单页面查看
    return true
  }
}

// 加载数据
async function loadData() {
  try {
    loading.value = true

    // 并行加载活动信息和选项配置
    const [activityRes, optionsRes] = await Promise.allSettled([
      getMysteryBoxActivity(),
      getMysteryBoxOptions(),
    ])

    // 处理活动信息
    if (activityRes.status === 'fulfilled' && activityRes.value.code === 200) {
      activityInfo.value = activityRes.value.data.activity
      rules.value = activityRes.value.data.rules
    }

    // 处理选项配置
    if (optionsRes.status === 'fulfilled' && optionsRes.value.code === 200) {
      energyTypes.value = optionsRes.value.data.energyTypes
      carTypes.value = optionsRes.value.data.carTypes
    }

    // 如果API调用失败，使用默认配置
    if (energyTypes.value.length === 0) {
      useDefaultOptions()
    }

    // 预选推荐选项
    const recommendedEnergy = energyTypes.value.find(e => e.isRecommended)
    const recommendedCarType = carTypes.value.find(c => c.isRecommended)

    if (recommendedEnergy) {
      selectedEnergyType.value = recommendedEnergy.type
    }
    if (recommendedCarType) {
      selectedCarType.value = recommendedCarType.type
    }

    // 如果有预选项，加载价格
    if (selectedEnergyType.value && selectedCarType.value) {
      loadPricing()
    }
  }
  catch (error) {
    console.error('加载数据失败:', error)
    useDefaultOptions()
  }
  finally {
    loading.value = false
  }
}

// 使用默认配置
function useDefaultOptions() {
  energyTypes.value = [
    {
      type: 'electric',
      name: '纯电动',
      description: '环保节能',
      icon: 'electric-bolt',
      color: 'green',
      isRecommended: true,
    },
    {
      type: 'hybrid',
      name: '混合动力',
      description: '长续航',
      icon: 'local-gas-station',
      color: 'tech-purple',
      isRecommended: false,
    },
  ]

  carTypes.value = [
    {
      type: 'sedan',
      name: '轿车',
      description: '商务舒适',
      icon: 'directions-car',
      color: 'tech-purple',
      isRecommended: true,
    },
    {
      type: 'suv',
      name: 'SUV',
      description: '宽敞空间',
      icon: 'airport-shuttle',
      color: 'green',
      isRecommended: false,
    },
    {
      type: 'sports',
      name: '跑车',
      description: '动感体验',
      icon: 'speed',
      color: 'red',
      isRecommended: false,
    },
  ]

  rules.value = [
    '选择偏好后，系统完全随机分配符合条件的车辆',
    '支付成功后生成取车码，具体车型、位置和租期取车时揭晓',
    '盲盒车辆均为平台精选，品质有保障',
    '抽到哪辆车就到哪里取，体验真正的盲盒惊喜',
  ]
}

// 生命周期
onMounted(async () => {
  await loadData()
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-[#F6F7FB]">
    <!-- 头部导航 -->
    <PageMysteryBoxHead />

    <!-- 加载状态 -->
    <view v-if="loading" class="flex flex-1 items-center justify-center">
      <view class="flex flex-col items-center">
        <text
          class="i-lets-icons:ring-duotone mb-[24rpx] animate-spin text-[48rpx] text-[#8B5CF6]"
        />
        <text class="text-[26rpx] text-[#6B7280]">
          加载中...
        </text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view v-else scroll-y class="h-0 flex-1">
      <!-- 顶部 Hero 区域 - 优化版 -->
      <view class="relative overflow-hidden from-[#2E1A4F] to-[#8B5CF6] bg-gradient-to-br pb-[100rpx] pt-[32rpx]">
        <!-- 精致装饰背景 -->
        <view class="absolute right-[-40rpx] top-[-40rpx] opacity-8">
          <text class="i-lets-icons:box-duotone text-[240rpx] text-white/20" />
        </view>
        <view class="absolute bottom-[20rpx] left-[-20rpx] opacity-6">
          <text class="i-lets-icons:sparkles-duotone text-[160rpx] text-white/15" />
        </view>

        <view class="relative z-10 px-[40rpx]">
          <!-- 标题区 -->
          <view class="flex items-start justify-between">
            <view class="flex-1">
              <view class="flex items-center">
                <text class="text-[36rpx] text-white font-bold tracking-wide">
                  {{ activityInfo.title }}
                </text>
                <view class="ml-[12rpx] flex items-center rounded-full bg-[#FF7A1A] px-[12rpx] py-[4rpx]">
                  <text class="text-[20rpx] text-white font-bold">
                    {{ activityInfo.badgeText }}
                  </text>
                </view>
              </view>
              <text class="mt-[8rpx] block text-[22rpx] text-white/75 leading-relaxed">
                {{ activityInfo.subtitle }}
              </text>
            </view>
          </view>

          <!-- 权益标签 - 更精致 -->
          <view class="mt-[28rpx] flex flex-wrap gap-[12rpx]">
            <view
              v-for="benefit in activityInfo.benefits"
              :key="benefit"
              class="flex items-center border border-white/20 rounded-full border-solid bg-white/10 px-[16rpx] py-[6rpx] backdrop-blur-md"
            >
              <text class="i-lets-icons:check-ring-duotone mr-[6rpx] text-[20rpx] text-[#10B981]" />
              <text class="text-[20rpx] text-white font-medium">
                {{ benefit }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 主要卡片区域 -->
      <view class="relative z-20 px-[40rpx] pb-[40rpx] -mt-[60rpx] space-y-[24rpx]">
        <!-- 取车时间卡片 - 优化版 -->
        <view class="border border-white/50 rounded-[28rpx] border-solid bg-white p-[28rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="mb-[20rpx] flex items-center justify-between">
            <text class="text-[28rpx] text-[#0F172A] font-bold">
              用车时间
            </text>
            <view class="flex items-center rounded-full bg-[#F6F7FB] px-[12rpx] py-[4rpx]">
              <text class="i-lets-icons:store-duotone mr-[4rpx] text-[16rpx] text-[#6B7280]" />
              <text class="text-[20rpx] text-[#6B7280]">
                到店取还
              </text>
            </view>
          </view>

          <view
            class="flex items-center justify-between border border-[#E5E7EB] rounded-[20rpx] border-solid bg-[#FAFAFA] px-[20rpx] py-[20rpx] transition-all active:border-[#8B5CF6] active:bg-[#F9FAFB]"
            @tap="showTimePicker"
          >
            <view class="flex items-center">
              <view class="mr-[16rpx] flex flex-col items-center justify-center rounded-[16rpx] bg-white px-[14rpx] py-[10rpx] shadow-sm">
                <text class="text-[20rpx] text-[#9CA3AF]">
                  {{ dayjs(timeForm.startDate).format('MM月') }}
                </text>
                <text class="text-[28rpx] text-[#1F2937] font-bold leading-tight">
                  {{ dayjs(timeForm.startDate).format('DD') }}
                </text>
              </view>
              <view class="flex flex-col">
                <text class="text-[26rpx] text-[#1F2937] font-semibold">
                  {{ displayPickupTime }}
                </text>
                <text class="mt-[2rpx] text-[20rpx] text-[#9CA3AF]">
                  点击修改取车时间
                </text>
              </view>
            </view>
            <text class="i-lets-icons:arrow-right-duotone text-[28rpx] text-[#D1D5DB]" />
          </view>
        </view>

        <!-- 选项卡片 - 优化版 -->
        <view class="border border-white/50 rounded-[28rpx] border-solid bg-white p-[28rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="mb-[28rpx]">
            <text class="text-[28rpx] text-[#0F172A] font-bold">
              偏好选择
            </text>
            <text class="mt-[4rpx] block text-[20rpx] text-[#9CA3AF]">
              选择后随机分配，惊喜翻倍
            </text>
          </view>

          <!-- 能源类型 -->
          <view class="mb-[32rpx]">
            <text class="mb-[16rpx] block text-[22rpx] text-[#6B7280] font-semibold">
              能源类型
            </text>
            <view class="grid grid-cols-2 gap-[12rpx]">
              <view
                v-for="energy in energyTypes"
                :key="energy.type"
                class="relative flex flex-col items-center justify-center border rounded-[20rpx] border-solid py-[20rpx] transition-all duration-200 active:scale-98"
                :class="[
                  selectedEnergyType === energy.type
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/8 shadow-sm'
                    : 'border-[#E5E7EB] bg-[#FAFAFA]',
                ]"
                @tap="selectEnergyType(energy.type)"
              >
                <!-- 推荐角标 -->
                <view v-if="energy.isRecommended" class="absolute right-0 top-0 flex rounded-bl-[12rpx] rounded-tr-[18rpx] from-[#FF7A1A] to-[#FF9A4A] bg-gradient-to-r px-[10rpx] py-[3rpx]">
                  <text class="text-[18rpx] text-white font-bold">
                    推荐
                  </text>
                </view>

                <text
                  class="mb-[6rpx] text-[36rpx]"
                  :class="`${energy.icon === 'electric-bolt' ? 'i-streamline-plump-color:electric-charging-station' : 'i-streamline-plump-color:leaf-protect'}`"
                  :style="{ color: getIconColor(energy.color, selectedEnergyType === energy.type) }"
                />
                <text
                  class="text-[24rpx] font-semibold"
                  :class="selectedEnergyType === energy.type ? 'text-[#8B5CF6]' : 'text-[#1F2937]'"
                >
                  {{ energy.name }}
                </text>
                <text class="mt-[2rpx] text-[18rpx] text-[#9CA3AF]">
                  {{ energy.description }}
                </text>
              </view>
            </view>
          </view>

          <!-- 车型选择 -->
          <view>
            <text class="mb-[16rpx] block text-[22rpx] text-[#6B7280] font-semibold">
              车型偏好
            </text>
            <view class="grid grid-cols-3 gap-[12rpx]">
              <view
                v-for="carType in carTypes"
                :key="carType.type"
                class="relative flex flex-col items-center justify-center border rounded-[20rpx] border-solid py-[20rpx] transition-all duration-200 active:scale-98"
                :class="[
                  selectedCarType === carType.type
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/8 shadow-sm'
                    : 'border-[#E5E7EB] bg-[#FAFAFA]',
                ]"
                @tap="selectCarType(carType.type)"
              >
                <!-- 推荐角标 -->
                <view v-if="carType.isRecommended" class="absolute right-0 top-0 flex rounded-bl-[10rpx] rounded-tr-[18rpx] from-[#FF7A1A] to-[#FF9A4A] bg-gradient-to-r px-[8rpx] py-[2rpx]">
                  <text class="text-[16rpx] text-white font-bold">
                    推荐
                  </text>
                </view>

                <text
                  class="mb-[6rpx] text-[32rpx]"
                  :class="`${carType.icon === 'directions-car' ? 'i-streamline-cyber-color:car-4' : carType.icon === 'airport-shuttle' ? 'i-streamline-cyber-color:cloud' : 'i-streamline-cyber-color:campfire'}`"
                  :style="{ color: getIconColor(carType.color, selectedCarType === carType.type) }"
                />
                <text
                  class="text-[22rpx] font-semibold"
                  :class="selectedCarType === carType.type ? 'text-[#8B5CF6]' : 'text-[#1F2937]'"
                >
                  {{ carType.name }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 库存提示或无车辆提示 - 优化版 -->
        <view class="box-border h-[132rpx] border border-white/50 rounded-[28rpx] border-solid bg-white p-[24rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <!-- 加载骨架 -->
          <!-- <view v-if="priceLoading" class="flex items-center">
            <view class="h-[48rpx] w-[48rpx] animate-pulse rounded-full bg-gray-200" />
            <view class="ml-[16rpx] flex-1">
              <view class="h-[28rpx] w-[140rpx] animate-pulse rounded-[8rpx] bg-gray-200" />
              <view class="mt-[10rpx] h-[22rpx] w-[220rpx] animate-pulse rounded-[8rpx] bg-gray-100" />
            </view>
          </view> -->

          <!-- 实际内容 v-else -->
          <view class="flex items-center h-[84rpx]">
            <view
              class="h-[48rpx] w-[48rpx] flex flex-shrink-0 items-center justify-center rounded-full"
              :class="noVehicleAvailable ? 'bg-[#FEE2E2]' : 'bg-[#EDE9FE]'"
            >
              <text
                class="text-[28rpx]"
                :class="noVehicleAvailable ? 'i-lets-icons:close-ring-duotone text-[#EF4444]' : 'i-lets-icons:box-alt-light text-[#8B5CF6]'"
              />
            </view>
            <view class="ml-[16rpx] flex-1 grid grid-rows-2">
              <text class="text-[26rpx] font-bold mb-[4rpx] " :class="noVehicleAvailable ? 'text-[#EF4444]' : 'text-[#1F2937]'">
                {{ noVehicleAvailable ? '暂无可用车辆' : '库存提示' }}
              </text>
              <view v-if="noVehicleAvailable" class="text-[20rpx] text-[#9CA3AF] leading-relaxed">
                <text>该组合暂无车辆，请选择其他偏好</text>
              </view>
              <view v-else-if="priceInfo" class="flex items-center text-[20rpx] text-[#6B7280]">
                <text>当前仅剩</text>
                <text class="mx-[6rpx] text-[26rpx] text-[#FF7A1A] font-bold">
                  {{ priceInfo.availableCount }}
                </text>
                <text>盒，售完即止</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 盲盒服务规则 - 优化版 -->
        <view class="border border-white/50 rounded-[28rpx] border-solid bg-white p-[28rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="mb-[20rpx] flex items-center">
            <view class="h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full bg-[#EDE9FE]">
              <text class="i-lets-icons:alarm-light text-[24rpx] text-[#8B5CF6]" />
            </view>
            <text class="ml-[12rpx] text-[28rpx] text-[#0F172A] font-bold">
              服务规则与说明
            </text>
          </view>
          <view class="space-y-[16rpx]">
            <view v-for="(rule, index) in rules" :key="index" class="flex items-start">
              <view class="mr-[12rpx] mt-[2rpx] h-[32rpx] w-[32rpx] flex flex-shrink-0 items-center justify-center rounded-full bg-[#F9FAFB] text-[20rpx] text-[#9CA3AF] font-bold">
                {{ index + 1 }}
              </view>
              <text class="flex-1 text-[22rpx] text-[#6B7280] leading-relaxed">
                {{ rule }}
              </text>
            </view>
          </view>
          <view class="mt-[24rpx] border-t border-[#F3F4F6] border-t-solid pt-[20rpx] text-center">
            <text class="text-[20rpx] text-[#D1D5DB]">
              最终解释权归平台所有
            </text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="h-[200rpx]" />
    </scroll-view>

    <!-- 底部购买栏 - 优化版 -->
    <view class="absolute bottom-0 left-0 right-0 z-30 border-t border-[#E5E7EB]/80 border-t-solid bg-white px-[40rpx] pb-[55rpx] pt-[20rpx] shadow-[0_-8rpx_32rpx_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <view class="flex items-center justify-between">
        <view class="flex-1">
          <view v-if="noVehicleAvailable" class="flex flex-col">
            <text class="text-[22rpx] text-[#EF4444] font-semibold">
              该组合暂无车辆
            </text>
            <text class="mt-[2rpx] text-[20rpx] text-[#D1D5DB]">
              请选择其他偏好
            </text>
          </view>
          <view v-else class="flex items-baseline">
            <text class="text-[24rpx] text-[#FF7A1A] font-bold">
              ¥
            </text>
            <text class="mx-[4rpx] text-[44rpx] text-[#FF7A1A] font-bold leading-none">
              {{ priceInfo ? priceInfo.finalPrice : activityInfo.startPrice }}
            </text>
            <text class="text-[20rpx] text-[#9CA3AF]">
              /天
            </text>
          </view>
        </view>

        <button
          class="m-0 h-[88rpx] w-[360rpx] flex items-center justify-center rounded-full text-[28rpx] text-white font-bold shadow-[0_8rpx_24rpx_-4rpx_rgba(139,92,246,0.4)] transition-all active:scale-98 active:shadow-[0_4rpx_16rpx_-4rpx_rgba(139,92,246,0.4)]"
          :class="!canPurchase || orderLoading ? 'bg-[#BA9DFB]' : 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]'"
          @tap="purchaseMysteryBox"
        >
          <text v-if="orderLoading" class="i-lets-icons:ring-duotone mr-[10rpx] animate-spin text-[28rpx]" />
          <text>{{ orderLoading ? '处理中...' : noVehicleAvailable ? '暂无车辆' : '立即购买' }}</text>
        </button>
      </view>
    </view>

    <!-- 弹窗组件 -->
    <DateTimePicker
      v-model:visible="showDatePicker"
      :start-date="timeForm.startDate"
      :start-time="timeForm.startTime"
      @confirm="handleDateTimeConfirm"
    />
  </view>
</template>

<route lang="yaml">
layout: home
</route>
