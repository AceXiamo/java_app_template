<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { uploadFileToOss } from '@/utils/alioss'
import { type PickupVerifyRequest, getContractStatus, getDepositQRCode, getDepositStatus, getOwnerOrderDetail, pickupVerify } from '@/api/owner-orders'

// 页面参数
interface PickupVerifyParams {
  orderNo: string
  orderId: string
}

const pageParams = ref<PickupVerifyParams>({
  orderNo: '',
  orderId: '',
})

// 订单基本信息
const orderInfo = ref({
  orderNo: '',
  userNickname: '',
  userPhone: '',
  vehicleName: '',
  licensePlate: '',
  brand: '',
  model: '',
  seats: 5,
  carType: '',
  energyType: '',
  pickupLocation: '',
  startTime: '',
  endTime: '',
})

// 押金类型选项
const depositTabs = [
  { key: 'wechat_pay', label: '微信支付', icon: 'i-material-symbols-qr-code', color: 'green' },
  { key: 'alipay_credit', label: '支付宝免押', icon: 'i-material-symbols-verified', color: 'blue' },
]

// 用车人信息
const driverInfo = reactive({
  idCardPhoto: '',
  licensePhoto: '',
})

// 车辆状态信息
const vehicleStatus = reactive({
  mileage: '',
  batteryLevel: '',
  fuelPhoto: '',
  vehiclePhotos: [] as string[],
  verificationPhotos: [] as string[],
})

// 押金信息
const depositInfo = reactive({
  type: 'wechat_pay', // alipay_credit | wechat_pay，默认选中微信支付
  amount: 500,
  status: 'pending', // pending | paid | confirmed
  statusText: '待支付',
  statusType: 'pending' as 'pending' | 'paid' | 'failed',
  qrCodeUrl: '', // 二维码图片URL（后端生成）
  paymentTime: '',
  transactionId: '',
})

// 合同签署信息
const contractInfo = reactive({
  signed: false,
  signTime: '',
  signature: '',
})

// 页面状态
const loading = ref(false)
const submitLoading = ref(false)

// 页面加载
onLoad((options: any) => {
  if (options.orderNo && options.orderId) {
    pageParams.value.orderNo = options.orderNo
    pageParams.value.orderId = options.orderId
    loadOrderInfo()
  }
})

// 加载订单信息
async function loadOrderInfo() {
  try {
    loading.value = true

    // 调用API获取订单详情
    const response = await getOwnerOrderDetail(pageParams.value.orderNo)

    if (response.code === 200 && response.data) {
      const orderData = response.data
      orderInfo.value = {
        orderNo: orderData.order_no || pageParams.value.orderNo,
        userNickname: orderData.user?.nickname || '未知用户',
        userPhone: orderData.user?.phone || '未知手机',
        vehicleName: orderData.vehicle?.name || '未知车辆',
        licensePlate: orderData.vehicle?.license_plate || '未知车牌',
        brand: orderData.vehicle?.brand || '未知品牌',
        model: orderData.vehicle?.model || '未知型号',
        seats: orderData.vehicle?.seats || 5,
        carType: orderData.vehicle?.car_type || '未知车型',
        energyType: orderData.vehicle?.energy_type || '未知能源',
        pickupLocation: orderData.pickup_location || '未知地点',
        startTime: orderData.start_time || '',
        endTime: orderData.end_time || '',
      }

      // 初始化合同状态
      await loadContractStatus()

      // 初始化押金状态（包含金额和支付状态）
      await refreshDepositStatus()

      // 初始化微信支付二维码（默认选中微信支付）
      await loadDepositQRCode()
    }
    else {
      throw new Error(response.msg || '获取订单详情失败')
    }
  }
  catch (error) {
    console.error('加载订单信息失败:', error)
    uni.showToast({
      title: '加载订单信息失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 拍摄/选择照片
async function chooseImage(type: string) {
  try {
    const res = await new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
      uni.chooseImage({
        count: type === 'vehiclePhotos' ? 6 : 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: resolve,
        fail: reject,
      })
    })

    uni.showLoading({ title: '上传中...' })

    const tempPaths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
    const uploadPromises = tempPaths.map(async (tempFilePath: string) => {
      const timestamp = Date.now()
      const randomNum = Math.floor(Math.random() * 1000)
      const fileName = `pickup_verify_${type}_${timestamp}_${randomNum}.jpg`
      const ossPath = `order/pickup/${fileName}`
      return await uploadFileToOss(tempFilePath, ossPath)
    })

    const ossUrls = await Promise.all(uploadPromises)

    // 根据类型更新对应字段
    switch (type) {
      case 'idCard':
        driverInfo.idCardPhoto = ossUrls[0]
        break
      case 'license':
        driverInfo.licensePhoto = ossUrls[0]
        break
      case 'fuel':
        vehicleStatus.fuelPhoto = ossUrls[0]
        break
      case 'vehiclePhotos':
        vehicleStatus.vehiclePhotos.push(...ossUrls)
        break
      case 'verification':
        vehicleStatus.verificationPhotos.push(...ossUrls)
        break
    }

    uni.hideLoading()
    uni.showToast({
      title: `上传成功`,
      icon: 'success',
    })
  }
  catch (error) {
    uni.hideLoading()
    console.error('上传照片失败:', error)
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none',
    })
  }
}

