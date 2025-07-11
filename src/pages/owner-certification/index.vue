<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { OwnerCertificationStatus } from '@/api/owner-certification'
import {
  getOwnerCertificationStatus,
  submitOwnerCertification,
} from '@/api/owner-certification'
import OwnerCertificationHead from '@/components/page/owner-certification/Head.vue'

// 认证状态数据
const certificationStatus = ref<OwnerCertificationStatus | null>(null)
const loading = ref(false)
const submitting = ref(false)

// 上传状态
const uploadStatus = ref({
  idFront: false,
  idBack: false,
  licenseFront: false,
  licenseBack: false,
})

// 上传的文件URLs
const uploadedUrls = ref({
  idFrontUrl: '',
  idBackUrl: '',
  licenseFrontUrl: '',
  licenseBackUrl: '',
})

// 获取认证状态
async function loadCertificationStatus() {
  try {
    loading.value = true
    const data = await getOwnerCertificationStatus()
    certificationStatus.value = data
  }
  catch (error) {
    console.error('获取认证状态失败:', error)
    toastRef.value?.error('获取认证状态失败')
  }
  finally {
    loading.value = false
  }
}

// 选择文件
function chooseImage(type: 'idFront' | 'idBack' | 'licenseFront' | 'licenseBack') {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      handleImageUpload(type, res.tempFilePaths[0])
    },
    fail: () => {
      toastRef.value?.error('选择图片失败')
    },
  })
}

// 处理图片上传
async function handleImageUpload(type: 'idFront' | 'idBack' | 'licenseFront' | 'licenseBack', filePath: string) {
  try {
    // 模拟文件上传 - 在实际项目中需要转换为File对象
    if (type === 'idFront' || type === 'idBack') {
      // 这里应该先收集两张身份证照片，然后一起上传
      uploadStatus.value[type] = true
      if (type === 'idFront') {
        uploadedUrls.value.idFrontUrl = filePath
        toastRef.value?.success('身份证正面上传成功')
      }
      else {
        uploadedUrls.value.idBackUrl = filePath
        toastRef.value?.success('身份证反面上传成功')
      }
    }
    else {
      // 驾驶证同理
      uploadStatus.value[type] = true
      if (type === 'licenseFront') {
        uploadedUrls.value.licenseFrontUrl = filePath
        toastRef.value?.success('驾驶证正页上传成功')
      }
      else {
        uploadedUrls.value.licenseBackUrl = filePath
        toastRef.value?.success('驾驶证副页上传成功')
      }
    }
  }
  catch (error) {
    console.error('上传失败:', error)
    toastRef.value?.error('上传失败，请重试')
  }
}

// 检查是否可以提交
function canSubmit() {
  return Object.values(uploadStatus.value).every(status => status)
}

// 提交认证申请
async function handleSubmit() {
  // 手动检查状态，因为view不支持disabled属性
  if (!canSubmit() || submitting.value) {
    return
  }

  if (!canSubmit()) {
    toastRef.value?.error('请先上传所有必要证件')
    return
  }

  try {
    submitting.value = true

    // 构造提交数据
    const submitData = {
      idCardFrontUrl: uploadedUrls.value.idFrontUrl,
      idCardBackUrl: uploadedUrls.value.idBackUrl,
      drivingLicenseFrontUrl: uploadedUrls.value.licenseFrontUrl,
      drivingLicenseBackUrl: uploadedUrls.value.licenseBackUrl,
      confirmInfo: true,
    }

    const result = await submitOwnerCertification(submitData)
    toastRef.value?.success('认证申请提交成功！')

    uni.showModal({
      title: '提交成功',
      content: result.reviewMessage || '认证申请已提交，请耐心等待审核',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        // 刷新认证状态
        loadCertificationStatus()
      },
    })
  }
  catch (error) {
    console.error('提交认证申请失败:', error)
    toastRef.value?.error('提交失败，请重试')
  }
  finally {
    submitting.value = false
  }
}

// 获取步骤状态样式
function getStepStyle(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-purple-600 text-white'
    case 'in_progress':
      return 'bg-orange-500 text-white'
    default:
      return 'bg-gray-300 text-gray-600'
  }
}

