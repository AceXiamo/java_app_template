<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import DocumentsHead from '@/components/page/my/documents/Head.vue'

// 证件状态
const documents = ref({
  drivingLicense: {
    status: 'verified', // verified, pending, not_uploaded, rejected
    name: '张三',
    number: '320106********1234',
    expireDate: '2028-06-15',
    uploadDate: '2023-12-01',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200',
  },
  idCard: {
    status: 'pending', // verified, pending, not_uploaded, rejected
    name: '张三',
    number: '32010619******1234',
    expireDate: '2030-12-31',
    uploadDate: '2024-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200',
  },
})

const loading = ref(false)

// 获取状态样式
function getStatusStyle(status: string) {
  const statusMap: Record<string, { text: string, class: string }> = {
    verified: { text: '已认证', class: 'text-green-600 bg-green-100' },
    pending: { text: '审核中', class: 'text-orange-600 bg-orange-100' },
    rejected: { text: '审核失败', class: 'text-red-600 bg-red-100' },
    not_uploaded: { text: '未上传', class: 'text-gray-600 bg-gray-100' },
  }
  return statusMap[status] || statusMap.not_uploaded
}

// 上传证件
function uploadDocument(type: 'drivingLicense' | 'idCard') {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      const _tempFilePath = res.tempFilePaths[0]

      uni.showLoading({
        title: '上传中...',
      })

      // 模拟上传
      setTimeout(() => {
        uni.hideLoading()
        documents.value[type].status = 'pending'
        documents.value[type].uploadDate = new Date().toISOString().split('T')[0]

        uni.showToast({
          title: '上传成功，请等待审核',
          icon: 'success',
        })
      }, 2000)
    },
    fail: () => {
      uni.showToast({
        title: '上传失败',
        icon: 'error',
      })
    },
  })
}

// 查看证件详情
function viewDocument(type: 'drivingLicense' | 'idCard') {
  const document = documents.value[type]
  if (document.imageUrl) {
    uni.previewImage({
      urls: [document.imageUrl],
    })
  }
}

// 重新上传
function reuploadDocument(type: 'drivingLicense' | 'idCard') {
  uni.showModal({
    title: '确认重新上传',
    content: '重新上传后需要重新审核，确定要继续吗？',
    success: (res) => {
      if (res.confirm) {
        uploadDocument(type)
      }
    },
  })
}

// 刷新数据
function refreshData() {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    uni.showToast({
      title: '刷新完成',
      icon: 'success',
    })
  }, 1000)
}