// 删除照片
function removePhoto(type: string, index?: number) {
  switch (type) {
    case 'idCard':
      driverInfo.idCardPhoto = ''
      break
    case 'license':
      driverInfo.licensePhoto = ''
      break
    case 'fuel':
      vehicleStatus.fuelPhoto = ''
      break
    case 'vehiclePhotos':
      if (index !== undefined) {
        vehicleStatus.vehiclePhotos.splice(index, 1)
      }
      break
    case 'verification':
      if (index !== undefined) {
        vehicleStatus.verificationPhotos.splice(index, 1)
      }
      break
  }
}

// 验证所有信息完成条件
const allInfoComplete = computed(() => {
  const driverInfoComplete = driverInfo.idCardPhoto && driverInfo.licensePhoto
  const vehicleInfoComplete = vehicleStatus.mileage
    && (orderInfo.value.energyType === '电动' ? vehicleStatus.batteryLevel : vehicleStatus.fuelPhoto)
    && vehicleStatus.vehiclePhotos.length >= 4
    && vehicleStatus.verificationPhotos.length >= 1
  const depositComplete = depositInfo.type && (
    (depositInfo.type === 'wechat_pay' && depositInfo.statusType === 'paid')
    || (depositInfo.type === 'alipay_credit') // 支付宝免押直接认为完成
  )
  const contractComplete = contractInfo.signed

  return driverInfoComplete && vehicleInfoComplete && depositComplete && contractComplete
})

// 选择押金类型
function selectDepositType(type: string) {
  depositInfo.type = type
  // 重置状态
  if (type === 'wechat_pay') {
    // 刷新押金状态
    refreshDepositStatus()
    // 获取微信支付二维码
    loadDepositQRCode()
  }
  else if (type === 'alipay_credit') {
    depositInfo.status = 'confirmed'
    depositInfo.qrCodeUrl = '' // 清空二维码
  }
}

// 从后端获取押金支付二维码
async function loadDepositQRCode() {
  try {
    const response = await getDepositQRCode(Number(pageParams.value.orderId))
    console.log('response', response)

    if (response.code === 200 && response.data) {
      depositInfo.qrCodeUrl = response.data.qrCodeUrl
      depositInfo.amount = response.data.amount
    }
    else {
      throw new Error(response.msg || '获取二维码失败')
    }
  }
  catch (error) {
    console.error('获取二维码失败:', error)
    uni.showToast({
      title: '获取二维码失败',
      icon: 'none',
    })
  }
}

