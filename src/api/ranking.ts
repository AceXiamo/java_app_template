import { host, request } from '@/utils/request'

// 排行榜车辆信息
export interface RankingVehicle {
  rank: number
  vehicleId: number
  name: string
  brand: string
  carType: string
  energyType: string
  dailyPrice?: number
  monthlyPrice?: number
  originalPrice?: number
  savings?: number
  imageUrl: string
  rating: number
  rentalCount: number
  rentalCountText: string
  savingsText?: string
  badge: {
    text: string
    color: string
    bgColor: string
  }
  rankBadge: {
    type: 'champion' | 'runner_up' | 'third_place' | 'normal'
    icon: string | null
    color: string
  }
  tags: string[]
}

// 日租排行榜响应
export interface DailyRankingResponse {
  period: string
  periodText: string
  statisticsDate: string
  updateTime: string
  rankings: RankingVehicle[]
  hasMore: boolean
  totalCount: number
}

// 月租排行榜响应
export interface MonthlyRankingResponse {
  period: string
  periodText: string
  statisticsDate: string
  updateTime: string
  rankings: RankingVehicle[]
  hasMore: boolean
  totalCount: number
}

// 完整排行榜响应
export interface FullRankingResponse {
  type: string
  period: string
  periodText: string
  statisticsDate: string
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  rankings: RankingVehicle[]
}

// 榜单统计信息
export interface RankingStatistics {
  updateFrequency: string
  lastUpdateTime: string
  dailyRanking: {
    totalVehicles: number
    weeklyOrders: number
    topBrand: string
    topCarType: string
    avgRating: number
  }
  monthlyRanking: {
    totalVehicles: number
    monthlyOrders: number
    topBrand: string
    topCarType: string
    avgSavings: number
  }
  trends: {
    risingBrands: string[]
    popularCarTypes: string[]
    energyTypeDistribution: Record<string, number>
  }
}

/**
 * 获取日租排行榜
 */
export function getDailyRanking(params: {
  period?: string
  limit?: number
} = {}) {
  return request.get({
    url: `${host}/api/ranking/daily`,
    params: {
      period: params.period || 'day',
      limit: params.limit || 10,
    },
  }).then((res: any) => {
    // 处理 AjaxResult 包装的响应
    if (res.code === 200) {
      return res.data as DailyRankingResponse
    }
    else {
      throw new Error(res.msg || '获取日租排行榜失败')
    }
  })
}

/**
 * 获取月租排行榜
 */
export function getMonthlyRanking(params: {
  period?: string
  limit?: number
} = {}) {
  return request.get({
    url: `${host}/api/ranking/monthly`,
    params: {
      period: params.period || 'month',
      limit: params.limit || 10,
    },
  }).then((res: any) => {
    // 处理 AjaxResult 包装的响应
    if (res.code === 200) {
      return res.data as MonthlyRankingResponse
    }
    else {
      throw new Error(res.msg || '获取月租排行榜失败')
    }
  })
}

/**
 * 获取完整排行榜
 */
export function getFullRanking(params: {
  type: 'daily' | 'monthly'
  period?: string
  page?: number
  size?: number
}) {
  return request.get({
    url: `${host}/api/ranking/full`,
    params: {
      type: params.type,
      period: params.period || (params.type === 'daily' ? 'day' : 'month'),
      page: params.page || 1,
      size: params.size || 20,
    },
  }).then((res: any) => {
    // 处理 AjaxResult 包装的响应
    if (res.code === 200) {
      return res.data as FullRankingResponse
    }
    else {
      throw new Error(res.msg || '获取完整排行榜失败')
    }
  })
}

/**
 * 获取榜单统计信息
 */
export function getRankingStatistics() {
  return request.get({
    url: `${host}/api/ranking/statistics`,
  }).then((res: any) => {
    // 处理 AjaxResult 包装的响应
    if (res.code === 200) {
      return res.data as RankingStatistics
    }
    else {
      throw new Error(res.msg || '获取榜单统计信息失败')
    }
  })
}
