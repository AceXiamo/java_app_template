<script setup lang="ts">
import { computed } from 'vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import type { InsuranceProduct } from '@/api/booking'

interface Props {
  visible: boolean
  insuranceProducts: Record<string, InsuranceProduct>
  selectedInsurance: InsuranceProduct | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select', insurance: InsuranceProduct | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function selectInsurance(insurance: InsuranceProduct | null) {
  emit('select', insurance)
}

// 检查是否选中
function isSelected(insurance: InsuranceProduct): boolean {
  if (!props.selectedInsurance || !insurance) {
    return false
  }
  // 使用字符串比较，因为后端返回的是字符串类型ID
  return props.selectedInsurance.productId === insurance.productId
}

// 检查是否选中基础保障
function isBasicSelected(): boolean {
  return props.selectedInsurance === null
}
</script>

<template>
  <BottomDrawer v-model:visible="localVisible" title="选择保险产品" height="80vh">
    <view class="flex h-full max-h-[calc(80vh-120rpx)] flex-col pt-[20rpx]">
      <!-- 保险说明 -->
      <view class="mb-[24rpx] rounded-[16rpx] bg-gray-50 p-[20rpx] flex-shrink-0">
        <view class="mb-[8rpx] flex items-center">
          <text class="i-material-symbols-info mr-[8rpx] text-[20rpx] text-gray-600" />
          <text class="text-[24rpx] text-gray-800 font-medium">
            保险说明
          </text>
        </view>
        <text class="text-[22rpx] text-gray-700 leading-[32rpx]">
          车辆已含基础保险（交强险、三者险），可选购额外保险降低风险
        </text>
      </view>

      <!-- 保险列表 - 可滚动区域 -->
      <view class="flex-1 min-h-0">
        <scroll-view scroll-y class="h-full">
          <view class="space-y-[16rpx] px-[4rpx]">
            <!-- 不选择额外保险（只使用默认保险） -->
            <view
              class="relative border-2 rounded-[16rpx] p-[24rpx] transition-all"
              :class="
                isBasicSelected()
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              "
              @tap="selectInsurance(null)"
            >
              <!-- 选中状态指示器 -->
              <view
                v-if="isBasicSelected()"
                class="absolute right-[16rpx] top-[16rpx] h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-blue-600"
              >
                <text class="i-material-symbols-check text-[16rpx] text-white" />
              </view>

              <view class="pr-[40rpx]">
                <view class="mb-[8rpx] flex items-center">
                  <text class="i-material-symbols-close mr-[8rpx] text-[24rpx] text-gray-500" />
                  <text class="text-[26rpx] text-black font-medium">
                    不购买保险
                  </text>
                </view>
                <text class="mb-[8rpx] block text-[22rpx] text-gray-600">
                  不购买任何额外保险产品
                </text>
                <view class="flex items-center justify-between">
                  <text class="text-[20rpx] text-gray-500">
                    自承担用车风险
                  </text>
                  <text class="text-[24rpx] text-gray-600 font-medium">
                    ¥0
                  </text>
                </view>
              </view>
            </view>

            <!-- 保险产品列表 -->
            <view
              v-for="(insurance, index) in Object.values(insuranceProducts)"
              :key="`insurance-${insurance.productId}-${index}`"
              class="relative border-2 rounded-[16rpx] p-[24rpx] transition-all"
              :class="
                isSelected(insurance)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              "
              @tap="selectInsurance(insurance)"
            >
              <!-- 选中状态指示器 -->
              <view
                v-if="isSelected(insurance)"
                class="absolute right-[16rpx] top-[16rpx] h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-blue-600"
              >
                <text class="i-material-symbols-check text-[16rpx] text-white" />
              </view>

              <view>
                <view class="mb-[8rpx] flex items-center">
                  <text class="i-material-symbols-security mr-[8rpx] text-[24rpx] text-blue-600" />
                  <text class="text-[26rpx] text-black font-medium">
                    {{ insurance.productName || '未知保险' }}
                  </text>
                  <!-- 推荐标识 -->
                  <text
                    v-if="insurance.price > 0 && insurance.price <= 39"
                    class="ml-[12rpx] rounded-[8rpx] bg-orange-100 px-[8rpx] py-[2rpx] text-[18rpx] text-orange-600"
                  >
                    推荐
                  </text>
                  <!-- 高级标识 -->
                  <text
                    v-if="insurance.price > 50"
                    class="ml-[12rpx] rounded-[8rpx] bg-purple-100 px-[8rpx] py-[2rpx] text-[18rpx] text-purple-600"
                  >
                    高级
                  </text>
                </view>

                <text class="mb-[12rpx] block text-[22rpx] text-gray-600 leading-[32rpx]">
                  {{ insurance.coverageDescription || '暂无保障说明' }}
                </text>

                <!-- 保障详情 -->
                <view class="mb-[12rpx] rounded-[12rpx] bg-gray-50 p-[16rpx]">
                  <view class="mb-[8rpx] flex items-center justify-between">
                    <text class="text-[20rpx] text-gray-600">
                      最高保额
                    </text>
                    <text class="text-[22rpx] text-orange-600 font-medium">
                      ¥{{ (insurance.coverageAmount || 0).toLocaleString() }}
                    </text>
                  </view>
                  <view class="flex items-center justify-between">
                    <text class="text-[20rpx] text-gray-600">
                      保险费用
                    </text>
                    <text
                      class="text-[24rpx] font-bold"
                      :class="insurance.price === 0 ? 'text-green-600' : 'text-blue-600'"
                    >
                      {{ insurance.price === 0 ? '免费' : `¥${insurance.price}` }}
                    </text>
                  </view>
                </view>

                <view class="flex items-center text-[18rpx] text-gray-500">
                  <text class="i-material-symbols-verified mr-[4rpx] text-[16rpx] text-green-500" />
                  <text>由合作保险公司承保，理赔快速</text>
                </view>
              </view>
            </view>
          </view>
          <!-- 底部留白，防止被固定按钮遮挡 -->
          <view class="h-[120rpx]" />
        </scroll-view>
      </view>

      <!-- 底部固定按钮 -->
      <view class="flex-shrink-0 border-t border-gray-100 bg-white pt-[24rpx]">
        <view
          class="w-full rounded-[20rpx] bg-blue-600 py-[24rpx] text-center text-[28rpx] text-white font-medium"
          @tap="localVisible = false"
        >
          确认选择
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