// 刷新押金状态
async function refreshDepositStatus() {
  try {
    uni.showLoading({ title: '检查状态中...' })

    // 调用API获取最新的押金状态
    const response = await getDepositStatus(Number(pageParams.value.orderId))

    if (response.code === 200 && response.data) {
      const depositData = response.data

      // 更新押金信息
      depositInfo.amount = depositData.depositAmount
      depositInfo.statusText = depositData.statusText
      depositInfo.statusType = depositData.statusType
      depositInfo.paymentTime = depositData.depositPaymentTime || ''
      depositInfo.transactionId = depositData.depositWechatTransactionId || ''

      // 更新状态显示
      if (depositData.statusType === 'paid') {
        depositInfo.status = 'paid'
        uni.showToast({
          title: '押金支付成功',
          icon: 'success',
        })
      }
      else if (depositData.statusType === 'failed') {
        depositInfo.status = 'failed'
        uni.showToast({
          title: '押金支付失败',
          icon: 'none',
        })
      }
      else {
        depositInfo.status = 'pending'
        uni.showToast({
          title: `当前状态：${depositData.statusText}`,
          icon: 'none',
        })
      }
    }
    else {
      throw new Error(response.msg || '获取押金状态失败')
    }
  }
  catch (error) {
    console.error('刷新押金状态失败:', error)
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'none',
    })
  }
  finally {
    uni.hideLoading()
  }
}

// 初始化合同状态（静默加载）
async function loadContractStatus() {
  try {
    const response = await getContractStatus(Number(pageParams.value.orderId))

    if (response.code === 200 && response.data) {
      const contractData = response.data
      contractInfo.signed = contractData.signed || false
      contractInfo.signTime = contractData.signTime || ''
    }
  }
  catch (error) {
    console.error('加载合同状态失败:', error)
    // 初始化时静默失败，不显示错误提示
  }
}

