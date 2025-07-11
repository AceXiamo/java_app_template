<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  type CarTypeOption,
  type EnergyTypeOption,
  type MysteryBoxActivity,
  getMysteryBoxActivity,
  getMysteryBoxOptions,
  purchaseMysteryBox as purchaseAPI,
} from '@/api/mysteryBox'

// 响应式数据
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

const energyTypes = ref<EnergyTypeOption[]>([])
const carTypes = ref<CarTypeOption[]>([])
const rules = ref<string[]>([])

const selectedEnergyType = ref<string>('')
const selectedCarType = ref<string>('')

const priceInfo = ref({
  basePrice: 99,
})

// 计算属性
const canPurchase = computed(() => {
  return selectedEnergyType.value && selectedCarType.value
})

// 方法
function selectEnergyType(type: string) {
  selectedEnergyType.value = type
}

function selectCarType(type: string) {
  selectedCarType.value = type
}

function getCarTypeIconBg(color: string) {
  switch (color) {
    case 'green':
      return 'bg-green-100'
    case 'red':
      return 'bg-red-100'
    default:
      return 'bg-purple-100'
  }
}

function getCarTypeIconColor(color: string) {
  switch (color) {
    case 'green':
      return 'rgb(34 197 94)'
    case 'red':
      return 'rgb(239 68 68)'
    default:
      return 'rgb(139 92 246)'
  }
}

function purchaseMysteryBox() {
  if (!canPurchase.value)
    return

  handlePurchase()
}

async function handlePurchase() {
  try {
    uni.showLoading({ title: '处理中...' })

    const result = await purchaseAPI({
      energyType: selectedEnergyType.value,
      carType: selectedCarType.value,
      days: 1,
      location: '人民广场',
    })

    uni.hideLoading()

    if (result.code === 200) {
      const energyTypeName = energyTypes.value.find(e => e.type === selectedEnergyType.value)?.name || selectedEnergyType.value
      const carTypeName = carTypes.value.find(c => c.type === selectedCarType.value)?.name || selectedCarType.value

      uni.showModal({
        title: '盲盒购买成功！',
        content: `选择偏好：\n能源类型：${energyTypeName}\n车型类别：${carTypeName}\n\n盲盒已分配，取车时揭晓神秘车型！\n取车码：${result.data.mysteryBoxId}`,
        showCancel: false,
        success: () => {
          // 可以跳转到订单页面
          uni.switchTab({
            url: '/pages/main/index',
          })
        },
      })
    }
  }
  catch {
    uni.hideLoading()
    uni.showToast({
      title: '购买失败，请重试',
      icon: 'none',
    })
  }
}

