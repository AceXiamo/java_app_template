import { host, request } from '@/utils/request'

// 资讯文章接口
export interface NewsArticle {
  articleId: number
  title: string
  subtitle?: string
  content: string
  coverImage?: string
  tags?: string[]
  authorName: string
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  isTop: boolean
  isHot: boolean
  publishTime: string
}

// 车辆评价接口
export interface VehicleReview {
  reviewId: number
  rating: number
  content: string
  createTime: string
  images?: string
  tags?: string[]
  vehicleName: string
  brand: string
  model: string
  userNickname: string
  userAvatar?: string
}

// 用户反馈接口
export interface UserFeedback {
  feedbackId: number
  feedbackNo: string
  title: string
  content: string
  categoryName: string
  adoptReason?: string
  implementStatus?: string
  implementStatusText?: string
  implementVersion?: string
  likeCount: number
  isFeatured: boolean
  processTime: string
}

// 反馈分类接口
export interface FeedbackCategory {
  categoryId: number
  categoryName: string
  categoryCode: string
  icon?: string
  color?: string
  description?: string
  sortOrder: number
  isActive: boolean
}

// 获取热门资讯列表
export function getNewsList(params: {
  page: number
  size: number
  status?: string
}): Promise<BaseRes<{
    records: NewsArticle[]
    total: number
    size: number
    current: number
    pages: number
  }>> {
  return request.get({
    url: `${host}/discover/news`,
    data: params,
  })
}

// 获取资讯详情
export function getNewsDetail(id: number): Promise<BaseRes<NewsArticle>> {
  return request.get({
    url: `${host}/discover/news/${id}`,
  })
}

// 获取租客评价列表
export function getReviewsList(params: {
  page: number
  size: number
  rating?: number
  vehicleType?: string
}): Promise<BaseRes<{
    records: VehicleReview[]
    total: number
    size: number
    current: number
    pages: number
  }>> {
  return request.get({
    url: `${host}/discover/reviews`,
    data: params,
  })
}

// 获取已采纳的反馈建议列表
export function getFeedbackList(params: {
  page: number
  size: number
}): Promise<BaseRes<{
    records: UserFeedback[]
    total: number
    size: number
    current: number
    pages: number
  }>> {
  return request.get({
    url: `${host}/discover/feedback`,
    data: params,
  })
}

// 获取反馈分类列表
export function getFeedbackCategories(): Promise<BaseRes<FeedbackCategory[]>> {
  return request.get({
    url: `${host}/discover/feedback/categories`,
  })
}

// 提交反馈建议
export function submitFeedback(data: {
  categoryId: number
  title: string
  content: string
  images?: string[]
  contactInfo?: string
}): Promise<BaseRes<string>> {
  return request.post({
    url: `${host}/discover/feedback`,
    data,
  })
}

// 获取用户的反馈列表
export function getMyFeedback(params: {
  userId: number
  page: number
  size: number
}): Promise<BaseRes<{
    records: UserFeedback[]
    total: number
    size: number
    current: number
    pages: number
  }>> {
  return request.get({
    url: `${host}/discover/feedback/my`,
    data: params,
  })
}