// 刷新合同签署状态
async function refreshContractStatus() {
  try {
    uni.showLoading({ title: '检查状态中...' })

    // 调用API获取最新的合同签署状态
    const response = await getContractStatus(Number(pageParams.value.orderId))

    if (response.code === 200 && response.data) {
      const contractData = response.data
      contractInfo.signed = contractData.signed || false
      contractInfo.signTime = contractData.signTime || ''

      if (contractData.signed) {
        uni.showToast({
          title: '合同已签署完成',
          icon: 'success',
        })
      }
      else {
        uni.showToast({
          title: '用户尚未签署合同',
          icon: 'none',
        })
      }
    }
    else {
      throw new Error(response.msg || '获取合同状态失败')
    }
  }
  catch (error) {
    console.error('刷新合同状态失败:', error)
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'none',
    })
  }
  finally {
    uni.hideLoading()
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 完成取车验证
async function completePickupVerify() {
  if (!allInfoComplete.value) {
    uni.showToast({
      title: '请完成所有信息填写',
      icon: 'none',
    })
    return
  }

  try {
    submitLoading.value = true

    // 构建取车验证请求数据
    const verifyData: PickupVerifyRequest = {
      driverIdCardPhoto: driverInfo.idCardPhoto,
      driverLicensePhoto: driverInfo.licensePhoto,
      pickupMileage: Number(vehicleStatus.mileage),
      pickupBatteryLevel: orderInfo.value.energyType === '电动' ? Number(vehicleStatus.batteryLevel) : undefined,
      pickupFuelPhoto: orderInfo.value.energyType !== '电动' ? vehicleStatus.fuelPhoto : undefined,
      pickupVehiclePhotos: vehicleStatus.vehiclePhotos,
      verificationPhotos: vehicleStatus.verificationPhotos,
      depositType: depositInfo.type as 'alipay_credit' | 'wechat_pay',
      depositAmount: depositInfo.amount,
      depositWechatPayStatus: depositInfo.type === 'wechat_pay' ? (depositInfo.status as 'pending' | 'paid' | 'failed') : undefined,
      contractSigned: contractInfo.signed,
      contractSignTime: contractInfo.signed && contractInfo.signTime ? contractInfo.signTime : undefined,
      remark: '取车验证完成',
    }

    console.log('提交取车验证数据:', verifyData)

    // 调用取车验证API
    const response = await pickupVerify(Number(pageParams.value.orderId), verifyData)

    if (response.code === 200 && response.data) {
      uni.showToast({
        title: '取车验证成功',
        icon: 'success',
      })

      // 显示还车码
      const returnCode = response.data.returnCode
      if (returnCode) {
        uni.showModal({
          title: '取车验证成功',
          content: `还车码：${returnCode}\n请妥善保管，还车时需要使用。`,
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            uni.navigateBack()
          },
        })
      }
      else {
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
    else {
      throw new Error(response.msg || '取车验证失败')
    }
  }
  catch (error) {
    console.error('取车验证失败:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '验证失败，请重试',
      icon: 'none',
    })
  }
  finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航栏 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <view class="absolute left-[20rpx] flex items-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[32rpx] text-gray-700" />
        </view>
        <text class="pointer-events-none absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          取车验证
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="h-0 flex-1">
      <view class="p-[32rpx] space-y-[24rpx]">
        <!-- 订单信息卡片 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-receipt-long mr-[12rpx] text-[24rpx] text-blue-600" />
            <text class="text-[28rpx] text-black font-semibold">
              订单信息
            </text>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                订单号
              </text>
              <text class="text-[24rpx] text-black font-medium">
                {{ orderInfo.orderNo }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                用户
              </text>
              <text class="text-[24rpx] text-black font-medium">
                {{ orderInfo.userNickname }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                车辆
              </text>
              <text class="text-[24rpx] text-black font-medium">
                {{ orderInfo.vehicleName }}
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                车牌
              </text>
              <text class="rounded-[8rpx] bg-blue-600 px-[12rpx] py-[4rpx] text-[20rpx] text-white font-bold">
                {{ orderInfo.licensePlate }}
              </text>
            </view>
          </view>
        </view>

        <!-- 用车人信息和车辆状态 -->
        <view class="space-y-[24rpx]">
          <!-- 用车人信息 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-person mr-[12rpx] text-[24rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">
                用车人信息
              </text>
            </view>

            <!-- 身份证照片 -->
            <view class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                身份证人像照片
              </text>
              <view
                v-if="!driverInfo.idCardPhoto"
                class="h-[200rpx] flex items-center justify-center border-2 border-gray-300 rounded-[16rpx] border-dashed"
                @tap="chooseImage('idCard')"
              >
                <view class="flex flex-col items-center">
                  <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                  <text class="text-[24rpx] text-gray-500">
                    点击拍摄身份证
                  </text>
                </view>
              </view>
              <view v-else class="relative">
                <image
                  :src="driverInfo.idCardPhoto"
                  mode="aspectFill"
                  class="h-[200rpx] w-full rounded-[16rpx]"
                />
                <view
                  class="absolute h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                  @tap="removePhoto('idCard')"
                >
                  <text class="i-material-symbols-close text-[20rpx] text-white" />
                </view>
              </view>
            </view>

            <!-- 驾驶证照片 -->
            <view class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                驾驶证照片
              </text>
              <view
                v-if="!driverInfo.licensePhoto"
                class="h-[200rpx] flex items-center justify-center border-2 border-gray-300 rounded-[16rpx] border-dashed"
                @tap="chooseImage('license')"
              >
                <view class="flex flex-col items-center">
                  <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                  <text class="text-[24rpx] text-gray-500">
                    点击拍摄驾驶证
                  </text>
                </view>
              </view>
              <view v-else class="relative">
                <image
                  :src="driverInfo.licensePhoto"
                  mode="aspectFill"
                  class="h-[200rpx] w-full rounded-[16rpx]"
                />
                <view
                  class="absolute h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                  @tap="removePhoto('license')"
                >
                  <text class="i-material-symbols-close text-[20rpx] text-white" />
                </view>
              </view>
            </view>
          </view>

          <!-- 车辆状态信息 -->
          <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
            <view class="mb-[24rpx] flex items-center">
              <text class="i-material-symbols-directions-car mr-[12rpx] text-[24rpx] text-green-600" />
              <text class="text-[28rpx] text-black font-semibold">
                车辆状态
              </text>
            </view>

            <!-- 里程数 -->
            <view class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                当前里程数
              </text>
              <input
                v-model="vehicleStatus.mileage"
                type="number"
                placeholder="请输入里程数（公里）"
                class="w-full border border-gray-200 rounded-[12rpx] border-solid px-[24rpx] py-[16rpx] text-[26rpx]"
              >
            </view>

            <!-- 电量或油量 -->
            <view v-if="orderInfo.energyType === '电动'" class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                当前电量
              </text>
              <input
                v-model="vehicleStatus.batteryLevel"
                type="number"
                placeholder="请输入电量百分比（0-100）"
                class="w-full border border-gray-200 rounded-[12rpx] border-solid px-[24rpx] py-[16rpx] text-[26rpx]"
              >
            </view>
            <view v-else class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                油表照片
              </text>
              <view
                v-if="!vehicleStatus.fuelPhoto"
                class="h-[200rpx] flex items-center justify-center border-2 border-gray-300 rounded-[16rpx] border-dashed"
                @tap="chooseImage('fuel')"
              >
                <view class="flex flex-col items-center">
                  <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[48rpx] text-gray-400" />
                  <text class="text-[24rpx] text-gray-500">
                    点击拍摄油表
                  </text>
                </view>
              </view>
              <view v-else class="relative">
                <image
                  :src="vehicleStatus.fuelPhoto"
                  mode="aspectFill"
                  class="h-[200rpx] w-full rounded-[16rpx]"
                />
                <view
                  class="absolute h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                  @tap="removePhoto('fuel')"
                >
                  <text class="i-material-symbols-close text-[20rpx] text-white" />
                </view>
              </view>
            </view>

            <!-- 车辆外观照片 -->
            <view class="mb-[24rpx]">
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                车辆外观照片
                <text class="text-[20rpx] text-gray-500">
                  （至少4张，包含前后左右各角度）
                </text>
              </text>
              <view class="grid grid-cols-3 gap-[16rpx]">
                <view
                  v-for="(photo, index) in vehicleStatus.vehiclePhotos"
                  :key="index"
                  class="relative aspect-square"
                >
                  <image
                    :src="photo"
                    mode="aspectFill"
                    class="h-full w-full rounded-[12rpx]"
                  />
                  <view
                    class="absolute h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-red-500 -right-[6rpx] -top-[6rpx]"
                    @tap="removePhoto('vehiclePhotos', index)"
                  >
                    <text class="i-material-symbols-close text-[16rpx] text-white" />
                  </view>
                </view>

                <view
                  v-if="vehicleStatus.vehiclePhotos.length < 6"
                  class="aspect-square flex items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed"
                  @tap="chooseImage('vehiclePhotos')"
                >
                  <text class="i-material-symbols-add text-[32rpx] text-gray-400" />
                </view>
              </view>
            </view>

            <!-- 验证照片 -->
            <view>
              <text class="mb-[12rpx] block text-[26rpx] text-black font-medium">
                取车验证照片
                <text class="text-[20rpx] text-gray-500">
                  （至少1张）
                </text>
              </text>
              <view class="grid grid-cols-3 gap-[16rpx]">
                <view
                  v-for="(photo, index) in vehicleStatus.verificationPhotos"
                  :key="index"
                  class="relative aspect-square"
                >
                  <image
                    :src="photo"
                    mode="aspectFill"
                    class="h-full w-full rounded-[12rpx]"
                  />
                  <view
                    class="absolute h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-red-500 -right-[6rpx] -top-[6rpx]"
                    @tap="removePhoto('verification', index)"
                  >
                    <text class="i-material-symbols-close text-[16rpx] text-white" />
                  </view>
                </view>

                <view
                  v-if="vehicleStatus.verificationPhotos.length < 4"
                  class="aspect-square flex items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed"
                  @tap="chooseImage('verification')"
                >
                  <text class="i-material-symbols-add text-[32rpx] text-gray-400" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 押金处理 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-account-balance-wallet mr-[12rpx] text-[24rpx] text-orange-600" />
              <text class="text-[28rpx] text-black font-semibold">
                押金处理
              </text>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <text class="text-[24rpx] text-orange-600 font-bold">
                ¥{{ depositInfo.amount }}
              </text>
              <!-- 刷新状态按钮 - 仅微信支付时显示 -->
              <view
                v-if="depositInfo.type === 'wechat_pay'"
                class="flex items-center rounded-[8rpx] bg-orange-100 px-[16rpx] py-[8rpx]"
                @tap="refreshDepositStatus"
              >
                <text class="i-material-symbols-refresh mr-[4rpx] text-[20rpx] text-orange-600" />
                <text class="text-[20rpx] text-orange-600 font-medium">
                  刷新状态
                </text>
              </view>
            </view>
          </view>

          <!-- 押金类型 Tab -->
          <view class="mb-[24rpx] flex rounded-[12rpx] bg-gray-100 p-[4rpx]">
            <view
              v-for="tab in depositTabs"
              :key="tab.key"
              class="flex-1 cursor-pointer rounded-[8rpx] px-[16rpx] py-[12rpx] text-center transition-all"
              :class="depositInfo.type === tab.key
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500'"
              @tap="selectDepositType(tab.key)"
            >
              <text :class="tab.icon" class="mr-[8rpx] text-[20rpx]" />
              <text class="text-[24rpx] font-medium">
                {{ tab.label }}
              </text>
            </view>
          </view>

          <!-- 支付宝免押二维码 -->
          <view v-if="depositInfo.type === 'alipay_credit'" class="space-y-[16rpx]">
            <view class="rounded-[12rpx] bg-blue-50 p-[20rpx]">
              <view class="flex items-start">
                <text class="i-material-symbols-info mr-[8rpx] mt-[4rpx] text-[20rpx] text-blue-600" />
                <view class="flex-1">
                  <text class="mb-[8rpx] block text-[24rpx] text-blue-800 font-medium">
                    支付宝免押指引
                  </text>
                  <text class="text-[22rpx] text-blue-700 leading-[32rpx]">
                    请指导用户使用支付宝扫描下方二维码，完成免押授权即可继续。
                  </text>
                </view>
              </view>
            </view>

            <!-- 支付宝免押二维码 -->
            <view class="rounded-[12rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[16rpx] block text-[26rpx] text-black font-medium">
                请用户扫码完成免押授权
              </text>
              <view class="mx-auto mb-[16rpx] h-[300rpx] w-[300rpx] flex items-center justify-center rounded-[12rpx] bg-white">
                <!-- TODO: 这里应该显示支付宝免押的固定二维码图片 -->
                <text class="text-[24rpx] text-gray-500">
                  支付宝免押二维码
                </text>
              </view>
              <text class="text-[20rpx] text-gray-500">
                用户扫码完成授权即可继续下一步
              </text>
            </view>
          </view>

          <!-- 微信支付二维码 -->
          <view v-else-if="depositInfo.type === 'wechat_pay'" class="space-y-[16rpx]">
            <view class="rounded-[12rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[16rpx] block text-[26rpx] text-black font-medium">
                请用户扫码支付押金
              </text>
              <view class="mx-auto mb-[16rpx] h-[300rpx] w-[300rpx] flex items-center justify-center rounded-[12rpx] bg-white">
                <!-- 显示后端生成的二维码 -->
                <image
                  v-if="depositInfo.qrCodeUrl"
                  :src="depositInfo.qrCodeUrl"
                  mode="aspectFit"
                  class="h-full w-full"
                />
                <text v-else class="text-[24rpx] text-gray-500">
                  获取二维码中...
                </text>
              </view>

              <!-- 支付状态显示 -->
              <view v-if="depositInfo.statusType === 'paid'" class="rounded-[8rpx] bg-green-50 p-[12rpx]">
                <text class="i-material-symbols-check-circle mr-[8rpx] text-[20rpx] text-green-600" />
                <text class="text-[22rpx] text-green-700">
                  {{ depositInfo.statusText }}
                </text>
                <text v-if="depositInfo.paymentTime" class="mt-[4rpx] block text-[18rpx] text-green-600">
                  支付时间：{{ depositInfo.paymentTime }}
                </text>
                <text v-if="depositInfo.transactionId" class="mt-[4rpx] block text-[18rpx] text-green-600">
                  交易单号：{{ depositInfo.transactionId }}
                </text>
              </view>
              <view v-else-if="depositInfo.statusType === 'failed'" class="rounded-[8rpx] bg-red-50 p-[12rpx]">
                <text class="i-material-symbols-error mr-[8rpx] text-[20rpx] text-red-600" />
                <text class="text-[22rpx] text-red-700">
                  {{ depositInfo.statusText }}
                </text>
                <text class="mt-[4rpx] block text-[18rpx] text-red-600">
                  请重新扫码支付或联系客服
                </text>
              </view>
              <view v-else class="space-y-[8rpx]">
                <view class="rounded-[8rpx] bg-yellow-50 p-[12rpx]">
                  <text class="i-material-symbols-schedule mr-[8rpx] text-[20rpx] text-yellow-600" />
                  <text class="text-[22rpx] text-yellow-700">
                    {{ depositInfo.statusText }}
                  </text>
                </view>
                <text class="block text-[20rpx] text-gray-500">
                  支付完成后状态会自动更新，也可点击右上角刷新状态
                </text>
                <text class="block text-[18rpx] text-gray-400">
                  二维码内容：ORDER_DEPOSIT#{{ pageParams.orderNo }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 合同签署 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-contract-edit mr-[12rpx] text-[24rpx] text-indigo-600" />
              <text class="text-[28rpx] text-black font-semibold">
                合同签署
              </text>
            </view>

            <!-- 刷新状态按钮 -->
            <view
              class="flex items-center rounded-[8rpx] bg-indigo-100 px-[16rpx] py-[8rpx]"
              @tap="refreshContractStatus"
            >
              <text class="i-material-symbols-refresh mr-[4rpx] text-[20rpx] text-indigo-600" />
              <text class="text-[20rpx] text-indigo-600 font-medium">
                刷新状态
              </text>
            </view>
          </view>

          <view class="mb-[24rpx] rounded-[16rpx] bg-blue-50 p-[20rpx]">
            <view class="flex items-start">
              <view class="flex-1">
                <text class="mb-[8rpx] block text-[24rpx] text-blue-800 font-medium">
                  合同签署说明
                </text>
                <text class="text-[22rpx] text-blue-700 leading-[32rpx]">
                  请指导用户在其手机上打开订单详情，点击"签署合同"按钮完成电子合同签署。签署完成后点击上方"刷新状态"按钮更新状态。
                </text>
              </view>
            </view>
          </view>

          <view
            v-if="!contractInfo.signed"
            class="rounded-[16rpx] bg-orange-50 p-[20rpx] text-center"
          >
            <text class="text-[24rpx] text-orange-700">
              等待用户签署合同...
            </text>
          </view>

          <view
            v-else
            class="rounded-[16rpx] bg-green-50 p-[20rpx] text-center"
          >
            <text class="text-[24rpx] text-green-700">
              合同签署完成
            </text>
            <text class="mt-[8rpx] block text-[20rpx] text-green-600">
              签署时间：{{ contractInfo.signTime }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="border-t border-gray-100 bg-white p-[32rpx] pb-[56rpx]">
      <view class="flex space-x-[16rpx]">
        <!-- 返回 -->
        <view
          class="flex-1 border border-gray-300 rounded-[20rpx] bg-white py-[24rpx] text-center text-[28rpx] text-gray-600 font-medium"
          @tap="goBack"
        >
          返回
        </view>

        <!-- 完成验证 -->
        <view
          class="flex-1 rounded-[20rpx] py-[24rpx] text-center text-[28rpx] font-medium"
          :class="allInfoComplete ? 'bg-purple-600 text-white' : 'bg-gray-400 text-gray-200'"
          @tap="completePickupVerify"
        >
          <text v-if="submitLoading">
            提交中...
          </text>
          <text v-else>
            完成验证
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
