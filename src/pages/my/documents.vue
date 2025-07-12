<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DocumentsHead from '@/components/page/my/documents/Head.vue'
import {
  type CertificationHelp,
  type UserDocuments,
  getCertificationHelp as apiGetCertificationHelp,
  getUserDocuments as apiGetUserDocuments,
  resubmitCertification as apiResubmitCertification,
  submitCertification as apiSubmitCertification,
} from '@/api/documents'
import { uploadFileToOss } from '@/utils/alioss'

// 用户证件数据
const userDocuments = ref<UserDocuments>({
  certificationStatus: 'not_submitted',
  certificationStatusText: '未提交认证',
  idCardVerified: false,
  drivingLicenseVerified: false,
  phoneVerified: false,
})

// 认证帮助信息
const helpInfo = ref<CertificationHelp>({
  uploadRequirements: [
    '请确保证件照片清晰、完整、无遮挡',
    '照片格式支持JPG、PNG，大小不超过10MB',
    '请在光线充足的环境下拍摄',
    '证件信息必须在有效期内',
    '身份证和驾驶证姓名必须一致',
  ],
  reviewProcess: [
    '提交证件后，系统将进行自动识别',
    '复杂情况下会转人工审核',
    '审核时间通常为1-3个工作日',
    '审核结果将通过短信和小程序通知',
  ],
  privacyPolicy: [
    '您的证件信息仅用于身份验证',
    '平台严格保护您的个人隐私',
    '不会向第三方泄露您的个人信息',
    '所有数据传输均采用加密技术',
  ],
  commonQuestions: [],
})

// 临时上传的图片URLs
const tempImages = ref({
  idCardFront: '',
  idCardBack: '',
  drivingLicenseFront: '',
  drivingLicenseBack: '',
})

// 真实姓名输入
const realNameInput = ref('')

const loading = ref(false)
const uploading = ref(false)
const submitting = ref(false)

// 计算属性：认证状态样式
const certificationStatusStyle = computed(() => {
  const statusMap: Record<string, string> = {
    not_submitted: 'text-gray-500 bg-gray-50',
    pending: 'text-orange-600 bg-orange-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
  }
  return statusMap[userDocuments.value.certificationStatus] || statusMap.not_submitted
})

// 计算属性：是否可以提交认证
const canSubmitCertification = computed(() => {
  if (userDocuments.value.certificationStatus === 'pending')
    return false
  if (userDocuments.value.certificationStatus === 'approved')
    return false

  // 检查是否所有图片都已上传
  const hasAllImages = tempImages.value.idCardFront
    && tempImages.value.idCardBack
    && tempImages.value.drivingLicenseFront
    && tempImages.value.drivingLicenseBack

  // 检查是否填写了真实姓名
  const hasRealName = realNameInput.value.trim().length > 0

  return hasAllImages && hasRealName
})

// 计算属性：获取当前有效的图片URL
const getImageUrl = computed(() => (type: string) => {
  const tempUrl = tempImages.value[type as keyof typeof tempImages.value]
  if (tempUrl)
    return tempUrl

  // 返回已保存的图片URL
  switch (type) {
    case 'idCardFront': return userDocuments.value.idCardFrontUrl
    case 'idCardBack': return userDocuments.value.idCardBackUrl
    case 'drivingLicenseFront': return userDocuments.value.drivingLicenseFrontUrl
    case 'drivingLicenseBack': return userDocuments.value.drivingLicenseBackUrl
    default: return ''
  }
})

