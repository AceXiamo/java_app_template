<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { type InvoiceApplication, InvoiceStatusText, InvoiceTypeText, getInvoiceApplicationDetail, getInvoiceDownloadUrl, getUserInvoiceApplications } from '@/api/invoice'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userId = computed(() => userStore.userInfo?.userId || 0)

// 页面状态
const loading = ref(false)
const refreshing = ref(false)

// 发票申请列表
const applications = ref<InvoiceApplication[]>([])

// Toast组件引用
const toastRef = ref()

// 获取状态颜色
function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-orange-600 bg-orange-100'
    case 'processing':
      return 'text-blue-600 bg-blue-100'
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'rejected':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// 获取状态图标
function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return 'i-material-symbols-pending'
    case 'processing':
      return 'i-material-symbols-autorenew'
    case 'completed':
      return 'i-material-symbols-check-circle'
    case 'rejected':
      return 'i-material-symbols-cancel'
    default:
      return 'i-material-symbols-help'
  }
}

// 查看申请详情
async function viewApplicationDetail(application: InvoiceApplication) {
  try {
    uni.showLoading({ title: '加载中...' })
    const response = await getInvoiceApplicationDetail(application.applicationId!, { userId: userId.value })
    uni.hideLoading()

    const detail = response.data

    // 构建详情内容
    let content = `申请单号：${detail.applicationNo}\n`
    content += `订单号：${detail.orderNo}\n`
    content += `发票类型：${InvoiceTypeText[detail.invoiceType as keyof typeof InvoiceTypeText]}\n`
    content += `发票抬头：${detail.invoiceTitle}\n`
    content += `发票金额：¥${detail.invoiceAmount}\n`
    content += `申请状态：${InvoiceStatusText[detail.status as keyof typeof InvoiceStatusText]}\n`
    content += `申请时间：${detail.createTime}\n`

    if (detail.status === 'rejected' && detail.rejectReason) {
      content += `拒绝原因：${detail.rejectReason}\n`
    }

    if (detail.status === 'completed') {
      content += `发票号码：${detail.invoiceNo}\n`
      content += `开票日期：${detail.issueDate}\n`
      if (detail.expressCompany && detail.expressNo) {
        content += `快递：${detail.expressCompany} ${detail.expressNo}`
      }
    }

    uni.showModal({
      title: '申请详情',
      content,
      showCancel: false,
      confirmText: '确定',
    })
  }
  catch (error: any) {
    uni.hideLoading()
    toastRef.value?.error(error.message || '获取详情失败')
  }
}

// 下载发票
async function downloadInvoice(application: InvoiceApplication) {
  if (application.status !== 'completed') {
    toastRef.value?.warning('发票尚未开具，无法下载')
    return
  }

  try {
    uni.showLoading({ title: '获取下载链接...' })
    const response = await getInvoiceDownloadUrl(application.applicationId!, { userId: userId.value })
    uni.hideLoading()

    const pdfUrl = response.data

    // 使用uni.downloadFile下载PDF
    uni.downloadFile({
      url: pdfUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 在小程序中打开PDF
          uni.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
              toastRef.value?.success('发票下载成功')
            },
            fail: (err) => {
              console.error('打开文件失败:', err)
              toastRef.value?.error('打开文件失败')
            },
          })
        }
        else {
          toastRef.value?.error('下载失败')
        }
      },
      fail: (err) => {
        console.error('下载失败:', err)
        toastRef.value?.error('下载失败')
      },
    })
  }
  catch (error: any) {
    uni.hideLoading()
    toastRef.value?.error(error.message || '获取下载链接失败')
  }
}

// 跳转到申请页面
function goToApply() {
  uni.navigateTo({ url: '/pages/invoice/apply' })
}

