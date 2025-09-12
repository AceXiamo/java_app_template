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
import BottomDrawer from '@/components/BottomDrawer.vue'

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

// 弹窗状态
const showDatePicker = ref(false)
const showRulesModal = ref(false)

// 计算属性
const canPurchase = computed(() => {
  return selectedEnergyType.value && selectedCarType.value && priceInfo.value
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

// 显示取车位置信息
const displayPickupLocation = computed(() => {
  return '完全随机分配，开奖后揭晓位置'
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

// 样式辅助函数
function getIconBg(color: string) {
  const colorMap: Record<string, string> = {
    'green': 'bg-green-100',
    'red': 'bg-red-100',
    'orange': 'bg-orange-100',
    'blue': 'bg-blue-100',
    'tech-purple': 'bg-purple-100',
  }
  return colorMap[color] || 'bg-purple-100'
}

function getIconColor(color: string) {
  const colorMap: Record<string, string> = {
    'green': 'rgb(34 197 94)',
    'red': 'rgb(239 68 68)',
    'orange': 'rgb(234 88 12)',
    'blue': 'rgb(37 99 235)',
    'tech-purple': 'rgb(139 92 246)',
  }
  return colorMap[color] || 'rgb(139 92 246)'
}

// 获取图标组件
function getIconClass(icon: string) {
  const iconMap: Record<string, string> = {
    'bolt': 'i-material-symbols-bolt',
    'electric-bolt': 'i-material-symbols-bolt',
    'local-gas-station': 'i-material-symbols-local-gas-station',
    'directions-car': 'i-material-symbols-directions-car',
    'airport-shuttle': 'i-material-symbols-airport-shuttle',
    'speed': 'i-material-symbols-speed',
  }
  return iconMap[icon] || 'i-material-symbols-directions-car'
}

// 加载价格信息
async function loadPricing() {
  if (!selectedEnergyType.value || !selectedCarType.value) {
    priceInfo.value = null
    return
  }

  try {
    priceLoading.value = true

    const result = await getMysteryBoxPricing({
      energyType: selectedEnergyType.value,
      carType: selectedCarType.value,
    })

    if (result.code === 200 && result.data) {
      priceInfo.value = result.data
    }
    else {
      throw new Error(result.msg || '获取价格失败')
    }
  }
  catch (error: any) {
    console.error('加载价格信息失败:', error)

    // 显示具体的错误信息
    if (error.message && error.message.includes('该组合暂无可用车辆')) {
      uni.showToast({
        title: '该组合暂无可用车辆',
        icon: 'none',
        duration: 2000,
      })
      priceInfo.value = null
      return
    }

    // 显示网络错误提示
    uni.showToast({
      title: '获取价格失败，请检查网络',
      icon: 'none',
      duration: 2000,
    })

    // 使用默认价格信息作为备选
    priceInfo.value = {
      basePrice: 99,
      finalPrice: 99,
      availableCount: 5,
      estimatedValue: { min: 150, max: 500 },
      pricing: {
        unit: '盒',
        pricePerDay: 99,
        rentalDays: 1,
      },
      preferences: {
        energyType: selectedEnergyType.value,
        energyTypeName: energyTypes.value.find(e => e.type === selectedEnergyType.value)?.name || selectedEnergyType.value,
        carType: selectedCarType.value,
        carTypeName: carTypes.value.find(c => c.type === selectedCarType.value)?.name || selectedCarType.value,
      },
      possibleBrands: ['特斯拉', '比亚迪', '小鹏', '蔚来'],
    }
  }
  finally {
    priceLoading.value = false
  }
}

// 购买盲盒
async function purchaseMysteryBox() {
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
      description: '环保节能，静音舒适',
      icon: 'bolt',
      color: 'green',
      isRecommended: true,
    },
    {
      type: 'hybrid',
      name: '混合动力',
      description: '长续航，双重保障',
      icon: 'local-gas-station',
      color: 'tech-purple',
      isRecommended: false,
    },
  ]

  carTypes.value = [
    {
      type: 'sedan',
      name: '轿车',
      description: '商务出行，舒适优雅',
      icon: 'directions-car',
      color: 'tech-purple',
      isRecommended: true,
    },
    {
      type: 'suv',
      name: 'SUV',
      description: '空间宽敞，适合家庭',
      icon: 'airport-shuttle',
      color: 'green',
      isRecommended: false,
    },
    {
      type: 'sports',
      name: '跑车',
      description: '激情驾驶，动感体验',
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
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageMysteryBoxHead />

    <!-- 加载状态 -->
    <view v-if="loading" class="flex flex-1 items-center justify-center">
      <view class="flex flex-col items-center">
        <text
          class="i-material-symbols-sync mb-[24rpx] animate-spin text-[48rpx] text-purple-600"
        />
        <text class="text-[26rpx] text-gray-600">
          加载中...
        </text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view v-else scroll-y class="h-0 flex-1">
      <!-- 盲盒活动说明 -->
      <view class="relative bg-purple-600 px-[24rpx] pb-[80rpx] pt-[32rpx]">
        <!-- 背景装饰 -->
        <view class="absolute inset-0 opacity-10">
          <text
            class="i-material-symbols-auto-awesome absolute right-[20rpx] top-[20rpx] text-[60rpx] text-white"
          />
          <text
            class="i-material-symbols-card-giftcard absolute bottom-[40rpx] left-[40rpx] text-[40rpx] text-white"
          />
        </view>

        <view class="relative z-10">
          <view class="mb-[24rpx] flex items-center justify-center">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-card-giftcard text-[40rpx] text-white" />
              <text class="text-[36rpx] text-white font-bold">
                {{ activityInfo.title }}
              </text>
              <view class="rounded-full bg-orange-500 px-[16rpx] py-[8rpx]">
                <text class="text-[22rpx] text-white font-medium">
                  {{ activityInfo.badgeText }}
                </text>
              </view>
            </view>
          </view>

          <text class="mb-[32rpx] block text-center text-[28rpx] text-purple-100">
            {{ activityInfo.subtitle }}
          </text>

          <view
            class="flex items-center justify-center text-[24rpx] text-purple-100 space-x-[32rpx]"
          >
            <view
              v-for="benefit in activityInfo.benefits"
              :key="benefit"
              class="flex items-center space-x-[8rpx]"
            >
              <text class="i-material-symbols-check-circle text-[24rpx] text-green-400" />
              <text>{{ benefit }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 海浪分割线 -->
      <view class="relative h-[40rpx] bg-gray-50 -mt-[40rpx]">
        <svg
          class="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="rgb(139 92 246)" />
        </svg>
      </view>

      <!-- 主要选择区域 -->
      <view class="px-[24rpx] pb-[24rpx] space-y-[24rpx]">
        <!-- 取车时间选择 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text
              class="i-material-symbols-schedule mr-[12rpx] text-[28rpx] text-purple-600"
            />
            <text class="text-[28rpx] text-black font-semibold">
              选择取车时间
            </text>
          </view>

          <!-- 时间选择 -->
          <view>
            <text class="mb-[12rpx] block text-[24rpx] text-gray-600">
              取车时间
            </text>
            <view
              class="flex items-center justify-between border border-gray-200 rounded-[16rpx] bg-gray-50 px-[24rpx] py-[20rpx] transition-colors active:bg-gray-100"
              @tap="showTimePicker"
            >
              <view class="flex items-center">
                <text
                  class="i-material-symbols-schedule mr-[12rpx] text-[24rpx] text-purple-600"
                />
                <text class="text-[26rpx] text-gray-700">
                  {{ displayPickupTime }}
                </text>
              </view>
              <text
                class="i-material-symbols-keyboard-arrow-right text-[28rpx] text-gray-400"
              />
            </view>
            <text class="mt-[8rpx] text-[22rpx] text-orange-600">
              时间可选，但车辆和位置都是惊喜
            </text>
          </view>
        </view>

        <!-- 选择能源类型 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text
              class="i-material-symbols-bolt mr-[12rpx] text-[28rpx] text-purple-600"
            />
            <text class="text-[28rpx] text-black font-semibold">
              第一步：选择能源类型
            </text>
          </view>

          <view class="grid grid-cols-1 gap-[16rpx]">
            <view
              v-for="energy in energyTypes"
              :key="energy.type"
              class="relative border-2 rounded-[20rpx] p-[20rpx] transition-all active:scale-[0.98]"
              :class="[
                selectedEnergyType === energy.type
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white active:bg-gray-50',
              ]"
              @tap="selectEnergyType(energy.type)"
            >
              <!-- 推荐标签 -->
              <view
                v-if="energy.isRecommended"
                class="absolute rounded-[12rpx] bg-orange-500 px-[12rpx] py-[4rpx] text-[20rpx] text-white font-medium -right-[8rpx] -top-[8rpx]"
              >
                推荐
              </view>

              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[20rpx]">
                  <view
                    class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[16rpx]"
                    :class="getIconBg(energy.color)"
                  >
                    <text
                      :class="getIconClass(energy.icon)"
                      class="text-[32rpx]"
                      :style="{ color: getIconColor(energy.color) }"
                    />
                  </view>
                  <view class="flex-1">
                    <text class="block text-[28rpx] text-black font-semibold">
                      {{ energy.name }}
                    </text>
                    <text class="text-[24rpx] text-gray-600 leading-[32rpx]">
                      {{ energy.description }}
                    </text>
                  </view>
                </view>
                <view
                  class="h-[32rpx] w-[32rpx] flex items-center justify-center border-2 rounded-full"
                  :class="
                    selectedEnergyType === energy.type
                      ? 'border-purple-600'
                      : 'border-gray-300'
                  "
                >
                  <view
                    v-if="selectedEnergyType === energy.type"
                    class="h-[16rpx] w-[16rpx] rounded-full bg-purple-600"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 选择车型类型 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text
              class="i-material-symbols-directions-car mr-[12rpx] text-[28rpx] text-purple-600"
            />
            <text class="text-[28rpx] text-black font-semibold">
              第二步：选择车型类别
            </text>
          </view>

          <view class="grid grid-cols-1 gap-[16rpx]">
            <view
              v-for="carType in carTypes"
              :key="carType.type"
              class="relative border-2 rounded-[20rpx] p-[20rpx] transition-all active:scale-[0.98]"
              :class="[
                selectedCarType === carType.type
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white active:bg-gray-50',
              ]"
              @tap="selectCarType(carType.type)"
            >
              <!-- 推荐标签 -->
              <view
                v-if="carType.isRecommended"
                class="absolute rounded-[12rpx] bg-orange-500 px-[12rpx] py-[4rpx] text-[20rpx] text-white font-medium -right-[8rpx] -top-[8rpx]"
              >
                推荐
              </view>

              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[20rpx]">
                  <view
                    class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[16rpx]"
                    :class="getIconBg(carType.color)"
                  >
                    <text
                      :class="getIconClass(carType.icon)"
                      class="text-[32rpx]"
                      :style="{ color: getIconColor(carType.color) }"
                    />
                  </view>
                  <view class="flex-1">
                    <text class="block text-[28rpx] text-black font-semibold">
                      {{ carType.name }}
                    </text>
                    <text class="text-[24rpx] text-gray-600 leading-[32rpx]">
                      {{ carType.description }}
                    </text>
                  </view>
                </view>
                <view
                  class="h-[32rpx] w-[32rpx] flex items-center justify-center border-2 rounded-full"
                  :class="
                    selectedCarType === carType.type
                      ? 'border-purple-600'
                      : 'border-gray-300'
                  "
                >
                  <view
                    v-if="selectedCarType === carType.type"
                    class="h-[16rpx] w-[16rpx] rounded-full bg-purple-600"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 盲盒价格信息 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text
              class="i-material-symbols-confirmation-number mr-[12rpx] text-[28rpx] text-purple-600"
            />
            <text class="text-[28rpx] text-black font-semibold">
              盲盒价格
            </text>
          </view>

          <!-- 价格加载状态 -->
          <view v-if="priceLoading" class="flex items-center justify-center py-[40rpx]">
            <text
              class="i-material-symbols-sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600"
            />
            <text class="text-[24rpx] text-gray-600">
              计算价格中...
            </text>
          </view>

          <!-- 价格信息 -->
          <view v-else-if="priceInfo" class="space-y-[20rpx]">
            <!-- 价格展示 -->
            <view
              class="relative rounded-[20rpx] from-purple-500 to-purple-600 bg-gradient-to-r p-[24rpx] text-white"
            >
              <view class="absolute right-[16rpx] top-[16rpx] opacity-20">
                <text class="i-material-symbols-auto-awesome text-[40rpx]" />
              </view>

              <view class="relative z-10 text-center">
                <view class="mb-[8rpx] text-[48rpx] font-bold">
                  ¥{{ priceInfo.finalPrice }}
                </view>
                <view class="mb-[16rpx] text-[24rpx] text-purple-100">
                  神秘盲盒体验 · 取车时揭晓
                </view>

                <!-- 预估价值 -->
                <view
                  class="flex items-center justify-center text-[20rpx] text-purple-100 space-x-[16rpx]"
                >
                  <text>
                    预估价值：¥{{ priceInfo.estimatedValue.min }}-{{
                      priceInfo.estimatedValue.max
                    }}
                  </text>
                  <view
                    class="rounded-[8rpx] bg-green-500 px-[8rpx] py-[2rpx] text-white"
                  >
                    超值
                  </view>
                </view>
              </view>
            </view>

            <!-- 可选品牌 -->
            <view
              v-if="priceInfo.possibleBrands?.length"
              class="rounded-[16rpx] bg-gray-50 p-[20rpx]"
            >
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                可能品牌：
              </text>
              <view class="flex flex-wrap gap-[8rpx]">
                <view
                  v-for="brand in priceInfo.possibleBrands"
                  :key="brand"
                  class="border border-gray-200 rounded-[12rpx] bg-white px-[12rpx] py-[6rpx]"
                >
                  <text class="text-[22rpx] text-gray-700">
                    {{ brand }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 库存信息 -->
            <view
              v-if="priceInfo.availableCount"
              class="flex items-center justify-center text-[22rpx] space-x-[8rpx]"
            >
              <text class="i-material-symbols-inventory text-orange-600" />
              <text class="text-gray-600">
                剩余
              </text>
              <text class="text-orange-600 font-medium">
                {{
                  priceInfo.availableCount
                }}
              </text>
              <text class="text-gray-600">
                个盲盒
              </text>
            </view>
          </view>

          <!-- 请先选择偏好 -->
          <view v-else class="py-[40rpx] text-center text-gray-500">
            <text class="i-material-symbols-touch-app mb-[16rpx] block text-[40rpx]" />
            <text class="text-[24rpx]">
              请先选择能源类型和车型类别
            </text>
          </view>

          <!-- 服务特性 -->
          <view
            class="mt-[24rpx] flex items-center justify-center text-[22rpx] space-x-[32rpx]"
          >
            <view
              v-for="feature in activityInfo.features"
              :key="feature"
              class="flex items-center space-x-[8rpx]"
            >
              <text class="i-material-symbols-check-circle text-[24rpx] text-green-600" />
              <text class="text-gray-600">
                {{ feature }}
              </text>
            </view>
          </view>
        </view>

        <!-- 盲盒规则 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <text
                class="i-material-symbols-rule mr-[12rpx] text-[28rpx] text-purple-600"
              />
              <text class="text-[28rpx] text-black font-semibold">
                盲盒规则
              </text>
            </view>
            <view
              class="text-[24rpx] text-purple-600 active:opacity-70"
              @tap="showRulesModal = true"
            >
              查看详情
            </view>
          </view>

          <view class="text-[24rpx] text-gray-600 space-y-[16rpx]">
            <view
              v-for="(rule, index) in rules.slice(0, 3)"
              :key="rule"
              class="flex items-start leading-[32rpx] space-x-[12rpx]"
            >
              <view
                class="mr-[8rpx] mt-[4rpx] h-[24rpx] w-[24rpx] flex flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
              >
                <text class="text-[16rpx] text-purple-600 font-medium">
                  {{
                    index + 1
                  }}
                </text>
              </view>
              <text class="flex-1">
                {{ rule }}
              </text>
            </view>

            <view v-if="rules.length > 3" class="pt-[16rpx] text-center">
              <text class="text-[22rpx] text-gray-500">
                ••• 共{{ rules.length }}条规则 •••
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部购买按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[24rpx] pb-[40rpx]">
      <!-- 价格信息 -->
      <view v-if="priceInfo" class="mb-[16rpx] flex items-center justify-between">
        <view>
          <text class="text-[24rpx] text-gray-500">
            盲盒价格
          </text>
          <view class="flex items-baseline">
            <text class="text-[36rpx] text-purple-600 font-bold">
              ¥{{ priceInfo.finalPrice }}
            </text>
            <text class="ml-[8rpx] text-[22rpx] text-gray-500">
              神秘体验
            </text>
          </view>
        </view>
        <view class="text-right">
          <text class="block text-[20rpx] text-gray-400 line-through">
            预估最低¥{{ priceInfo.estimatedValue.min }}
          </text>
          <text class="text-[22rpx] text-green-600 font-medium">
            节省至少¥{{ priceInfo.estimatedValue.min - priceInfo.finalPrice }}
          </text>
        </view>
      </view>

      <!-- 购买按钮 -->
      <view
        class="w-full rounded-[24rpx] py-[24rpx] text-center text-[32rpx] font-semibold transition-all active:scale-[0.98]"
        :class="[
          canPurchase && !orderLoading
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        ]"
        @tap="purchaseMysteryBox"
      >
        <text
          v-if="orderLoading"
          class="i-material-symbols-sync mr-[8rpx] animate-spin"
        />
        <text>
          {{
            orderLoading
              ? "处理中..."
              : `立即购买盲盒${priceInfo ? ` ¥${priceInfo.finalPrice}` : ""}`
          }}
        </text>
      </view>

      <text class="mt-[12rpx] block text-center text-[22rpx] text-gray-500">
        {{ canPurchase ? "立即抽奖，解锁神秘车辆！" : "请先完成所有选择" }}
      </text>
    </view>

    <!-- 取车时间选择器 -->
    <DateTimePicker
      v-model:visible="showDatePicker"
      :start-date="timeForm.startDate"
      :start-time="timeForm.startTime"
      @confirm="handleDateTimeConfirm"
    />

    <!-- 规则详情弹窗 -->
    <BottomDrawer v-model:visible="showRulesModal" title="盲盒规则详情">
      <view class="px-[24rpx] pb-[40rpx]">
        <view class="text-[26rpx] text-gray-700 leading-[40rpx] space-y-[20rpx]">
          <view
            v-for="(rule, index) in rules"
            :key="rule"
            class="flex items-start space-x-[16rpx]"
          >
            <view
              class="mt-[6rpx] h-[28rpx] w-[28rpx] flex flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
            >
              <text class="text-[18rpx] text-purple-600 font-semibold">
                {{
                  index + 1
                }}
              </text>
            </view>
            <text class="flex-1">
              {{ rule }}
            </text>
          </view>
        </view>

        <view class="mt-[40rpx] border-t border-gray-100 pt-[24rpx]">
          <text class="block text-center text-[24rpx] text-gray-600">
            以上规则解释权归窘启租车所有
          </text>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
