<script setup lang="ts">
import { useDiscoverStore } from '@/store/discover'
import DiscoverHead from '@/components/page/discover/Head.vue'

const discoverStore = useDiscoverStore()

// 状态文本映射
function getImplementStatusText(status?: string) {
  const statusTextMap: Record<string, string> = {
    planning: '规划中',
    developing: '开发中',
    testing: '测试中',
    released: '已上线',
  }
  return statusTextMap[status || ''] || status || ''
}

// 当前激活的tab
const activeTab = ref<'news' | 'reviews' | 'feedback'>('news')

// 定义tab配置
const tabConfig = [
  { key: 'news', label: '热门资讯', icon: 'i-material-symbols:newspaper-outline' },
  { key: 'reviews', label: '租客评价', icon: 'i-material-symbols:star-outline' },
  { key: 'feedback', label: '反馈建议', icon: 'i-material-symbols:feedback-outline' },
]

function switchTab(tab: 'news' | 'reviews' | 'feedback') {
  activeTab.value = tab

  // 根据tab加载对应数据
  switch (tab) {
    case 'news':
      discoverStore.loadNewsList()
      break
    case 'reviews':
      discoverStore.loadReviewsList()
      break
    case 'feedback':
      discoverStore.loadFeedbackList()
      break
  }
}

