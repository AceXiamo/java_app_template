// 首页相关 API
import { host, request } from '@/utils/request'
import { reverseGeocode } from '@/api/map'
import type { AddressInfoWithValidation } from '@/api/map'

export interface Banner {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  linkType: string
  linkUrl: string
  isActive: boolean
}

export interface HomeData {
  banners: Banner[]
}

// 服务区域城市接口
export interface ServiceCity {
  areaId: number
  cityCode: string
  cityName: string
  status: 'active' | 'coming_soon' | 'closed'
  createTime: string
  updateTime: string
}

// 获取首页轮播图
export function getHomeBanners(): Promise<BaseRes<HomeData>> {
  return request.get({
    url: `${host}/api/home/banners`,
  })
}

// 兼容性函数：根据经纬度获取位置信息
// 内部调用 map.ts 的 reverseGeocode 接口
export function getCurrentLocation(params: {
  latitude: number
  longitude: number
}): Promise<BaseRes<{
  address: AddressInfoWithValidation
  serviceAreaValidation?: import('@/api/map').ServiceAreaValidation
}>> {
  return reverseGeocode(params) as any
}

// 获取已开通服务的城市列表
export function getServiceCities(): Promise<BaseRes<ServiceCity[]>> {
  return request.get({
    url: `${host}/admin/service-area/active-cities`,
  })
}
