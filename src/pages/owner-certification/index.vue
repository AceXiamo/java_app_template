<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type {
  AgreementInfo,
  OperationPackageConfig,
  VehicleRentalRequest,
  VehicleRentalRequestSubmitData,
} from '@/api/vehicle-rental-request'
import {
  getAgreement,
  getCurrentStatus,
  getOperationPackages,
  submitRentalRequest,
} from '@/api/vehicle-rental-request'
import { uploadFileToOss } from '@/utils/alioss'
import { useUserStore } from '@/store/user'
import OwnerCertificationHead from '@/components/page/owner-certification/Head.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'

// Toast 引用
const toastRef = ref()

// 用户 store
const userStore = useUserStore()

// 页面状态
const loading = ref(false)
const submitting = ref(false)

// 数据状态
const currentStatus = ref<VehicleRentalRequest | null>(null)
const packageConfigs = ref<OperationPackageConfig[]>([])
const agreementInfo = ref<AgreementInfo | null>(null)

// 表单数据
const formData = ref<VehicleRentalRequestSubmitData>({
  operationMode: '',
  contactPhone: '',
  contactAddress: '',
  contactLongitude: undefined,
  contactLatitude: undefined,
  vehicleDescription: '',
  rentalIntention: '',
  registrationCertFrontUrl: '',
  registrationCertBackUrl: '',
  insurancePolicyUrls: [],
  inspectionCertUrl: '',
  agreementVersion: 'v1.0',
  agreementAgreed: false,
})

// 上传状态
const uploadStatus = ref({
  registrationCertFront: false,
  registrationCertBack: false,
  insurancePolicy: false,
  inspectionCert: false,
})

// 地址选择器状态
const addressPickerVisible = ref(false)
const currentLocation = ref({
  latitude: 31.230416,
  longitude: 121.473701,
})

// 初始化手机号
function initPhoneNumber() {
  if (userStore.user?.phone) {
    formData.value.contactPhone = userStore.user.phone
  }
}

// 表单验证
const canSubmit = computed(() => {
  return (
    // 运营模式
    formData.value.operationMode
    // 联系信息
    && formData.value.contactPhone
    // 必需文档
    && formData.value.registrationCertFrontUrl
    && formData.value.registrationCertBackUrl
    && formData.value.insurancePolicyUrls.length > 0
    && formData.value.inspectionCertUrl
    // 协议
    && formData.value.agreementAgreed
  )
})

// 选择运营模式
function selectOperationMode(packageCode: string) {
  formData.value.operationMode = packageCode
}

// 选择地址
function selectAddress() {
  addressPickerVisible.value = true
}

// 地址选择确认
function onAddressConfirm(data: {
  latitude: number
  longitude: number
  address: string
  formattedAddress: string
  poiName?: string
}) {
  formData.value.contactAddress = data.formattedAddress
  formData.value.contactLongitude = data.longitude
  formData.value.contactLatitude = data.latitude
}

// 文件上传
async function uploadDocument(type: string) {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      const status = uploadStatus.value as any
      status[type] = true

      uni.showLoading({
        title: '上传中...',
      })

      try {
        const timestamp = Date.now()
        const fileName = `${type}_${timestamp}.jpg`
        const ossPath = `vehicle/rental-request/${fileName}`

        const documentUrl = await uploadFileToOss(tempFilePath, ossPath)

        // 更新对应的文档URL
        switch (type) {
          case 'registrationCertFront':
            formData.value.registrationCertFrontUrl = documentUrl
            break
          case 'registrationCertBack':
            formData.value.registrationCertBackUrl = documentUrl
            break
          case 'insurancePolicy':
            formData.value.insurancePolicyUrls.push(documentUrl)
            break
          case 'inspectionCert':
            formData.value.inspectionCertUrl = documentUrl
            break
        }

        uni.hideLoading()
        toastRef.value?.success('上传成功')
      }
      catch (error) {
        console.error('文档上传失败:', error)
        uni.hideLoading()
        toastRef.value?.error('上传失败')
      }
      finally {
        status[type] = false
      }
    },
    fail: () => {
      toastRef.value?.error('选择图片失败')
    },
  })
}

// 删除保险文件
function removeInsuranceFile(index: number) {
  formData.value.insurancePolicyUrls.splice(index, 1)
}

// 切换协议同意状态
function toggleAgreement() {
  formData.value.agreementAgreed = !formData.value.agreementAgreed
}