onMounted(() => {
  // 默认加载热门资讯
  discoverStore.loadNewsList()
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航 -->
    <DiscoverHead />

    <!-- Tab切换栏 - 左对齐下划线式 -->
    <view class="flex-shrink-0 bg-gray-50 px-[40rpx] pb-[16rpx] pt-[32rpx]">
      <view class="min-h-[64rpx] flex items-end space-x-[48rpx]">
        <view
          v-for="tab in tabConfig"
          :key="tab.key"
          class="relative pb-[16rpx] transition-all duration-200 active:scale-95"
          @tap="switchTab(tab.key as 'news' | 'reviews' | 'feedback')"
        >
          <!-- 标签文字 -->
          <view class="flex items-center">
            <text
              class="font-semibold transition-all duration-200"
              :style="{
                color: activeTab === tab.key ? '#111827' : '#9ca3af',
                fontSize: activeTab === tab.key ? '34rpx' : '28rpx',
              }"
            >
              {{ tab.label }}
            </text>

            <!-- 数量徽章 -->
            <view
              v-if="tab.key === 'news' && discoverStore.hotNewsCount > 0"
              class="ml-[12rpx] h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-red-500"
            >
              <text class="text-[20rpx] text-white font-bold">
                {{ discoverStore.hotNewsCount }}
              </text>
            </view>
          </view>

          <!-- 紫色下划线指示器 -->
          <view
            class="absolute bottom-0 left-0 h-[6rpx] rounded-full transition-all duration-300"
            :style="{
              width: activeTab === tab.key ? '100%' : '0',
              backgroundColor: activeTab === tab.key ? '#8b5cf6' : 'transparent',
            }"
          />
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="relative h-0 flex-1">
      <!-- 热门资讯 -->
      <scroll-view
        v-if="activeTab === 'news'"
        scroll-y
        class="h-full"
        refresher-enabled
        :refresher-triggered="discoverStore.newsRefreshing"
        @refresherrefresh="discoverStore.refreshNews"
        @scrolltolower="discoverStore.loadMoreNews"
      >
        <view class="p-[24rpx] space-y-[32rpx]">
          <!-- 资讯列表 -->
          <view
            v-for="article in discoverStore.newsList"
            :key="article.articleId"
            class="relative overflow-hidden rounded-[24rpx] bg-white shadow-[0_8rpx_24rpx_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-98"
            @tap="discoverStore.openNewsDetail(article.articleId)"
          >
            <!-- 热门标签 - 悬浮在右上角 -->
            <view v-if="article.isHot" class="absolute right-[20rpx] top-[20rpx] z-10 flex items-center rounded-[20rpx] bg-gradient-to-r from-red-500 to-orange-500 px-[16rpx] py-[8rpx] shadow-[0_4rpx_12rpx_rgba(239,68,68,0.3)]">
              <image src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/fire.png" class="h-[22rpx] w-[22rpx] mr-[8rpx]" mode="aspectFit" alt="热门icon" />
              <text class="text-[20rpx] text-white font-bold">
                热门
              </text>
            </view>

            <!-- 封面图片区域 -->
            <view v-if="article.coverImage" class="relative mb-[28rpx]">
              <!-- 图片容器 - 带悬浮阴影 -->
              <view class="relative flex overflow-hidden rounded-[20rpx] shadow-[0_4rpx_16rpx_rgba(0,0,0,0.08)]">
                <image
                  :src="article.coverImage"
                  class="h-[320rpx] w-full object-cover"
                  mode="aspectFill"
                />
                <!-- 底部渐变遮罩 -->
                <view class="absolute bottom-0 left-0 right-0 h-[120rpx] bg-gradient-to-t from-black/50 to-transparent" />

                <!-- 标签 - 悬浮在左下角 -->
                <view v-if="article.tags?.length" class="absolute bottom-[20rpx] left-[20rpx] flex gap-[12rpx]">
                  <view
                    v-for="tag in article.tags.slice(0, 2)"
                    :key="tag"
                    class="rounded-[16rpx] bg-black/70 px-[16rpx] py-[8rpx] text-[20rpx] text-white font-medium backdrop-blur-sm"
                  >
                    {{ tag }}
                  </view>
                </view>
              </view>
            </view>

            <!-- 内容区域 -->
            <view class="px-[32rpx] pb-[32rpx]">
              <!-- 标题区域 -->
              <view class="mb-[24rpx]">
                <text class="line-clamp-2 mb-[16rpx] block text-[32rpx] text-gray-900 font-bold leading-[1.4]">
                  {{ article.title }}
                </text>
                <text v-if="article.subtitle" class="line-clamp-2 block text-[26rpx] text-gray-600 leading-[1.5]">
                  {{ article.subtitle }}
                </text>
              </view>

              <!-- 统计信息区域 -->
              <view class="flex items-center justify-between border-t border-gray-100 pt-[24rpx]">
                <view class="flex items-center space-x-[28rpx]">
                  <view class="flex items-center">
                    <text class="i-material-symbols:visibility mr-[6rpx] text-[24rpx] text-gray-400" />
                    <text class="text-[22rpx] text-gray-500 font-medium">{{ article.viewCount }}</text>
                  </view>
                  <view class="flex items-center">
                    <text class="i-material-symbols:thumb-up mr-[6rpx] text-[24rpx] text-gray-400" />
                    <text class="text-[22rpx] text-gray-500 font-medium">{{ article.likeCount }}</text>
                  </view>
                  <view class="flex items-center">
                    <text class="i-material-symbols:chat-bubble mr-[6rpx] text-[24rpx] text-gray-400" />
                    <text class="text-[22rpx] text-gray-500 font-medium">{{ article.commentCount }}</text>
                  </view>
                </view>
                <text class="text-[22rpx] text-gray-400 font-medium">{{ article.publishTime }}</text>
              </view>
            </view>
          </view>

          <!-- 加载状态 -->
          <view v-if="discoverStore.newsStatus === 'loading'" class="flex justify-center py-[48rpx]">
            <text class="i-material-symbols:sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
            <text class="text-[26rpx] text-gray-600">
              加载中...
            </text>
          </view>

          <!-- 空状态 -->
          <view v-if="discoverStore.newsStatus === 'nomore' && discoverStore.newsList.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
            <image src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/msg_empty.png" class="h-[180rpx] w-[180rpx] mb-[32rpx]" mode="aspectFit" alt="暂无资讯" />
            <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">暂无资讯</text>
            <text class="text-[24rpx] text-gray-400">敬请期待更多内容</text>
          </view>
        </view>
      </scroll-view>

      <!-- 租客评价 -->
      <scroll-view
        v-if="activeTab === 'reviews'"
        scroll-y
        class="h-full"
        refresher-enabled
        :refresher-triggered="discoverStore.reviewsRefreshing"
        @refresherrefresh="discoverStore.refreshReviews"
        @scrolltolower="discoverStore.loadMoreReviews"
      >
        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 评价列表 -->
          <view
            v-for="review in discoverStore.reviewsList"
            :key="review.reviewId"
            class="border border-gray-100 rounded-[24rpx] bg-white p-[32rpx] shadow-sm"
          >
            <!-- 用户信息和评分 -->
            <view class="mb-[24rpx] flex items-center">
              <image
                :src="review.userAvatar || '/static/default-avatar.png'"
                class="mr-[24rpx] h-[80rpx] w-[80rpx] rounded-full"
              />
              <view class="flex-1">
                <text class="mb-[8rpx] block text-[28rpx] text-black font-medium">
                  {{ review.userNickname }}
                </text>
                <view class="flex items-center">
                  <!-- 星级评分 -->
                  <view class="mr-[16rpx] flex items-center">
                    <text
                      v-for="star in 5"
                      :key="star"
                      class="mr-[4rpx] text-[24rpx]"
                      :class="star <= review.rating ? 'text-orange-400' : 'text-gray-300'"
                    >
                      ★
                    </text>
                  </view>
                  <text class="text-[24rpx] text-gray-500">
                    {{ review.createTime }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 车辆信息卡片 -->
            <view class="mb-[24rpx] rounded-[16rpx] bg-gray-50 p-[24rpx]">
              <view class="flex items-center">
                <text class="i-material-symbols:directions-car mr-[12rpx] text-[32rpx] text-purple-600" />
                <view>
                  <text class="text-[26rpx] text-black font-medium">
                    {{ review.vehicleName }}
                  </text>
                  <text class="ml-[16rpx] text-[24rpx] text-gray-600">
                    {{ review.brand }} {{ review.model }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 评价内容 -->
            <text class="mb-[24rpx] block text-[26rpx] text-gray-700 leading-relaxed">
              {{ review.content }}
            </text>

            <!-- 评价标签 -->
            <view v-if="review.tags?.length" class="mb-[24rpx] flex flex-wrap gap-[12rpx]">
              <view
                v-for="tag in review.tags"
                :key="tag"
                class="rounded-[12rpx] bg-purple-50 px-[16rpx] py-[8rpx] text-[22rpx] text-purple-600 font-medium"
              >
                {{ tag }}
              </view>
            </view>

            <!-- 评价图片 -->
            <view v-if="review.images?.length" class="grid grid-cols-3 gap-[16rpx]">
              <image
                v-for="(img, index) in review.images.slice(0, 3)"
                :key="index"
                :src="img"
                class="h-[160rpx] w-full rounded-[12rpx] object-cover"
                mode="aspectFill"
              />
            </view>
          </view>

          <!-- 加载状态 -->
          <view v-if="discoverStore.reviewsStatus === 'loading'" class="flex justify-center py-[48rpx]">
            <text class="i-material-symbols:sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
            <text class="text-[26rpx] text-gray-600">
              加载中...
            </text>
          </view>

          <!-- 空状态 -->
          <view v-if="discoverStore.reviewsStatus === 'nomore' && discoverStore.reviewsList.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
            <image src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/comment_empty.png" class="h-[180rpx] w-[180rpx] mb-[32rpx]" mode="aspectFit" alt="暂无评价" />
            <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">暂无评价</text>
            <text class="text-[24rpx] text-gray-400">期待您的分享</text>
          </view>
        </view>
      </scroll-view>

      <!-- 反馈建议 -->
      <scroll-view
        v-if="activeTab === 'feedback'"
        scroll-y
        class="h-full"
        refresher-enabled
        :refresher-triggered="discoverStore.feedbackRefreshing"
        @refresherrefresh="discoverStore.refreshFeedback"
        @scrolltolower="discoverStore.loadMoreFeedback"
      >
        <view class="p-[24rpx] space-y-[24rpx]">
          <!-- 提交建议按钮 -->
          <view
            class="relative overflow-hidden rounded-[28rpx] shadow-[0_8rpx_24rpx_rgba(139,92,246,0.12)] px-[32rpx] py-[48rpx] mb-[24rpx] active:scale-98"
            @tap="discoverStore.openFeedbackForm"
          >
            <!-- 背景图 -->
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/feedback-bg.png"
              class="absolute left-0 top-0 h-full w-full object-cover"
              mode="aspectFill"
              style="z-index: 0;"
            />
            <!-- 半透明遮罩（可选，提升内容可读性） -->
            <view class="absolute left-0 top-0 h-full w-full bg-black/10" style="z-index: 1;" />

            <!-- 内容区 -->
            <view class="relative z-10 flex flex-col items-center justify-center">
              <text class="i-material-symbols:lightbulb-outline mb-[16rpx] text-[56rpx] text-white/90" />
              <text class="mb-[12rpx] text-[32rpx] font-bold text-white" style="text-shadow:0 2rpx 8rpx rgba(139,92,246,0.18);">
                提交您的建议
              </text>
              <text class="text-center text-[24rpx] text-white/80">
                我们重视每一个建议，好的建议将被采纳实施
              </text>
            </view>
          </view>

          <!-- 已采纳建议列表 -->
          <view
            v-for="feedback in discoverStore.feedbackList"
            :key="feedback.feedbackId"
            class="overflow-hidden border border-gray-100 rounded-[24rpx] bg-white shadow-sm"
          >
            <!-- 建议头部 -->
            <view class="border-b border-green-100 bg-green-50 p-[32rpx]">
              <view class="flex items-start justify-between">
                <view class="flex-1">
                  <view class="mb-[16rpx] flex items-center">
                    <view class="mr-[16rpx] rounded-[12rpx] bg-green-100 px-[16rpx] py-[8rpx] text-[22rpx] text-green-700 font-medium">
                      已采纳
                    </view>
                    <view class="rounded-[12rpx] bg-blue-100 px-[16rpx] py-[8rpx] text-[22rpx] text-blue-700 font-medium">
                      {{ feedback.categoryName }}
                    </view>
                  </view>
                  <text class="text-[28rpx] text-black font-semibold">
                    {{ feedback.title }}
                  </text>
                </view>
                <view v-if="feedback.isFeatured" class="ml-[16rpx]">
                  <text class="i-material-symbols:star text-[48rpx] text-orange-400" />
                </view>
              </view>
            </view>

            <!-- 建议内容 -->
            <view class="p-[32rpx]">
              <text class="mb-[24rpx] block text-[26rpx] text-gray-700 leading-relaxed">
                {{ feedback.content }}
              </text>

              <!-- 采纳说明 -->
              <view v-if="feedback.adoptReason" class="mb-[24rpx] rounded-[16rpx] bg-green-50 p-[24rpx]">
                <view class="mb-[16rpx] flex items-center">
                  <text class="i-material-symbols:verified mr-[12rpx] text-[32rpx] text-green-600" />
                  <text class="text-[26rpx] text-green-800 font-medium">
                    采纳说明
                  </text>
                </view>
                <text class="text-[24rpx] text-green-700">
                  {{ feedback.adoptReason }}
                </text>
              </view>

              <!-- 实施状态 -->
              <view v-if="feedback.implementStatus" class="mb-[24rpx] flex items-center justify-between">
                <view class="flex items-center">
                  <text class="i-material-symbols:engineering mr-[8rpx] text-[24rpx] text-blue-600" />
                  <text class="text-[24rpx] text-blue-600">
                    实施状态: {{ getImplementStatusText(feedback.implementStatus) }}
                  </text>
                </view>
                <view v-if="feedback.implementVersion" class="rounded-[8rpx] bg-gray-100 px-[12rpx] py-[4rpx] text-[22rpx] text-gray-600">
                  {{ feedback.implementVersion }}
                </view>
              </view>

              <!-- 底部信息 -->
              <view class="flex items-center justify-between border-t border-gray-100 pt-[24rpx]">
                <text class="text-[24rpx] text-gray-500">
                  {{ feedback.processTime }}
                </text>
                <view class="flex items-center">
                  <text class="i-material-symbols:thumb-up mr-[8rpx] text-[24rpx] text-gray-400" />
                  <text class="text-[24rpx] text-gray-500">
                    {{ feedback.likeCount }}
                  </text>
                </view>
              </view>
            </view>
          </view>

          <!-- 加载状态 -->
          <view v-if="discoverStore.feedbackStatus === 'loading'" class="flex justify-center py-[48rpx]">
            <text class="i-material-symbols:sync mr-[12rpx] animate-spin text-[32rpx] text-purple-600" />
            <text class="text-[26rpx] text-gray-600">
              加载中...
            </text>
          </view>

          <!-- 空状态 -->
          <view v-if="discoverStore.feedbackStatus === 'nomore' && discoverStore.feedbackList.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
            <image src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/feedback_empty.png" class="h-[180rpx] w-[180rpx] mb-[32rpx]" mode="aspectFit" alt="暂无建议" />
            <text class="mb-[16rpx] text-[28rpx] text-gray-500 font-medium">暂无建议</text>
            <text class="text-[24rpx] text-gray-400">欢迎您的反馈</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
