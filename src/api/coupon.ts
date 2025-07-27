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

// 用户优惠券信息接口
export interface UserCoupon {
  userCouponId: number
  userId: number
  templateId: number
  couponCode: string
  couponName: string
  couponType: string
  discountAmount: number
  discountRate?: number
  minAmount: number
  applicableType: string
  status: 'available' | 'used' | 'expired'
  source: string
  redeemCode?: string
  usedOrderId?: string
  usedTime?: string
  expireTime: string
  createTime: string
}

// 优惠券统计信息
export interface CouponStats {
  available: number
  used: number
  expired: number
}

// 兑换优惠券请求参数
export interface RedeemCouponRequest {
  redeemCode: string
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

// ===== 用户优惠券管理 API =====

// 获取用户优惠券列表
export function getUserCoupons(params: {
  status?: 'available' | 'used' | 'expired'
  pageNum?: number
  pageSize?: number
}): Promise<{
    code: number
    msg: string
    rows: UserCoupon[]
    total: number
  }> {
  return request.get({
    url: `${host}/api/user/coupons`,
    data: params,
  })
}

// 获取优惠券统计信息
export function getCouponStats(): Promise<BaseRes<CouponStats>> {
  return request.get({
    url: `${host}/api/user/coupons/stats`,
  })
}

// 通过兑换码兑换优惠券
export function redeemCoupon(data: RedeemCouponRequest): Promise<BaseRes<UserCoupon>> {
  return request.post({
    url: `${host}/api/user/coupons/redeem`,
    data,
  })
}

// 获取优惠券详情
export function getCouponDetail(userCouponId: number): Promise<BaseRes<UserCoupon>> {
  return request.get({
    url: `${host}/api/user/coupons/${userCouponId}`,
  })
}
