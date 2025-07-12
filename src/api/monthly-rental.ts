import { host, request } from '@/utils/request'

// 位置信息接口
export interface LocationInfo {
  latitude: number
  longitude: number
  address?: string
}

// 月租搜索参数
export interface MonthlyRentalSearchParams {
  location: LocationInfo
  rentalPeriod: number
  page?: number
  size?: number
}

// 价格计算参数
export interface PriceCalculateParams {
  vehicleId: number
  rentalPeriod: number
}

// 月租活动信息
export interface MonthlyRentalActivity {
  id: number
  title: string
  subtitle: string
  status: string
  startTime: string
  endTime: string
  minDays: number
  maxDiscount: number
  badgeText: string
  badgeColor: string
  benefits: string[]
}

// 车辆价格信息
export interface VehiclePricing {
  originalPrice: number
  discountPrice: number
  discountRate: number
  savings: number
  period: number
  unit: string
  dailyAverage?: number
}

// 车辆信息 - 与搜索页面兼容的格式
export interface MonthlyVehicle {
  vehicleId: number
  name: string
  brand: string
  carType: string
  energyType: string
  seats: number
  imageUrl: string
  distance: number
  rating: number
  ratingCount: number
  licensePlate: string
  dailyPrice: number
  monthlyPrice?: number
  rangeKm?: number
  tags: Array<{
    tagName: string
    tagType: string
  }>
}

// 租期选项
export interface PeriodOption {
  period: number
  label: string
  discountRate: number
  discountText: string
  isRecommended: boolean
  benefits: string[]
}

// API 响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 获取月租活动信息
 */
export function getActivityInfo(): Promise<ApiResponse<{
  activity: MonthlyRentalActivity
  rules: string[]
}>> {
  return request.get({
    url: `${host}/api/monthly-rental/activity`,
  })
}

/**
 * 获取月租车辆列表
 */
export function getMonthlyVehicles(params: MonthlyRentalSearchParams): Promise<ApiResponse<{
  total: number
  location: string
  rentalPeriod: number
  vehicles: MonthlyVehicle[]
}>> {
  return request.post({
    url: `${host}/api/monthly-rental/vehicles`,
    data: params,
  })
}

/**
 * 计算价格
 */
export function calculatePrice(params: PriceCalculateParams): Promise<ApiResponse<{
  vehicleId: number
  vehicleName: string
  rentalPeriod: number
  pricing: VehiclePricing
  benefits: string[]
}>> {
  return request.post({
    url: `${host}/api/monthly-rental/calculate-price`,
    data: params,
  })
}

/**
 * 获取租期选项
 */
export function getPeriodOptions(): Promise<ApiResponse<{
  options: PeriodOption[]
}>> {
  return request.get({
    url: `${host}/api/monthly-rental/period-options`,
  })
}

/**
 * 获取支持月租的车辆列表（通用接口）
 */
export function getMonthlyVehicleList(
  location?: string,
  days?: number,
  page: number = 1,
  size: number = 10
): Promise<ApiResponse<{
  vehicles: Array<{
    id: number
    name: string
    dailyPrice: number
    monthlyPrice: number
    originalPrice: number
    discount: number
    savings: number
    imageUrl: string
    tags: string[]
    distance: number
    rating: number
  }>
}>> {
  const params: any = { page, size }
  if (location) params.location = location
  if (days) params.days = days

  return request.get({
    url: `${host}/api/monthly-rental/vehicle-list`,
    data: params,
  })
}