// 获取步骤状态标签样式
function getStepLabelStyle(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'in_progress':
      return 'text-orange-600 bg-orange-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// 刷新数据
function refreshData() {
  loadCertificationStatus()
}

// 页面加载
onMounted(() => {
  loadCertificationStatus()

  // 监听头部组件的刷新事件
  uni.$on('ownerCertificationRefresh', refreshData)
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('ownerCertificationRefresh', refreshData)
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <OwnerCertificationHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto bg-gray-50">
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 认证说明卡片 -->
        <view class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[16rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-verified-user text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              成为认证车主
            </text>
            <text class="rounded-full bg-green-100 px-[16rpx] py-[8rpx] text-[22rpx] text-green-600">
              赚收益
            </text>
          </view>
          <text class="mb-[16rpx] block text-[26rpx] text-gray-700">
            上传证件完成认证，开启车主赚钱之旅
          </text>
          <view class="flex items-center text-[24rpx] text-gray-600 space-x-[32rpx]">
            <text>✓ 平台保障</text>
            <text>✓ 月入过万</text>
            <text>✓ 专人服务</text>
          </view>
        </view>

        <!-- 认证进度 -->
        <view v-if="certificationStatus" class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-checklist text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              认证进度
            </text>
          </view>
          <view class="space-y-[32rpx]">
            <view
              v-for="step in certificationStatus.steps"
              :key="step.step"
              class="flex items-center space-x-[24rpx]"
            >
              <view :class="`w-[64rpx] h-[64rpx] rounded-full flex items-center justify-center ${getStepStyle(step.status)}`">
                <text v-if="step.status === 'completed'" class="i-material-symbols-check text-[32rpx]" />
                <text v-else class="text-[28rpx] font-bold">
                  {{ step.step }}
                </text>
              </view>
              <view class="flex-1">
                <text class="block text-[30rpx] text-black font-medium">
                  {{ step.title }}
                </text>
                <text class="mt-[8rpx] block text-[26rpx] text-gray-600">
                  {{ step.description }}
                </text>
              </view>
              <text :class="`text-[22rpx] px-[16rpx] py-[8rpx] rounded-full font-medium ${getStepLabelStyle(step.status)}`">
                {{ step.status === 'completed' ? '已完成' : step.status === 'in_progress' ? '进行中' : '待完成' }}
              </text>
            </view>
          </view>
        </view>

        <!-- 身份证认证 -->
        <view class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-badge text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              身份证认证
            </text>
          </view>
          <view class="space-y-[32rpx]">
            <!-- 身份证正面 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-gray-700 font-medium">
                身份证正面
              </text>
              <view
                class="cursor-pointer border-2 border-gray-300 rounded-xl border-dashed p-[48rpx] text-center transition-colors duration-200 active:scale-95"
                :class="{ 'border-purple-400 bg-purple-50': uploadStatus.idFront }"
                @tap="chooseImage('idFront')"
              >
                <view v-if="!uploadStatus.idFront">
                  <text class="i-material-symbols-add-photo-alternate mb-[16rpx] block text-[80rpx] text-gray-400" />
                  <text class="block text-[28rpx] text-gray-600">
                    点击上传身份证正面
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    请确保证件信息清晰可见
                  </text>
                </view>
                <view v-else>
                  <text class="i-material-symbols-check-circle mb-[16rpx] block text-[80rpx] text-purple-600" />
                  <text class="block text-[28rpx] text-purple-600">
                    身份证正面已上传
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    点击重新上传
                  </text>
                </view>
              </view>
            </view>

            <!-- 身份证反面 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-gray-700 font-medium">
                身份证反面
              </text>
              <view
                class="cursor-pointer border-2 border-gray-300 rounded-xl border-dashed p-[48rpx] text-center transition-colors duration-200 active:scale-95"
                :class="{ 'border-purple-400 bg-purple-50': uploadStatus.idBack }"
                @tap="chooseImage('idBack')"
              >
                <view v-if="!uploadStatus.idBack">
                  <text class="i-material-symbols-add-photo-alternate mb-[16rpx] block text-[80rpx] text-gray-400" />
                  <text class="block text-[28rpx] text-gray-600">
                    点击上传身份证反面
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    请确保有效期清晰可见
                  </text>
                </view>
                <view v-else>
                  <text class="i-material-symbols-check-circle mb-[16rpx] block text-[80rpx] text-purple-600" />
                  <text class="block text-[28rpx] text-purple-600">
                    身份证反面已上传
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    点击重新上传
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 驾驶证认证 -->
        <view class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-drive-eta text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              驾驶证认证
            </text>
          </view>
          <view class="space-y-[32rpx]">
            <!-- 驾驶证正页 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-gray-700 font-medium">
                驾驶证正页
              </text>
              <view
                class="cursor-pointer border-2 border-gray-300 rounded-xl border-dashed p-[48rpx] text-center transition-colors duration-200 active:scale-95"
                :class="{ 'border-purple-400 bg-purple-50': uploadStatus.licenseFront }"
                @tap="chooseImage('licenseFront')"
              >
                <view v-if="!uploadStatus.licenseFront">
                  <text class="i-material-symbols-add-photo-alternate mb-[16rpx] block text-[80rpx] text-gray-400" />
                  <text class="block text-[28rpx] text-gray-600">
                    点击上传驾驶证正页
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    请确保个人信息清晰
                  </text>
                </view>
                <view v-else>
                  <text class="i-material-symbols-check-circle mb-[16rpx] block text-[80rpx] text-purple-600" />
                  <text class="block text-[28rpx] text-purple-600">
                    驾驶证正页已上传
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    点击重新上传
                  </text>
                </view>
              </view>
            </view>

            <!-- 驾驶证副页 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-gray-700 font-medium">
                驾驶证副页
              </text>
              <view
                class="cursor-pointer border-2 border-gray-300 rounded-xl border-dashed p-[48rpx] text-center transition-colors duration-200 active:scale-95"
                :class="{ 'border-purple-400 bg-purple-50': uploadStatus.licenseBack }"
                @tap="chooseImage('licenseBack')"
              >
                <view v-if="!uploadStatus.licenseBack">
                  <text class="i-material-symbols-add-photo-alternate mb-[16rpx] block text-[80rpx] text-gray-400" />
                  <text class="block text-[28rpx] text-gray-600">
                    点击上传驾驶证副页
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    请确保档案编号清晰
                  </text>
                </view>
                <view v-else>
                  <text class="i-material-symbols-check-circle mb-[16rpx] block text-[80rpx] text-purple-600" />
                  <text class="block text-[28rpx] text-purple-600">
                    驾驶证副页已上传
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-gray-500">
                    点击重新上传
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 车主权益 -->
        <view v-if="certificationStatus" class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-card-giftcard text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              车主权益
            </text>
          </view>
          <view class="grid grid-cols-2 gap-[24rpx]">
            <view
              v-for="benefit in certificationStatus.benefits"
              :key="benefit.title"
              class="border border-gray-100 rounded-xl bg-gray-50 p-[24rpx] text-center"
            >
              <text :class="`i-material-symbols-${benefit.icon} text-purple-600 text-[48rpx] mb-[8rpx] block`" />
              <text class="block text-[26rpx] text-gray-800 font-semibold">
                {{ benefit.title }}
              </text>
              <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                {{ benefit.description }}
              </text>
            </view>
          </view>
        </view>

        <!-- 认证须知 -->
        <view v-if="certificationStatus" class="rounded-2xl bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-info text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              认证须知
            </text>
          </view>
          <view class="space-y-[20rpx]">
            <view
              v-for="tip in certificationStatus.certificationTips"
              :key="tip"
              class="flex items-start text-[26rpx] text-gray-600 space-x-[16rpx]"
            >
              <text class="mt-[4rpx] text-[20rpx] text-purple-600 font-bold">
                •
              </text>
              <text class="flex-1">
                {{ tip }}
              </text>
            </view>
          </view>
        </view>

        <!-- 底部安全距离 -->
        <view class="h-[120rpx]" />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-xl py-[32rpx] text-center text-[32rpx] text-white font-semibold transition-all duration-200 active:scale-95"
        :class="canSubmit() && !submitting ? 'bg-purple-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'"
        @tap="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交认证申请' }}
      </view>
      <text class="mt-[16rpx] block text-center text-[24rpx] text-gray-500">
        {{ canSubmit() ? '所有证件已上传，可以提交认证' : '请上传所有必要证件后提交' }}
      </text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <view class="rounded-xl bg-white p-[40rpx] shadow-lg">
        <view class="flex items-center space-x-[16rpx]">
          <view class="h-[32rpx] w-[32rpx] animate-spin border-2 border-purple-600 border-t-transparent rounded-full" />
          <text class="text-[28rpx] text-gray-700">
            加载中...
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
  layout: home
</route>