// 查看申请记录
function goToRecords() {
  uni.navigateTo({
    url: '/pages/vehicle-affiliation-records/index',
  })
}

// 提交申请
async function submitForm() {
  if (!canSubmit.value) {
    toastRef.value?.error('请完善所有必填信息')
    return
  }

  submitting.value = true
  uni.showLoading({
    title: '提交中...',
  })

  try {
    const response = await submitRentalRequest(formData.value)

    if (response.code === 200) {
      uni.hideLoading()

      // 显示详细的成功信息
      const { applicationNo, submitTime, expectedProcessDays, message } = response.data

      uni.showModal({
        title: '申请提交成功',
        content: `申请编号：${applicationNo}\n提交时间：${submitTime}\n预计处理：${expectedProcessDays}个工作日\n\n${message}`,
        confirmText: '查看记录',
        cancelText: '继续申请',
        success: (res) => {
          if (res.confirm) {
            // 跳转到记录页面
            uni.navigateTo({
              url: '/pages/vehicle-affiliation-records/index',
            })
          }
          else {
            // 重置表单继续申请
            resetForm()
          }
        },
      })
    }
    else {
      throw new Error(response.message || '提交失败')
    }
  }
  catch (error: any) {
    console.error('提交申请失败:', error)
    uni.hideLoading()
    toastRef.value?.error(error.message || '提交失败')
  }
  finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    operationMode: packageConfigs.value.length > 0 ? packageConfigs.value[0].packageCode : '',
    contactPhone: userStore.user?.phone || '',
    contactAddress: '',
    contactLongitude: undefined,
    contactLatitude: undefined,
    vehicleDescription: '',
    rentalIntention: '',
    registrationCertFrontUrl: '',
    registrationCertBackUrl: '',
    insurancePolicyUrls: [],
    inspectionCertUrl: '',
    agreementVersion: agreementInfo.value?.version || 'v1.0',
    agreementAgreed: false,
  }
}

// 加载当前申请状态
async function loadCurrentStatus() {
  try {
    const response = await getCurrentStatus()
    if (response.code === 200) {
      currentStatus.value = response.data
    }
  }
  catch (error) {
    console.error('获取申请状态失败:', error)
    toastRef.value?.error('获取申请状态失败')
  }
}

// 加载套餐配置
async function loadPackageConfigs() {
  try {
    const response = await getOperationPackages()
    if (response.code === 200) {
      packageConfigs.value = response.data

      // 默认选中套餐A
      if (packageConfigs.value.length > 0) {
        formData.value.operationMode = packageConfigs.value[0].packageCode
      }
    }
  }
  catch (error) {
    console.error('获取套餐配置失败:', error)
  }
}

// 加载协议信息
async function loadAgreement() {
  try {
    const response = await getAgreement()
    if (response.code === 200) {
      agreementInfo.value = response.data
      formData.value.agreementVersion = response.data.version
    }
  }
  catch (error) {
    console.error('获取协议信息失败:', error)
  }
}

