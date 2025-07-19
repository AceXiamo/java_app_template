<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getVehicleReviews } from '@/api/vehicle'
import type { VehicleReview } from '@/api/vehicle'

// 页面参数
const vehicleId = ref('')
const vehicleName = ref('')

// 页面状态
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const refreshing = ref(false)

// 评价数据
const reviews = ref<VehicleReview[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 统计数据
const ratingStats = ref({
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: [
    { star: 5, count: 0, percentage: 0 },
    { star: 4, count: 0, percentage: 0 },
    { star: 3, count: 0, percentage: 0 },
    { star: 2, count: 0, percentage: 0 },
    { star: 1, count: 0, percentage: 0 },
  ],
})

// 页面加载
onLoad((options: any) => {
  vehicleId.value = options.vehicleId || ''
  vehicleName.value = decodeURIComponent(options.vehicleName || '')

  if (vehicleId.value) {
    loadReviews()
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  refreshReviews()
})

// 上拉加载
onReachBottom(() => {
  loadMoreReviews()
})

// 加载评价列表
async function loadReviews() {
  if (loading.value)
    return

  try {
    loading.value = true
    const response = await getVehicleReviews(Number(vehicleId.value), currentPage.value, pageSize.value)

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        reviews.value = response.data
        total.value = response.data.length
        hasMore.value = false
      }
      else if (response.data && typeof response.data === 'object' && 'records' in response.data) {
        const data = response.data as any
        reviews.value = data.records || []
        total.value = data.total || 0
        hasMore.value = currentPage.value * pageSize.value < total.value
      }

      // 计算评分统计
      calculateRatingStats()
    }
    else {
      reviews.value = []
      total.value = 0
      hasMore.value = false
    }
  }
  catch (error) {
    console.error('加载评价失败:', error)
    reviews.value = []
    total.value = 0
    hasMore.value = false
  }
  finally {
    loading.value = false
  }
}

// 刷新评价
async function refreshReviews() {
  refreshing.value = true
  currentPage.value = 1
  try {
    await loadReviews()
  }
  finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

// 加载更多评价
async function loadMoreReviews() {
  if (loadingMore.value || !hasMore.value)
    return

  try {
    loadingMore.value = true
    currentPage.value += 1

    const response = await getVehicleReviews(Number(vehicleId.value), currentPage.value, pageSize.value)

    if (response.code === 200 && response.data) {
      let newReviews: VehicleReview[] = []

      if (Array.isArray(response.data)) {
        newReviews = response.data
      }
      else if (response.data && typeof response.data === 'object' && 'records' in response.data) {
        newReviews = (response.data as any).records || []
      }

      reviews.value.push(...newReviews)
      hasMore.value = reviews.value.length < total.value

      // 重新计算评分统计
      calculateRatingStats()
    }
  }
  catch (error) {
    console.error('加载更多评价失败:', error)
    currentPage.value -= 1
  }
  finally {
    loadingMore.value = false
  }
}

// 计算评分统计
function calculateRatingStats() {
  if (reviews.value.length === 0) {
    ratingStats.value = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [
        { star: 5, count: 0, percentage: 0 },
        { star: 4, count: 0, percentage: 0 },
        { star: 3, count: 0, percentage: 0 },
        { star: 2, count: 0, percentage: 0 },
        { star: 1, count: 0, percentage: 0 },
      ],
    }
    return
  }

  const totalReviews = reviews.value.length
  const totalRating = reviews.value.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / totalReviews

  // 统计各星级分布
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.value.filter(review => review.rating === star).length
    return {
      star,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    }
  })

  ratingStats.value = {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution: distribution,
  }
}

