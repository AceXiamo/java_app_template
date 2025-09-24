import { host, request } from '@/utils/request'

// 服务区域验证结果接口
export interface ServiceAreaValidation {
  isSupported: boolean
  status: 'active' | 'coming_soon' | 'closed' | 'not_available'
  message: string
  cityName: string
  cityCode: string | null
}

// 地址信息接口
export interface AddressInfo {
  latitude: number
  longitude: number
  formattedAddress: string
  province: string
  city: string
  district: string
  township: string
  streetName: string
  streetNumber: string
  poiName?: string
  poiType?: string
}

// 包含服务区域验证的地址信息接口
export interface AddressInfoWithValidation extends AddressInfo {
  serviceAreaValidation?: ServiceAreaValidation
}

// 位置信息接口
export interface LocationInfo {
  latitude: number
  longitude: number
}

// 根据经纬度获取地址信息（逆地理编码）
export function reverseGeocode(location: LocationInfo): Promise<BaseRes<AddressInfoWithValidation>> {
  return request.post({
    url: `${host}/api/map/reverse-geocode`,
    data: location,
  })
}

// 地址搜索（正地理编码）
export function searchAddress(keyword: string, city?: string): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/api/map/search-address`,
    params: {
      keyword,
      city,
    },
  })
}