// 加载发票申请记录
async function loadApplications() {
  loading.value = true
  try {
    const response = await getUserInvoiceApplications({ userId: userId.value })
    applications.value = response.data || []
  }
  catch (error: any) {
    toastRef.value?.error(error.message || '加载发票记录失败')
  }
  finally {
    loading.value = false
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  try {
    await loadApplications()
    toastRef.value?.success('刷新成功')
  }
  finally {
    refreshing.value = false
  }
}

function back() {
  uni.navigateBack()
}

// 页面加载
onMounted(() => {
  loadApplications()
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
            发票管理
          </text>
        </view>
        <text
          class="i-material-symbols-add text-[40rpx] text-black"
          @tap="goToApply"
        />
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <scroll-view
      class="flex-1"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="p-[32rpx]">
        <!-- 加载状态 -->
        <view v-if="loading" class="py-[128rpx] text-center">
          <text class="i-material-symbols-autorenew animate-spin text-[80rpx] text-gray-400" />
          <text class="mt-[16rpx] block text-[28rpx] text-gray-500">
            加载中...
          </text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="applications.length === 0" class="py-[128rpx] text-center">
          <text class="i-material-symbols-receipt-long text-[120rpx] text-gray-300" />
          <text class="mb-[16rpx] mt-[24rpx] block text-[32rpx] text-gray-500 font-medium">
            暂无发票记录
          </text>
          <text class="mb-[48rpx] block text-[24rpx] text-gray-400">
            您还没有申请过发票
          </text>
          <view
            class="mx-auto w-[240rpx] border border-purple-600 rounded-[24rpx] bg-purple-50 py-[16rpx] text-center"
            @tap="goToApply"
          >
            <text class="text-[28rpx] text-purple-600 font-medium">
              立即申请
            </text>
          </view>
        </view>

        <!-- 发票记录列表 -->
        <view v-else class="space-y-[24rpx]">
          <view
            v-for="application in applications"
            :key="application.applicationId"
            class="rounded-[24rpx] bg-white p-[32rpx] shadow-sm"
          >
            <!-- 头部信息 -->
            <view class="mb-[24rpx] flex items-center justify-between">
              <view class="flex items-center space-x-[12rpx]">
                <text
                  class="text-[24rpx]"
                  :class="getStatusIcon(application.status || '')"
                />
                <text
                  class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                  :class="getStatusColor(application.status || '')"
                >
                  {{ InvoiceStatusText[application.status as keyof typeof InvoiceStatusText] }}
                </text>
              </view>
              <text class="text-[24rpx] text-gray-500">
                {{ application.createTime }}
              </text>
            </view>

            <!-- 主要信息 -->
            <view class="mb-[24rpx] space-y-[12rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[28rpx] text-black font-medium">
                  {{ application.invoiceTitle }}
                </text>
                <text class="text-[32rpx] text-purple-600 font-semibold">
                  ¥{{ application.invoiceAmount }}
                </text>
              </view>

              <view class="flex items-center text-[24rpx] text-gray-600 space-x-[32rpx]">
                <text>{{ InvoiceTypeText[application.invoiceType as keyof typeof InvoiceTypeText] }}</text>
                <text>订单：{{ application.orderNo }}</text>
              </view>

              <view class="text-[24rpx] text-gray-600">
                申请单号：{{ application.applicationNo }}
              </view>
            </view>

            <!-- 拒绝原因 -->
            <view v-if="application.status === 'rejected' && application.rejectReason" class="mb-[24rpx] rounded-[12rpx] bg-red-50 p-[16rpx]">
              <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
                <text class="i-material-symbols-error text-[20rpx] text-red-600" />
                <text class="text-[24rpx] text-red-600 font-medium">
                  拒绝原因
                </text>
              </view>
              <text class="text-[24rpx] text-red-700">
                {{ application.rejectReason }}
              </text>
            </view>

            <!-- 发票信息 -->
            <view v-if="application.status === 'completed'" class="mb-[24rpx] rounded-[12rpx] bg-green-50 p-[16rpx]">
              <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
                <text class="i-material-symbols-check-circle text-[20rpx] text-green-600" />
                <text class="text-[24rpx] text-green-600 font-medium">
                  发票信息
                </text>
              </view>
              <text class="block text-[24rpx] text-green-700">
                发票号码：{{ application.invoiceNo }}
              </text>
              <text class="block text-[24rpx] text-green-700">
                开票日期：{{ application.issueDate }}
              </text>
              <text v-if="application.expressCompany && application.expressNo" class="block text-[24rpx] text-green-700">
                快递：{{ application.expressCompany }} {{ application.expressNo }}
              </text>
            </view>

            <!-- 操作按钮 -->
            <view class="flex items-center space-x-[24rpx]">
              <view
                class="flex-1 border border-gray-300 rounded-[12rpx] py-[16rpx] text-center"
                @tap="viewApplicationDetail(application)"
              >
                <text class="text-[26rpx] text-gray-700">
                  查看详情
                </text>
              </view>

              <view
                v-if="application.status === 'completed'"
                class="flex-1 border border-purple-600 rounded-[12rpx] bg-purple-600 py-[16rpx] text-center"
                @tap="downloadInvoice(application)"
              >
                <text class="text-[26rpx] text-white">
                  下载发票
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </scroll-view>

    <!-- Toast组件 -->
    <Toast ref="toastRef" />
  </view>
</template>

<route lang="yaml">
layout: home
</route>
