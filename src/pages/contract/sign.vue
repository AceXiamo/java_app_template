<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { uploadFileToOss } from '@/utils/alioss'
import { submitContractSignature } from '@/api/owner-orders'

// 页面参数
interface ContractSignParams {
  orderId: string
  orderNo: string
}

const pageParams = ref<ContractSignParams>({
  orderId: '',
  orderNo: '',
})

// 合同信息
const contractInfo = reactive({
  templateImages: [] as string[],
  orderInfo: {
    orderNo: '',
    vehicleName: '',
    startTime: '',
    endTime: '',
    userNickname: '',
    totalAmount: 0,
  },
  currentPage: 0,
  signature: '',
  signed: false,
})

// Canvas 签名相关
const canvasId = 'signatureCanvas'
const canvasContext = ref<UniApp.CanvasContext | null>(null)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const isDrawing = ref(false)
const lastPoint = ref({ x: 0, y: 0 })

// 页面状态
const loading = ref(false)
const currentTab = ref<'contract' | 'signature'>('contract') // 当前Tab

// 页面加载
onLoad((options: any) => {
  if (options.orderId && options.orderNo) {
    pageParams.value.orderId = options.orderId
    pageParams.value.orderNo = options.orderNo
    loadContractTemplate()
  }
})

// 加载合同模板
async function loadContractTemplate() {
  try {
    loading.value = true

    // TODO: 调用API获取合同模板
    // const response = await getContractTemplate({
    //   orderId: pageParams.value.orderId
    // })

    // 模拟数据
    contractInfo.templateImages = [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    ]

    contractInfo.orderInfo = {
      orderNo: pageParams.value.orderNo,
      vehicleName: '特斯拉 Model 3',
      startTime: '2024-12-16 10:00:00',
      endTime: '2024-12-18 18:00:00',
      userNickname: '张三',
      totalAmount: 598,
    }
  }
  catch (error) {
    console.error('加载合同模板失败:', error)
    uni.showToast({
      title: '加载合同失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 切换合同页面（暂时保留，可能后续需要）
function _switchPage(index: number) {
  contractInfo.currentPage = index
}

// 初始化Canvas
function initCanvas() {
  // 获取系统信息来计算Canvas尺寸
  const systemInfo = uni.getSystemInfoSync()
  canvasWidth.value = systemInfo.windowWidth - 64 // 减去左右padding
  canvasHeight.value = systemInfo.windowHeight - 300 // 减去头部、底部、按钮区域

  canvasContext.value = uni.createCanvasContext(canvasId)
  if (canvasContext.value) {
    // 设置画笔样式 - 保持原来的粗细
    canvasContext.value.setStrokeStyle('#000000') // 使用黑色，保持原样
    canvasContext.value.setLineWidth(4) // 恢复原来的粗细
    canvasContext.value.setLineCap('round')
    canvasContext.value.setLineJoin('round')
    canvasContext.value.setMiterLimit(10)

    // 设置背景色
    canvasContext.value.setFillStyle('#ffffff')
    canvasContext.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
    canvasContext.value.draw()
  }
}

// 切换Tab
function switchTab(tab: 'contract' | 'signature') {
  currentTab.value = tab
  if (tab === 'signature') {
    nextTick(() => {
      initCanvas()
    })
  }
}

// 处理Canvas区域触摸 - 防止iOS弹簧效果
function handleCanvasAreaTouch(_event: any) {
  // 只阻止默认行为，不处理具体逻辑
  // Canvas元素会处理实际的绘制逻辑
}

// Canvas 触摸开始
function onTouchStart(event: any) {
  if (!canvasContext.value)
    return

  // 阻止事件冒泡但不阻止默认行为
  event.stopPropagation()

  isDrawing.value = true
  const touch = event.touches[0]
  lastPoint.value = {
    x: touch.x,
    y: touch.y,
  }

  canvasContext.value.beginPath()
  canvasContext.value.moveTo(touch.x, touch.y)
  canvasContext.value.stroke()
}

// Canvas 触摸移动
function onTouchMove(event: any) {
  if (!canvasContext.value || !isDrawing.value)
    return

  // 阻止事件冒泡但不阻止默认行为
  event.stopPropagation()

  const touch = event.touches[0]

  // 使用连续的线段绘制，确保流畅性
  canvasContext.value.lineTo(touch.x, touch.y)
  canvasContext.value.stroke()
  canvasContext.value.draw(true)

  // 更新起点为当前点，确保连续绘制
  canvasContext.value.beginPath()
  canvasContext.value.moveTo(touch.x, touch.y)

  lastPoint.value = {
    x: touch.x,
    y: touch.y,
  }
}

// Canvas 触摸结束
function onTouchEnd(event: any) {
  // 阻止事件冒泡但不阻止默认行为
  event.stopPropagation()

  isDrawing.value = false

  // 结束当前路径
  if (canvasContext.value) {
    canvasContext.value.stroke()
    canvasContext.value.draw(true)
  }
}

// 清空Canvas签名
function clearCanvasSignature() {
  if (!canvasContext.value)
    return

  // 清空画布
  canvasContext.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 重新设置背景色
  canvasContext.value.setFillStyle('#ffffff')
  canvasContext.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 重新设置画笔样式 - 保持与初始化一致
  canvasContext.value.setStrokeStyle('#000000') // 黑色
  canvasContext.value.setLineWidth(4) // 粗细
  canvasContext.value.setLineCap('round')
  canvasContext.value.setLineJoin('round')
  canvasContext.value.setMiterLimit(10)

  canvasContext.value.draw()
}

// 保存Canvas签名并直接提交合同
async function saveCanvasSignature() {
  try {
    uni.showLoading({ title: '签名提交中...' })

    // 导出Canvas为图片
    const res = await new Promise<any>((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvasId,
        success: resolve,
        fail: reject,
      })
    })

    if (res.tempFilePath) {
      // 上传到OSS
      const timestamp = Date.now()
      const fileName = `contract_signature_${pageParams.value.orderId}_${timestamp}.jpg`
      const ossPath = `contract/signature/${fileName}`

      const ossUrl = await uploadFileToOss(res.tempFilePath, ossPath)
      contractInfo.signature = ossUrl

      // 直接提交合同签署
      const response = await submitContractSignature(
        Number(pageParams.value.orderId),
        ossUrl,
      )

      if (response.code === 200) {
        contractInfo.signed = true

        uni.hideLoading()
        uni.showToast({
          title: '合同签署成功',
          icon: 'success',
        })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
      else {
        throw new Error(response.msg || '合同签署失败')
      }
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('签名提交失败:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '签名提交失败，请重试',
      icon: 'none',
    })
  }
}

// 清除签名
function clearSignature() {
  contractInfo.signature = ''
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view
    class="relative h-full flex flex-col bg-gray-50"
    style="touch-action: pan-x pan-y; -webkit-overflow-scrolling: touch;"
  >
    <!-- 头部导航栏 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <view class="absolute left-[20rpx] flex items-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[32rpx] text-gray-700" />
        </view>
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold pointer-events-none">
          签署合同
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view v-if="loading" class="h-0 flex flex-1 items-center justify-center">
      <view class="flex flex-col items-center">
        <view class="mb-[24rpx] h-[60rpx] w-[60rpx] animate-spin border-4 border-purple-200 border-t-purple-600 rounded-full" />
        <text class="text-[28rpx] text-gray-500">
          加载合同中...
        </text>
      </view>
    </view>

    <!-- Tab内容区域 -->
    <view v-else class="relative h-0 flex flex-1 flex-col">
      <!-- 合同Tab内容 -->
      <view v-if="currentTab === 'contract'" class="h-full">
        <!-- 合同图片纵向滚动 - PDF查阅风格 -->
        <scroll-view scroll-y class="h-full">
          <view class="space-y-0">
            <image
              v-for="(image, index) in contractInfo.templateImages"
              :key="index"
              :src="image"
              mode="widthFix"
              class="block w-full bg-white"
              :style="{ minHeight: '600rpx' }"
            />
          </view>
        </scroll-view>
      </view>

      <!-- 签名Tab内容 -->
      <view
        v-else-if="currentTab === 'signature'"
        class="signature-tab-container h-full flex flex-col p-[32rpx]"
      >
        <!-- 签名状态显示 -->
        <view v-if="contractInfo.signature" class="mb-[24rpx] rounded-[16rpx] bg-green-50 p-[20rpx]">
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-check-circle mr-[8rpx] text-[24rpx] text-green-600" />
              <text class="text-[24rpx] text-green-800 font-medium">
                签名已完成
              </text>
            </view>
            <view
              class="rounded-[8rpx] bg-orange-500 px-[16rpx] py-[6rpx]"
              @tap="clearSignature"
            >
              <text class="text-[20rpx] text-white">
                重新签名
              </text>
            </view>
          </view>
        </view>

        <!-- 签名说明 -->
        <view class="mb-[24rpx] rounded-[16rpx] bg-blue-50 p-[20rpx]">
          <view class="flex items-start">
            <text class="i-material-symbols-info mr-[8rpx] mt-[4rpx] text-[20rpx] text-blue-600" />
            <view class="flex-1">
              <text class="mb-[8rpx] block text-[24rpx] text-blue-800 font-medium">
                签名说明
              </text>
              <text class="text-[22rpx] text-blue-700 leading-[32rpx]">
                请在下方区域使用手指或触控笔书写您的姓名。签名完成后点击"保存签名"按钮。
              </text>
            </view>
          </view>
        </view>

        <!-- Canvas签名区域 -->
        <view
          class="signature-canvas-area relative h-0 flex-1 overflow-hidden border-2 border-gray-300 rounded-[16rpx] bg-white"
          @touchstart.prevent="handleCanvasAreaTouch"
          @touchmove.prevent="handleCanvasAreaTouch"
          @touchend.prevent="handleCanvasAreaTouch"
        >
          <canvas
            :canvas-id="canvasId"
            class="h-full w-full"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          />

          <!-- 清空按钮 -->
          <!-- <view
            class="absolute right-[12rpx] top-[12rpx] flex items-center rounded-[8rpx] bg-gray-100 px-[12rpx] py-[6rpx] text-[18rpx] text-gray-600"
            @tap="clearCanvasSignature"
          >
            <text class="i-material-symbols-clear mr-[4rpx]" />
            <text>清空</text>
          </view> -->
        </view>

        <!-- 签名操作按钮 -->
        <view class="mt-[24rpx] flex space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-300 rounded-[16rpx] bg-white py-[20rpx] text-center text-[26rpx] text-gray-600 font-medium"
            @tap="clearCanvasSignature"
          >
            清空重写
          </view>
          <view
            class="flex-1 rounded-[16rpx] bg-purple-600 py-[20rpx] text-center text-[26rpx] text-white font-medium"
            @tap="saveCanvasSignature"
          >
            保存签名
          </view>
        </view>
      </view>

      <!-- 已签署状态 -->
      <view v-if="contractInfo.signed" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
        <view class="overflow-hidden rounded-[24rpx] bg-green-50 p-[48rpx] text-center">
          <text class="i-material-symbols-check-circle mb-[16rpx] block text-[80rpx] text-green-600" />
          <text class="mb-[8rpx] block text-[32rpx] text-green-700 font-semibold">
            合同签署完成
          </text>
          <text class="text-[24rpx] text-green-600">
            感谢您的信任，祝您用车愉快！
          </text>
        </view>
      </view>
    </view>

    <!-- 底部Tab切换 -->
    <view v-if="!contractInfo.signed" class="flex-shrink-0 border-t border-gray-100 bg-white pb-[32rpx]">
      <!-- Tab切换 -->
      <view class="flex">
        <view
          class="flex flex-1 items-center justify-center py-[24rpx] transition-all"
          :class="currentTab === 'contract' ? 'border-b-2 border-purple-600' : ''"
          @tap="switchTab('contract')"
        >
          <text class="i-material-symbols-contract-edit mr-[8rpx] text-[20rpx]" :class="currentTab === 'contract' ? 'text-purple-600' : 'text-gray-500'" />
          <text class="text-[26rpx] font-medium" :class="currentTab === 'contract' ? 'text-purple-600' : 'text-gray-500'">
            查看合同
          </text>
        </view>

        <view
          class="flex flex-1 items-center justify-center py-[24rpx] transition-all"
          :class="currentTab === 'signature' ? 'border-b-2 border-purple-600' : ''"
          @tap="switchTab('signature')"
        >
          <text class="i-material-symbols-draw mr-[8rpx] text-[20rpx]" :class="currentTab === 'signature' ? 'text-purple-600' : 'text-gray-500'" />
          <text class="text-[26rpx] font-medium" :class="currentTab === 'signature' ? 'text-purple-600' : 'text-gray-500'">
            电子签名
          </text>
          <text v-if="contractInfo.signature" class="ml-[8rpx] h-[16rpx] w-[16rpx] rounded-full bg-green-500" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 防止iOS弹性滚动效果 */
.signature-canvas-area {
  touch-action: none; /* 完全禁用触摸手势，防止弹簧效果 */
  -webkit-overflow-scrolling: auto;
  overscroll-behavior: none; /* 完全阻止滚动边界行为 */
  position: relative;
  /* 添加更强的约束 */
  -webkit-user-select: none;
  user-select: none;
}

/* Canvas触摸响应 - 允许绘制但防止系统手势 */
canvas {
  touch-action: none; /* 禁用所有系统手势 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: auto; /* 确保自定义事件正常 */
  /* 添加iOS特定的防护 */
  -webkit-tap-highlight-color: transparent;
}

/* 签名Tab容器样式 */
.signature-tab-container {
  touch-action: none; /* 完全禁用触摸手势 */
  -webkit-overflow-scrolling: auto;
  overflow: hidden;
  overscroll-behavior: none;
  /* 添加iOS防护 */
  -webkit-user-select: none;
  user-select: none;
}
</style>

<route lang="yaml">
layout: home
</route>
