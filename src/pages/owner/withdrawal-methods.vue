<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'

// 提现方式数据
const withdrawalMethods = reactive([
  {
    id: 1,
    type: 'bank',
    name: '招商银行',
    account: '****1234',
    fullAccount: '6225 8856 1234 5678',
    holderName: '张三',
    icon: 'i-material-symbols-account-balance',
    isDefault: true,
    createTime: '2025-07-10 15:30',
  },
  {
    id: 2,
    type: 'wechat',
    name: '微信收款码',
    account: '微信号: wx****8888',
    fullAccount: 'wx_test_8888',
    holderName: '张三',
    iconUrl: 'https://img.icons8.com/color/48/wechat.png',
    isDefault: false,
    createTime: '2025-07-12 10:20',
  },
  {
    id: 3,
    type: 'alipay',
    name: '支付宝收款码',
    account: '支付宝: ali****6666',
    fullAccount: 'alipay_test_6666',
    holderName: '张三',
    iconUrl: 'https://img.icons8.com/color/48/alipay.png',
    isDefault: false,
    createTime: '2025-07-15 14:45',
  },
])

const showDeleteConfirm = ref(false)
const methodToDelete = ref<any>(null)

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 设置默认提现方式
function setAsDefault(methodId: number) {
  withdrawalMethods.forEach((method) => {
    method.isDefault = method.id === methodId
  })
  uni.showToast({ title: '设置成功', icon: 'success' })
}

// 删除提现方式
function confirmDelete(method: any) {
  methodToDelete.value = method
  showDeleteConfirm.value = true
}

function deleteMethod() {
  if (methodToDelete.value) {
    const index = withdrawalMethods.findIndex(m => m.id === methodToDelete.value.id)
    if (index > -1) {
      withdrawalMethods.splice(index, 1)
      uni.showToast({ title: '删除成功', icon: 'success' })
    }
  }
  showDeleteConfirm.value = false
  methodToDelete.value = null
}

// 编辑提现方式
function editMethod(method: any) {
  uni.navigateTo({
    url: `/pages/owner/add-withdrawal-method?id=${method.id}&type=${method.type}`,
  })
}

// 添加新的提现方式
function addNewMethod() {
  uni.navigateTo({ url: '/pages/owner/add-withdrawal-method' })
}

// 获取类型图标颜色
function getIconColor(type: string) {
  switch (type) {
    case 'bank': return '#1976d2'
    case 'wechat': return '#4caf50'
    case 'alipay': return '#ff9800'
    default: return '#666'
  }
}

