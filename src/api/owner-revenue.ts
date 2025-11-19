import { host, request } from '@/utils/request'

// 车主收益概览数据接口
export interface OwnerRevenueSummary {
  availableBalance: number
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  vehicleStats: {
    totalVehicles: number
    availableVehicles: number
    rentedVehicles: number
    todayOrders: number
    monthlyOrders: number
  }
}

// 车主车辆统计数据接口
export interface OwnerVehicleStats {
  vehicleId: number
  name: string
  brand: string
  model: string
  licensePlate: string
  imageUrl: string
  carType: string
  energyType: string
  seats: number
  status: string
  statusText: string
  dailyPrice: number
  monthlyPrice?: number
  rating: number
  ratingCount: number
  rangeKm?: number
  deliveryEnabled: boolean
  operationType: string
  operationTypeText: string
  todayOrders: number
  monthlyOrders: number
  isMonthlyRental: boolean
  remainingTime?: string
}

// 收益记录数据接口
export interface OwnerRevenueRecord {
  revenueId: number
  orderId: number
  orderNo: string
  vehicleId: number
  userId: number
  settlementDate: string
  orderTotalAmount: number
  platformCommissionRate: number
  platformCommissionAmount: number
  ownerRevenueAmount: number
  finalRevenueAmount: number
  status: string
  settlementTime: string
  vehicleName?: string
  licensePlate?: string
  userNickname?: string
  userPhone?: string
  packageType?: string
  remark?: string

  // 分账相关字段
  profitSharingStatus?: string  // pending, processing, success, failed, not_required
  profitSharingTime?: string
  profitSharingOrderNo?: string
  profitSharingReceiverOpenid?: string
  profitSharingAmount?: number  // 实际分账金额（受30%限制）
  remainingWithdrawalAmount?: number  // 🆕 剩余待提现金额
  profitSharingFailureReason?: string
  profitSharingRetryCount?: number
  profitSharingMode?: string  // auto, manual, immediate
  expectedSharingDate?: string
  paymentOrderNo?: string
}

// 收益查询参数接口
export interface OwnerRevenueQueryParams {
  startDate?: string
  endDate?: string
  status?: string
  vehicleId?: number
  pageNum?: number
  pageSize?: number
}

// 车主首页数据接口
export interface OwnerHomeData {
  revenueData: {
    balance: number
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
      total: number
    }
  }
  vehicleList: OwnerVehicleStats[]
  orderStatistics: {
    ongoing: number
    todayNew: number
    monthlyCompleted: number
  }
}

/**
 * 获取车主首页全部数据
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerHomeData(): Promise<BaseRes<OwnerHomeData>> {
  return request.get({
    url: `${host}/owner/home/data`
  })
}

/**
 * 获取车主收益概览
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerRevenueSummary(): Promise<BaseRes<OwnerRevenueSummary>> {
  return request.get({
    url: `${host}/owner/revenue/summary`
  })
}

/**
 * 获取车主车辆统计列表
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerVehicleStats(): Promise<BaseRes<OwnerVehicleStats[]>> {
  return request.get({
    url: `${host}/owner/revenue/vehicles`
  })
}

/**
 * 分页查询收益记录
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerRevenueRecords(params: OwnerRevenueQueryParams): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/owner/revenue/records`,
    data: params
  })
}

/**
 * 获取收益趋势数据
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerRevenueTrend(days: number = 30): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/owner/revenue/trend`,
    params: { days }
  })
}

/**
 * 获取车主余额信息
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerBalance(): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/balance`
  })
}

/**
 * 获取车主车辆概况统计
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerVehicleSummary(): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/vehicle-summary`
  })
}

/**
 * 获取车主订单统计
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerOrderStats(): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/order-stats`
  })
}