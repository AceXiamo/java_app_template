<script setup lang="ts">
import { computed } from 'vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import type { ValueAddedService } from '@/api/booking'

interface Props {
  visible: boolean
  valueAddedServices: Record<string, ValueAddedService>
  selectedServices: string[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'selectService', serviceId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// 检查服务是否被选中
function isServiceSelected(serviceId: string): boolean {
  return props.selectedServices.includes(serviceId)
}

function toggleService(serviceId: string) {
  emit('selectService', serviceId)
}

// 计算选中服务的总价
const totalPrice = computed(() => {
  return props.selectedServices.reduce((total, serviceId) => {
    const service = props.valueAddedServices[serviceId]
    return total + (service?.price || 0)
  }, 0)
})

// 获取选中的服务信息
const selectedServicesList = computed(() => {
  return props.selectedServices.map(serviceId => props.valueAddedServices[serviceId]).filter(Boolean)
})
</script>

<template>
  <BottomDrawer v-model:visible="localVisible" title="选择增值服务" height="80vh">
    <view class="h-full max-h-[calc(80vh-120rpx)] flex flex-col pt-[20rpx]">
      <!-- 服务说明 -->
      <view class="mb-[24rpx] flex-shrink-0 rounded-[16rpx] bg-gray-50 p-[20rpx]">
        <view class="mb-[8rpx] flex items-center">
          <text class="i-material-symbols-build mr-[8rpx] text-[20rpx] text-gray-600" />
          <text class="text-[24rpx] text-gray-800 font-medium">
            增值服务
          </text>
        </view>
        <text class="text-[22rpx] text-gray-700 leading-[32rpx]">
          可选购专业服务，提升用车体验，支持多选
        </text>
      </view>

      <!-- 服务列表 - 可滚动区域 -->
      <view class="min-h-0 flex-1">
        <scroll-view scroll-y class="h-full">
          <view class="px-[4rpx] space-y-[16rpx]">
            <view
              v-for="service in Object.values(valueAddedServices)"
              :key="service.serviceId"
              class="relative border-2 rounded-[16rpx] p-[24rpx] transition-all"
              :class="
                isServiceSelected(service.serviceId)
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white'
              "
              @tap="toggleService(service.serviceId)"
            >
              <!-- 选中状态指示器 -->
              <view
                v-if="isServiceSelected(service.serviceId)"
                class="absolute right-[16rpx] top-[16rpx] h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-green-600"
              >
                <text class="i-material-symbols-check text-[16rpx] text-white" />
              </view>

              <!-- 服务信息 -->
              <view class="pr-[40rpx]">
                <view class="mb-[8rpx] flex items-center">
                  <text class="i-material-symbols-auto-awesome mr-[8rpx] text-[24rpx] text-green-600" />
                  <text class="text-[26rpx] text-black font-medium">
                    {{ service.serviceName || '未知服务' }}
                  </text>
                </view>

                <text class="mb-[12rpx] block text-[22rpx] text-gray-600 leading-[32rpx]">
                  {{ service.description || '暂无描述' }}
                </text>

                <!-- 价格信息 -->
                <view class="mb-[12rpx] rounded-[12rpx] bg-gray-50 p-[16rpx]">
                  <view class="flex items-center justify-between">
                    <text class="text-[20rpx] text-gray-600">
                      服务价格
                    </text>
                    <text class="text-[24rpx] text-green-600 font-bold">
                      ¥{{ service.price || 0 }}
                    </text>
                  </view>
                </view>

                <!-- 服务特色 -->
                <view class="flex items-center text-[18rpx] text-gray-500">
                  <text class="i-material-symbols-verified mr-[4rpx] text-[16rpx] text-green-500" />
                  <text>专业团队服务，品质保障</text>
                </view>
              </view>
            </view>
          </view>
          <!-- 底部留白，防止被固定按钮遮挡 -->
          <view class="h-[200rpx]" />
        </scroll-view>
      </view>

      <!-- 底部固定区域 -->
      <view class="flex-shrink-0 border-t border-gray-100 bg-white pt-[24rpx]">
        <!-- 费用汇总 -->
        <view v-if="selectedServices.length > 0" class="mb-[16rpx] rounded-[12rpx] bg-gray-50 p-[16rpx]">
          <view class="mb-[8rpx] flex items-center">
            <text class="i-material-symbols-receipt mr-[8rpx] text-[20rpx] text-gray-600" />
            <text class="text-[22rpx] text-gray-800 font-medium">
              已选服务
            </text>
          </view>
          <view class="max-h-[120rpx] overflow-hidden">
            <view class="space-y-[4rpx]">
              <view
                v-for="(service, index) in selectedServicesList"
                :key="index"
                class="flex items-center justify-between text-[20rpx]"
              >
                <text class="truncate text-gray-600">
                  {{ service.serviceName || '未知服务' }}
                </text>
                <text class="ml-[8rpx] flex-shrink-0 text-gray-700 font-medium">
                  ¥{{ service.price || 0 }}
                </text>
              </view>
            </view>
          </view>
          <view class="mt-[8rpx] flex items-center justify-between border-t border-gray-200 pt-[8rpx]">
            <text class="text-[22rpx] text-gray-800 font-medium">
              服务费小计
            </text>
            <text class="text-[24rpx] text-gray-900 font-bold">
              ¥{{ totalPrice }}
            </text>
          </view>
        </view>

        <view
          class="w-full rounded-[20rpx] bg-blue-600 py-[24rpx] text-center text-[28rpx] text-white font-medium"
          @tap="localVisible = false"
        >
          确认选择{{ selectedServices.length > 0 ? `（${selectedServices.length}项）` : '' }}
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