// 获取类型名称
function getTypeName(type: string) {
  switch (type) {
    case 'bank': return '银行卡'
    case 'wechat': return '微信'
    case 'alipay': return '支付宝'
    default: return '其他'
  }
}
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
          提现方式
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[24rpx]">
        <!-- 提示信息 -->
        <view class="rounded-[16rpx] bg-blue-50 p-[24rpx]">
          <view class="mb-[12rpx] flex items-center space-x-[8rpx]">
            <text class="i-material-symbols-info text-[24rpx] text-blue-600" />
            <text class="text-[26rpx] text-blue-800 font-medium">
              提现方式说明
            </text>
          </view>
          <view class="text-[22rpx] text-blue-700 space-y-[8rpx]">
            <text class="block">
              • 您可以添加银行卡、微信、支付宝等提现方式
            </text>
            <text class="block">
              • 每个账户最多可添加5种提现方式
            </text>
            <text class="block">
              • 请确保提现账户信息准确，避免资金损失
            </text>
          </view>
        </view>

        <!-- 提现方式列表 -->
        <view v-if="withdrawalMethods.length" class="space-y-[16rpx]">
          <view
            v-for="method in withdrawalMethods"
            :key="method.id"
            class="overflow-hidden rounded-[16rpx] bg-white shadow-sm"
          >
            <!-- 头部信息 -->
            <view class="border-b border-gray-100 bg-gray-50/50 px-[24rpx] py-[16rpx]">
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[12rpx]">
                  <image
                    v-if="method.iconUrl"
                    :src="method.iconUrl"
                    class="h-[32rpx] w-[32rpx]"
                    mode="aspectFit"
                  />
                  <text
                    v-else
                    class="text-[32rpx]"
                    :class="method.icon"
                    :style="{ color: getIconColor(method.type) }"
                  />
                  <text class="text-[26rpx] font-medium">
                    {{ getTypeName(method.type) }}
                  </text>
                  <text v-if="method.isDefault" class="rounded-full bg-orange-100 px-[12rpx] py-[4rpx] text-[18rpx] text-orange-600">
                    默认
                  </text>
                </view>
                <text class="text-[20rpx] text-gray-500">
                  {{ method.createTime }}
                </text>
              </view>
            </view>

            <!-- 详细信息 -->
            <view class="p-[24rpx] space-y-[16rpx]">
              <view class="space-y-[12rpx]">
                <view class="flex items-center justify-between">
                  <text class="text-[24rpx] text-gray-600">
                    {{ method.type === 'bank' ? '银行名称' : '账户名称' }}
                  </text>
                  <text class="text-[26rpx] font-medium">
                    {{ method.name }}
                  </text>
                </view>

                <view class="flex items-center justify-between">
                  <text class="text-[24rpx] text-gray-600">
                    {{ method.type === 'bank' ? '银行卡号' : '账户信息' }}
                  </text>
                  <text class="text-[26rpx] font-medium">
                    {{ method.account }}
                  </text>
                </view>

                <view class="flex items-center justify-between">
                  <text class="text-[24rpx] text-gray-600">
                    持有人姓名
                  </text>
                  <text class="text-[26rpx] font-medium">
                    {{ method.holderName }}
                  </text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="flex pt-[8rpx] space-x-[12rpx]">
                <view
                  v-if="!method.isDefault"
                  class="flex-1 border border-orange-600 rounded-[8rpx] bg-orange-50 py-[16rpx] text-center text-[24rpx] text-orange-600 font-medium"
                  @tap="setAsDefault(method.id)"
                >
                  设为默认
                </view>
                <view
                  class="flex-1 border border-purple-600 rounded-[8rpx] bg-purple-50 py-[16rpx] text-center text-[24rpx] text-purple-600 font-medium"
                  @tap="editMethod(method)"
                >
                  编辑
                </view>
                <view
                  class="flex-1 border border-red-600 rounded-[8rpx] bg-red-50 py-[16rpx] text-center text-[24rpx] text-red-600 font-medium"
                  @tap="confirmDelete(method)"
                >
                  删除
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="flex flex-col items-center justify-center py-[120rpx] text-gray-400">
          <text class="i-material-symbols-payment mb-[16rpx] text-[64rpx]" />
          <text class="mb-[8rpx] text-[28rpx] font-medium">
            暂无提现方式
          </text>
          <text class="text-[24rpx]">
            请添加您的提现账户信息
          </text>
        </view>
      </view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-semibold"
        @tap="addNewMethod"
      >
        添加新的提现方式
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteConfirm" class="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
      <view class="mx-[48rpx] rounded-[16rpx] bg-white p-[32rpx]">
        <view class="mb-[24rpx] text-center">
          <text class="text-[28rpx] font-semibold">
            确认删除
          </text>
        </view>
        <view class="mb-[32rpx] text-center">
          <text class="text-[24rpx] text-gray-600">
            确定要删除「{{ methodToDelete?.name }}」吗？
          </text>
          <text class="mt-[8rpx] block text-[20rpx] text-red-500">
            删除后无法恢复
          </text>
        </view>
        <view class="flex space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-300 rounded-[8rpx] bg-white py-[20rpx] text-center text-[24rpx] text-gray-600"
            @tap="showDeleteConfirm = false"
          >
            取消
          </view>
          <view
            class="flex-1 rounded-[8rpx] bg-red-600 py-[20rpx] text-center text-[24rpx] text-white"
            @tap="deleteMethod"
          >
            确认删除
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
