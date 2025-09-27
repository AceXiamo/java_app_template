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

  // 验车信息
  pickup_mileage?: number
  pickup_battery_level?: number
  pickup_fuel_photo?: string
  pickup_vehicle_photos?: string[]

  // 验证照片
  pickup_verification_photos?: string[]
  return_verification_photos?: string[]

  // 押金信息
  deposit_amount?: number
  deposit_type?: string
  deposit_wechat_pay_status?: string
  deposit_payment_time?: string
  deposit_wechat_transaction_id?: string

  // 合同签署信息
  contract_signed?: boolean
  contract_sign_time?: string

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
      pageSize: params.pageSize || 20,
    },
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
      orderNo,
    },
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
      orderNo,
    },
  })
}

// 取车验证请求参数接口
export interface PickupVerifyRequest {
  /** 用车人身份证人像照片URL */
  driverIdCardPhoto: string
  /** 用车人驾驶证照片URL */
  driverLicensePhoto: string
  /** 取车里程数（公里） */
  pickupMileage: number
  /** 取车电量百分比（0-100），电动车必填 */
  pickupBatteryLevel?: number
  /** 取车油表照片URL，燃油车必填 */
  pickupFuelPhoto?: string
  /** 取车时车辆各方位照片数组，至少4张 */
  pickupVehiclePhotos: string[]
  /** 取车验证照片数组，至少1张 */
  verificationPhotos: string[]
  /** 押金类型：alipay_credit支付宝免押 | wechat_pay微信支付 */
  depositType: 'alipay_credit' | 'wechat_pay'
  /** 实际收取押金金额 */
  depositAmount: number
  /** 押金微信支付状态，微信支付时必填 */
  depositWechatPayStatus?: 'pending' | 'paid' | 'failed'
  /** 合同是否已签署 */
  contractSigned: boolean
  /** 合同签署时间 */
  contractSignTime?: string
  /** 备注信息 */
  remark?: string
}

// 押金处理结果
export interface DepositResult {
  /** 押金类型 */
  depositType: string
  /** 押金金额 */
  depositAmount: number
  /** 押金状态 */
  depositStatus: string
  /** 押金状态描述 */
  depositStatusText: string
  /** 押金支付时间 */
  depositPaymentTime?: string
  /** 微信支付状态（仅微信支付） */
  wechatPayStatus?: string
}

// 合同签署状态
export interface ContractStatus {
  /** 是否已签署 */
  signed: boolean
  /** 签署时间 */
  signTime?: string
  /** 签署状态描述 */
  statusText: string
}

// 车辆状态记录
export interface VehicleStatus {
  /** 取车里程数 */
  pickupMileage: number
  /** 取车电量（电动车） */
  pickupBatteryLevel?: number
  /** 能源类型 */
  energyType: string
  /** 车辆照片数量 */
  vehiclePhotosCount: number
  /** 验证照片数量 */
  verificationPhotosCount: number
  /** 状态记录时间 */
  recordTime: string
}

// 取车验证响应接口
export interface PickupVerifyResponse {
  /** 订单ID */
  orderId: number
  /** 订单号 */
  orderNo: string
  /** 订单状态 */
  status: string
  /** 状态描述 */
  statusText: string
  /** 实际开始时间 */
  actualStartTime: string
  /** 还车码 */
  returnCode: string
  /** 提示消息 */
  message: string
  /** 押金处理结果 */
  depositResult: DepositResult
  /** 合同签署状态 */
  contractStatus: ContractStatus
  /** 车辆状态记录 */
  vehicleStatus: VehicleStatus
}

/**
 * 取车验证 - 完整的取车验证流程
 */
export function pickupVerify(orderId: number, data: PickupVerifyRequest): Promise<BaseRes<PickupVerifyResponse>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/pickup-verify`,
    data,
  })
}

/**
 * 还车验证 - 用户上传还车照片
 */
export function returnVerify(orderId: number, photos: string[]): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/return-verify`,
    data: {
      photos,
    },
  })
}

/**
 * 获取合同签署状态
 */
export function getContractStatus(orderId: number): Promise<BaseRes<ContractStatus>> {
  return request.get({
    url: `${host}/api/orders/${orderId}/contract-status`,
  })
}

/**
 * 提交合同签署
 */
export function submitContractSignature(orderId: number, signature: string): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/contract-sign`,
    data: {
      signature,
      signTime: new Date().toISOString(),
    },
  })
}

/**
 * 获取押金支付二维码
 */
export function getDepositQRCode(orderId: number): Promise<BaseRes<{ qrCodeUrl: string; amount: number }>> {
  return request.get({
    url: `${host}/api/orders/${orderId}/deposit-qrcode`,
  })
}

/**
 * 获取押金状态信息
 */
export function getDepositStatus(orderId: number): Promise<BaseRes<{
  depositAmount: number
  depositType: string
  depositWechatPayStatus: string
  depositPaymentTime: string
  depositWechatTransactionId: string
  statusText: string
  statusType: 'pending' | 'paid' | 'failed'
}>> {
  return request.get({
    url: `${host}/api/orders/${orderId}/deposit-status`,
  })
}

/**
 * 确认订单完成 - 车主/平台方使用
 */
export function confirmOrderCompletion(orderId: number, completedBy: string, remark?: string): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/api/orders/${orderId}/complete`,
    data: {
      completedBy,
      remark,
    },
  })
}
