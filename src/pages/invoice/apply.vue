<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { type AvailableOrder, type InvoiceApplication, getAvailableOrders, submitInvoiceApplication } from '@/api/invoice'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userId = computed(() => userStore.userInfo?.userId || 0)

// 页面状态
const loading = ref(false)
const submitting = ref(false)

// 可申请发票的订单列表
const availableOrders = ref<AvailableOrder[]>([])
const selectedOrder = ref<AvailableOrder | null>(null)

// 发票类型
const invoiceType = ref<'personal' | 'enterprise'>('personal')

// 表单数据
const formData = ref<InvoiceApplication>({
  userId: userId.value,
  orderId: 0,
  invoiceType: 'personal',
  invoiceTitle: '',
  invoiceAmount: 0,

  // 个人发票信息
  personalName: '',
  personalIdCard: '',

  // 企业发票信息
  companyName: '',
  taxNumber: '',
  companyAddress: '',
  companyPhone: '',
  companyBank: '',
  bankAccount: '',

  // 邮寄信息
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
})

// Toast组件引用
const toastRef = ref()

// 发票类型选项
const invoiceTypeOptions = [
  { value: 'personal', label: '个人发票' },
  { value: 'enterprise', label: '企业发票' },
]

// 选择订单
function selectOrder(order: AvailableOrder) {
  selectedOrder.value = order
  formData.value.orderId = order.orderId
  formData.value.orderNo = order.orderNo
  formData.value.invoiceAmount = order.finalAmount
}

// 发票类型改变
function onInvoiceTypeChange() {
  formData.value.invoiceType = invoiceType.value
  // 清空对应类型的表单数据
  if (invoiceType.value === 'personal') {
    formData.value.companyName = ''
    formData.value.taxNumber = ''
    formData.value.companyAddress = ''
    formData.value.companyPhone = ''
    formData.value.companyBank = ''
    formData.value.bankAccount = ''
  }
  else {
    formData.value.personalName = ''
    formData.value.personalIdCard = ''
  }
}

// 验证表单
function validateForm(): boolean {
  if (!selectedOrder.value) {
    toastRef.value?.error('请选择要开发票的订单')
    return false
  }

  if (!formData.value.invoiceTitle.trim()) {
    toastRef.value?.error('请填写发票抬头')
    return false
  }

  if (invoiceType.value === 'personal') {
    if (!formData.value.personalName?.trim()) {
      toastRef.value?.error('请填写个人姓名')
      return false
    }
    if (!formData.value.personalIdCard?.trim()) {
      toastRef.value?.error('请填写身份证号')
      return false
    }
    // 身份证号格式验证
    const idCardRegex = /^[1-9]\d{17}$/
    if (!idCardRegex.test(formData.value.personalIdCard || '')) {
      toastRef.value?.error('身份证号格式不正确')
      return false
    }
  }
  else {
    if (!formData.value.companyName?.trim()) {
      toastRef.value?.error('请填写企业名称')
      return false
    }
    if (!formData.value.taxNumber?.trim()) {
      toastRef.value?.error('请填写纳税人识别号')
      return false
    }
  }

  if (!formData.value.recipientName.trim()) {
    toastRef.value?.error('请填写收件人姓名')
    return false
  }

  if (!formData.value.recipientPhone.trim()) {
    toastRef.value?.error('请填写收件人电话')
    return false
  }

  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.recipientPhone)) {
    toastRef.value?.error('收件人电话格式不正确')
    return false
  }

  if (!formData.value.recipientAddress.trim()) {
    toastRef.value?.error('请填写收件地址')
    return false
  }

  return true
}

// 提交申请
async function submitApplication() {
  if (submitting.value)
    return

  if (!validateForm())
    return

  submitting.value = true
  uni.showLoading({ title: '提交中...' })

  try {
    await submitInvoiceApplication(formData.value)
    uni.hideLoading()
    toastRef.value?.success('发票申请提交成功')

    // 延迟跳转到发票记录页面
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/my/invoice' })
    }, 1500)
  }
  catch (error: any) {
    uni.hideLoading()
    toastRef.value?.error(error.message || '提交失败')
  }
  finally {
    submitting.value = false
  }
}

// 加载可申请发票的订单
async function loadAvailableOrders() {
  loading.value = true
  try {
    const response = await getAvailableOrders({ userId: userId.value })
    availableOrders.value = response.data || []

    if (availableOrders.value.length === 0) {
      toastRef.value?.info('暂无可申请发票的订单')
    }
  }
  catch (error: any) {
    toastRef.value?.error(error.message || '加载订单失败')
  }
  finally {
    loading.value = false
  }
}

// 返回上一页
function back() {
  uni.navigateBack()
}