// 格式化时间
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 预览评价图片
function previewImages(images: string[], current: number = 0) {
  if (images.length === 0)
    return

  uni.previewImage({
    current: images[current],
    urls: images,
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 自定义导航栏 -->
    <view class="border-b border-gray-100 bg-white">
      <view class="flex items-center justify-between px-[24rpx] py-[16rpx]" style="padding-top: var(--status-bar-height)">
        <view class="flex items-center">
          <view
            class="h-[60rpx] w-[60rpx] flex items-center justify-center rounded-full bg-gray-100 transition-colors active:bg-gray-200"
            @tap="goBack"
          >
            <text class="i-material-symbols-arrow-back text-[32rpx] text-gray-700" />
          </view>
          <text class="ml-[24rpx] text-[32rpx] text-black font-semibold">
            用户评价
          </text>
        </view>
      </view>
    </view>

    <!-- 主要内容 -->
    <scroll-view
      scroll-y
      class="h-0 flex-1"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshReviews"
    >
      <!-- 车辆信息栏 -->
      <view class="border-b border-gray-100 bg-white px-[24rpx] py-[32rpx]">
        <text class="text-[28rpx] text-black font-medium">
          {{ vehicleName }}
        </text>
        <text class="ml-[12rpx] text-[24rpx] text-gray-600">
          的用户评价
        </text>
      </view>

      <!-- 评分统计 -->
      <view class="border-b border-gray-100 bg-white px-[24rpx] py-[32rpx]">
        <view class="flex items-center justify-between">
          <!-- 平均评分 -->
          <view class="flex items-center">
            <text class="text-[56rpx] text-black font-bold">
              {{ ratingStats.averageRating || 0 }}
            </text>
            <view class="ml-[16rpx]">
              <view class="flex items-center">
                <text
                  v-for="i in 5"
                  :key="i"
                  class="i-material-symbols-star mr-[4rpx] text-[28rpx]"
                  :class="i <= Math.floor(ratingStats.averageRating) ? 'text-yellow-500' : 'text-gray-300'"
                />
              </view>
              <text class="text-[24rpx] text-gray-600">
                {{ ratingStats.totalReviews }}条评价
              </text>
            </view>
          </view>

          <!-- 评分分布 -->
          <view class="ml-[32rpx] flex-1">
            <view
              v-for="item in ratingStats.ratingDistribution"
              :key="item.star"
              class="mb-[8rpx] flex items-center last:mb-0"
            >
              <text class="w-[40rpx] text-[22rpx] text-gray-600">
                {{ item.star }}星
              </text>
              <view class="mx-[12rpx] h-[12rpx] flex-1 overflow-hidden rounded-full bg-gray-200">
                <view
                  class="h-full bg-yellow-500 transition-all duration-300"
                  :style="{ width: `${item.percentage}%` }"
                />
              </view>
              <text class="w-[60rpx] text-right text-[22rpx] text-gray-600">
                {{ item.count }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 评价列表 -->
      <view v-if="reviews.length > 0" class="bg-white">
        <view
          v-for="review in reviews"
          :key="review.reviewId"
          class="border-b border-gray-100 px-[24rpx] py-[32rpx] last:border-b-0"
        >
          <!-- 用户信息 -->
          <view class="mb-[16rpx] flex items-center">
            <image
              :src="review.userAvatar || '/static/images/default-avatar.png'"
              class="h-[60rpx] w-[60rpx] rounded-full"
            />
            <view class="ml-[16rpx] flex-1">
              <text class="block text-[26rpx] text-black font-medium">
                {{ review.userName || '匿名用户' }}
              </text>
              <view class="mt-[4rpx] flex items-center">
                <view class="mr-[12rpx] flex items-center">
                  <text
                    v-for="i in 5"
                    :key="i"
                    class="i-material-symbols-star mr-[2rpx] text-[20rpx]"
                    :class="i <= review.rating ? 'text-yellow-500' : 'text-gray-300'"
                  />
                </view>
                <text class="text-[20rpx] text-gray-500">
                  {{ formatDate(review.createTime) }}
                </text>
              </view>
            </view>
          </view>

          <!-- 评价内容 -->
          <text class="mb-[16rpx] text-[24rpx] text-gray-700 leading-[36rpx]">
            {{ review.content }}
          </text>

          <!-- 评价图片 -->
          <view v-if="review.images && review.images.length > 0" class="grid grid-cols-3 gap-[8rpx]">
            <image
              v-for="(image, index) in review.images"
              :key="index"
              :src="image"
              mode="aspectFill"
              class="h-[120rpx] w-full rounded-[8rpx]"
              @tap="previewImages(review.images, index)"
            />
          </view>

          <!-- 评价标签 -->
          <view v-if="review.tags && review.tags.length > 0" class="mt-[16rpx] flex flex-wrap gap-[8rpx]">
            <text
              v-for="tag in review.tags"
              :key="tag"
              class="rounded-full bg-blue-50 px-[16rpx] py-[8rpx] text-[20rpx] text-blue-600"
            >
              {{ tag }}
            </text>
          </view>

          <!-- 商家回复 -->
          <view v-if="review.replyContent" class="mt-[16rpx] rounded-[12rpx] bg-gray-50 p-[16rpx]">
            <text class="text-[22rpx] text-gray-600 font-medium">
              商家回复：
            </text>
            <text class="mt-[8rpx] block text-[22rpx] text-gray-700 leading-[32rpx]">
              {{ review.replyContent }}
            </text>
            <text v-if="review.replyTime" class="mt-[8rpx] block text-[20rpx] text-gray-500">
              {{ formatDate(review.replyTime) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-[60rpx]">
        <text class="text-[28rpx] text-gray-500">
          加载中...
        </text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="reviews.length === 0" class="flex flex-col items-center justify-center py-[120rpx]">
        <text class="i-lets-icons-comment text-[120rpx] text-slate-400" />
        <text class="mt-[24rpx] text-[28rpx] text-gray-500">
          暂无评价
        </text>
        <text class="mt-[8rpx] text-[24rpx] text-gray-400">
          快来成为第一个评价的用户吧~
        </text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="flex items-center justify-center py-[40rpx]">
        <text v-if="loadingMore" class="text-[24rpx] text-gray-500">
          加载更多...
        </text>
        <text v-else class="text-[24rpx] text-gray-400">
          上拉加载更多
        </text>
      </view>

      <!-- 到底了 -->
      <view v-if="!hasMore && reviews.length > 0" class="flex items-center justify-center py-[40rpx]">
        <text class="text-[24rpx] text-gray-400">
          没有更多评价了
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
