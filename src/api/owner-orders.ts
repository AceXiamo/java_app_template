import { host, request } from '@/utils/request'

// 车主订单详情数据接口 - 匹配后端API的snake_case命名
export interface OwnerOrderDetail {
  order_id: number
  order_no: string
  user_id: number
  vehicle_id: number
  owner_id: number
  status: string
  statusText: string
  order_type: string
  
  // 时间信息
  start_time: string
  end_time: string
  actual_start_time?: string
  actual_end_time?: string
  pickup_deadline?: string
  rental_days: number
  create_time: string
  
  // 价格信息
  daily_price?: number
  monthly_price?: number
  total_amount: number
  discount_amount?: number
  delivery_fee?: number
  late_pickup_fee?: number
  overtime_fee?: number
  final_amount: number
  
  // 地点和配送信息
  pickup_method: string
  pickup_location?: string
  delivery_address?: string
  delivery_distance?: number
  
  // 验证码信息
  pickup_code?: string
  return_code?: string
  
  // 支付信息
  payment_time?: string
  payment_method?: string
  wechat_transaction_id?: string
  
  // 其他信息
  dispute_status?: string
  remark?: string
  
  // 车辆信息
  vehicle?: {
    vehicle_id: number
    name: string
    brand: string
    model: string
    license_plate: string
    image_url: string
    car_type: string
    energy_type: string
    seats: number
    rating: number
    rating_count: number
    operation_type: string
    operation_type_text: string
  }
  
  // 用户信息（脱敏）
  user?: {
    user_id: number
    nickname: string
    avatar: string
    real_name: string
    gender: string
    age?: number
    phone: string
  }
  
  // 验证照片
  pickup_verification_photos?: string[]
  return_verification_photos?: string[]
  
  // 保险信息
  insurance?: Array<{
    product_id: number
    product_name: string
    price: number
    coverage_amount: number
    coverage_description: string
  }>
  
  // 增值服务信息
  services?: Array<{
    service_id: number
    service_name: string
    price: number
    quantity: number
    total_amount: number
    description: string
  }>
  
  // 费用汇总
  insurance_fee?: number
  service_fee?: number
}

// 车主订单列表数据接口
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
  
  // 扩展字段 - 匹配后端返回的字段
  vehicleName?: string
  vehicleImage?: string // 车辆图片
  licensePlate?: string
  carType?: string // 车型
  energyType?: string // 能源类型
  seats?: number // 座位数
  rating?: number // 评分
  ratingCount?: number // 评价数量
  userNickname?: string
  userPhone?: string
  userAvatar?: string
  userGender?: string
  ownerNickname?: string
  ownerPhone?: string
  vehicleOperationType?: string // 运营类型
  isOwnerOperation?: boolean // 是否车主运营
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
export function getOwnerOrderDetail(orderNo: string): Promise<BaseRes<OwnerOrderDetail>> {
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
 * 取车验证 - 车主/平台管理员上传取车照片
 */
export function pickupVerify(orderId: number, photos: string[]): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/pickup-verify`,
    data: {
      photos
    }
  })
}

/**
 * 还车验证 - 用户上传还车照片
 */
export function returnVerify(orderId: number, photos: string[]): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/return-verify`,
    data: {
      photos
    }
  })
}