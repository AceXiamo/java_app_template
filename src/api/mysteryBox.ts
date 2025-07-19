// 百元盲盒相关 API
import { host, request } from '@/utils/request'

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
  payData?: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
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

// API 接口
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
  location: {
    latitude: number
    longitude: number
    address: string
  }
}) {
  return request.post({
    url: `${host}/api/mystery-box/pricing`,
    data: params,
  })
}

// 创建盲盒订单
export function createMysteryBoxOrder(params: {
  preferences: {
    energyType: string
    carType: string
  }
  rentalInfo: {
    startTime: string
  }
  location: {
    latitude: number
    longitude: number
    address: string
  }
}) {
  return request.post({
    url: `${host}/api/mystery-box/create-order`,
    data: params,
  })
}

// 获取盲盒配置（通用接口）
export function getMysteryBoxConfig() {
  return request.get({
    url: `${host}/api/mysterybox/config`,
  })
}

// 购买盲盒（通用接口）
export function purchaseMysteryBox(params: {
  energyType: string
  carType: string
  days: number
  location: string
}) {
  return request.post({
    url: `${host}/api/mysterybox/purchase`,
    data: params,
  })
}
