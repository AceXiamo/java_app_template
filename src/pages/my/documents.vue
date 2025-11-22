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
  decryptPhoneNumber,
} from '@/api/documents'
import { uploadFileToOss } from '@/utils/alioss'

// 用户证件数据
const userDocuments = ref<UserDocuments>({
  certificationStatus: 'none',
  certificationStatusText: '未认证',
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

// 身份证号输入
const idCardNumberInput = ref('')

// 驾驶证号输入
const drivingLicenseNumberInput = ref('')

const loading = ref(false)
const uploading = ref(false)
const submitting = ref(false)
const gettingPhone = ref(false)

// 计算属性：认证状态样式
const certificationStatusStyle = computed(() => {
  const statusMap: Record<string, string> = {
    none: 'text-gray-500 bg-gray-50',
    pending: 'text-orange-600 bg-orange-50',
    certified: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
  }
  return statusMap[userDocuments.value.certificationStatus] || statusMap.none
})

// 计算属性：是否可以提交认证
const canSubmitCertification = computed(() => {
  if (userDocuments.value.certificationStatus === 'pending')
    return false
  if (userDocuments.value.certificationStatus === 'certified')
    return false

  // 检查是否所有图片都已上传（临时图片或已保存的图片）
  const hasIdCardFront = tempImages.value.idCardFront || userDocuments.value.idCardFrontUrl
  const hasIdCardBack = tempImages.value.idCardBack || userDocuments.value.idCardBackUrl
  const hasDrivingLicenseFront = tempImages.value.drivingLicenseFront || userDocuments.value.drivingLicenseFrontUrl
  const hasDrivingLicenseBack = tempImages.value.drivingLicenseBack || userDocuments.value.drivingLicenseBackUrl
  
  const hasAllImages = hasIdCardFront && hasIdCardBack && hasDrivingLicenseFront && hasDrivingLicenseBack

  // 检查是否填写了真实姓名
  const hasRealName = realNameInput.value.trim().length > 0

  // 检查是否填写了身份证号
  const hasIdCardNumber = idCardNumberInput.value.trim().length > 0

  // 检查是否填写了驾驶证号
  const hasDrivingLicenseNumber = drivingLicenseNumberInput.value.trim().length > 0

  return hasAllImages && hasRealName && hasIdCardNumber && hasDrivingLicenseNumber
})

// 计算属性：获取当前有效的图片URL
const getImageUrl = computed(() => (type: string): string => {
  const tempUrl = tempImages.value[type as keyof typeof tempImages.value]
  if (tempUrl)
    return tempUrl

  // 返回已保存的图片URL
  switch (type) {
    case 'idCardFront': return userDocuments.value.idCardFrontUrl || ''
    case 'idCardBack': return userDocuments.value.idCardBackUrl || ''
    case 'drivingLicenseFront': return userDocuments.value.drivingLicenseFrontUrl || ''
    case 'drivingLicenseBack': return userDocuments.value.drivingLicenseBackUrl || ''
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
        toastRef.value?.success('上传成功')
      }
      catch (error: any) {
        console.error('上传证件失败:', error)
        uni.hideLoading()
        toastRef.value?.error(error.message || '上传失败，请重试')
      }
      finally {
        uploading.value = false
      }
    },
    fail: () => {
      toastRef.value?.error('选择图片失败')
    },
  })
}

// 预览图片
function previewImage(imageUrl: string) {
  if (!imageUrl) {
    toastRef.value?.error('暂无图片')
    return
  }

  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl,
  })
}

// 删除图片
function removeImage(documentType: 'idCard' | 'drivingLicense', imageType: 'front' | 'back') {
  // 清空临时图片
  const key = `${documentType}${imageType.charAt(0).toUpperCase() + imageType.slice(1)}` as keyof typeof tempImages.value
  tempImages.value[key] = ''
  
  // 清空已保存的图片URL
  const urlKey = `${key}Url` as keyof typeof userDocuments.value
  if (userDocuments.value[urlKey]) {
    (userDocuments.value as any)[urlKey] = ''
  }
}

