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
}

// 收益查询参数接口
export interface OwnerRevenueQueryParams {
  ownerId: number
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
 */
export function getOwnerHomeData(ownerId: number): Promise<BaseRes<OwnerHomeData>> {
  return request.get({
    url: `${host}/owner/home/data`,
    params: { ownerId }
  })
}

/**
 * 获取车主收益概览
 */
export function getOwnerRevenueSummary(ownerId: number): Promise<BaseRes<OwnerRevenueSummary>> {
  return request.get({
    url: `${host}/owner/revenue/summary`,
    params: { ownerId }
  })
}

/**
 * 获取车主车辆统计列表
 */
export function getOwnerVehicleStats(ownerId: number): Promise<BaseRes<OwnerVehicleStats[]>> {
  return request.get({
    url: `${host}/owner/revenue/vehicles`,
    params: { ownerId }
  })
}

/**
 * 分页查询收益记录
 */
export function getOwnerRevenueRecords(params: OwnerRevenueQueryParams): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/owner/revenue/records`,
    data: params
  })
}

/**
 * 获取收益趋势数据
 */
export function getOwnerRevenueTrend(ownerId: number, days: number = 30): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/owner/revenue/trend`,
    params: { ownerId, days }
  })
}

/**
 * 获取车主余额信息
 */
export function getOwnerBalance(ownerId: number): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/balance`,
    params: { ownerId }
  })
}

/**
 * 获取车主车辆概况统计
 */
export function getOwnerVehicleSummary(ownerId: number): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/vehicle-summary`,
    params: { ownerId }
  })
}

/**
 * 获取车主订单统计
 */
export function getOwnerOrderStats(ownerId: number): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/revenue/order-stats`,
    params: { ownerId }
  })
}