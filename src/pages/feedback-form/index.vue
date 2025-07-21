<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { type FeedbackCategory, getFeedbackCategories, submitFeedback } from '@/api/discover'

// 表单数据
const formData = ref({
  categoryId: 0,
  title: '',
  content: '',
  images: [] as string[],
  contactInfo: '',
})

// 分类列表
const categories = ref<FeedbackCategory[]>([])
const loadingCategories = ref(true)
const categoryPickerIndex = ref(0)
const categoryPickerRange = ref<string[]>([])

// 表单状态
const submitting = ref(false)

// 图片选择器
const maxImages = 3

// 获取反馈分类
async function fetchCategories() {
  try {
    loadingCategories.value = true
    const response = await getFeedbackCategories()

    if (response.code === 200) {
      categories.value = response.data
      categoryPickerRange.value = categories.value.map(c => c.categoryName)
      // 默认选择第一个分类
      if (categories.value.length > 0) {
        formData.value.categoryId = categories.value[0].categoryId
        categoryPickerIndex.value = 0
      }
    }
    else {
      uni.showToast({
        title: '获取分类失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('获取分类失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none',
    })
  }
  finally {
    loadingCategories.value = false
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 分类picker变化事件
function onCategoryPickerChange(e: any) {
  const index = e.detail.value
  const selectedCategory = categories.value[index]

  categoryPickerIndex.value = index
  formData.value.categoryId = selectedCategory.categoryId
}

// 获取分类名称
function getCategoryName(categoryId: number) {
  const category = categories.value.find(c => c.categoryId === categoryId)
  return category?.categoryName || '请选择分类'
}

// 上传状态
const uploadStatus = ref<boolean[]>([])

// 选择图片
function chooseImage() {
  if (formData.value.images.length >= maxImages) {
    uni.showToast({
      title: `最多上传${maxImages}张图片`,
      icon: 'none',
    })
    return
  }

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      const currentIndex = formData.value.images.length

      // 设置上传状态
      uploadStatus.value[currentIndex] = true

      uni.showLoading({
        title: '上传中...',
      })

      try {
        // TODO: 这里应该上传图片到服务器获取URL
        // 目前直接使用本地路径作为示例
        // const timestamp = Date.now()
        // const fileName = `feedback_${timestamp}.jpg`
        // const ossPath = `feedback/images/${fileName}`
        // const imageUrl = await uploadFileToOss(tempFilePath, ossPath)

        // 暂时使用本地路径
        formData.value.images.push(tempFilePath)

        uni.hideLoading()
        uni.showToast({
          title: '图片添加成功',
          icon: 'success',
        })
      }
      catch (error) {
        console.error('图片上传失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '上传失败',
          icon: 'none',
        })
      }
      finally {
        uploadStatus.value[currentIndex] = false
      }
    },
    fail: () => {
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    },
  })
}

// 删除图片
function removeImage(index: number) {
  formData.value.images.splice(index, 1)
}

// 表单验证
function validateForm() {
  if (!formData.value.categoryId) {
    uni.showToast({
      title: '请选择反馈分类',
      icon: 'none',
    })
    return false
  }

  if (!formData.value.title.trim()) {
    uni.showToast({
      title: '请输入反馈标题',
      icon: 'none',
    })
    return false
  }

  if (formData.value.title.trim().length < 5) {
    uni.showToast({
      title: '标题不能少于5个字符',
      icon: 'none',
    })
    return false
  }

  if (!formData.value.content.trim()) {
    uni.showToast({
      title: '请输入反馈内容',
      icon: 'none',
    })
    return false
  }

  if (formData.value.content.trim().length < 10) {
    uni.showToast({
      title: '内容不能少于10个字符',
      icon: 'none',
    })
    return false
  }

  return true
}