// 处理获取手机号回调
async function onGetPhoneNumber(event: any) {
  const { detail } = event
  if (detail.errMsg !== 'getPhoneNumber:ok') {
    toastRef.value?.error('用户取消获取手机号')
    return
  }

  if (!detail.code) {
    toastRef.value?.error('获取手机号失败')
    return
  }

  try {
    gettingPhone.value = true

    // 调用后端API解密手机号
    const decryptResult = await decryptPhoneNumber(detail.code)

    if (decryptResult.code === 200) {
      userDocuments.value.phone = decryptResult.data.phoneNumber
      userDocuments.value.phoneVerified = true

      toastRef.value?.success('手机号获取成功')

      // 刷新用户数据
      await fetchUserDocuments()
    }
    else {
      throw new Error(decryptResult.message || '解密手机号失败')
    }
  }
  catch (error: any) {
    console.error('获取手机号失败:', error)
    toastRef.value?.error(error.message || '获取手机号失败')
  }
  finally {
    gettingPhone.value = false
  }
}

// 提交认证申请
async function submitCertification() {
  if (!canSubmitCertification.value) {
    toastRef.value?.error('请完善所有证件信息')
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
      idCardNumber: idCardNumberInput.value.trim(),
      drivingLicenseNumber: drivingLicenseNumberInput.value.trim(),
    }

    const apiCall = userDocuments.value.certificationStatus === 'rejected'
      ? apiResubmitCertification
      : apiSubmitCertification

    const result = await apiCall(params)

    if (result.code === 200) {
      toastRef.value?.success('提交成功，请等待审核')

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
    toastRef.value?.error(error.message || '提交失败，请重试')
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
      idCardNumberInput.value = result.data.idCardNumber || ''
      drivingLicenseNumberInput.value = result.data.drivingLicenseNumber || ''
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
  toastRef.value?.success('刷新完成')
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
  <view class="relative h-full flex flex-col overflow-hidden bg-[#F6F7FB]">
    <!-- 头部导航 -->
    <DocumentsHead />

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 认证状态概览 -->
        <view class="border border-white/50 rounded-[28rpx] bg-white p-[32rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="flex items-center space-x-[16rpx]">
            <text
              class="text-[40rpx]"
              :class="{
                'i-solar:verified-check-bold text-[#10B981]': userDocuments.certificationStatus === 'certified',
                'i-solar:clock-circle-bold text-[#FF7A1A]': userDocuments.certificationStatus === 'pending',
                'i-solar:close-circle-bold text-[#EF4444]': userDocuments.certificationStatus === 'rejected',
                'i-solar:shield-user-bold text-[#6B7280]': userDocuments.certificationStatus === 'none',
              }"
            />
            <text class="text-[32rpx] text-gray-900 font-semibold">
              实名认证
            </text>
            <text
              class="rounded-full px-[16rpx] py-[6rpx] text-[22rpx] font-medium"
              :class="certificationStatusStyle"
            >
              {{ userDocuments.certificationStatusText }}
            </text>
          </view>

          <!-- 认证状态描述 -->
          <view class="mt-[24rpx] text-[26rpx] text-gray-700">
            <text v-if="userDocuments.certificationStatus === 'none'">
              完成实名认证后，即可开始租车服务
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'pending'">
              您的认证申请正在审核中，请耐心等待（1-3个工作日）
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'certified'">
              认证已通过，您可以正常使用租车服务
            </text>
            <text v-else-if="userDocuments.certificationStatus === 'rejected'">
              认证审核未通过，请重新提交材料
            </text>
          </view>

          <!-- 时间信息 -->
          <view v-if="userDocuments.certificationSubmitTime || userDocuments.certificationApproveTime" class="mt-[24rpx] space-y-[12rpx]">
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
          <view v-if="userDocuments.certificationStatus === 'rejected' && userDocuments.certificationRejectReason" class="mt-[24rpx] rounded-[16rpx] bg-red-50 p-[16rpx]">
            <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
              <text class="i-solar:danger-circle-bold text-[20rpx] text-red-600" />
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
        <view class="border border-white/50 rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-solar:user-bold text-[40rpx] text-[#8b5cf6]" />
              <text class="text-[32rpx] text-gray-900 font-semibold">
                个人信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 真实姓名 -->
            <view class="relative flex items-center justify-between">
              <input
                v-model="realNameInput"
                class="w-full border border-gray-300 rounded bg-transparent px-[16rpx] py-[32rpx] text-right text-[26rpx]"
                placeholder="请输入真实姓名"
                maxlength="20"
                :disabled="userDocuments.certificationStatus === 'certified'"
              />
              <view class="pointer-events-none absolute left-0 top-0 flex flex-col justify-center py-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  真实姓名
                </text>
                <text class="text-[24rpx] text-gray-500">
                  用于实名认证验证
                </text>
              </view>
            </view>

            <!-- 手机号 -->
            <view class="relative flex items-center justify-between py-[16rpx]">
              <view class="pointer-events-none absolute left-0 top-0 flex flex-col justify-center py-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  手机号码
                </text>
                <text class="text-[24rpx] text-gray-500">
                  已验证的手机号
                </text>
              </view>
              <view class="ml-auto flex items-center space-x-[16rpx] py-[20rpx]">
                <text class="text-[26rpx] text-gray-700">
                  {{ userDocuments.phone || '未设置' }}
                </text>
                <text
                  v-if="userDocuments.phoneVerified"
                  class="rounded-full bg-green-100 px-[12rpx] py-[4rpx] text-[20rpx] text-green-600"
                >
                  已验证
                </text>
                <view v-else class="flex items-center space-x-[8rpx]">
                  <text class="rounded-full bg-gray-100 px-[12rpx] py-[4rpx] text-[20rpx] text-gray-500">
                    未验证
                  </text>
                  <button
                    class="m-0 rounded-full border-0 bg-[#8b5cf6] px-[16rpx] py-[2rpx] text-[20rpx] text-white transition-all duration-150 active:scale-95"
                    open-type="getPhoneNumber"
                    :disabled="gettingPhone"
                    @getphonenumber="onGetPhoneNumber"
                  >
                    <text v-if="gettingPhone" class="flex items-center space-x-[4rpx]">
                      <text class="i-solar:refresh-bold animate-spin text-[16rpx]" />
                      <text>获取中</text>
                    </text>
                    <text v-else>
                      获取手机号
                    </text>
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 身份证管理 -->
        <view class="border border-white/50 rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-solar:card-bold text-[36rpx] text-[#8b5cf6]" />
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
            <view class="relative mb-[24rpx]">
              <input
                v-model="idCardNumberInput"
                class="w-full border border-gray-300 rounded bg-transparent px-[16rpx] py-[32rpx] text-right text-[26rpx]"
                placeholder="请输入身份证号码"
                maxlength="18"
                type="idcard"
                :disabled="userDocuments.certificationStatus === 'certified'"
              />
              <view class="pointer-events-none absolute left-0 top-0 flex flex-col justify-center py-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  身份证号码
                </text>
                <text class="text-[24rpx] text-gray-500">
                  请输入18位身份证号码
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
                <view class="relative">
                  <view
                    class="h-[200rpx] w-full flex flex-col items-center justify-center border border-gray-300 rounded-[16rpx] border-dashed transition-all duration-150 active:scale-95"
                    :class="{ 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5': getImageUrl('idCardFront') }"
                    @tap="getImageUrl('idCardFront') ? previewImage(getImageUrl('idCardFront')) : uploadImage('idCard', 'front')"
                  >
                    <image
                      v-if="getImageUrl('idCardFront')"
                      :src="getImageUrl('idCardFront')"
                      class="h-full w-full rounded-[14rpx]"
                      mode="aspectFill"
                    />
                    <template v-else>
                      <text class="i-solar:gallery-add-bold mb-[8rpx] text-[48rpx] text-gray-400" />
                      <text class="text-[24rpx] text-gray-500">
                        点击上传
                      </text>
                    </template>
                  </view>
                  <!-- 删除按钮 -->
                  <view
                    v-if="getImageUrl('idCardFront') && userDocuments.certificationStatus !== 'certified'"
                    class="absolute right-[8rpx] top-[8rpx] flex transition-all active:scale-90"
                    @tap.stop="removeImage('idCard', 'front')"
                  >
                    <text class="i-solar:close-circle-bold text-[32rpx] text-red-600" />
                  </view>
                </view>
              </view>

              <!-- 反面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  身份证反面
                </text>
                <view class="relative">
                  <view
                    class="h-[200rpx] w-full flex flex-col items-center justify-center border border-gray-300 rounded-[16rpx] border-dashed transition-all duration-150 active:scale-95"
                    :class="{ 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5': getImageUrl('idCardBack') }"
                    @tap="getImageUrl('idCardBack') ? previewImage(getImageUrl('idCardBack')) : uploadImage('idCard', 'back')"
                  >
                    <image
                      v-if="getImageUrl('idCardBack')"
                      :src="getImageUrl('idCardBack')"
                      class="h-full w-full rounded-[14rpx]"
                      mode="aspectFill"
                    />
                    <template v-else>
                      <text class="i-solar:gallery-add-bold mb-[8rpx] text-[48rpx] text-gray-400" />
                      <text class="text-[24rpx] text-gray-500">
                        点击上传
                      </text>
                    </template>
                  </view>
                  <!-- 删除按钮 -->
                  <view
                    v-if="getImageUrl('idCardBack') && userDocuments.certificationStatus !== 'certified'"
                    class="absolute right-[8rpx] top-[8rpx] flex transition-all active:scale-90"
                    @tap.stop="removeImage('idCard', 'back')"
                  >
                    <text class="i-solar:close-circle-bold text-[32rpx] text-red-600" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 驾驶证管理 -->
        <view class="border border-white/50 rounded-[28rpx] bg-white shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-solar:diploma-verified-bold text-[36rpx] text-[#8b5cf6]" />
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
            <view class="relative mb-[24rpx]">
              <input
                v-model="drivingLicenseNumberInput"
                class="w-full border border-gray-300 rounded bg-transparent px-[16rpx] py-[32rpx] text-right text-[26rpx]"
                placeholder="请输入驾驶证号码"
                maxlength="20"
                :disabled="userDocuments.certificationStatus === 'certified'"
              />
              <view class="pointer-events-none absolute left-0 top-0 flex flex-col justify-center py-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  驾驶证号码
                </text>
                <text class="text-[24rpx] text-gray-500">
                  请输入驾驶证号码
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
                <view class="relative">
                  <view
                    class="h-[200rpx] w-full flex flex-col items-center justify-center border border-gray-300 rounded-[16rpx] border-dashed transition-all duration-150 active:scale-95"
                    :class="{ 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5': getImageUrl('drivingLicenseFront') }"
                    @tap="getImageUrl('drivingLicenseFront') ? previewImage(getImageUrl('drivingLicenseFront')) : uploadImage('drivingLicense', 'front')"
                  >
                    <image
                      v-if="getImageUrl('drivingLicenseFront')"
                      :src="getImageUrl('drivingLicenseFront')"
                      class="h-full w-full rounded-[14rpx]"
                      mode="aspectFill"
                    />
                    <template v-else>
                      <text class="i-solar:gallery-add-bold mb-[8rpx] text-[48rpx] text-gray-400" />
                      <text class="text-[24rpx] text-gray-500">
                        点击上传
                      </text>
                    </template>
                  </view>
                  <!-- 删除按钮 -->
                  <view
                    v-if="getImageUrl('drivingLicenseFront') && userDocuments.certificationStatus !== 'certified'"
                    class="absolute right-[8rpx] top-[8rpx] flex transition-all active:scale-90"
                    @tap.stop="removeImage('drivingLicense', 'front')"
                  >
                    <text class="i-solar:close-circle-bold text-[32rpx] text-red-600" />
                  </view>
                </view>
              </view>

              <!-- 反面 -->
              <view>
                <text class="mb-[12rpx] block text-[24rpx] text-gray-700">
                  驾驶证副页
                </text>
                <view class="relative">
                  <view
                    class="h-[200rpx] w-full flex flex-col items-center justify-center border border-gray-300 rounded-[16rpx] border-dashed transition-all duration-150 active:scale-95"
                    :class="{ 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5': getImageUrl('drivingLicenseBack') }"
                    @tap="getImageUrl('drivingLicenseBack') ? previewImage(getImageUrl('drivingLicenseBack')) : uploadImage('drivingLicense', 'back')"
                  >
                    <image
                      v-if="getImageUrl('drivingLicenseBack')"
                      :src="getImageUrl('drivingLicenseBack')"
                      class="h-full w-full rounded-[14rpx]"
                      mode="aspectFill"
                    />
                    <template v-else>
                      <text class="i-solar:gallery-add-bold mb-[8rpx] text-[48rpx] text-gray-400" />
                      <text class="text-[24rpx] text-gray-500">
                        点击上传
                      </text>
                    </template>
                  </view>
                  <!-- 删除按钮 -->
                  <view
                    v-if="getImageUrl('drivingLicenseBack') && userDocuments.certificationStatus !== 'certified'"
                    class="absolute right-[8rpx] top-[8rpx] flex transition-all active:scale-90"
                    @tap.stop="removeImage('drivingLicense', 'back')"
                  >
                    <text class="i-solar:close-circle-bold text-[32rpx] text-red-600" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 提交认证按钮 -->
        <view
          v-if="userDocuments.certificationStatus !== 'certified' && userDocuments.certificationStatus !== 'pending'"
          class="border border-white/50 rounded-[28rpx] bg-white p-[32rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]"
        >
          <view
            class="w-full rounded-[20rpx] py-[24rpx] text-center text-[28rpx] font-semibold transition-all duration-150 active:scale-95"
            :class="[
              canSubmitCertification && !submitting
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#A78BFA] text-white shadow-[0_8rpx_24rpx_-4rpx_rgba(139,92,246,0.4)]'
                : 'bg-gray-200 text-gray-500',
            ]"
            @tap="canSubmitCertification && !submitting ? submitCertification() : null"
          >
            <text v-if="submitting" class="flex items-center justify-center space-x-[8rpx]">
              <text class="i-solar:refresh-bold animate-spin text-[24rpx]" />
              <text>{{ userDocuments.certificationStatus === 'rejected' ? '重新提交中...' : '提交认证中...' }}</text>
            </text>
            <text v-else>
              {{ userDocuments.certificationStatus === 'rejected' ? '重新提交认证' : '提交认证申请' }}
            </text>
          </view>

          <view v-if="!canSubmitCertification" class="mt-[16rpx] text-center text-[24rpx] text-gray-500">
            请完善个人信息、证件号码和证件照片后提交
          </view>
        </view>

        <!-- 认证须知 -->
        <view class="border border-white/50 rounded-[28rpx] bg-white p-[32rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)]">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-solar:info-circle-bold text-[36rpx] text-[#FF7A1A]" />
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
    <view v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <text class="i-solar:refresh-bold mb-[16rpx] animate-spin text-[48rpx] text-[#8b5cf6]" />
      <text class="text-[28rpx] text-gray-700">
        正在加载...
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
