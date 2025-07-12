import { host, request } from '@/utils/request'

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
  deliveryServices: {
    carWash: boolean
    detailing: boolean
  }
  couponId?: number
  totalAmount: number
  finalAmount: number
  discountAmount: number
  remarks?: string
}

export interface BookingResponse {
  orderId: string
  orderNo: string
  status: string
  paymentAmount: number
  paymentUrl?: string
}

// 创建预订
export function createBooking(data: BookingRequest): Promise<BaseRes<BookingResponse>> {
  return request.post({
    url: `${host}/api/bookings`,
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
  couponId?: number
}): Promise<BaseRes<{
  basePrice: number
  deliveryFee: number
  servicesFee: number
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