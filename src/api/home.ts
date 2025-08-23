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
}): Promise<BaseRes<AddressInfoWithValidation>> {
  return reverseGeocode(params)
}
