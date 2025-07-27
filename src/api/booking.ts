import { host, request } from '@/utils/request'

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
}

export interface BookingResponse {
  orderId: number
  orderNo: string
  status: string
  totalAmount: number
  finalAmount: number
  payData: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

// 创建预订
export function createBooking(data: BookingRequest, openId: string): Promise<BaseRes<BookingResponse>> {
  return request.post({
    url: `${host}/api/bookings?openId=${openId}`,
    data,
  })
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

// 微信支付相关接口
export interface WxPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 查询支付状态
export function queryPaymentStatus(orderNo: string): Promise<BaseRes<{
  tradeState: string
  tradeStateDesc: string
  transactionId?: string
  outTradeNo: string
  totalFee: number
  timeEnd?: string
}>> {
  return request.get({
    url: `${host}/api/wx/pay/query/${orderNo}`,
  })
}

// 调用微信支付
export function requestWxPayment(payData: WxPayParams): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      appId: payData.appId,
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: payData.signType,
      paySign: payData.paySign,
      success: () => {
        console.log('支付成功')
        resolve()
      },
      fail: (error: any) => {
        console.error('支付失败', error)
        reject(error)
      },
    })
  })
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
