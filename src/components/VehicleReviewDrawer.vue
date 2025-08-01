<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BottomDrawer from './BottomDrawer.vue'
import { uploadFileToOss } from '@/utils/alioss'

interface VehicleReviewData {
  orderId: number
  rating: number
  content: string
  images: string[]
  isAnonymous: boolean
}

interface OrderInfo {
  id: string
  orderNumber: string
  vehicle?: {
    name: string
    imageUrl: string
    licensePlate: string
  }
}

const props = defineProps<{
  visible: boolean
  order?: OrderInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', data: VehicleReviewData): void
}>()

const loading = ref(false)
const uploadingImages = ref(false)

// 评价数据
const reviewData = ref<VehicleReviewData>({
  orderId: 0,
  rating: 5,
  content: '',
  images: [],
  isAnonymous: false,
})

// 选中的图片文件
const selectedImages = ref<any[]>([])

// 计算属性
const isSubmitDisabled = computed(() => {
  return loading.value || reviewData.value.rating === 0 || reviewData.value.content.trim().length === 0
})

// 字符计数
const characterCount = computed(() => reviewData.value.content.length)
const maxLength = ref(500)

// 处理评分点击
function handleRatingClick(rating: number) {
  reviewData.value.rating = rating
}

// 处理文本输入
function handleTextInput(e: any) {
  const value = e.detail.value
  if (value.length <= maxLength.value) {
    reviewData.value.content = value
  }
}

// 选择图片
function chooseImages() {
  const remainingCount = 6 - selectedImages.value.length
  if (remainingCount <= 0)
    return
  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const newImages = (res.tempFilePaths as string[]).map((path, index) => ({
        path,
        url: path,
        id: `${Date.now()}_${index}`,
      }))
      selectedImages.value.push(...newImages)
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

// 删除图片
function removeImage(index: number) {
  selectedImages.value.splice(index, 1)
}

// 预览图片
function previewImage(index: number) {
  const urls = selectedImages.value.map(img => img.url)
  uni.previewImage({
    current: urls[index],
    urls,
  })
}

// 切换匿名状态
function toggleAnonymous() {
  reviewData.value.isAnonymous = !reviewData.value.isAnonymous
}

// 上传图片到OSS
async function uploadImages(): Promise<string[]> {
  if (selectedImages.value.length === 0)
    return []

  uploadingImages.value = true
  const uploadPromises = selectedImages.value.map(async (img, index) => {
    try {
      const fileName = `review/${Date.now()}_${index}.jpg`
      const url = await uploadFileToOss(img.path, fileName)
      return url
    }
    catch (error) {
      console.error('图片上传失败:', error)
      throw new Error(`第${index + 1}张图片上传失败`)
    }
  })

  try {
    const urls = await Promise.all(uploadPromises)
    return urls
  }
  finally {
    uploadingImages.value = false
  }
}

// 提交评价
async function submitReview() {
  if (isSubmitDisabled.value)
    return

  if (!props.order) {
    uni.showToast({ title: '订单信息不存在', icon: 'none' })
    return
  }

  try {
    loading.value = true
    uni.showLoading({ title: '提交评价中...' })

    // 上传图片
    const imageUrls = await uploadImages()

    // 准备提交数据
    const submitData: VehicleReviewData = {
      orderId: Number(props.order.id),
      rating: reviewData.value.rating,
      content: reviewData.value.content.trim(),
      images: imageUrls,
      isAnonymous: reviewData.value.isAnonymous,
    }

    emit('submit', submitData)
  }
  catch (error) {
    console.error('提交评价失败:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '提交失败，请重试',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
    uni.hideLoading()
  }
}

// 关闭弹框
function closeDrawer() {
  emit('update:visible', false)
  // 重置数据
  reviewData.value = {
    orderId: 0,
    rating: 5,
    content: '',
    images: [],
    isAnonymous: false,
  }
  selectedImages.value = []
}

// 监听弹框显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.order) {
    reviewData.value.orderId = Number(props.order.id)
  }
})
</script>