// 上传证件图片
async function uploadImage(documentType: 'idCard' | 'drivingLicense', imageType: 'front' | 'back') {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      uploading.value = true

      try {
        // 生成文件路径
        const timestamp = Date.now()
        const fileName = `${documentType}_${imageType}_${timestamp}.jpg`
        const ossPath = `user/documents/${fileName}`

        // 显示上传进度
        uni.showLoading({
          title: '上传中...',
        })

        // 上传到阿里云OSS
        const imageUrl = await uploadFileToOss(tempFilePath, ossPath)

        // 保存临时图片URL
        const key = `${documentType}${imageType.charAt(0).toUpperCase() + imageType.slice(1)}` as keyof typeof tempImages.value
        tempImages.value[key] = imageUrl

        uni.hideLoading()
        uni.showToast({
          title: '上传成功',
          icon: 'success',
        })
      }
      catch (error: any) {
        console.error('上传证件失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: error.message || '上传失败，请重试',
          icon: 'error',
        })
      }
      finally {
        uploading.value = false
      }
    },
    fail: () => {
      uni.showToast({
        title: '选择图片失败',
        icon: 'error',
      })
    },
  })
}

// 预览图片
function previewImage(imageUrl: string) {
  if (!imageUrl) {
    uni.showToast({
      title: '暂无图片',
      icon: 'none',
    })
    return
  }

  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl,
  })
}

// 提交认证申请
async function submitCertification() {
  if (!canSubmitCertification.value) {
    uni.showToast({
      title: '请完善所有证件信息',
      icon: 'none',
    })
    return
  }

  submitting.value = true

  try {
    const params = {
      idCardFrontUrl: tempImages.value.idCardFront || userDocuments.value.idCardFrontUrl || '',
      idCardBackUrl: tempImages.value.idCardBack || userDocuments.value.idCardBackUrl || '',
      drivingLicenseFrontUrl: tempImages.value.drivingLicenseFront || userDocuments.value.drivingLicenseFrontUrl || '',
      drivingLicenseBackUrl: tempImages.value.drivingLicenseBack || userDocuments.value.drivingLicenseBackUrl || '',
      realName: realNameInput.value.trim(),
    }

    const apiCall = userDocuments.value.certificationStatus === 'rejected'
      ? apiResubmitCertification
      : apiSubmitCertification

    const result = await apiCall(params)

    if (result.code === 200) {
      uni.showToast({
        title: '提交成功，请等待审核',
        icon: 'success',
      })

      // 刷新页面数据
      await fetchUserDocuments()

      // 清空临时图片
      tempImages.value = {
        idCardFront: '',
        idCardBack: '',
        drivingLicenseFront: '',
        drivingLicenseBack: '',
      }
    }
    else {
      throw new Error(result.message || '提交失败')
    }
  }
  catch (error: any) {
    console.error('提交认证失败:', error)
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'error',
    })
  }
  finally {
    submitting.value = false
  }
}

// 获取用户证件信息
async function fetchUserDocuments() {
  try {
    loading.value = true
    const result = await apiGetUserDocuments()
    console.log(result)
    
    if (result.code === 200) {
      userDocuments.value = result.data
      realNameInput.value = result.data.realName || ''
    }
    else {
      // API 失败时使用默认数据，不阻塞页面
      console.warn('获取证件信息失败:', result.message)
    }
  }
  catch (error: any) {
    console.error('获取证件信息失败:', error)
    // 不显示错误提示，使用默认数据
  }
  finally {
    loading.value = false
  }
}

// 获取帮助信息
async function fetchHelpInfo() {
  try {
    const result = await apiGetCertificationHelp()
    if (result.code === 200) {
      helpInfo.value = result.data
    }
  }
  catch (error) {
    console.error('获取帮助信息失败:', error)
    // 使用默认帮助信息，不影响页面显示
  }
}

// 刷新数据
async function refreshData() {
  await fetchUserDocuments()
  uni.showToast({
    title: '刷新完成',
    icon: 'success',
  })
}

