import { host, request } from '@/utils/request'

// 车主订单数据接口
export interface OwnerOrder {
  orderId: number
  orderNo: string
  userId: number
  vehicleId: number
  ownerId: number
  startTime: string
  endTime: string
  actualStartTime?: string
  actualEndTime?: string
  pickupDeadline?: string
  rentalDays: number
  totalAmount: number
  finalAmount: number
  deliveryFee?: number
  pickupCode?: string
  returnCode?: string
  pickupLocation: string
  deliveryAddress?: string
  deliveryDistance?: number
  deliveryLatitude?: number
  deliveryLongitude?: number
  returnLocation?: string
  status: string
  statusText?: string
  orderType: string
  pickupMethod: string
  isRenewable: boolean
  createTime: string
  updateTime: string
  
  // 扩展字段
  vehicleName?: string
  licensePlate?: string
  userNickname?: string
  userPhone?: string
  userAvatar?: string
  ownerNickname?: string
  ownerPhone?: string
  vehicle?: {
    vehicleId: number
    name: string
    brand: string
    model: string
    licensePlate: string
    carType: string
    energyType: string
    seats: number
    imageUrl: string
    rating: number
    ratingCount: number
  }
  user?: {
    name: string
    phone: string
    avatar: string
  }
}

// 订单查询参数接口
export interface OwnerOrderQueryParams {
  status?: string
  orderType?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 获取车主订单列表
 * 使用车主专用API，后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerOrders(params: OwnerOrderQueryParams): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/owner/orders/list`,
    params: {
      status: params.status || 'all',
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20
    }
  })
}

/**
 * 获取车主订单详情
 * 后端通过 SecurityUtils 自动获取当前用户ID，只能查看自己车辆的订单详情
 */
export function getOwnerOrderDetail(orderNo: string): Promise<BaseRes<OwnerOrder>> {
  return request.get({
    url: `${host}/owner/orders/detail`,
    params: { 
      orderNo
    }
  })
}

/**
 * 获取车主订单时间线
 * 后端通过 SecurityUtils 自动获取当前用户ID，只能查看自己车辆的订单时间线
 */
export function getOrderTimeline(orderNo: string): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/owner/orders/timeline`,
    params: { 
      orderNo
    }
  })
}

/**
 * 订单操作 - 确认取车
 */
export function confirmPickup(params: {
  orderNo: string
  pickupCode: string
  photos: string[]
  location?: {
    latitude: number
    longitude: number
    address: string
  }
}): Promise<BaseRes<string>> {
  return request.post({
    url: `${host}/owner/order/confirm-pickup`,
    data: params
  })
}

/**
 * 订单操作 - 确认还车
 */
export function confirmReturn(params: {
  orderNo: string
  returnCode: string
  photos: string[]
  location?: {
    latitude: number
    longitude: number
    address: string
  }
}): Promise<BaseRes<string>> {
  return request.post({
    url: `${host}/owner/order/confirm-return`,
    data: params
  })
}