// 页面加载
onMounted(() => {
  loadAvailableOrders()
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="flex items-center justify-between px-[32rpx]">
        <view class="flex items-center space-x-[16rpx]">
          <text
            class="i-material-symbols-arrow-back text-[40rpx] text-black"
            @tap="back"
          />
          <text class="text-[32rpx] text-black font-semibold">
            申请发票
          </text>
        </view>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 选择订单 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-receipt text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              选择订单
            </text>
          </view>

          <view v-if="loading" class="py-[64rpx] text-center">
            <text class="text-[28rpx] text-gray-500">
              加载中...
            </text>
          </view>

          <view v-else-if="availableOrders.length === 0" class="py-[64rpx] text-center">
            <text class="i-material-symbols-info text-[80rpx] text-gray-300" />
            <text class="mt-[16rpx] block text-[28rpx] text-gray-500">
              暂无可申请发票的订单
            </text>
          </view>

          <view v-else class="space-y-[24rpx]">
            <view
              v-for="order in availableOrders"
              :key="order.orderId"
              class="border rounded-[16rpx] p-[24rpx] transition-colors duration-200"
              :class="selectedOrder?.orderId === order.orderId ? 'border-purple-600 bg-purple-50' : 'border-gray-200'"
              @tap="selectOrder(order)"
            >
              <view class="mb-[16rpx] flex items-center justify-between">
                <text class="text-[28rpx] text-black font-medium">
                  订单号：{{ order.orderNo }}
                </text>
                <text class="text-[32rpx] text-purple-600 font-semibold">
                  ¥{{ order.finalAmount }}
                </text>
              </view>
              <view class="flex items-center justify-between text-[24rpx] text-gray-600">
                <text>{{ order.vehicleName }} {{ order.licensePlate }}</text>
                <text>{{ order.startTime }} - {{ order.endTime }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 发票类型 -->
        <view v-if="selectedOrder" class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-description text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              发票类型
            </text>
          </view>

          <view class="flex space-x-[32rpx]">
            <view
              v-for="option in invoiceTypeOptions"
              :key="option.value"
              class="flex-1 border rounded-[16rpx] p-[24rpx] text-center transition-colors duration-200"
              :class="invoiceType === option.value ? 'border-purple-600 bg-purple-50' : 'border-gray-200'"
              @tap="invoiceType = option.value; onInvoiceTypeChange()"
            >
              <text class="text-[28rpx] font-medium" :class="invoiceType === option.value ? 'text-purple-600' : 'text-gray-700'">
                {{ option.label }}
              </text>
            </view>
          </view>
        </view>

        <!-- 发票信息表单 -->
        <view v-if="selectedOrder" class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-edit-document text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                发票信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 发票抬头 -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                发票抬头 *
              </text>
              <input
                v-model="formData.invoiceTitle"
                class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                placeholder="请输入发票抬头"
                maxlength="100"
              >
            </view>

            <!-- 个人发票信息 -->
            <template v-if="invoiceType === 'personal'">
              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  个人姓名 *
                </text>
                <input
                  v-model="formData.personalName"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入真实姓名"
                  maxlength="50"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  身份证号 *
                </text>
                <input
                  v-model="formData.personalIdCard"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入身份证号"
                  maxlength="18"
                >
              </view>
            </template>

            <!-- 企业发票信息 -->
            <template v-else>
              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  企业名称 *
                </text>
                <input
                  v-model="formData.companyName"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入企业全称"
                  maxlength="100"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  纳税人识别号 *
                </text>
                <input
                  v-model="formData.taxNumber"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入纳税人识别号"
                  maxlength="30"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  企业地址
                </text>
                <input
                  v-model="formData.companyAddress"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入企业注册地址"
                  maxlength="200"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  企业电话
                </text>
                <input
                  v-model="formData.companyPhone"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入企业联系电话"
                  maxlength="20"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  开户银行
                </text>
                <input
                  v-model="formData.companyBank"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入开户银行全称"
                  maxlength="100"
                >
              </view>

              <view>
                <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                  银行账号
                </text>
                <input
                  v-model="formData.bankAccount"
                  class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                  placeholder="请输入银行账号"
                  maxlength="30"
                >
              </view>
            </template>

            <!-- 发票金额（只读） -->
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                发票金额
              </text>
              <view class="w-full border border-gray-200 rounded-[12rpx] bg-gray-50 px-[24rpx] py-[16rpx]">
                <text class="text-[28rpx] text-gray-700">
                  ¥{{ formData.invoiceAmount }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 邮寄信息 -->
        <view v-if="selectedOrder" class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-local-shipping text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                邮寄信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                收件人姓名 *
              </text>
              <input
                v-model="formData.recipientName"
                class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                placeholder="请输入收件人姓名"
                maxlength="50"
              >
            </view>

            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                收件人电话 *
              </text>
              <input
                v-model="formData.recipientPhone"
                class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                placeholder="请输入收件人手机号"
                maxlength="11"
                type="number"
              >
            </view>

            <view>
              <text class="mb-[16rpx] block text-[28rpx] text-black font-medium">
                收件地址 *
              </text>
              <textarea
                v-model="formData.recipientAddress"
                class="w-full border border-gray-300 rounded-[12rpx] bg-transparent px-[24rpx] py-[16rpx] text-[28rpx]"
                placeholder="请输入详细收件地址，包括省市区街道门牌号"
                maxlength="200"
                :auto-height="true"
                :show-confirm-bar="false"
              />
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view v-if="selectedOrder" class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] py-[24rpx] text-center text-[28rpx] font-semibold transition-colors duration-200"
        :class="submitting ? 'bg-gray-400 text-white' : 'bg-purple-600 text-white'"
        @tap="submitApplication"
      >
        {{ submitting ? '提交中...' : '提交申请' }}
      </view>
    </view>

    <!-- Toast组件 -->
    <Toast ref="toastRef" />
  </view>
</template>

<route lang="yaml">
layout: home
</route>
