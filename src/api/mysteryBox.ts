// 百元盲盒相关 API
import { host, request } from '@/utils/request'
import { createPaymentParams, getCurrentPayType, getUserPaymentId, processPaymentResponse, requestPlatformPayment } from '@/utils/payment'
import type { PayPlatformType, UnifiedPayParams } from '@/utils/platform'

// 盲盒活动信息
export interface MysteryBoxActivity {
  id: number
  title: string
  subtitle: string
  description: string
  status: string
  startPrice: number
  badgeText: string
  badgeColor: string
  benefits: string[]
  features: string[]
}

// 能源类型选项
export interface EnergyTypeOption {
  type: string
  name: string
  description: string
  icon: string
  color: string
  isRecommended: boolean
}

// 车型类别选项
export interface CarTypeOption {
  type: string
  name: string
  description: string
  icon: string
  color: string
  isRecommended: boolean
}

// 盲盒选项配置
export interface MysteryBoxOptions {
  energyTypes: EnergyTypeOption[]
  carTypes: CarTypeOption[]
}

// 价格信息
export interface MysteryBoxPricing {
  basePrice: number
  finalPrice: number
  availableCount: number
  estimatedValue: {
    min: number
    max: number
  }
  pricing: {
    rentalDays: number
    unit: string
    pricePerDay: number
  }
  preferences: {
    energyType: string
    energyTypeName: string
    carType: string
    carTypeName: string
  }
  possibleBrands: string[]
}

// 盲盒订单
export interface MysteryBoxOrder {
  orderId: number
  orderNo: string
  mysteryBoxId: string
  pickupCode: string
  status: string
  orderType: string
  pricing: {
    totalAmount: number
    finalAmount: number
    discountAmount: number
  }
  preferences: {
    energyType: string
    energyTypeName: string
    carType: string
    carTypeName: string
  }
  rentalInfo: {
    startTime: string
    endTime: string
    rentalDays: number
    pickupLocation: string
  }
  mysteryVehicle: {
    isRevealed: boolean
    revealMessage: string
    canExchange: boolean
    exchangeTimeLimit: number
  }
  features: string[]
  payData?: UnifiedPayParams // 支持双平台支付数据
}

// 盲盒配置（通用接口）
export interface MysteryBoxConfig {
  basePrice: number
  energyTypes: Array<{
    value: string
    label: string
    description: string
  }>
  carTypes: Array<{
    value: string
    label: string
    description: string
  }>
  features: string[]
}

// =================================
// 盲盒信息查询API
// =================================

// 获取盲盒活动信息
export function getMysteryBoxActivity() {
  return request.get({
    url: `${host}/api/mystery-box/activity`,
  })
}

// 获取盲盒选项配置
export function getMysteryBoxOptions() {
  return request.get({
    url: `${host}/api/mystery-box/options`,
  })
}

// 获取盲盒价格信息
export function getMysteryBoxPricing(params: {
  energyType: string
  carType: string
}) {
  return request.post({
    url: `${host}/api/mystery-box/pricing`,
    data: params,
  })
}

// 创建盲盒订单 - 支持双平台支付
export function createMysteryBoxOrder(params: {
  preferences: {
    energyType: string
    carType: string
  }
  rentalInfo: {
    startTime: string
  }
  paymentMethod?: PayPlatformType // 可选，默认根据平台自动选择
  payType?: PayPlatformType // 兼容后端接口
}) {
  // 自动添加支付参数
  const paymentParams = createPaymentParams({
    ...params,
    paymentMethod: params.paymentMethod || getCurrentPayType(),
    payType: params.payType || getCurrentPayType(),
  })
  
  return request.post({
    url: `${host}/api/mystery-box/create-order`,
    data: paymentParams,
    params: {
      openId: getUserPaymentId(), // 自动获取用户支付ID
    },
  })
}

// 创建盲盒订单 - 兼容旧版本接口
export function createMysteryBoxOrderLegacy(params: {
  preferences: {
    energyType: string
    carType: string
  }
  rentalInfo: {
    startTime: string
  }
}) {
  return createMysteryBoxOrder(params)
}

// 获取盲盒配置（通用接口）
export function getMysteryBoxConfig() {
  return request.get({
    url: `${host}/api/mysterybox/config`,
  })
}

// 购买盲盒（通用接口）- 支持双平台支付
export function purchaseMysteryBox(params: {
  energyType: string
  carType: string
  days: number
  location: string
  paymentMethod?: PayPlatformType // 可选，默认根据平台自动选择
  payType?: PayPlatformType // 兼容后端接口
}) {
  // 自动添加支付参数
  const paymentParams = createPaymentParams({
    ...params,
    paymentMethod: params.paymentMethod || getCurrentPayType(),
    payType: params.payType || getCurrentPayType(),
  })
  
  return request.post({
    url: `${host}/api/mysterybox/purchase`,
    data: paymentParams,
    params: {
      openId: getUserPaymentId(), // 自动获取用户支付ID
    },
  })
}

// 购买盲盒 - 兼容旧版本接口
export function purchaseMysteryBoxLegacy(params: {
  energyType: string
  carType: string
  days: number
  location: string
}) {
  return purchaseMysteryBox(params)
}

// =================================
// 盲盒支付相关API
// =================================

// 统一盲盒支付接口 - 自动识别平台
export async function requestMysteryBoxPayment(paymentData: UnifiedPayParams | MysteryBoxOrder): Promise<void> {
  let processedPayData: UnifiedPayParams
  
  // 如果是盲盒订单数据，提取支付数据
  if ('payData' in paymentData && paymentData.payData) {
    processedPayData = processPaymentResponse({ data: paymentData.payData })
  } else {
    processedPayData = paymentData as UnifiedPayParams
  }
  
  const result = await requestPlatformPayment(processedPayData)
  if (!result.success) {
    throw new Error(result.message)
  }
}
