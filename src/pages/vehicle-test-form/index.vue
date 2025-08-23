<script setup lang="ts">
import { computed, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { submitVehicleTestApplication } from '@/api/vehicle-test'
import type { VehicleTestApplicationForm } from '@/api/vehicle-test'

// 声明uni全局变量
declare const uni: any

const formData = ref<VehicleTestApplicationForm>({
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  testRequirements: '',
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const showSuccess = ref(false)
const applicationNo = ref('')

const characterCount = computed(() => {
  return formData.value.testRequirements ? formData.value.testRequirements.length : 0
})

function validateForm() {
  errors.value = {}

  let isValid = true

  if (!formData.value.contactName.trim()) {
    errors.value.contactName = '请输入联系人姓名'
    isValid = false
  }
  else if (formData.value.contactName.trim().length < 2) {
    errors.value.contactName = '姓名至少2个字符'
    isValid = false
  }

  if (!formData.value.contactPhone.trim()) {
    errors.value.contactPhone = '请输入联系电话'
    isValid = false
  }
  else if (!/^1[3-9]\d{9}$/.test(formData.value.contactPhone.trim())) {
    errors.value.contactPhone = '请输入正确的手机号码'
    isValid = false
  }

  if (formData.value.contactEmail && formData.value.contactEmail.trim()
    && !/^[\w+.-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.value.contactEmail.trim())) {
    errors.value.contactEmail = '请输入正确的邮箱地址'
    isValid = false
  }

  if (!formData.value.testRequirements.trim()) {
    errors.value.testRequirements = '请描述您的测试需求'
    isValid = false
  }
  else if (formData.value.testRequirements.trim().length < 20) {
    errors.value.testRequirements = '需求描述至少20个字符，请详细说明'
    isValid = false
  }
  else if (formData.value.testRequirements.length > 1000) {
    errors.value.testRequirements = '需求描述不能超过1000个字符'
    isValid = false
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  uni.showLoading({
    title: '提交中...',
  })

  try {
    const submitData: VehicleTestApplicationForm = {
      contactName: formData.value.contactName.trim(),
      contactPhone: formData.value.contactPhone.trim(),
      contactEmail: formData.value.contactEmail?.trim() || undefined,
      testRequirements: formData.value.testRequirements.trim(),
    }

    const result = await submitVehicleTestApplication(submitData)

    if (result.code === 200) {
      applicationNo.value = result.applicationNo
      showSuccess.value = true
      // 重置表单
      Object.keys(formData.value).forEach((key) => {
        formData.value[key as keyof VehicleTestApplicationForm] = ''
      })
      errors.value = {}
    }
    else {
      uni.showToast({
        title: result.msg || '提交失败，请稍后重试',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('提交失败:', error)
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none',
    })
  }
  finally {
    uni.hideLoading()
    loading.value = false
  }
}

function closeSuccessModal() {
  showSuccess.value = false
  applicationNo.value = ''
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="h-full flex items-center justify-between px-[32rpx]">
        <view class="flex items-center">
          <view
            class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full bg-white/20"
            @tap="back"
          >
            <text class="i-material-symbols:arrow-back text-[28rpx] text-black" />
          </view>
          <text class="ml-[20rpx] text-[32rpx] text-black font-semibold">
            竞品车测试申请
          </text>
        </view>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">

        <!-- 联系信息 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-lets-icons:phone-duotone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                联系信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 联系人姓名 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系人姓名 <text class="text-red-500">*</text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  请输入您的真实姓名
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="formData.contactName"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactName }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactName" class="text-[24rpx] text-red-500">
              {{ errors.contactName }}
            </view>

            <!-- 联系电话 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系电话 <text class="text-red-500">*</text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  手机号码
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="formData.contactPhone"
                  type="number"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactPhone }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactPhone" class="text-[24rpx] text-red-500">
              {{ errors.contactPhone }}
            </view>

            <!-- 联系邮箱 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系邮箱
                </text>
                <text class="text-[24rpx] text-gray-500">
                  可选填写
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="formData.contactEmail"
                  type="email"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactEmail }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactEmail" class="text-[24rpx] text-red-500">
              {{ errors.contactEmail }}
            </view>
          </view>
        </view>

        <!-- 测试需求 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-lets-icons:send-hor-duotone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                测试需求 <text class="text-red-500">*</text>
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <view class="mb-[16rpx]">
              <text class="block text-[28rpx] text-black font-medium">
                需求描述
              </text>
              <text class="text-[24rpx] text-gray-500">
                请详细说明您的竞品车测试需求
              </text>
            </view>
            <textarea
              v-model="formData.testRequirements"
              class="w-full min-h-[200rpx] border border-gray-300 rounded bg-transparent text-[26rpx]"
              :class="{ 'border-red-500': errors.testRequirements }"
              placeholder="请详细描述您的竞品车测试需求，包括：公司信息、测试车型、用车数量时长、测试目的要求、时间安排等"
              :auto-height="true"
              :maxlength="1000"
            />
            <view class="flex items-center justify-between mt-[8rpx]">
              <view v-if="errors.testRequirements" class="text-[24rpx] text-red-500">
                {{ errors.testRequirements }}
              </view>
              <view class="text-[24rpx] text-gray-500 ml-auto">
                {{ characterCount }}/1000字符
              </view>
            </view>
          </view>
        </view>

        <!-- 服务说明 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-lets-icons:info-duotone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                服务说明
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[16rpx]">
            <view class="flex items-start space-x-[12rpx]">
              <view class="mt-[8rpx] h-[8rpx] w-[8rpx] flex-shrink-0 rounded-full bg-purple-500" />
              <text class="text-[26rpx] text-gray-700">
                我们将在收到申请后24小时内与您联系
              </text>
            </view>
            <view class="flex items-start space-x-[12rpx]">
              <view class="mt-[8rpx] h-[8rpx] w-[8rpx] flex-shrink-0 rounded-full bg-purple-500" />
              <text class="text-[26rpx] text-gray-700">
                提供专业的竞品车辆测试服务和技术支持
              </text>
            </view>
            <view class="flex items-start space-x-[12rpx]">
              <view class="mt-[8rpx] h-[8rpx] w-[8rpx] flex-shrink-0 rounded-full bg-purple-500" />
              <text class="text-[26rpx] text-gray-700">
                根据您的需求定制个性化的测试方案
              </text>
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-semibold"
        :style="{ backgroundColor: loading ? '#9ca3af' : '#9333ea' }"
        @tap="submitForm"
      >
        <text v-if="loading">提交中...</text>
        <text v-else>提交申请</text>
      </view>
    </view>

    <!-- 成功提示弹框 -->
    <view
      v-if="showSuccess"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-[40rpx]"
      @tap="showSuccess = false"
    >
      <view class="max-w-[600rpx] w-full rounded-[32rpx] bg-white p-[48rpx]" @tap.stop>
        <view class="text-center">
          <view class="mx-auto mb-[32rpx] h-[120rpx] w-[120rpx] flex items-center justify-center rounded-full bg-green-100">
            <text class="i-material-symbols:check-circle text-[64rpx] text-green-600" />
          </view>
          <view class="mb-[16rpx] text-[36rpx] text-gray-800 font-semibold">
            申请提交成功
          </view>
          <view class="mb-[8rpx] text-[28rpx] text-gray-600">
            申请编号：{{ applicationNo }}
          </view>
          <view class="mb-[48rpx] text-[24rpx] text-gray-500">
            我们将尽快与您联系
          </view>
          <view
            class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-medium"
            @tap="closeSuccessModal"
          >
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>