// 提交反馈
async function handleSubmit() {
  if (!validateForm())
    return

  try {
    submitting.value = true

    const response = await submitFeedback({
      categoryId: formData.value.categoryId,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      images: formData.value.images,
      contactInfo: formData.value.contactInfo.trim() || undefined,
    })

    if (response.code === 200) {
      uni.showToast({
        title: '提交成功',
        icon: 'success',
      })

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
    else {
      uni.showToast({
        title: response.msg || '提交失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('提交反馈失败:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none',
    })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <view class="relative min-h-screen bg-gray-50">
    <!-- 固定头部 -->
    <view class="fixed left-0 right-0 top-0 z-50 bg-[#f9fafb]">
      <HeadBar bg-color="#f9fafb">
        <view class="flex items-center justify-between px-[32rpx]">
          <!-- 返回按钮 -->
          <view
            class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 active:scale-95"
            @tap="goBack"
          >
            <text class="i-material-symbols:arrow-back text-[32rpx] text-gray-700" />
          </view>

          <!-- 标题 -->
          <view class="flex-1 px-[32rpx]">
            <text class="text-center text-[32rpx] text-gray-900 font-semibold">
              反馈建议
            </text>
          </view>

          <!-- 占位 -->
          <view class="h-[64rpx] w-[64rpx]" />
        </view>
      </HeadBar>
    </view>

    <!-- 内容区域，需要添加顶部间距避开固定头部 -->
    <scroll-view scroll-y class="h-screen">
      <!-- 占位区域，高度等于头部高度 -->
      <view class="h-[200rpx]" />

      <!-- 表单内容 -->
      <view class="p-[32rpx] pb-[120rpx]">
        <!-- 顶部说明 -->
        <view class="mb-[32rpx] rounded-[24rpx] from-purple-50 to-pink-50 bg-gradient-to-r p-[32rpx]">
          <view class="mb-[16rpx] flex items-center">
            <text class="i-material-symbols:feedback mr-[12rpx] text-[32rpx] text-purple-600" />
            <text class="text-[28rpx] text-purple-900 font-semibold">
              您的建议很重要
            </text>
          </view>
          <text class="text-[24rpx] text-purple-700 leading-relaxed">
            我们重视每一个建议，好的建议将被采纳并在后续版本中实现。请详细描述您的想法，帮助我们做得更好！
          </text>
        </view>

        <!-- 反馈分类 -->
        <view class="mb-[32rpx] rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols:category mr-[12rpx] text-[28rpx] text-gray-600" />
            <text class="text-[28rpx] text-gray-900 font-medium">
              反馈分类
            </text>
            <text class="ml-[8rpx] text-[24rpx] text-red-500">
              *
            </text>
          </view>

          <view v-if="loadingCategories" class="flex justify-center py-[48rpx]">
            <text class="i-material-symbols:sync animate-spin text-[32rpx] text-purple-600" />
          </view>

          <view v-else class="flex items-center justify-between">
            <view>
              <text class="block text-[28rpx] text-black font-medium">
                选择分类
              </text>
              <text class="text-[24rpx] text-gray-500">
                请选择反馈类型
              </text>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <picker
                mode="selector"
                :range="categoryPickerRange"
                :value="categoryPickerIndex"
                @change="onCategoryPickerChange"
              >
                <view class="flex items-center space-x-[16rpx]">
                  <text class="min-w-[200rpx] text-right text-[26rpx] text-purple-600">
                    {{ getCategoryName(formData.categoryId) }}
                  </text>
                  <text class="i-material-symbols:chevron-right text-[32rpx] text-gray-400" />
                </view>
              </picker>
            </view>
          </view>
        </view>

        <!-- 反馈标题 -->
        <view class="mb-[32rpx] rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols:title mr-[12rpx] text-[28rpx] text-gray-600" />
            <text class="text-[28rpx] text-gray-900 font-medium">
              反馈标题
            </text>
            <text class="ml-[8rpx] text-[24rpx] text-red-500">
              *
            </text>
          </view>
          <input
            v-model="formData.title"
            class="w-full border border-gray-200 rounded-[16rpx] px-[24rpx] py-[20rpx] text-[26rpx] text-gray-900 placeholder-gray-400"
            placeholder="请简洁地描述您的建议或问题（至少5个字符）"
            maxlength="50"
          >
          <view class="mt-[12rpx] text-right text-[22rpx] text-gray-400">
            {{ formData.title.length }}/50
          </view>
        </view>

        <!-- 详细内容 -->
        <view class="mb-[32rpx] rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols:description mr-[12rpx] text-[28rpx] text-gray-600" />
            <text class="text-[28rpx] text-gray-900 font-medium">
              详细内容
            </text>
            <text class="ml-[8rpx] text-[24rpx] text-red-500">
              *
            </text>
          </view>
          <textarea
            v-model="formData.content"
            class="h-[300rpx] w-full border border-gray-200 rounded-[16rpx] px-[24rpx] py-[20rpx] text-[26rpx] text-gray-900 placeholder-gray-400"
            placeholder="请详细描述您的建议、遇到的问题或期望的功能（至少10个字符）"
            maxlength="500"
            :show-confirm-bar="false"
          />
          <view class="mt-[12rpx] text-right text-[22rpx] text-gray-400">
            {{ formData.content.length }}/500
          </view>
        </view>

        <!-- 图片上传 -->
        <view class="mb-[32rpx] rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols:image mr-[12rpx] text-[28rpx] text-gray-600" />
            <text class="text-[28rpx] text-gray-900 font-medium">
              相关图片
            </text>
            <text class="ml-[8rpx] text-[22rpx] text-gray-500">
              （可选，最多3张）
            </text>
          </view>

          <view class="grid grid-cols-3 gap-[16rpx]">
            <!-- 已选图片 -->
            <view
              v-for="(image, index) in formData.images"
              :key="index"
              class="relative aspect-square overflow-hidden rounded-[16rpx] bg-gray-100"
            >
              <image
                :src="image"
                class="h-full w-full rounded-[16rpx] object-cover"
                mode="aspectFill"
              />
              <!-- 删除按钮 -->
              <view
                class="absolute right-[8rpx] top-[8rpx] h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500 transition-all duration-200 active:scale-95"
                @tap="removeImage(index)"
              >
                <text class="i-material-symbols:close text-[20rpx] text-white" />
              </view>
              <!-- 上传状态 -->
              <view v-if="uploadStatus[index]" class="absolute inset-0 flex items-center justify-center rounded-[16rpx] bg-black bg-opacity-50">
                <text class="i-material-symbols:sync animate-spin text-[24rpx] text-white" />
              </view>
            </view>

            <!-- 添加按钮 -->
            <view
              v-if="formData.images.length < maxImages"
              class="relative aspect-square flex items-center justify-center border-2 rounded-[16rpx] border-dashed transition-all duration-200 active:scale-95"
              :class="formData.images.length > 0 ? 'border-purple-300 bg-purple-50' : 'border-gray-300 bg-gray-50'"
              @tap="chooseImage"
            >
              <view class="flex flex-col items-center">
                <text class="i-material-symbols:add-a-photo text-[40rpx] text-gray-400" />
                <text class="mt-[8rpx] text-[20rpx] text-gray-400">
                  添加图片
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="mb-[32rpx] rounded-[24rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols:contact-phone mr-[12rpx] text-[28rpx] text-gray-600" />
            <text class="text-[28rpx] text-gray-900 font-medium">
              联系手机号
            </text>
            <text class="ml-[8rpx] text-[22rpx] text-gray-500">
              （可选）
            </text>
          </view>

          <view class="flex items-center justify-between">
            <view>
              <text class="block text-[28rpx] text-black font-medium">
                手机号码
              </text>
              <text class="text-[24rpx] text-gray-500">
                方便我们联系您
              </text>
            </view>
            <view class="flex items-center space-x-[16rpx]">
              <input
                v-model="formData.contactInfo"
                type="number"
                class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                placeholder="请输入手机号"
                maxlength="11"
              >
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-[32rpx] py-[24rpx] pb-[calc(24rpx+env(safe-area-inset-bottom))]">
      <view
        class="h-[80rpx] flex items-center justify-center rounded-[16rpx] transition-all duration-200 active:scale-95"
        :class="submitting ? 'bg-gray-300' : 'bg-purple-600'"
        @tap="handleSubmit"
      >
        <text
          v-if="submitting"
          class="i-material-symbols:sync mr-[12rpx] animate-spin text-[28rpx] text-white"
        />
        <text
          v-else
          class="i-material-symbols:send mr-[12rpx] text-[28rpx] text-white"
        />
        <text class="text-[32rpx] text-white font-semibold">
          {{ submitting ? '提交中...' : '提交反馈' }}
        </text>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
  layout: home
  </route>
