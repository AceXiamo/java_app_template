import { defineStore } from 'pinia'
import * as discoverApi from '@/api/discover'
import type { NewsArticle, UserFeedback, VehicleReview } from '@/api/discover'

export interface NewsListParams {
  page: number
  size: number
  status?: string
}

export interface ReviewsListParams {
  page: number
  size: number
  rating?: number
  vehicleType?: string
}

export interface FeedbackListParams {
  page: number
  size: number
  status: string // 只显示已采纳的: 'adopted'
}

export const useDiscoverStore = defineStore('discover', () => {
  // 热门资讯数据
  const newsList = ref<NewsArticle[]>([])
  const newsQuery = ref<NewsListParams>({
    page: 1,
    size: 10,
    status: 'published',
  })
  const newsStatus = ref<'hide' | 'loading' | 'nomore'>('hide')
  const newsRefreshing = ref(false)
  const hotNewsCount = ref(2) // 热门资讯未读数量

  // 租客评价数据
  const reviewsList = ref<VehicleReview[]>([])
  const reviewsQuery = ref<ReviewsListParams>({
    page: 1,
    size: 10,
  })
  const reviewsStatus = ref<'hide' | 'loading' | 'nomore'>('hide')
  const reviewsRefreshing = ref(false)

  // 反馈建议数据
  const feedbackList = ref<UserFeedback[]>([])
  const feedbackQuery = ref<FeedbackListParams>({
    page: 1,
    size: 10,
    status: 'adopted',
  })
  const feedbackStatus = ref<'hide' | 'loading' | 'nomore'>('hide')
  const feedbackRefreshing = ref(false)

  // 加载热门资讯
  const loadNewsList = async (reload = false) => {
    if (newsStatus.value === 'nomore' && !reload)
      return

    try {
      newsStatus.value = 'loading'

      if (reload) {
        newsQuery.value.page = 1
      }

      const response = await discoverApi.getNewsList({
        page: newsQuery.value.page,
        size: newsQuery.value.size,
        status: newsQuery.value.status,
      })

      if (response.code === 200) {
        const result = response.data
        const articles = result.records || []

        if (reload) {
          newsList.value = articles
        }
        else {
          newsList.value = [...newsList.value, ...articles]
        }

        // 判断是否还有更多数据
        newsStatus.value = articles.length < newsQuery.value.size ? 'nomore' : 'hide'
      }
      else {
        throw new Error(response.msg || '加载失败')
      }
    }
    catch (error) {
      console.error('加载资讯列表失败:', error)
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
      newsStatus.value = 'hide'
    }
  }

  // 刷新热门资讯
  const refreshNews = async () => {
    newsRefreshing.value = true
    newsQuery.value.page = 1
    await loadNewsList(true)
    newsRefreshing.value = false
  }

  // 加载更多资讯
  const loadMoreNews = () => {
    if (newsStatus.value !== 'hide')
      return
    newsQuery.value.page += 1
    loadNewsList()
  }

  // 打开资讯详情
  const openNewsDetail = (articleId: number) => {
    uni.navigateTo({
      url: `/pages/news-detail/index?id=${articleId}`,
    })
  }

  // 加载租客评价
  const loadReviewsList = async (reload = false) => {
    if (reviewsStatus.value === 'nomore' && !reload)
      return

    try {
      reviewsStatus.value = 'loading'

      if (reload) {
        reviewsQuery.value.page = 1
      }

      // 构建请求参数，只包含已定义的值
      const params: any = {
        page: reviewsQuery.value.page,
        size: reviewsQuery.value.size,
      }

      // 只有当 rating 和 vehicleType 有值时才添加到参数中
      if (reviewsQuery.value.rating !== undefined) {
        params.rating = reviewsQuery.value.rating
      }
      if (reviewsQuery.value.vehicleType !== undefined) {
        params.vehicleType = reviewsQuery.value.vehicleType
      }

      const response = await discoverApi.getReviewsList(params)

      if (response.code === 200) {
        const result = response.data
        const reviews = result.records || []

        if (reload) {
          reviewsList.value = reviews
        }
        else {
          reviewsList.value = [...reviewsList.value, ...reviews]
        }

        // 判断是否还有更多数据
        reviewsStatus.value = reviews.length < reviewsQuery.value.size ? 'nomore' : 'hide'
      }
      else {
        throw new Error(response.msg || '加载失败')
      }
    }
    catch (error) {
      console.error('加载评价列表失败:', error)
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
      reviewsStatus.value = 'hide'
    }
  }

  // 刷新租客评价
  const refreshReviews = async () => {
    reviewsRefreshing.value = true
    reviewsQuery.value.page = 1
    await loadReviewsList(true)
    reviewsRefreshing.value = false
  }

  // 加载更多评价
  const loadMoreReviews = () => {
    if (reviewsStatus.value !== 'hide')
      return
    reviewsQuery.value.page += 1
    loadReviewsList()
  }

  // 加载反馈建议
  const loadFeedbackList = async (reload = false) => {
    if (feedbackStatus.value === 'nomore' && !reload)
      return

    try {
      feedbackStatus.value = 'loading'

      if (reload) {
        feedbackQuery.value.page = 1
      }

      const response = await discoverApi.getFeedbackList({
        page: feedbackQuery.value.page,
        size: feedbackQuery.value.size,
      })

      if (response.code === 200) {
        const result = response.data
        const feedbacks = result.records || []

        if (reload) {
          feedbackList.value = feedbacks
        }
        else {
          feedbackList.value = [...feedbackList.value, ...feedbacks]
        }

        // 判断是否还有更多数据
        feedbackStatus.value = feedbacks.length < feedbackQuery.value.size ? 'nomore' : 'hide'
      }
      else {
        throw new Error(response.msg || '加载失败')
      }
    }
    catch (error) {
      console.error('加载反馈列表失败:', error)
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
      feedbackStatus.value = 'hide'
    }
  }

  // 刷新反馈建议
  const refreshFeedback = async () => {
    feedbackRefreshing.value = true
    feedbackQuery.value.page = 1
    await loadFeedbackList(true)
    feedbackRefreshing.value = false
  }

  // 加载更多反馈
  const loadMoreFeedback = () => {
    if (feedbackStatus.value !== 'hide')
      return
    feedbackQuery.value.page += 1
    loadFeedbackList()
  }

  // 打开反馈表单
  const openFeedbackForm = () => {
    uni.navigateTo({
      url: '/pages/feedback-form/index',
    })
  }

  return {
    // 热门资讯
    newsList,
    newsQuery,
    newsStatus,
    newsRefreshing,
    hotNewsCount,
    loadNewsList,
    refreshNews,
    loadMoreNews,
    openNewsDetail,

    // 租客评价
    reviewsList,
    reviewsQuery,
    reviewsStatus,
    reviewsRefreshing,
    loadReviewsList,
    refreshReviews,
    loadMoreReviews,

    // 反馈建议
    feedbackList,
    feedbackQuery,
    feedbackStatus,
    feedbackRefreshing,
    loadFeedbackList,
    refreshFeedback,
    loadMoreFeedback,
    openFeedbackForm,
  }
})
