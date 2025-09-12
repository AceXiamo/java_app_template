import { host, request } from '@/utils/request'
import { createPaymentParams, getCurrentPayType, getUserPaymentId, processPaymentResponse, requestPlatformPayment } from '@/utils/payment'
import type { PayPlatformType, UnifiedPayParams } from '@/utils/platform'

// 保险产品接口
export interface InsuranceProduct {
  productId: string
  productName: string
  price: number
  coverageAmount: number
  coverageDescription: string
  isDefault: boolean
  status: string
  sortOrder: number
  createTime: string
  updateTime: string
}

// 增值服务接口
export interface ValueAddedService {
  serviceId: string
  serviceName: string
  price: number
  description: string
  status: string
  sortOrder: number
  createTime: string
  updateTime: string
}

// 预订接口
export interface BookingRequest {
  vehicleId: number
  startTime: string
  endTime: string
  pickupMethod: 'self' | 'delivery' // 自取或送车
  pickupLocation?: string // 自取地址
  deliveryAddress?: string // 送车地址
  deliveryLatitude?: number
  deliveryLongitude?: number
  deliveryDistance?: number // 送车距离
  deliveryServices?: {
    carWash: boolean
    detailing: boolean
  }
  userCouponId?: number
  totalAmount: number
  finalAmount: number
  discountAmount?: number
  remarks?: string
  // 新增保险和服务字段
  insuranceProductId?: string
  selectedServices?: string[]
  // 双平台支付参数
  paymentMethod?: PayPlatformType // 可选，默认根据平台自动选择
  payType?: PayPlatformType // 兼容后端接口
}

export interface BookingResponse {
  orderId: number
  orderNo: string
  status: string
  totalAmount: number
  finalAmount: number
  payData: UnifiedPayParams // 支持双平台支付数据
}

// 创建预订 - 支持双平台支付
export function createBooking(data: BookingRequest, openId?: string): Promise<BaseRes<BookingResponse>> {
  // 自动添加支付参数
  const paymentParams = createPaymentParams({
    ...data,
    paymentMethod: data.paymentMethod || getCurrentPayType(),
    payType: data.payType || getCurrentPayType(),
  })
  
  return request.post({
    url: `${host}/api/bookings`,
    data: paymentParams,
    params: {
      openId: openId || getUserPaymentId(), // 自动获取用户支付ID
    },
  })
}

// 创建预订 - 兼容旧版本接口
export function createBookingLegacy(data: BookingRequest, openId: string): Promise<BaseRes<BookingResponse>> {
  return createBooking(data, openId)
}

// 计算预订费用
export function calculateBookingPrice(params: {
  vehicleId: number
  startTime: string
  endTime: string
  pickupMethod: 'self' | 'delivery'
  deliveryLatitude?: number
  deliveryLongitude?: number
  deliveryServices?: {
    carWash: boolean
    detailing: boolean
  }
  userCouponId?: number
  insuranceProductId?: string
  selectedServices?: string[]
}): Promise<BaseRes<{
    basePrice: number
    deliveryFee: number
    servicesFee: number
    insuranceFee: number
    totalAmount: number
    discountAmount: number
    finalAmount: number
    rentalDays: number
  }>> {
  return request.post({
    url: `${host}/api/bookings/calculate-price`,
    data: params,
  })
}

// 微信支付相关接口 - 兼容旧版本
export interface WxPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 查询支付状态 - 支持双平台
export function queryPaymentStatus(orderNo: string): Promise<BaseRes<{
  tradeState: string
  tradeStateDesc: string
  transactionId?: string
  outTradeNo: string
  totalFee: number
  timeEnd?: string
}>> {
  const payType = getCurrentPayType()
  return request.get({
    url: `${host}/api/${payType}/pay/query/${orderNo}`,
  })
}

// 统一支付接口 - 自动识别平台
export async function requestBookingPayment(paymentData: UnifiedPayParams | BookingResponse): Promise<void> {
  let processedPayData: UnifiedPayParams
  
  // 如果是预订响应数据，提取支付数据
  if ('payData' in paymentData) {
    processedPayData = processPaymentResponse({ data: paymentData.payData })
  } else {
    processedPayData = paymentData
  }
  
  const result = await requestPlatformPayment(processedPayData)
  if (!result.success) {
    throw new Error(result.message)
  }
}

// 调用微信支付 - 兼容旧版本
export async function requestWxPayment(payData: WxPayParams): Promise<void> {
  await requestBookingPayment(payData)
}

// 获取保险产品列表
export function getInsuranceProducts(): Promise<BaseRes<Record<string, InsuranceProduct>>> {
  return request.get({
    url: `${host}/api/bookings/insurance-products`,
  })
}

// 获取增值服务列表
export function getValueAddedServices(): Promise<BaseRes<Record<string, ValueAddedService>>> {
  return request.get({
    url: `${host}/api/bookings/value-added-services`,
  })
}
