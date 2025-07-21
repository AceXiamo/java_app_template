<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { type NewsArticle, getNewsDetail } from '@/api/discover'

// 文章ID参数
const articleId = ref<number>(0)

// 文章详情数据
const article = ref<NewsArticle | null>(null)
const loading = ref(true)
const error = ref('')

// 头部透明度
const headerOpacity = ref(0)

// 获取文章详情
async function fetchArticleDetail() {
  if (!articleId.value) {
    error.value = '文章ID无效'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await getNewsDetail(articleId.value)

    if (response.code === 200) {
      article.value = response.data
    }
    else {
      error.value = response.msg || '获取文章详情失败'
    }
  }
  catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '网络错误，请重试'
  }
  finally {
    loading.value = false
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 分享文章
function shareArticle() {
  if (!article.value)
    return

  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: '',
    title: article.value.title,
    summary: article.value.subtitle || '精彩内容等你来看',
    imageUrl: article.value.coverImage || '',
    success: () => {
      uni.showToast({
        title: '分享成功',
        icon: 'success',
      })
    },
    fail: () => {
      uni.showToast({
        title: '分享失败',
        icon: 'none',
      })
    },
  })
}

// 收藏文章
const isCollected = ref(false)
function collectArticle() {
  if (!article.value)
    return

  isCollected.value = !isCollected.value
  uni.showToast({
    title: isCollected.value ? '收藏成功' : '取消收藏',
    icon: 'success',
  })
}

// 点赞文章
const isLiked = ref(false)
function likeArticle() {
  if (!article.value)
    return

  if (!isLiked.value) {
    article.value.likeCount += 1
    isLiked.value = true
    uni.showToast({
      title: '点赞成功',
      icon: 'success',
    })
  }
  else {
    article.value.likeCount -= 1
    isLiked.value = false
  }
}

