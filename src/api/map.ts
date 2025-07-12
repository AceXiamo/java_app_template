import { host, request } from '@/utils/request'

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

// 位置信息接口
export interface LocationInfo {
  latitude: number
  longitude: number
}

// 根据经纬度获取地址信息（逆地理编码）
export function reverseGeocode(location: LocationInfo): Promise<BaseRes<AddressInfo>> {
  return request.post({
    url: `${host}/api/map/reverse-geocode`,
    data: location,
  })
}

// 地址搜索（正地理编码）
export function searchAddress(keyword: string, city?: string): Promise<BaseRes<any[]>> {
  return request.get({
    url: `${host}/api/map/search-address`,
    data: {
      keyword,
      city,
    },
  })
}
