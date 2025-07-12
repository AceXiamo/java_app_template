import { host, request } from '@/utils/request'

// 优惠券接口
export interface Coupon {
  couponId: number
  title: string
  description: string
  discountType: 'amount' | 'percentage' // 金额券或折扣券
  discountAmount: number // 优惠金额
  discountRate?: number // 折扣比例（如0.9表示9折）
  minOrderAmount: number // 最低消费金额
  maxDiscountAmount?: number // 最大优惠金额（折扣券用）
  validFrom: string
  validTo: string
  isUsed: boolean
  applicableVehicleTypes?: string[] // 适用车型
  applicableOperationTypes?: ('platform' | 'owner')[] // 适用运营类型
}

// 获取用户可用优惠券
export function getAvailableCoupons(params: {
  vehicleId: number
  startTime: string
  endTime: string
  totalAmount: number
}): Promise<BaseRes<Coupon[]>> {
  return request.post({
    url: `${host}/api/coupons/available`,
    data: params,
  })
}

// 应用优惠券（计算优惠金额）
export function applyCoupon(params: {
  couponId: number
  vehicleId: number
  startTime: string
  endTime: string
  totalAmount: number
}): Promise<BaseRes<{
  discountAmount: number
  finalAmount: number
}>> {
  return request.post({
    url: `${host}/api/coupons/apply`,
    data: params,
  })
}