// 格式化时间
function formatTime(timeStr: string) {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  else if (hours < 24) {
    return `${hours}小时前`
  }
  else if (days < 7) {
    return `${days}天前`
  }
  else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

// 处理富文本内容，给图片添加样式
function processRichTextContent(content: string) {
  if (!content)
    return content

  // 给所有 img 标签添加响应式样式
  return content.replace(/<img([^>]*)>/gi, (match, attrs) => {
    // 检查是否已经有 style 属性
    if (attrs.includes('style=')) {
      // 如果已有 style，在其中添加宽度限制
      return match.replace(/style\s*=\s*["']([^"']*)["']/i, (styleMatch, existingStyle) => {
        const newStyle = `${existingStyle};max-width:100%;width:auto;height:auto;display:block;`
        return `style="${newStyle}"`
      })
    }
    else {
      // 如果没有 style 属性，添加新的
      return `<img${attrs} style="max-width:100%;width:auto;height:auto;display:block;">`
    }
  })
}

// 监听页面滚动，控制头部透明度
function onScroll(e: any) {
  const scrollTop = e.detail.scrollTop
  const threshold = 300 // 滚动多少距离后头部完全不透明
  const opacity = Math.min(scrollTop / threshold, 1)
  headerOpacity.value = opacity
}

// 页面加载时获取参数
onLoad((options) => {
  if (options?.id) {
    articleId.value = Number.parseInt(options.id)
    fetchArticleDetail()
  }
  else {
    error.value = '缺少文章ID参数'
    loading.value = false
  }
})

onMounted(() => {
  // 设置分享信息
  if (article.value) {
    uni.setNavigationBarTitle({
      title: article.value.title,
    })
  }
})
</script>

<template>
  <view class="relative min-h-screen bg-white">
    <!-- 固定头部 -->
    <view
      class="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      :style="{
        backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
        backdropFilter: headerOpacity > 0.5 ? 'blur(20rpx)' : 'none',
      }"
    >
      <HeadBar bg-color="transparent">
        <view class="flex items-center justify-between px-[32rpx]">
          <!-- 返回按钮 -->
          <view
            class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full transition-all duration-200 active:scale-95"
            :class="headerOpacity > 0.5 ? 'bg-gray-100' : 'bg-black/20 backdrop-blur-sm'"
            @tap="goBack"
          >
            <text
              class="i-material-symbols:arrow-back text-[24rpx]"
              :class="headerOpacity > 0.5 ? 'text-gray-700' : 'text-white'"
            />
          </view>
        </view>
      </HeadBar>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="flex flex-col items-center justify-center py-[200rpx]">
      <text class="i-material-symbols:sync mb-[24rpx] animate-spin text-[40rpx] text-gray-400" />
      <text class="text-[24rpx] text-gray-500">
        正在加载...
      </text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="flex flex-col items-center justify-center py-[200rpx]">
      <text class="i-material-symbols:error mb-[24rpx] text-[40rpx] text-red-400" />
      <text class="mb-[32rpx] text-[24rpx] text-gray-600">
        {{ error }}
      </text>
      <view
        class="rounded-full bg-blue-500 px-[32rpx] py-[16rpx] transition-all duration-200 active:scale-95"
        @tap="fetchArticleDetail"
      >
        <text class="text-[24rpx] text-white font-medium">
          重新加载
        </text>
      </view>
    </view>

    <!-- 文章内容 -->
    <scroll-view
      v-else-if="article"
      scroll-y
      class="h-screen"
      @scroll="onScroll"
    >
      <!-- 封面图片区域 -->
      <view class="relative">
        <image
          v-if="article.coverImage"
          :src="article.coverImage"
          class="h-[500rpx] w-full object-cover"
          mode="aspectFill"
        />
        <view
          v-else
          class="h-[320rpx] w-full flex items-center justify-center from-blue-50 to-indigo-100 bg-gradient-to-br"
        >
          <text class="i-material-symbols:article text-[80rpx] text-gray-300" />
        </view>

        <!-- 渐变遮罩 -->
        <view class="absolute bottom-0 left-0 right-0 h-[120rpx] from-black/40 to-transparent bg-gradient-to-t" />
      </view>

      <!-- 文章主体内容 -->
      <view class="relative min-h-[calc(100vh-420rpx)] rounded-t-[32rpx] bg-white px-[32rpx] pt-[40rpx] -mt-[60rpx]">
        <!-- 标签区域 -->
        <view class="mb-[24rpx] flex flex-wrap gap-[12rpx]">
          <view v-if="article.isHot" class="flex rounded-full bg-red-500 px-[16rpx] py-[6rpx]">
            <text class="text-[20rpx] text-white font-medium">
              🔥 热门
            </text>
          </view>
          <view v-if="article.isTop" class="rounded-full bg-orange-500 px-[16rpx] py-[6rpx]">
            <text class="text-[20rpx] text-white font-medium">
              📌 置顶
            </text>
          </view>
          <view
            v-for="tag in article.tags?.slice(0, 2)"
            :key="tag"
            class="rounded-full bg-blue-50 px-[16rpx] py-[6rpx]"
          >
            <text class="text-[20rpx] text-blue-600 font-medium">
              # {{ tag }}
            </text>
          </view>
        </view>

        <!-- 文章标题 -->
        <view class="mb-[32rpx]">
          <text class="block text-[36rpx] text-gray-900 font-bold leading-[1.3]">
            {{ article.title }}
          </text>
          <text v-if="article.subtitle" class="mt-[16rpx] block text-[26rpx] text-gray-600 leading-[1.5]">
            {{ article.subtitle }}
          </text>
        </view>

        <!-- 作者信息和时间 -->
        <view class="mb-[40rpx] flex items-center justify-between">
          <view class="flex items-center">
            <view class="mr-[16rpx] h-[64rpx] w-[64rpx] flex items-center justify-center rounded-full bg-blue-100">
              <text class="i-material-symbols:person text-[28rpx] text-blue-600" />
            </view>
            <view>
              <text class="block text-[24rpx] text-gray-900 font-semibold">
                {{ article.authorName }}
              </text>
              <text class="text-[20rpx] text-gray-500">
                {{ formatTime(article.publishTime) }}
              </text>
            </view>
          </view>

          <view class="flex items-center gap-[24rpx] text-[20rpx] text-gray-500">
            <view class="flex items-center">
              <text class="i-material-symbols:visibility mr-[6rpx]" />
              <text>{{ article.viewCount }}</text>
            </view>
            <view class="flex items-center">
              <text class="i-material-symbols:thumb-up mr-[6rpx]" />
              <text>{{ article.likeCount }}</text>
            </view>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="mb-[32rpx] h-[1rpx] bg-gray-100" />

        <!-- 文章正文 -->
        <view class="mb-[80rpx]">
          <rich-text
            :nodes="processRichTextContent(article.content)"
            class="text-[28rpx] text-gray-800 leading-[1.8]"
          />
        </view>

        <!-- 文章结束标记 -->
        <view class="mb-[40rpx] flex items-center justify-center">
          <view class="flex items-center gap-[8rpx]">
            <view class="h-[4rpx] w-[4rpx] rounded-full bg-gray-300" />
            <text class="text-[20rpx] text-gray-400">
              全文完
            </text>
            <view class="h-[4rpx] w-[4rpx] rounded-full bg-gray-300" />
          </view>
        </view>

        <!-- 底部安全区域 -->
        <view class="h-[100rpx]" />
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view
      v-if="article"
      class="fixed bottom-0 left-0 right-0 hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg"
    >
      <view class="flex items-center justify-between px-[32rpx] py-[16rpx]">
        <!-- 评论框 -->
        <view class="mr-[24rpx] flex-1">
          <view class="h-[60rpx] flex items-center rounded-full bg-gray-100 px-[24rpx]">
            <text class="text-[22rpx] text-gray-500">
              写下你的想法...
            </text>
          </view>
        </view>

        <!-- 操作按钮组 -->
        <view class="flex items-center gap-[16rpx]">
          <!-- 点赞 -->
          <view
            class="h-[60rpx] flex items-center justify-center rounded-full px-[16rpx] transition-all duration-200 active:scale-95"
            :class="isLiked ? 'bg-red-50' : 'bg-gray-100'"
            @tap="likeArticle"
          >
            <text
              class="i-material-symbols:thumb-up mr-[6rpx] text-[22rpx] transition-all duration-200"
              :class="isLiked ? 'text-red-500' : 'text-gray-600'"
            />
            <text
              class="text-[20rpx] font-medium transition-all duration-200"
              :class="isLiked ? 'text-red-500' : 'text-gray-600'"
            >
              {{ article.likeCount }}
            </text>
          </view>

          <!-- 收藏 -->
          <view
            class="h-[60rpx] w-[60rpx] flex items-center justify-center rounded-full transition-all duration-200 active:scale-95"
            :class="isCollected ? 'bg-yellow-50' : 'bg-gray-100'"
            @tap="collectArticle"
          >
            <text
              class="i-material-symbols:bookmark text-[22rpx] transition-all duration-200"
              :class="isCollected ? 'text-yellow-500' : 'text-gray-600'"
            />
          </view>

          <!-- 分享 -->
          <view
            class="h-[60rpx] w-[60rpx] flex items-center justify-center rounded-full bg-blue-500 transition-all duration-200 active:scale-95"
            @tap="shareArticle"
          >
            <text class="i-material-symbols:share text-[22rpx] text-white" />
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="h-[env(safe-area-inset-bottom)]" />
    </view>
  </view>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>

<route lang="yaml">
  layout: home
  </route>
