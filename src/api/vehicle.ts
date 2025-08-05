import { host, request } from '@/utils/request'

// 车辆相关 API
export interface Vehicle {
  vehicleId: number
  name: string
  brand: string
  model: string
  year?: string // 年款（如：2020款）
  licensePlate: string // 车牌号
  carType: string // 轿车/SUV等
  energyType: string // 汽油/电动/混动
  seats: number
  dailyPrice: number
  monthlyPrice?: number
  imageUrl: string
  images: string[]
  rangeKm: number
  rating: number
  ratingCount: number
  isMonthlyRental: boolean
  distance?: number
  isHot?: boolean
  isNew?: boolean
  location: {
    address: string
    city: string
    district: string
    latitude: number
    longitude: number
  }
  tags: {
    tagName: string
    tagType: string
    tagColor: string
    tagIcon?: string
  }[]
  // 预订相关字段
  deliveryEnabled: boolean
  deliveryBaseFee: number
  deliveryFreeDistance: number
  deliveryPricePerKm: number
  maxDeliveryDistance: number
  operationType: 'platform' | 'owner' // platform: 平台自营, owner: 车主优选
  ownerNickname?: string // 车主昵称（仅当operationType为owner时有值）
}

export interface VehicleSearchParams {
  city: string
  startTime?: string
  endTime?: string
  keywords?: string
  vehicleTypes?: string[]
  energyTypes?: string[]
  minPrice?: number
  maxPrice?: number
  seats?: number[]
  sortBy?: 'price' | 'year' | 'hot'
  page?: number
  limit?: number
  latitude?: number
  longitude?: number
  categoryId?: number
}

export interface VehicleSearchResult {
  vehicles: Vehicle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface VehicleFilterOptions {
  brands: string[]
  carTypes: string[]
  energyTypes: string[]
  seats: number[]
  priceRange: [number, number]
}

// 一级分类（品牌）- 使用驼峰命名
export interface VehicleBrand {
  categoryId: number
  parentCategoryId?: number
  level: number
  categoryName: string
  categoryCode: string
  description?: string
  minPrice: number
  iconUrl?: string
  sortOrder: number
  isActive: boolean
}

// 二级分类（车型）- 使用下划线命名
export interface VehicleCategory {
  category_id: number
  parent_category_id?: number
  level: number
  category_name: string
  category_code: string
  description?: string
  min_price: number
  actual_min_price?: number  // 实际最低价格（从vehicle表联表查询得到）
  icon_url?: string
  gallery_images?: string   // 组图JSON字符串
  feature_tags?: string     // 特征标签JSON字符串
  sort_order: number
  is_active: boolean
  children?: VehicleCategory[]
  // 排序相关字段
  avg_rating?: number       // 平均评分
  review_count?: number     // 评价数量
  min_distance?: number     // 最近距离(km)
}

export interface VehicleTagType {
  label: string
  value: string
  color: string
}

export interface VehicleReview {
  reviewId: number
  orderId: number
  vehicleId: number
  userId: number
  rating: number
  content: string
  images: string[]
  tags: string[]
  isAnonymous: boolean
  status: string
  helpfulCount: number
  replyContent?: string
  replyTime?: string
  createTime: string
  updateTime: string
  userName?: string
  userAvatar?: string
}

// 搜索车辆
export function searchVehicles(params: VehicleSearchParams): Promise<BaseRes<VehicleSearchResult>> {
  return request.post({
    url: `${host}/api/vehicles/search`,
    data: params,
  })
}

// 车辆详情接口返回的数据结构
export interface VehicleDetail {
  vehicleId: number
  name: string
  brand: string
  model: string
  year?: string // 年款（如：2020款）
  licensePlate: string
  carType: string
  energyType: string
  seats: number
  dailyPrice: number
  monthlyPrice?: number
  imageUrl: string
  images: string[]
  rangeKm: number
  rating: number
  ratingCount: number
  isMonthlyRental: boolean
  distance?: number
  isHot?: boolean
  isNew?: boolean
  location: {
    address: string
    city: string
    district: string
    latitude?: number
    longitude?: number
  }
  tags: {
    tagName: string
    tagType: string
    tagColor: string
    tagIcon?: string
  }[]
  deliveryEnabled: boolean
  deliveryBaseFee: number
  deliveryFreeDistance: number
  deliveryPricePerKm: number
  maxDeliveryDistance: number
  operationType: 'platform' | 'owner'
  ownerNickname?: string // 车主昵称（仅当operationType为owner时有值）
}

// 获取车辆详情
export function getVehicleDetail(vehicleId: number): Promise<BaseRes<VehicleDetail>> {
  return request.get({
    url: `${host}/api/vehicles/${vehicleId}`,
  })
}

// 获取筛选条件
export function getVehicleFilters(): Promise<BaseRes<VehicleFilterOptions>> {
  return request.get({
    url: `${host}/api/vehicles/filter-options`,
  })
}

// 获取车辆分类
export function getVehicleCategories(): Promise<BaseRes<VehicleCategory[]>> {
  return request.get({
    url: `${host}/api/vehicles/categories`,
  })
}

// 获取主分类列表（层级为1的分类）- 小程序端
export function getParentCategories(): Promise<BaseRes<VehicleBrand[]>> {
  return request.get({
    url: `${host}/app/vehicle/category/brands`,
  })
}

// 获取指定父分类下的子分类列表 - 小程序端
export function getChildCategories(
  parentCategoryId: number,
  params?: {
    latitude?: number
    longitude?: number
    sortType?: string
  }
): Promise<BaseRes<VehicleCategory[]>> {
  return request.get({
    url: `${host}/app/vehicle/category/models/${parentCategoryId}`,
    params
  })
}

// 获取所有子分类列表（层级为2的分类）- 小程序端
export function getAllChildCategories(params?: {
  latitude?: number
  longitude?: number
  sortType?: string
}): Promise<BaseRes<VehicleCategory[]>> {
  return request.get({
    url: `${host}/app/vehicle/category/models`,
    params
  })
}

// 获取分类树形结构
export function getCategoryTree(): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/vehicle/category/tree`,
  })
}

// 获取车辆标签类型
export function getVehicleTagTypes(): Promise<BaseRes<VehicleTagType[]>> {
  return request.get({
    url: `${host}/api/vehicles/tag-types`,
  })
}

// 获取车辆评价列表
export function getVehicleReviews(vehicleId: number, pageNum: number = 1, pageSize: number = 10): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/api/vehicles/${vehicleId}/reviews`,
    params: {
      pageNum,
      pageSize,
    },
  })
}

// 获取相似车辆推荐
export function getSimilarVehicles(vehicleId: number, limit: number = 2): Promise<BaseRes<Vehicle[]>> {
  return request.get({
    url: `${host}/api/vehicles/${vehicleId}/similar`,
    params: {
      limit,
    },
  })
}

// 更新车辆状态
export function updateVehicleStatus(vehicleId: number, status: string): Promise<BaseRes<any>> {
  return request.put({
    url: `${host}/api/vehicles/${vehicleId}/status`,
    params: { status },
  })
}

// 完成车辆维护
export function completeVehicleMaintenance(vehicleId: number): Promise<BaseRes<any>> {
  return request.put({
    url: `${host}/api/vehicles/${vehicleId}/complete-maintenance`,
  })
}