// 页面加载时获取数据
onMounted(() => {
  // 监听头部组件的刷新事件
  uni.$on('documentsRefresh', refreshData)
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
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 认证状态概览 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-verified-user text-[40rpx] text-green-600" />
            <text class="text-[32rpx] text-black font-semibold">
              认证状态
            </text>
          </view>

          <view class="grid grid-cols-2 gap-[24rpx]">
            <view class="rounded-[16rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[24rpx] text-gray-600">
                驾驶证
              </text>
              <text
                class="rounded-full px-[16rpx] py-[8rpx] text-[22rpx] font-medium"
                :class="getStatusStyle(documents.drivingLicense.status).class"
              >
                {{ getStatusStyle(documents.drivingLicense.status).text }}
              </text>
            </view>
            <view class="rounded-[16rpx] bg-gray-50 p-[24rpx] text-center">
              <text class="mb-[8rpx] block text-[24rpx] text-gray-600">
                身份证
              </text>
              <text
                class="rounded-full px-[16rpx] py-[8rpx] text-[22rpx] font-medium"
                :class="getStatusStyle(documents.idCard.status).class"
              >
                {{ getStatusStyle(documents.idCard.status).text }}
              </text>
            </view>
          </view>
        </view>

        <!-- 驾驶证管理 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-badge text-[36rpx] text-purple-600" />
                <text class="text-[32rpx] text-black font-semibold">
                  驾驶证
                </text>
              </view>
              <text
                class="rounded-full px-[16rpx] py-[8rpx] text-[22rpx] font-medium"
                :class="getStatusStyle(documents.drivingLicense.status).class"
              >
                {{ getStatusStyle(documents.drivingLicense.status).text }}
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <!-- 证件图片 -->
            <view v-if="documents.drivingLicense.imageUrl" class="mb-[24rpx]">
              <view
                class="h-[240rpx] w-full cursor-pointer overflow-hidden border border-gray-200 rounded-[16rpx]"
                @tap="viewDocument('drivingLicense')"
              >
                <image
                  :src="documents.drivingLicense.imageUrl"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>
            </view>

            <!-- 证件信息 -->
            <view class="mb-[32rpx] space-y-[16rpx]">
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  姓名
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.drivingLicense.name }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  证件号码
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.drivingLicense.number }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  有效期至
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.drivingLicense.expireDate }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  上传时间
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.drivingLicense.uploadDate }}
                </text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="flex space-x-[16rpx]">
              <view
                v-if="documents.drivingLicense.status === 'not_uploaded'"
                class="flex-1 rounded-[16rpx] bg-purple-600 py-[20rpx] text-center text-[28rpx] text-white font-medium"
                @tap="uploadDocument('drivingLicense')"
              >
                上传驾驶证
              </view>
              <template v-else>
                <view
                  class="flex-1 border border-purple-600 rounded-[16rpx] py-[20rpx] text-center text-[28rpx] text-purple-600 font-medium"
                  @tap="viewDocument('drivingLicense')"
                >
                  查看证件
                </view>
                <view
                  class="flex-1 rounded-[16rpx] bg-purple-600 py-[20rpx] text-center text-[28rpx] text-white font-medium"
                  @tap="reuploadDocument('drivingLicense')"
                >
                  重新上传
                </view>
              </template>
            </view>
          </view>
        </view>

        <!-- 身份证管理 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center justify-between">
              <view class="flex items-center space-x-[16rpx]">
                <text class="i-material-symbols-credit-card text-[36rpx] text-blue-600" />
                <text class="text-[32rpx] text-black font-semibold">
                  身份证
                </text>
              </view>
              <text
                class="rounded-full px-[16rpx] py-[8rpx] text-[22rpx] font-medium"
                :class="getStatusStyle(documents.idCard.status).class"
              >
                {{ getStatusStyle(documents.idCard.status).text }}
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <!-- 证件图片 -->
            <view v-if="documents.idCard.imageUrl" class="mb-[24rpx]">
              <view
                class="h-[240rpx] w-full cursor-pointer overflow-hidden border border-gray-200 rounded-[16rpx]"
                @tap="viewDocument('idCard')"
              >
                <image
                  :src="documents.idCard.imageUrl"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>
            </view>

            <!-- 证件信息 -->
            <view class="mb-[32rpx] space-y-[16rpx]">
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  姓名
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.idCard.name }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  证件号码
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.idCard.number }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  有效期至
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.idCard.expireDate }}
                </text>
              </view>
              <view class="flex justify-between">
                <text class="text-[26rpx] text-gray-600">
                  上传时间
                </text>
                <text class="text-[26rpx] text-black">
                  {{ documents.idCard.uploadDate }}
                </text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="flex space-x-[16rpx]">
              <view
                v-if="documents.idCard.status === 'not_uploaded'"
                class="flex-1 rounded-[16rpx] bg-blue-600 py-[20rpx] text-center text-[28rpx] text-white font-medium"
                @tap="uploadDocument('idCard')"
              >
                上传身份证
              </view>
              <template v-else>
                <view
                  class="flex-1 border border-blue-600 rounded-[16rpx] py-[20rpx] text-center text-[28rpx] text-blue-600 font-medium"
                  @tap="viewDocument('idCard')"
                >
                  查看证件
                </view>
                <view
                  class="flex-1 rounded-[16rpx] bg-blue-600 py-[20rpx] text-center text-[28rpx] text-white font-medium"
                  @tap="reuploadDocument('idCard')"
                >
                  重新上传
                </view>
              </template>
            </view>
          </view>
        </view>

        <!-- 认证须知 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-info text-[36rpx] text-orange-600" />
            <text class="text-[32rpx] text-black font-semibold">
              认证须知
            </text>
          </view>

          <view class="text-[26rpx] text-gray-700 space-y-[16rpx]">
            <text class="block">
              • 请确保证件信息清晰可见，照片完整
            </text>
            <text class="block">
              • 驾驶证和身份证姓名必须一致
            </text>
            <text class="block">
              • 证件必须在有效期内
            </text>
            <text class="block">
              • 审核时间通常为1-3个工作日
            </text>
            <text class="block">
              • 如有问题，请联系客服协助处理
            </text>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
      <text class="text-[28rpx] text-gray-500">
        加载中...
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
