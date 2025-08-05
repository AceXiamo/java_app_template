import chinaAreaData from '@/utils/china-area-nested.json'

// 地区数据类型定义
export interface RegionItem {
  code: string
  name: string
  children?: RegionItem[]
}

// 处理后的地区数据缓存
let processedData: {
  provinces: RegionItem[]
  cityMap: Map<string, RegionItem[]>
  districtMap: Map<string, RegionItem[]>
} | null = null

/**
 * 处理原始地区数据
 */
function processRegionData() {
  if (processedData) {
    return processedData
  }

  const provinces = chinaAreaData as RegionItem[]
  const cityMap = new Map<string, RegionItem[]>()
  const districtMap = new Map<string, RegionItem[]>()

  // 处理省份和城市数据
  provinces.forEach(province => {
    if (province.children) {
      const cities: RegionItem[] = []
      
      province.children.forEach(cityGroup => {
        if (cityGroup.children) {
          // 对于直辖市，children直接是区县
          if (province.name.includes('北京') || province.name.includes('上海') || 
              province.name.includes('天津') || province.name.includes('重庆')) {
            // 直辖市的区县
            const districts = cityGroup.children.filter(item => 
              !item.name.includes('市辖区') && !item.name.includes('县')
            )
            districtMap.set(province.name, districts)
          } else {
            // 普通省份的城市
            if (cityGroup.name !== '市辖区') {
              cities.push({
                code: cityGroup.code,
                name: cityGroup.name
              })
              
              // 处理城市下的区县
              if (cityGroup.children) {
                const districts = cityGroup.children.filter(item => 
                  !item.name.includes('市辖区')
                )
                districtMap.set(cityGroup.name, districts)
              }
            }
          }
        }
      })
      
      if (cities.length > 0) {
        cityMap.set(province.name, cities)
      }
    }
  })

  processedData = {
    provinces,
    cityMap,
    districtMap
  }

  return processedData
}

/**
 * 获取所有省份
 */
export function getProvinces(): string[] {
  const data = processRegionData()
  return data.provinces.map(province => province.name)
}

/**
 * 根据省份获取城市列表
 */
export function getCitiesByProvince(provinceName: string): string[] {
  const data = processRegionData()
  const cities = data.cityMap.get(provinceName)
  
  // 对于直辖市，返回空数组（因为直接是区县）
  if (provinceName.includes('北京') || provinceName.includes('上海') || 
      provinceName.includes('天津') || provinceName.includes('重庆')) {
    return []
  }
  
  return cities ? cities.map(city => city.name) : []
}

/**
 * 根据省份或城市获取区县列表
 */
export function getDistrictsByCity(provinceName: string, cityName?: string): string[] {
  const data = processRegionData()
  
  // 如果是直辖市，直接用省份名获取区县
  if (provinceName.includes('北京') || provinceName.includes('上海') || 
      provinceName.includes('天津') || provinceName.includes('重庆')) {
    const districts = data.districtMap.get(provinceName)
    return districts ? districts.map(district => district.name) : []
  }
  
  // 普通省份，用城市名获取区县
  if (cityName) {
    const districts = data.districtMap.get(cityName)
    return districts ? districts.map(district => district.name) : []
  }
  
  return []
}

/**
 * 搜索地区（用于自动完成等功能）
 */
export function searchRegions(keyword: string): Array<{
  province: string
  city?: string
  district?: string
  fullName: string
}> {
  const data = processRegionData()
  const results: Array<{
    province: string
    city?: string
    district?: string
    fullName: string
  }> = []
  
  if (!keyword.trim()) {
    return results
  }
  
  const lowerKeyword = keyword.toLowerCase()
  
  // 搜索省份
  data.provinces.forEach(province => {
    if (province.name.toLowerCase().includes(lowerKeyword)) {
      results.push({
        province: province.name,
        fullName: province.name
      })
    }
    
    // 搜索城市
    const cities = data.cityMap.get(province.name) || []
    cities.forEach(city => {
      if (city.name.toLowerCase().includes(lowerKeyword)) {
        results.push({
          province: province.name,
          city: city.name,
          fullName: `${province.name} ${city.name}`
        })
      }
      
      // 搜索区县
      const districts = data.districtMap.get(city.name) || []
      districts.forEach(district => {
        if (district.name.toLowerCase().includes(lowerKeyword)) {
          results.push({
            province: province.name,
            city: city.name,
            district: district.name,
            fullName: `${province.name} ${city.name} ${district.name}`
          })
        }
      })
    })
    
    // 对于直辖市，搜索区县
    if (province.name.includes('北京') || province.name.includes('上海') || 
        province.name.includes('天津') || province.name.includes('重庆')) {
      const districts = data.districtMap.get(province.name) || []
      districts.forEach(district => {
        if (district.name.toLowerCase().includes(lowerKeyword)) {
          results.push({
            province: province.name,
            district: district.name,
            fullName: `${province.name} ${district.name}`
          })
        }
      })
    }
  })
  
  return results.slice(0, 20) // 限制返回结果数量
}