async function loadData() {
  try {
    // 加载活动信息
    const activityRes = await getMysteryBoxActivity()
    if (activityRes.code === 200) {
      activityInfo.value = activityRes.data.activity
      rules.value = activityRes.data.rules
    }

    // 加载选项配置
    const optionsRes = await getMysteryBoxOptions()
    if (optionsRes.code === 200) {
      energyTypes.value = optionsRes.data.energyTypes
      carTypes.value = optionsRes.data.carTypes
    }
  }
  catch {
    // 使用默认配置
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
        icon: 'directions-car',
        color: 'red',
        isRecommended: false,
      },
    ]

    rules.value = [
      '选择偏好后，系统随机分配符合条件的车辆',
      '支付成功后生成取车码，具体车型取车时揭晓',
      '盲盒车辆均为平台精选，品质有保障',
      '取车后如不满意，1小时内可免费更换一次',
    ]
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<template>
  <view relative h-full flex flex-col overflow-hidden bg-gray-50>
    <!-- 头部导航 -->
    <PageMysteryBoxHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <!-- 盲盒说明区域 -->
      <view class="flex-shrink-0 bg-gray-50 px-[40rpx] py-[32rpx]">
        <view class="border border-gray-200 rounded-[32rpx] bg-white p-[32rpx]">
          <view class="mb-[16rpx] flex items-center space-x-[16rpx]">
            <text
              class="i-material-symbols-card-giftcard text-[32rpx] text-purple-600"
            />
            <text class="text-[28rpx] text-black font-semibold">
              {{ activityInfo.title }}
            </text>
            <text class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[20rpx] text-purple-600">
              {{ activityInfo.badgeText }}
            </text>
          </view>
          <text class="mb-[16rpx] block text-[26rpx] text-gray-700">
            {{ activityInfo.subtitle }}
          </text>
          <view class="flex items-center text-[22rpx] text-gray-600 space-x-[24rpx]">
            <text v-for="benefit in activityInfo.benefits" :key="benefit">
              ✓ {{ benefit }}
            </text>
          </view>
        </view>
      </view>

      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 选择能源类型 -->
        <view class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center text-[30rpx] text-black font-semibold">
            <text
              class="i-material-symbols-bolt mr-[12rpx] text-purple-600"
            />
            <text>第一步：选择能源类型</text>
          </view>

          <view class="space-y-[16rpx]">
            <view
              v-for="energy in energyTypes"
              :key="energy.type"
              class="cursor-pointer rounded-[20rpx] p-[20rpx] transition-all"
              :class="selectedEnergyType === energy.type
                ? 'border border-purple-200 bg-purple-50'
                : 'border border-gray-200'"
              @tap="selectEnergyType(energy.type)"
            >
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[20rpx]">
                  <view
                    class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[12rpx]"
                    :class="energy.color === 'green' ? 'bg-green-100' : 'bg-purple-100'"
                  >
                    <text
                      v-if="energy.icon === 'bolt'"
                      class="i-material-symbols-bolt text-[28rpx]"
                      :style="{ color: energy.color === 'green' ? 'rgb(34 197 94)' : 'rgb(139 92 246)' }"
                    />
                    <text
                      v-else-if="energy.icon === 'local-gas-station'"
                      class="i-material-symbols-local-gas-station text-[28rpx]"
                      :style="{ color: energy.color === 'green' ? 'rgb(34 197 94)' : 'rgb(139 92 246)' }"
                    />
                  </view>
                  <view>
                    <text class="block text-[26rpx] text-black font-medium">
                      {{ energy.name }}
                    </text>
                    <text class="text-[22rpx] text-gray-600">
                      {{ energy.description }}
                    </text>
                  </view>
                </view>
                <view
                  class="h-[28rpx] w-[28rpx] flex items-center justify-center border rounded-full"
                  :class="selectedEnergyType === energy.type ? 'border-purple-300' : 'border-gray-300'"
                >
                  <view
                    v-if="selectedEnergyType === energy.type"
                    class="h-[14rpx] w-[14rpx] rounded-full bg-purple-600"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 选择车型类型 -->
        <view class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center text-[30rpx] text-black font-semibold">
            <text
              class="i-material-symbols-directions-car mr-[12rpx] text-purple-600"
            />
            <text>第二步：选择车型类别</text>
          </view>

          <view class="grid grid-cols-1 gap-[16rpx]">
            <view
              v-for="carType in carTypes"
              :key="carType.type"
              class="cursor-pointer rounded-[20rpx] p-[20rpx] transition-all"
              :class="selectedCarType === carType.type
                ? 'border border-purple-200 bg-purple-50'
                : 'border border-gray-200'"
              @tap="selectCarType(carType.type)"
            >
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[20rpx]">
                  <view
                    class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[12rpx]"
                    :class="getCarTypeIconBg(carType.color)"
                  >
                    <text
                      v-if="carType.icon === 'directions-car'"
                      class="i-material-symbols-directions-car text-[28rpx]"
                      :style="{ color: getCarTypeIconColor(carType.color) }"
                    />
                    <text
                      v-else-if="carType.icon === 'airport-shuttle'"
                      class="i-material-symbols-airport-shuttle text-[28rpx]"
                      :style="{ color: getCarTypeIconColor(carType.color) }"
                    />
                  </view>
                  <view>
                    <text class="block text-[26rpx] text-black font-medium">
                      {{ carType.name }}
                    </text>
                    <text class="text-[22rpx] text-gray-600">
                      {{ carType.description }}
                    </text>
                  </view>
                </view>
                <view
                  class="h-[28rpx] w-[28rpx] flex items-center justify-center border rounded-full"
                  :class="selectedCarType === carType.type ? 'border-purple-300' : 'border-gray-300'"
                >
                  <view
                    v-if="selectedCarType === carType.type"
                    class="h-[14rpx] w-[14rpx] rounded-full bg-purple-600"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 盲盒价格 -->
        <view class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center text-[30rpx] text-black font-semibold">
            <text
              class="i-material-symbols-confirmation-number mr-[12rpx] text-purple-600"
            />
            <text>盲盒价格</text>
          </view>

          <view class="border border-purple-200 rounded-[20rpx] bg-purple-50 p-[24rpx]">
            <view class="text-center">
              <view class="mb-[12rpx] text-[48rpx] text-purple-600 font-bold">
                ¥{{ priceInfo.basePrice }}
              </view>
              <view class="mb-[16rpx] text-[24rpx] text-gray-600">
                起步价 · 1天盲盒体验
              </view>
              <view class="flex items-center justify-center text-[20rpx] space-x-[24rpx]">
                <view
                  v-for="feature in activityInfo.features"
                  :key="feature"
                  class="flex items-center space-x-[6rpx]"
                >
                  <text
                    class="i-material-symbols-check-circle text-green-600"
                  />
                  <text>{{ feature }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 盲盒规则 -->
        <view class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center text-[30rpx] text-black font-semibold">
            <text
              class="i-material-symbols-rule mr-[12rpx] text-purple-600"
            />
            <text>盲盒规则</text>
          </view>
          <view class="text-[24rpx] text-gray-600 space-y-[12rpx]">
            <view
              v-for="(rule, index) in rules"
              :key="rule"
              class="flex items-start space-x-[12rpx]"
            >
              <text class="text-purple-600">
                {{ index + 1 }}.
              </text>
              <text>{{ rule }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部购买按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx]">
      <view
        class="w-full rounded-[20rpx] py-[28rpx] text-[32rpx] font-semibold transition-all text-center"
        :class="canPurchase
          ? 'bg-purple-600 text-white'
          : 'cursor-not-allowed bg-gray-300 text-gray-500'"
        @tap="purchaseMysteryBox"
      >
        立即购买盲盒 ¥{{ priceInfo.basePrice }}
      </view>
      <text class="mt-[12rpx] text-center text-[22rpx] text-gray-500">
        {{ canPurchase ? '点击购买，开始神秘之旅！' : '请先完成选择后购买' }}
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
