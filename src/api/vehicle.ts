// 车辆相关 API
export interface Vehicle {
  id: number
  name: string
  brand: string
  model: string
  type: string // 轿车/SUV等
  energyType: string // 电动/混动
  seats: number
  dailyPrice: number
  monthlyPrice?: number
  imageUrl: string
  distance: number
  batteryRange: number
  rating: number
  isHot?: boolean
  isNew?: boolean
  isLuxury?: boolean
  tags: string[]
  location: {
    name: string
    distance: number
  }
}

export interface VehicleSearchParams {
  city?: string
  startTime?: string
  endTime?: string
  vehicleType?: string
  energyType?: string
  priceRange?: [number, number]
  sortBy?: 'price' | 'distance' | 'rating'
  page?: number
  limit?: number
}

export interface VehicleSearchResult {
  vehicles: Vehicle[]
  total: number
  filters: {
    brands: string[]
    types: string[]
    energyTypes: string[]
    priceRange: [number, number]
  }
}

// 搜索车辆
export function searchVehicles(params: VehicleSearchParams): Promise<BaseRes<VehicleSearchResult>> {
  return request.get({
    url: '/api/vehicles/search',
    params,
  })
}

// 获取车辆详情
export function getVehicleDetail(id: number): Promise<BaseRes<Vehicle>> {
  return request.get({
    url: `/api/vehicles/${id}`,
  })
}

// 获取筛选条件
export function getVehicleFilters(): Promise<BaseRes<VehicleSearchResult['filters']>> {
  return request.get({
    url: '/api/vehicles/filters',
  })
}