// 页面加载时获取数据
onMounted(async () => {
  // 监听头部组件的刷新事件
  uni.$on('documentsRefresh', refreshData)

  // 获取初始数据，即使失败也不阻塞页面
  await Promise.allSettled([
    fetchUserDocuments(),
    fetchHelpInfo(),
  ])
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('documentsRefresh', refreshData)
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <DocumentsHead />

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 认证状态概览 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text
              class="i-material-symbols-verified-user text-[40rpx]"
              :class="{
                'text-green-600': userDocuments.certificationStatus === 'approved',
                'text-orange-600': userDocuments.certificationStatus === 'pending',
                'text-red-600': userDocuments.certificationStatus === 'rejected',
                'text-gray-500': userDocuments.certificationStatus === 'not_submitted',
              }"
            />
            <text class="text-[32rpx] text-gray-900 font-semibold">
              实名认证
            </text>
            <text
              class="rounded-[8rpx] px-[12rpx] py-[4rpx] text-[22rpx] font-medium"
              :class="certificationStatusStyle"
            >
              {{ userDocuments.certificationStatusText }}
            </text>
          </view>

          <!-- 认证状态描述 -->
          <view class="mb-[24rpx] text-[26rpx] text-gray-700">
            <text v-if="userDocuments.certificationStatus === 'not_submitted'">
              完成实名认证后，即可开始租车服务
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'pending'">
              您的认证申请正在审核中，请耐心等待（1-3个工作日）
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'approved'">
              认证已通过，您可以正常使用租车服务
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'rejected'">
              认证审核未通过，请重新提交材料
            </text>
          </view>

          <!-- 时间信息 -->
          <view v-if="userDocuments.certificationSubmitTime || userDocuments.certificationApproveTime" class="space-y-[12rpx]">
            <view v-if="userDocuments.certificationSubmitTime" class="flex justify-between text-[24rpx]">
              <text class="text-gray-600">
                提交时间
              </text>
              <text class="text-gray-900">
                {{ userDocuments.certificationSubmitTime }}
              </text>
            </view>
            <view v-if="userDocuments.certificationApproveTime" class="flex justify-between text-[24rpx]">
              <text class="text-gray-600">
                审核时间
              </text>
              <text class="text-gray-900">
                {{ userDocuments.certificationApproveTime }}
              </text>
            </view>
          </view>

          <!-- 拒绝原因 -->
          <view v-if="userDocuments.certificationStatus === 'rejected' && userDocuments.certificationRejectReason" class="mt-[24rpx] rounded-[12rpx] bg-red-50 p-[16rpx]">
            <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
              <text class="i-material-symbols-error text-[20rpx] text-red-600" />
              <text class="text-[24rpx] text-red-600 font-medium">
                审核未通过原因
              </text>
            </view>
            <text class="text-[24rpx] text-red-700">
              {{ userDocuments.certificationRejectReason }}
            </text>
          </view>
        </view>

        <!-- 个人信息 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-person text-[36rpx] text-purple-600" />
            <text class="text-[32rpx] text-gray-900 font-semibold">
              个人信息
            </text>
          </view>

          <view class="space-y-[24rpx]">
            <!-- 真实姓名 -->
            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-gray-700">
                真实姓名
              </text>
              <input
                v-model="realNameInput"
                class="w-full border border-gray-300 rounded-[12rpx] px-[24rpx] py-[16rpx] text-[26rpx]"
                placeholder="请输入真实姓名"
                :disabled="userDocuments.certificationStatus === 'approved'"
              >
            </view>

            <!-- 手机号 -->
            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-gray-700">
                手机号码
              </text>
              <view class="flex items-center space-x-[16rpx]">
                <text class="text-[26rpx] text-gray-900">
                  {{ userDocuments.phone || '未绑定' }}
                </text>
                <text
                  v-if="userDocuments.phoneVerified"
                  class="rounded-[4rpx] bg-green-50 px-[8rpx] py-[4rpx] text-[22rpx] text-green-600"
                >
                  已验证
                </text>
                <text
                  v-else
                  class="rounded-[4rpx] bg-gray-50 px-[8rpx] py-[4rpx] text-[22rpx] text-gray-500"
                >
                  未验证
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 身份证管理 -->
        <view class="rounded-[24rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-credit-card text-[36rpx] text-purple-600" />
                <text class="text-[32rpx] text-gray-900 font-semibold">
                  身份证
                </text>
              </view>
              <text
                v-if="userDocuments.idCardVerified"
                class="rounded-[8rpx] bg-green-50 px-[12rpx] py-[4rpx] text-[22rpx] text-green-600 font-medium"
              >
                已认证
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <!-- 身份证号码 -->
            <view v-if="userDocuments.idCardNumber" class="mb-[24rpx]">
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-700">
                  证件号码
                </text>
                <text class="text-[26rpx] text-gray-900">
                  {{ userDocuments.idCardNumber }}
                </text>
              </view>
            </view>

            <!-- 身份证图片 -->
            <view class="grid grid-cols-2 mb-[24rpx] gap-[16rpx]">
              <!-- 正面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  身份证正面
                </text>
                <view
                  class="h-[200rpx] w-full flex flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-95"
                  :class="{ 'border-purple-300 bg-purple-50': getImageUrl('idCardFront') }"
                  @tap="getImageUrl('idCardFront') ? previewImage(getImageUrl('idCardFront')) : uploadImage('idCard', 'front')"
                >
                  <image
                    v-if="getImageUrl('idCardFront')"
                    :src="getImageUrl('idCardFront')"
                    class="h-full w-full rounded-[10rpx] object-cover"
                    mode="aspectFill"
                  />
                  <template v-else>
                    <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                    <text class="text-[24rpx] text-gray-500">
                      点击上传
                    </text>
                  </template>
                </view>
              </view>

              <!-- 反面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  身份证反面
                </text>
                <view
                  class="h-[200rpx] w-full flex flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-95"
                  :class="{ 'border-purple-300 bg-purple-50': getImageUrl('idCardBack') }"
                  @tap="getImageUrl('idCardBack') ? previewImage(getImageUrl('idCardBack')) : uploadImage('idCard', 'back')"
                >
                  <image
                    v-if="getImageUrl('idCardBack')"
                    :src="getImageUrl('idCardBack')"
                    class="h-full w-full rounded-[10rpx] object-cover"
                    mode="aspectFill"
                  />
                  <template v-else>
                    <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                    <text class="text-[24rpx] text-gray-500">
                      点击上传
                    </text>
                  </template>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 驾驶证管理 -->
        <view class="rounded-[24rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-badge text-[36rpx] text-purple-600" />
                <text class="text-[32rpx] text-gray-900 font-semibold">
                  驾驶证
                </text>
              </view>
              <text
                v-if="userDocuments.drivingLicenseVerified"
                class="rounded-[8rpx] bg-green-50 px-[12rpx] py-[4rpx] text-[22rpx] text-green-600 font-medium"
              >
                已认证
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <!-- 驾驶证号码 -->
            <view v-if="userDocuments.drivingLicenseNumber" class="mb-[24rpx]">
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-700">
                  证件号码
                </text>
                <text class="text-[26rpx] text-gray-900">
                  {{ userDocuments.drivingLicenseNumber }}
                </text>
              </view>
            </view>

            <!-- 驾驶证图片 -->
            <view class="grid grid-cols-2 mb-[24rpx] gap-[16rpx]">
              <!-- 正面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  驾驶证正面
                </text>
                <view
                  class="h-[200rpx] w-full flex flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-95"
                  :class="{ 'border-purple-300 bg-purple-50': getImageUrl('drivingLicenseFront') }"
                  @tap="getImageUrl('drivingLicenseFront') ? previewImage(getImageUrl('drivingLicenseFront')) : uploadImage('drivingLicense', 'front')"
                >
                  <image
                    v-if="getImageUrl('drivingLicenseFront')"
                    :src="getImageUrl('drivingLicenseFront')"
                    class="h-full w-full rounded-[10rpx] object-cover"
                    mode="aspectFill"
                  />
                  <template v-else>
                    <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                    <text class="text-[24rpx] text-gray-500">
                      点击上传
                    </text>
                  </template>
                </view>
              </view>

              <!-- 反面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  驾驶证副页
                </text>
                <view
                  class="h-[200rpx] w-full flex flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-95"
                  :class="{ 'border-purple-300 bg-purple-50': getImageUrl('drivingLicenseBack') }"
                  @tap="getImageUrl('drivingLicenseBack') ? previewImage(getImageUrl('drivingLicenseBack')) : uploadImage('drivingLicense', 'back')"
                >
                  <image
                    v-if="getImageUrl('drivingLicenseBack')"
                    :src="getImageUrl('drivingLicenseBack')"
                    class="h-full w-full rounded-[10rpx] object-cover"
                    mode="aspectFill"
                  />
                  <template v-else>
                    <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                    <text class="text-[24rpx] text-gray-500">
                      点击上传
                    </text>
                  </template>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 提交认证按钮 -->
        <view
          v-if="userDocuments.certificationStatus !== 'approved' && userDocuments.certificationStatus !== 'pending'"
          class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm"
        >
          <view
            class="w-full rounded-[20rpx] py-[24rpx] text-center text-[28rpx] font-semibold transition-all duration-150 active:scale-95"
            :class="[
              canSubmitCertification && !submitting
                ? 'bg-purple-600 text-white active:bg-purple-700'
                : 'bg-gray-200 text-gray-500',
            ]"
            @tap="canSubmitCertification && !submitting ? submitCertification() : null"
          >
            <text v-if="submitting" class="flex items-center justify-center space-x-[8rpx]">
              <text class="i-material-symbols-sync animate-spin text-[24rpx]" />
              <text>{{ userDocuments.certificationStatus === 'rejected' ? '重新提交中...' : '提交认证中...' }}</text>
            </text>
            <text v-else>
              {{ userDocuments.certificationStatus === 'rejected' ? '重新提交认证' : '提交认证申请' }}
            </text>
          </view>

          <view v-if="!canSubmitCertification" class="mt-[16rpx] text-center text-[24rpx] text-gray-500">
            请完善个人信息和证件照片后提交
          </view>
        </view>

        <!-- 认证须知 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-info text-[36rpx] text-orange-600" />
            <text class="text-[32rpx] text-gray-900 font-semibold">
              认证须知
            </text>
          </view>

          <!-- 上传要求 -->
          <view class="mb-[32rpx]">
            <text class="mb-[16rpx] block text-[28rpx] text-gray-900 font-medium">
              上传要求
            </text>
            <view class="space-y-[12rpx]">
              <text
                v-for="(req, index) in helpInfo.uploadRequirements"
                :key="index"
                class="block text-[26rpx] text-gray-700 leading-relaxed"
              >
                • {{ req }}
              </text>
            </view>
          </view>

          <!-- 审核流程 -->
          <view class="mb-[32rpx]">
            <text class="mb-[16rpx] block text-[28rpx] text-gray-900 font-medium">
              审核流程
            </text>
            <view class="space-y-[12rpx]">
              <text
                v-for="(process, index) in helpInfo.reviewProcess"
                :key="index"
                class="block text-[26rpx] text-gray-700 leading-relaxed"
              >
                • {{ process }}
              </text>
            </view>
          </view>

          <!-- 隐私保护 -->
          <view>
            <text class="mb-[16rpx] block text-[28rpx] text-gray-900 font-medium">
              隐私保护
            </text>
            <view class="space-y-[12rpx]">
              <text
                v-for="(policy, index) in helpInfo.privacyPolicy"
                :key="index"
                class="block text-[26rpx] text-gray-700 leading-relaxed"
              >
                • {{ policy }}
              </text>
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90">
      <text class="i-material-symbols-sync mb-[16rpx] animate-spin text-[48rpx] text-purple-600" />
      <text class="text-[28rpx] text-gray-700">
        正在加载...
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