<template>
  <BottomDrawer
    :visible="visible"
    title="评价车辆"
    @update:visible="closeDrawer"
  >
    <view class="h-[calc(70vh-120rpx)] flex flex-col">
      <!-- 车辆信息 -->
      <view v-if="order?.vehicle" class="flex items-center bg-gray-50/50 px-[32rpx] py-[24rpx]">
        <image
          :src="order.vehicle.imageUrl"
          class="h-[66rpx] w-[88rpx] rounded-[12rpx] bg-gray-200"
          mode="aspectFill"
        />
        <view class="ml-[20rpx] flex-1">
          <text class="text-[26rpx] text-gray-900 font-medium leading-[36rpx]">
            {{ order.vehicle.name }}
          </text>
          <text class="mt-[4rpx] block text-[22rpx] text-gray-500 leading-[30rpx]">
            {{ order.vehicle.licensePlate }}
          </text>
        </view>
      </view>

      <!-- 滚动内容区域 -->
      <scroll-view scroll-y class="flex-1 py-[20rpx] box-border h-0">
        <view class="space-y-[20rpx]">
          <!-- 评分区域 -->
          <view class="flex items-center justify-center py-[20rpx]">
            <view
              v-for="star in 5"
              :key="star"
              class="mx-[8rpx] h-[60rpx] w-[60rpx] flex items-center justify-center transition-all duration-200 active:scale-90"
              @tap="handleRatingClick(star)"
            >
              <text
                v-if="star <= reviewData.rating"
                class="i-heroicons-star-solid text-[48rpx] text-amber-400"
              />
              <text
                v-else
                class="i-heroicons-star text-[48rpx] text-gray-300"
              />
            </view>
          </view>

          <!-- 评价内容 -->
          <view class="border-2 border-gray-200 rounded-[16rpx] bg-white p-[24rpx]">
            <view class="mb-[16rpx] flex items-center">
              <text class="i-material-symbols-edit mr-[8rpx] text-[20rpx] text-blue-600" />
              <text class="text-[24rpx] text-gray-800 font-medium">
                详细评价
              </text>
            </view>

            <text class="mb-[16rpx] block text-[22rpx] text-gray-600 leading-[32rpx]">
              分享您的真实用车感受，帮助其他用户做出更好的选择
            </text>

            <!-- 文本输入框 -->
            <view class="relative border border-gray-200 rounded-[12rpx] bg-gray-50 p-[16rpx]">
              <textarea
                :value="reviewData.content"
                placeholder="说说您的用车体验吧，比如车辆性能、服务质量、整体感受等..."
                :maxlength="maxLength"
                auto-height
                class="min-h-[160rpx] w-full bg-transparent text-[28rpx] text-gray-900 leading-[40rpx]"
                placeholder-class="text-gray-400"
                @input="handleTextInput"
              />

              <!-- 字数统计 -->
              <view class="mt-[12rpx] flex items-center justify-between">
                <view class="flex items-center">
                  <text
                    v-if="characterCount < 20"
                    class="flex items-center text-[20rpx] text-blue-500"
                  >
                    <text class="i-material-symbols-tips-and-updates mr-[4rpx] text-[16rpx]" />
                    详细的评价能帮助其他用户~
                  </text>
                  <text
                    v-else-if="characterCount >= 20 && characterCount < 50"
                    class="flex items-center text-[20rpx] text-green-500"
                  >
                    <text class="i-material-symbols-check-circle mr-[4rpx] text-[16rpx]" />
                    很好，继续补充更多细节
                  </text>
                </view>
                <text
                  class="text-[20rpx] font-medium"
                  :class="characterCount > maxLength * 0.9 ? 'text-red-500' : characterCount > 50 ? 'text-green-600' : 'text-gray-500'"
                >
                  {{ characterCount }}/{{ maxLength }}
                </text>
              </view>
            </view>
          </view>

          <!-- 上传图片 -->
          <view class="border-2 border-gray-200 rounded-[16rpx] bg-white p-[24rpx]">
            <view class="mb-[16rpx] flex items-center">
              <text class="i-material-symbols-image mr-[8rpx] text-[20rpx] text-blue-600" />
              <text class="text-[24rpx] text-gray-800 font-medium">
                上传图片
              </text>
              <text class="ml-[8rpx] text-[20rpx] text-gray-400">
                (可选，最多6张)
              </text>
            </view>

            <text class="mb-[20rpx] block text-[22rpx] text-gray-600 leading-[32rpx]">
              上传用车过程中的图片，让评价更生动直观
            </text>

            <!-- 图片网格 -->
            <view class="grid grid-cols-3 gap-[12rpx]">
              <!-- 已选图片 -->
              <view
                v-for="(image, index) in selectedImages"
                :key="image.id"
                class="relative aspect-square"
              >
                <image
                  :src="image.url"
                  class="h-full w-full border border-gray-100 rounded-[12rpx] bg-gray-200"
                  mode="aspectFill"
                  @tap="previewImage(index)"
                />

                <!-- 序号 -->
                <view class="absolute left-[8rpx] top-[8rpx] h-[24rpx] w-[24rpx] flex items-center justify-center rounded-full bg-blue-600">
                  <text class="text-[16rpx] text-white font-bold">
                    {{ index + 1 }}
                  </text>
                </view>

                <!-- 删除按钮 -->
                <view
                  class="absolute h-[28rpx] w-[28rpx] flex items-center justify-center rounded-full bg-red-500 shadow-md -right-[6rpx] -top-[6rpx]"
                  @tap="removeImage(index)"
                >
                  <text class="i-material-symbols-close text-[16rpx] text-white" />
                </view>
              </view>

              <!-- 添加按钮 -->
              <view
                v-if="selectedImages.length < 6"
                class="aspect-square flex flex-col items-center justify-center border-2 border-blue-300 rounded-[12rpx] border-dashed bg-blue-50 transition-all"
                @tap="chooseImages"
              >
                <text class="i-material-symbols-add-a-photo mb-[8rpx] text-[32rpx] text-blue-600" />
                <text class="text-[20rpx] text-blue-600 font-medium">
                  添加图片
                </text>
                <text class="mt-[4rpx] text-[18rpx] text-gray-500">
                  {{ selectedImages.length }}/6
                </text>
              </view>
            </view>

            <!-- 上传提示 -->
            <view class="mt-[16rpx] rounded-[12rpx] bg-gray-50 p-[12rpx]">
              <view class="flex items-center text-[18rpx] text-gray-500">
                <text class="i-material-symbols-info mr-[6rpx] text-[16rpx]" />
                <text>支持JPG、PNG格式，单张不超过5MB</text>
              </view>
            </view>
          </view>

          <!-- 匿名选项 -->
          <view class="border-2 border-gray-200 rounded-[16rpx] bg-white p-[24rpx]">
            <view class="mb-[12rpx] flex items-center">
              <text class="i-material-symbols-privacy-tip mr-[8rpx] text-[20rpx] text-blue-600" />
              <text class="text-[24rpx] text-gray-800 font-medium">
                隐私设置
              </text>
            </view>

            <view class="flex items-center justify-between">
              <view class="flex-1 pr-[16rpx]">
                <text class="text-[22rpx] text-gray-800 font-medium">
                  匿名评价
                </text>
                <text class="mt-[4rpx] block text-[20rpx] text-gray-500 leading-[28rpx]">
                  开启后，其他用户将无法看到您的个人信息
                </text>
              </view>

              <!-- 自定义开关 -->
              <view
                class="relative h-[44rpx] w-[80rpx] rounded-full transition-all duration-300"
                :class="reviewData.isAnonymous ? 'bg-blue-600' : 'bg-gray-300'"
                @tap="toggleAnonymous"
              >
                <view
                  class="absolute top-[6rpx] h-[32rpx] w-[32rpx] rounded-full bg-white shadow-md transition-all duration-300"
                  :style="{
                    transform: reviewData.isAnonymous
                      ? 'translateX(42rpx)'
                      : 'translateX(6rpx)',
                  }"
                />
                <view
                  v-if="reviewData.isAnonymous"
                  class="absolute inset-0 flex items-center justify-start pl-[8rpx]"
                >
                  <text class="i-material-symbols-check text-[16rpx] text-white" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部留白 -->
        <view class="h-[100rpx]" />
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="flex-shrink-0 border-t border-gray-100 bg-white px-[32rpx] pb-[15rpx]">
        <view
          class="h-[88rpx] w-full flex items-center justify-center rounded-[20rpx] text-[28rpx] font-medium transition-all"
          :class="[
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white shadow-lg',
          ]"
          @tap="submitReview"
        >
          <!-- 加载动画 -->
          <view
            v-if="loading || uploadingImages"
            class="mr-[12rpx] h-[24rpx] w-[24rpx] animate-spin border-2 border-white border-t-transparent rounded-full"
          />

          <!-- 图标 -->
          <text
            v-else-if="!isSubmitDisabled"
            class="i-material-symbols-send mr-[8rpx] text-[24rpx]"
          />

          <!-- 文字 -->
          <text v-if="uploadingImages">
            正在上传图片...
          </text>
          <text v-else-if="loading">
            提交中...
          </text>
          <text v-else>
            提交评价
          </text>
        </view>
      </view>
    </view>
  </BottomDrawer>
</template>