// 页面初始化
onMounted(async () => {
  loading.value = true
  try {
    // 初始化手机号
    initPhoneNumber()

    await Promise.all([
      loadCurrentStatus(),
      loadPackageConfigs(),
      loadAgreement(),
    ])
  }
  catch (error) {
    console.error('页面初始化失败:', error)
    toastRef.value?.error('页面加载失败')
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <OwnerCertificationHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 申请记录入口 -->
        <view
          class="border border-purple-100 rounded-[24rpx] from-purple-50 to-blue-50 bg-gradient-to-r p-[24rpx] transition-transform duration-150 active:scale-98"
          @tap="goToRecords"
        >
          <view class="flex items-center justify-between">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-history text-[32rpx] text-purple-600" />
              <view>
                <text class="block text-[28rpx] text-purple-800 font-semibold">
                  查看申请记录
                </text>
                <text class="text-[24rpx] text-purple-600">
                  查看之前的挂靠申请状态
                </text>
              </view>
            </view>
            <text class="i-material-symbols-chevron-right text-[32rpx] text-purple-400" />
          </view>
        </view>
        <!-- 运营套餐选择 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-business-center text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              运营套餐
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view
              v-for="config in packageConfigs"
              :key="config.packageCode"
              class="border rounded-[16rpx] p-[24rpx] transition-all duration-150 active:scale-98"
              :class="formData.operationMode === config.packageCode
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-white'"
              @tap="selectOperationMode(config.packageCode)"
            >
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[12rpx]">
                  <view
                    class="h-[20rpx] w-[20rpx] flex items-center justify-center border-2 rounded-full"
                    :class="formData.operationMode === config.packageCode
                      ? 'border-purple-600'
                      : 'border-gray-300'"
                  >
                    <view
                      v-if="formData.operationMode === config.packageCode"
                      class="h-[8rpx] w-[8rpx] rounded-full bg-purple-600"
                    />
                  </view>
                  <text class="text-[28rpx] text-black font-medium">
                    {{ config.packageName }}
                  </text>
                </view>
                <!-- <text class="text-[24rpx] text-purple-600 font-medium">
                  {{ config.revenueShareRateText }}
                </text> -->
              </view>

              <text class="mt-[12rpx] block text-[24rpx] text-gray-600 leading-relaxed">
                {{ config.packageDescription }}
              </text>

              <view v-if="config.includedServices?.length" class="mt-[16rpx] flex flex-wrap gap-[8rpx]">
                <text
                  v-for="service in config.includedServices"
                  :key="service"
                  class="rounded-[8rpx] bg-purple-100 px-[12rpx] py-[4rpx] text-[20rpx] text-purple-700"
                >
                  {{ service }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系信息 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-contact-phone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                联系信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 联系电话 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系电话 <text class="text-red-500">
                    *
                  </text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  方便我们联系您
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="formData.contactPhone"
                  type="number"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  placeholder="请输入手机号"
                  maxlength="11"
                >
              </view>
            </view>

            <!-- 联系地址 -->
            <view class="flex items-center justify-between">
              <view w-max flex-none>
                <text class="block text-[28rpx] text-black font-medium">
                  联系地址
                </text>
                <text class="text-[24rpx] text-gray-500">
                  上门看车地址
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <text
                  class="min-w-[200rpx] text-right text-[26rpx] text-purple-600"
                  @tap="selectAddress"
                >
                  {{ formData.contactAddress || '点击选择地址' }}
                </text>
                <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
              </view>
            </view>
          </view>
        </view>

        <!-- 车辆描述 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-directions-car text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                车辆信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 车辆描述 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                车辆描述
              </text>
              <textarea
                v-model="formData.vehicleDescription"
                class="h-[200rpx] w-full border border-gray-300 rounded text-[26rpx]"
                placeholder="请简单描述您的车辆，如：品牌型号、年份、颜色、里程等"
                maxlength="200"
              />
            </view>

            <!-- 出租意向 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                出租意向
              </text>
              <textarea
                v-model="formData.rentalIntention"
                class="h-[200rpx] w-full border border-gray-300 rounded text-[26rpx]"
                placeholder="请描述您的出租意向，如：期望价格、可出租时间等"
                maxlength="200"
              />
            </view>
          </view>
        </view>

        <!-- 证件材料 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-photo-camera text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                证件材料
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 行驶证正本 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  行驶证正本 <text class="text-red-500">
                    *
                  </text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  上传行驶证正本照片
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <view
                  class="relative h-[120rpx] w-[120rpx] flex items-center justify-center border-2 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-98"
                  :class="formData.registrationCertFrontUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'"
                  @tap="uploadDocument('registrationCertFront')"
                >
                  <image
                    v-if="formData.registrationCertFrontUrl"
                    :src="formData.registrationCertFrontUrl"
                    class="h-full w-full rounded-[12rpx] object-cover"
                    mode="aspectFill"
                  />
                  <text
                    v-else
                    class="i-material-symbols-add-a-photo text-[40rpx] text-gray-400"
                  />
                  <view v-if="uploadStatus.registrationCertFront" class="absolute inset-0 flex items-center justify-center rounded-[12rpx] bg-black bg-opacity-50">
                    <text class="i-material-symbols-sync animate-spin text-[24rpx] text-white" />
                  </view>
                </view>
              </view>
            </view>

            <!-- 行驶证副本 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  行驶证副本 <text class="text-red-500">
                    *
                  </text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  上传行驶证副本照片
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <view
                  class="relative h-[120rpx] w-[120rpx] flex items-center justify-center border-2 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-98"
                  :class="formData.registrationCertBackUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'"
                  @tap="uploadDocument('registrationCertBack')"
                >
                  <image
                    v-if="formData.registrationCertBackUrl"
                    :src="formData.registrationCertBackUrl"
                    class="h-full w-full rounded-[12rpx] object-cover"
                    mode="aspectFill"
                  />
                  <text
                    v-else
                    class="i-material-symbols-add-a-photo text-[40rpx] text-gray-400"
                  />
                  <view v-if="uploadStatus.registrationCertBack" class="absolute inset-0 flex items-center justify-center rounded-[12rpx] bg-black bg-opacity-50">
                    <text class="i-material-symbols-sync animate-spin text-[24rpx] text-white" />
                  </view>
                </view>
              </view>
            </view>

            <!-- 保险单 -->
            <view>
              <view class="mb-[16rpx] flex items-center justify-between">
                <view>
                  <text class="block text-[28rpx] text-black font-medium">
                    保险单 <text class="text-red-500">
                      *
                    </text>
                  </text>
                  <text class="text-[24rpx] text-gray-500">
                    交强险、商业保险等
                  </text>
                </view>
                <view
                  class="rounded-[8rpx] bg-purple-600 px-[16rpx] py-[8rpx] text-[24rpx] text-white active:bg-purple-700"
                  @tap="uploadDocument('insurancePolicy')"
                >
                  添加保险单
                </view>
              </view>

              <view v-if="formData.insurancePolicyUrls.length > 0" class="grid grid-cols-3 gap-[16rpx]">
                <view
                  v-for="(url, index) in formData.insurancePolicyUrls"
                  :key="index"
                  class="relative"
                >
                  <image
                    :src="url"
                    class="h-[120rpx] w-full rounded-[12rpx] object-cover"
                    mode="aspectFill"
                  />
                  <view
                    class="absolute h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                    @tap="removeInsuranceFile(index)"
                  >
                    <text class="i-material-symbols-close text-[16rpx] text-white" />
                  </view>
                </view>
              </view>
            </view>

            <!-- 年检标 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  电子年检标 <text class="text-red-500">
                    *
                  </text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  上传年检标照片
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <view
                  class="relative h-[120rpx] w-[120rpx] flex items-center justify-center border-2 rounded-[12rpx] border-dashed transition-all duration-150 active:scale-98"
                  :class="formData.inspectionCertUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'"
                  @tap="uploadDocument('inspectionCert')"
                >
                  <image
                    v-if="formData.inspectionCertUrl"
                    :src="formData.inspectionCertUrl"
                    class="h-full w-full rounded-[12rpx] object-cover"
                    mode="aspectFill"
                  />
                  <text
                    v-else
                    class="i-material-symbols-add-a-photo text-[40rpx] text-gray-400"
                  />
                  <view v-if="uploadStatus.inspectionCert" class="absolute inset-0 flex items-center justify-center rounded-[12rpx] bg-black bg-opacity-50">
                    <text class="i-material-symbols-sync animate-spin text-[24rpx] text-white" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 协议签署 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-gavel text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                协议签署
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 协议同意 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  协议同意 <text class="text-red-500">
                    *
                  </text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  同意车辆出租服务协议
                </text>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="formData.agreementAgreed ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="toggleAgreement"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="formData.agreementAgreed ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 协议内容 -->
            <view class="rounded-[12rpx] bg-gray-50 p-[20rpx]">
              <text class="text-[24rpx] text-gray-700 leading-normal">
                我已阅读并同意《车辆出租服务协议》，确认所提供信息真实有效，愿意承担相应的法律责任。我们将在1-3个工作日内联系您进行详细沟通。
              </text>
              <text
                v-if="agreementInfo"
                class="mt-[12rpx] block text-[22rpx] text-purple-600"
              >
                协议版本：{{ agreementInfo.version }}
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
        class="w-full rounded-[16rpx] py-[24rpx] text-center text-[28rpx] font-semibold transition-all duration-150"
        :class="canSubmit && !submitting
          ? 'bg-purple-600 text-white active:bg-purple-700'
          : 'bg-gray-300 text-gray-500'"
        @tap="submitForm"
      >
        <text v-if="submitting" class="flex items-center justify-center space-x-[8rpx]">
          <text class="i-material-symbols-sync animate-spin text-[24rpx]" />
          <text>提交中...</text>
        </text>
        <text v-else>
          提交申请
        </text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
      <text class="text-[28rpx] text-gray-500">
        加载中...
      </text>
    </view>

    <!-- 地址选择器 -->
    <MapAddressPicker
      v-model:visible="addressPickerVisible"
      title="选择联系地址"
      :latitude="currentLocation.latitude"
      :longitude="currentLocation.longitude"
      @confirm="onAddressConfirm"
    />
  </view>
</template>

<route lang="yaml">
layout: home
</route>
