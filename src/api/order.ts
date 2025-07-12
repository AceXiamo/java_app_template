import { host, request } from '@/utils/request'

// 基础响应类型
export interface BaseRes<T = any> {
  code: number
  message: string
  data: T
}

// 订单列表查询参数
export interface OrderListParams {
  status?: string
  page?: number
  size?: number
}

// 车辆信息
export interface VehicleInfo {
  name: string
  imageUrl: string
  type: string
}

// 租期信息
export interface RentPeriod {
  startTime: string
  endTime: string
  days: number
}

// 取消信息
export interface CancelInfo {
  reason: string
  cancelTime: string
}

// 订单操作按钮
export interface OrderAction {
  type: string
  text: string
  style: 'primary' | 'secondary' | 'outline'
}

// 订单数据
export interface OrderData {
  id: string
  orderNumber: string
  status: string
  statusText: string
  statusColor: string
  vehicle: VehicleInfo
  rentPeriod: RentPeriod
  location: string
  amount: number
  pickupCode?: string
  remainingTime?: string
  cancelInfo?: CancelInfo
  actions: OrderAction[]
}

// 状态统计
export interface StatusCounts {
  all: number
  ongoing: number
  completed: number
  cancelled: number
}

// 订单列表响应
export interface OrderListResponse {
  total: number
  statusCounts: StatusCounts
  orders: OrderData[]
}

// 搜索订单响应
export interface SearchOrderResponse {
  total: number
  orders: OrderData[]
}

// 续租请求参数
export interface RenewOrderParams {
  extendDays: number
  newEndTime: string
}

// 续租响应
export interface RenewOrderResponse {
  orderId: string
  additionalAmount: number
  newEndTime: string
  paymentUrl: string
}

// 车主联系信息
export interface OwnerInfo {
  name: string
  phone: string
  avatar: string
}

// 联系方式
export interface ContactMethod {
  type: string
  label: string
  action: string
}

// 联系车主响应
export interface ContactOwnerResponse {
  owner: OwnerInfo
  contactMethods: ContactMethod[]
}

// 评价请求参数
export interface ReviewOrderParams {
  rating: number
  comment: string
  tags: string[]
}

// 评价响应
export interface ReviewOrderResponse {
  reviewId: number
  points: number
  couponReward: {
    name: string
    amount: number
    expiryDate: string
  }
}

// 重新预订请求参数
export interface RebookOrderParams {
  newStartTime: string
  newEndTime: string
}

// 重新预订响应
export interface RebookOrderResponse {
  newOrderId: string
  vehicleId: number
  amount: number
  paymentUrl: string
}

// 取消订单请求参数
export interface CancelOrderParams {
  reason: string
  description: string
}

// 取消订单响应
export interface CancelOrderResponse {
  refundAmount: number
  refundReason: string
  refundTime: string
}

// 位置信息
export interface LocationInfo {
  latitude: number
  longitude: number
  address: string
}

// 创建订单请求参数
export interface CreateOrderParams {
  vehicleId: number
  startTime: string
  endTime: string
  days: number
  pickupLocation: LocationInfo
  returnLocation: LocationInfo
  couponId?: number
  specialRequests?: string
}

// 订单定价信息
export interface OrderPricing {
  dailyRent: number
  serviceFee: number
  insurance: number
  couponDiscount: number
  deposit: number
  totalAmount: number
  payableAmount: number
}

// 创建订单响应
export interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  status: string
  pricing: OrderPricing
  paymentUrl: string
  expireTime: string
}

/**
 * 获取用户订单列表
 */
export function getUserOrders(params: OrderListParams): Promise<BaseRes<OrderListResponse>> {
  return request.get({
    url: `${host}/api/orders/list`,
    params,
  })
}

/**
 * 搜索订单
 */
export function searchOrders(keyword: string): Promise<BaseRes<SearchOrderResponse>> {
  return request.get({
    url: `${host}/api/orders/search`,
    params: { keyword },
  })
}

// 订单详情数据
export interface OrderDetail {
  id: string | number
  orderNumber: string
  status: string
  statusText: string
  amount: number
  finalAmount: number
  discountAmount: number
  deliveryFee: number
  vehicle: {
    id: number
    name: string
    brand: string
    model: string
    licensePlate: string
    imageUrl: string
    seats: number
    energyType: string
    carType: string
    rating: number
    ratingCount: number
  }
  rentPeriod: {
    startTime: string
    endTime: string
    days: number
  }
  location: string
  pickupMethod: 'self' | 'delivery'
  deliveryAddress: string
  pickupCode: string
  remainingTime: string
  paymentInfo: {
    payTime: string
    payMethod: string
    transactionId: string
  }
  createTime: string
  updateTime: string
  remark: string
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId: string | number): Promise<BaseRes<OrderDetail>> {
  return request.get({
    url: `${host}/api/orders/${orderId}/detail`,
  })
}

/**
 * 续租订单
 */
export function renewOrder(orderId: number, extendDays: number, newEndTime: string): Promise<BaseRes<RenewOrderResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/renew`,
    data: {
      extendDays,
      newEndTime,
    },
  })
}

/**
 * 联系车主
 */
export function contactOwner(orderId: number, message: string): Promise<BaseRes<ContactOwnerResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/contact`,
    data: { message },
  })
}

/**
 * 评价订单
 */
export function reviewOrder(orderId: number, rating: number, comment: string, tags: string[]): Promise<BaseRes<ReviewOrderResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/review`,
    data: {
      rating,
      comment,
      tags,
    },
  })
}

/**
 * 重新预订
 */
export function rebookOrder(orderId: number, newStartTime: string, newEndTime: string): Promise<BaseRes<RebookOrderResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/rebook`,
    data: {
      newStartTime,
      newEndTime,
    },
  })
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: string | number, reason: string, description: string): Promise<BaseRes<CancelOrderResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/cancel`,
    data: {
      reason,
      description,
    },
  })
}

/**
 * 创建订单
 */
export function createOrder(params: CreateOrderParams): Promise<BaseRes<CreateOrderResponse>> {
  return request.post({
    url: `${host}/api/orders/create`,
    data: params,
  })
}