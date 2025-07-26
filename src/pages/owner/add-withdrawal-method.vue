<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import {
  type OwnerWithdrawalMethod,
  addOwnerWithdrawalMethod,
  getOwnerWithdrawalMethods,
} from '@/api/owner-withdrawal'
import { uploadFileToOss } from '@/utils/alioss'

// 获取页面参数
const { id, type } = defineProps<{
  id?: string
  type?: string
}>()

const isEdit = ref(!!id)
const currentType = ref(type || 'bank')

// 表单数据
const formData = reactive({
  type: 'bank',
  bankName: '',
  accountNumber: '',
  holderName: '',
  holderPhone: '',
  wechatAccount: '',
  alipayAccount: '',
  qrCodeImage: '',
  isDefault: false,
})

// 验证状态
const errors = reactive({
  bankName: '',
  accountNumber: '',
  holderName: '',
  holderPhone: '',
  wechatAccount: '',
  alipayAccount: '',
})

const loading = ref(false)

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 提现方式类型选项
const typeOptions = [
  { value: 'bank', label: '银行卡', icon: 'i-material-symbols-account-balance' },
  { value: 'wechat', label: '微信', iconUrl: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/wechat.png' },
  { value: 'alipay', label: '支付宝', iconUrl: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/alipay.png' },
]

// 常用银行列表
const bankList = [
  '中国工商银行',
  '中国建设银行',
  '中国银行',
  '中国农业银行',
  '招商银行',
  '交通银行',
  '浦发银行',
  '中信银行',
  '光大银行',
  '华夏银行',
  '民生银行',
  '兴业银行',
  '平安银行',
  '广发银行',
  '邮储银行',
  '其他银行',
]

const bankPickerIndex = ref(0)

// 切换提现方式类型
function switchType(type: string) {
  currentType.value = type
  formData.type = type
  clearErrors()
}

// 清除错误信息
function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

// 验证表单
function validateForm() {
  clearErrors()
  let isValid = true

  if (formData.type === 'bank') {
    if (!formData.bankName) {
      errors.bankName = '请选择银行'
      isValid = false
    }
    if (!formData.accountNumber) {
      errors.accountNumber = '请输入银行卡号'
      isValid = false
    }
    else if (!/^\d{16,19}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      errors.accountNumber = '请输入正确的银行卡号'
      isValid = false
    }
  }
  else if (formData.type === 'wechat') {
    if (!formData.wechatAccount) {
      errors.wechatAccount = '请输入微信号'
      isValid = false
    }
  }
  else if (formData.type === 'alipay') {
    if (!formData.alipayAccount) {
      errors.alipayAccount = '请输入支付宝账号'
      isValid = false
    }
  }

  if (!formData.holderName) {
    errors.holderName = '请输入持有人姓名'
    isValid = false
  }
  else if (!/^[\u4E00-\u9FA5]{2,10}$/.test(formData.holderName)) {
    errors.holderName = '请输入正确的中文姓名'
    isValid = false
  }

  if (!formData.holderPhone) {
    errors.holderPhone = '请输入手机号'
    isValid = false
  }
  else if (!/^1[3-9]\d{9}$/.test(formData.holderPhone)) {
    errors.holderPhone = '请输入正确的手机号'
    isValid = false
  }

  return isValid
}

// 选择银行
function onBankPickerChange(e: any) {
  const index = e.detail.value
  bankPickerIndex.value = index
  formData.bankName = bankList[index]
  if (errors.bankName) {
    errors.bankName = ''
  }
}

// 格式化银行卡号
function formatBankCard(value: string) {
  const cleaned = value.replace(/\s/g, '')
  const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
  return formatted
}

// 银行卡号输入处理
function onBankCardInput(e: any) {
  const value = e.detail.value
  formData.accountNumber = formatBankCard(value)
  if (errors.accountNumber) {
    errors.accountNumber = ''
  }
}

// 上传收款码
async function uploadQRCode() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      try {
        uni.showLoading({ title: '上传中...' })

        // 生成文件名和路径
        const timestamp = Date.now()
        const fileName = `qrcode_${timestamp}.jpg`
        const ossPath = `withdrawal/${formData.type}/${fileName}`

        // 上传到阿里云OSS
        const uploadedUrl = await uploadFileToOss(tempFilePath, ossPath)

        formData.qrCodeImage = uploadedUrl
        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })
      }
      catch (error) {
        console.error('上传失败:', error)
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

// 提交表单
async function submitForm() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  uni.showLoading({ title: isEdit.value ? '更新中...' : '添加中...' })

  try {
    // 构建提交数据
    const submitData: Partial<OwnerWithdrawalMethod> = {
      methodType: formData.type,
      methodName: getMethodName(),
      accountInfo: getAccountInfo(),
      holderName: formData.holderName,
      holderPhone: formData.holderPhone,
      isDefault: formData.isDefault,
    }

    // 根据类型设置特定字段
    if (formData.type === 'bank') {
      submitData.bankName = formData.bankName
      submitData.bankAccount = formData.accountNumber.replace(/\s/g, '') // 去除空格
    }
    else if (formData.type === 'wechat') {
      submitData.wechatAccount = formData.wechatAccount
      if (formData.qrCodeImage) {
        submitData.qrCodeImageUrl = formData.qrCodeImage // 已上传到OSS的URL
      }
    }
    else if (formData.type === 'alipay') {
      submitData.alipayAccount = formData.alipayAccount
      if (formData.qrCodeImage) {
        submitData.qrCodeImageUrl = formData.qrCodeImage // 已上传到OSS的URL
      }
    }

    // 目前只支持添加，编辑功能待后端API支持
    if (isEdit.value) {
      uni.hideLoading()
      uni.showToast({ title: '编辑功能暂未开放', icon: 'none' })
      return
    }

    const response = await addOwnerWithdrawalMethod(submitData)

    if (response.code === 200) {
      uni.hideLoading()
      uni.showToast({
        title: '添加成功',
        icon: 'success',
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
    else {
      throw new Error(response.msg || '提交失败')
    }
  }
  catch (error) {
    console.error('提交失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error instanceof Error ? error.message : '提交失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 获取方式名称
function getMethodName(): string {
  if (formData.type === 'bank') {
    return formData.bankName
  }
  else if (formData.type === 'wechat') {
    return '微信收款码'
  }
  else if (formData.type === 'alipay') {
    return '支付宝收款码'
  }
  return ''
}

// 获取账户信息
function getAccountInfo(): string {
  if (formData.type === 'bank') {
    const account = formData.accountNumber.replace(/\s/g, '')
    return `****${account.slice(-4)}` // 显示后4位
  }
  else if (formData.type === 'wechat') {
    return `微信号: ${formData.wechatAccount}`
  }
  else if (formData.type === 'alipay') {
    return `支付宝: ${formData.alipayAccount}`
  }
  return ''
}

// 加载现有数据（编辑模式）
async function loadExistingData() {
  if (!isEdit.value || !id)
    return

  try {
    uni.showLoading({ title: '加载中...' })
    const response = await getOwnerWithdrawalMethods()

    if (response.code === 200 && response.data) {
      const method = response.data.find(m => m.methodId.toString() === id)
      if (method) {
        // 填充表单数据
        formData.type = method.methodType
        currentType.value = method.methodType
        formData.holderName = method.holderName
        formData.holderPhone = method.holderPhone
        formData.isDefault = method.isDefault

        if (method.methodType === 'bank') {
          formData.bankName = method.bankName || ''
          formData.accountNumber = method.bankAccount || ''
          // 找到对应的银行索引
          const bankIndex = bankList.findIndex(bank => bank === method.bankName)
          if (bankIndex !== -1) {
            bankPickerIndex.value = bankIndex
          }
        }
        else if (method.methodType === 'wechat') {
          formData.wechatAccount = method.wechatAccount || ''
          if (method.qrCodeImageUrl) {
            formData.qrCodeImage = method.qrCodeImageUrl
          }
        }
        else if (method.methodType === 'alipay') {
          formData.alipayAccount = method.alipayAccount || ''
          if (method.qrCodeImageUrl) {
            formData.qrCodeImage = method.qrCodeImageUrl
          }
        }
      }
    }
    uni.hideLoading()
  }
  catch (error) {
    console.error('加载数据失败:', error)
    uni.hideLoading()
    uni.showToast({ title: '加载数据失败', icon: 'none' })
  }
}

// 页面初始化
onMounted(async () => {
  formData.type = currentType.value

  if (isEdit.value && id) {
    await loadExistingData()
  }
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航栏 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          {{ isEdit ? '编辑提现方式' : '添加提现方式' }}
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 提现方式类型选择 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-payment text-[32rpx] text-purple-600" />
            <text class="text-[28rpx] font-semibold">
              选择提现方式
            </text>
          </view>

          <view class="grid grid-cols-3 gap-[16rpx]">
            <view
              v-for="option in typeOptions"
              :key="option.value"
              class="border-2 rounded-[16rpx] p-[24rpx] text-center transition-all duration-200"
              :class="currentType === option.value ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'"
              @tap="switchType(option.value)"
            >
              <view class="mb-[8rpx] flex justify-center">
                <image
                  v-if="option.iconUrl"
                  :src="option.iconUrl"
                  class="h-[32rpx] w-[32rpx]"
                  mode="aspectFit"
                />
                <text
                  v-else
                  class="text-[32rpx]"
                  :class="option.icon"
                  :style="{ color: currentType === option.value ? '#7c3aed' : '#666' }"
                />
              </view>
              <text
                class="text-[22rpx] font-medium"
                :class="currentType === option.value ? 'text-purple-600' : 'text-gray-600'"
              >
                {{ option.label }}
              </text>
            </view>
          </view>
        </view>

        <!-- 银行卡信息 -->
        <view v-if="currentType === 'bank'" class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-account-balance text-[32rpx] text-blue-600" />
            <text class="text-[28rpx] font-semibold">
              银行卡信息
            </text>
          </view>

          <view class="space-y-[24rpx]">
            <!-- 银行选择 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                选择银行 <text class="text-red-500">
                  *
                </text>
              </text>
              <picker
                mode="selector"
                :range="bankList"
                :value="bankPickerIndex"
                @change="onBankPickerChange"
              >
                <view
                  class="border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                  :class="errors.bankName ? 'border-red-500' : 'border-gray-300'"
                >
                  <view class="flex items-center justify-between">
                    <text :class="formData.bankName ? 'text-black' : 'text-gray-400'">
                      {{ formData.bankName || '请选择银行' }}
                    </text>
                    <text class="i-material-symbols-keyboard-arrow-down text-[24rpx] text-gray-400" />
                  </view>
                </view>
              </picker>
              <text v-if="errors.bankName" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.bankName }}
              </text>
            </view>

            <!-- 银行卡号 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                银行卡号 <text class="text-red-500">
                  *
                </text>
              </text>
              <input
                :value="formData.accountNumber"
                class="w-full border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                :class="errors.accountNumber ? 'border-red-500' : 'border-gray-300'"
                placeholder="请输入银行卡号"
                maxlength="23"
                type="number"
                @input="onBankCardInput"
              >
              <text v-if="errors.accountNumber" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.accountNumber }}
              </text>
            </view>
          </view>
        </view>

        <!-- 微信信息 -->
        <view v-else-if="currentType === 'wechat'" class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/wechat.png"
              class="h-[32rpx] w-[32rpx]"
              mode="aspectFit"
            />
            <text class="text-[28rpx] font-semibold">
              微信信息
            </text>
          </view>

          <view class="space-y-[24rpx]">
            <!-- 微信号 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                微信号 <text class="text-red-500">
                  *
                </text>
              </text>
              <input
                v-model="formData.wechatAccount"
                class="w-full border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                :class="errors.wechatAccount ? 'border-red-500' : 'border-gray-300'"
                placeholder="请输入微信号"
                @input="() => errors.wechatAccount = ''"
              >
              <text v-if="errors.wechatAccount" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.wechatAccount }}
              </text>
            </view>

            <!-- 收款码上传 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                微信收款码（可选）
              </text>
              <view class="flex items-center space-x-[16rpx]">
                <view
                  v-if="formData.qrCodeImage"
                  class="relative h-[120rpx] w-[120rpx] rounded-[12rpx]"
                >
                  <image
                    :src="formData.qrCodeImage"
                    mode="aspectFill"
                    class="h-full w-full rounded-[12rpx]"
                  />
                  <view
                    class="absolute h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                    @tap="formData.qrCodeImage = ''"
                  >
                    <text class="i-material-symbols-close text-[14rpx] text-white" />
                  </view>
                </view>
                <view
                  class="flex flex-1 flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed bg-gray-50 py-[32rpx]"
                  @tap="uploadQRCode"
                >
                  <text class="i-material-symbols-add-a-photo mb-[8rpx] block text-[32rpx] text-gray-400" />
                  <text class="text-[20rpx] text-gray-500">
                    上传收款码
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 支付宝信息 -->
        <view v-else-if="currentType === 'alipay'" class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/alipay.png"
              class="h-[32rpx] w-[32rpx]"
              mode="aspectFit"
            />
            <text class="text-[28rpx] font-semibold">
              支付宝信息
            </text>
          </view>

          <view class="space-y-[24rpx]">
            <!-- 支付宝账号 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                支付宝账号 <text class="text-red-500">
                  *
                </text>
              </text>
              <input
                v-model="formData.alipayAccount"
                class="w-full border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                :class="errors.alipayAccount ? 'border-red-500' : 'border-gray-300'"
                placeholder="请输入支付宝账号/手机号/邮箱"
                @input="() => errors.alipayAccount = ''"
              >
              <text v-if="errors.alipayAccount" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.alipayAccount }}
              </text>
            </view>

            <!-- 收款码上传 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                支付宝收款码（可选）
              </text>
              <view class="flex items-center space-x-[16rpx]">
                <view
                  v-if="formData.qrCodeImage"
                  class="relative h-[120rpx] w-[120rpx] overflow-hidden rounded-[12rpx]"
                >
                  <image
                    :src="formData.qrCodeImage"
                    mode="aspectFill"
                    class="h-full w-full"
                  />
                  <view
                    class="absolute h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-red-500 -right-[8rpx] -top-[8rpx]"
                    @tap="formData.qrCodeImage = ''"
                  >
                    <text class="i-material-symbols-close text-[14rpx] text-white" />
                  </view>
                </view>
                <view
                  class="flex flex-1 flex-col items-center justify-center border-2 border-gray-300 rounded-[12rpx] border-dashed bg-gray-50 py-[32rpx]"
                  @tap="uploadQRCode"
                >
                  <text class="i-material-symbols-add-a-photo mb-[8rpx] block text-[32rpx] text-gray-400" />
                  <text class="text-[20rpx] text-gray-500">
                    上传收款码
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 持有人信息 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-person text-[32rpx] text-purple-600" />
            <text class="text-[28rpx] font-semibold">
              持有人信息
            </text>
          </view>

          <view class="space-y-[24rpx]">
            <!-- 持有人姓名 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                持有人姓名 <text class="text-red-500">
                  *
                </text>
              </text>
              <input
                v-model="formData.holderName"
                class="w-full border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                :class="errors.holderName ? 'border-red-500' : 'border-gray-300'"
                placeholder="请输入真实姓名"
                @input="() => errors.holderName = ''"
              >
              <text v-if="errors.holderName" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.holderName }}
              </text>
            </view>

            <!-- 手机号 -->
            <view>
              <text class="mb-[12rpx] block text-[24rpx] text-gray-700 font-medium">
                手机号 <text class="text-red-500">
                  *
                </text>
              </text>
              <input
                v-model="formData.holderPhone"
                class="w-full border rounded-[12rpx] bg-gray-50 px-[20rpx] py-[16rpx] text-[26rpx]"
                :class="errors.holderPhone ? 'border-red-500' : 'border-gray-300'"
                placeholder="请输入手机号"
                type="number"
                maxlength="11"
                @input="() => errors.holderPhone = ''"
              >
              <text v-if="errors.holderPhone" class="mt-[8rpx] block text-[20rpx] text-red-500">
                {{ errors.holderPhone }}
              </text>
            </view>
          </view>
        </view>

        <!-- 设置选项 -->
        <view class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="flex items-center justify-between">
            <view>
              <text class="block text-[26rpx] font-medium">
                设为默认提现方式
              </text>
              <text class="text-[22rpx] text-gray-500">
                设置为默认后优先使用此方式提现
              </text>
            </view>
            <view
              class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
              :class="formData.isDefault ? 'bg-purple-600' : 'bg-gray-300'"
              @tap="formData.isDefault = !formData.isDefault"
            >
              <view
                class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                :class="formData.isDefault ? 'right-[8rpx]' : 'left-[8rpx]'"
              />
            </view>
          </view>
        </view>

        <!-- 温馨提示 -->
        <view class="rounded-[16rpx] bg-yellow-50 p-[24rpx]">
          <view class="mb-[12rpx] flex items-center space-x-[8rpx]">
            <text class="i-material-symbols-warning text-[24rpx] text-yellow-600" />
            <text class="text-[26rpx] text-yellow-800 font-medium">
              温馨提示
            </text>
          </view>
          <view class="text-[22rpx] text-yellow-700 space-y-[8rpx]">
            <text class="block">
              • 请确保提现账户信息准确无误
            </text>
            <text class="block">
              • 持有人姓名需与身份认证信息一致
            </text>
            <text class="block">
              • 提现到账时间：工作日1-3小时，节假日顺延
            </text>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] py-[24rpx] text-center text-[28rpx] text-white font-semibold"
        :class="loading ? 'bg-gray-400' : 'bg-purple-600'"
        @tap="submitForm"
      >
        {{ loading ? '提交中...' : (isEdit ? '保存修改' : '添加提现方式') }}
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
