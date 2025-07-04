// 首页相关 API
import { host, request } from '@/utils/request'

export interface Banner {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  linkType: string
  linkUrl: string
  isActive: boolean
}

export interface LocationInfo {
  address: string
  city: string
  district: string
  isServiceAvailable: boolean
  nearbyVehicleCount: number
}

export interface HomeData {
  banners: Banner[]
}

// 获取首页轮播图
export function getHomeBanners(): Promise<BaseRes<HomeData>> {
  return request.get({
    url: `${host}/api/home/banners`,
  })
}

// 根据经纬度获取位置信息
export function getCurrentLocation(params: {
  latitude: number
  longitude: number
}): Promise<BaseRes<LocationInfo>> {
  return request.post({
    url: `${host}/api/home/location/current`,
    data: params,
  })
}
