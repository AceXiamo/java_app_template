import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AddressInfoWithValidation, ServiceAreaValidation } from '@/api/map'

export const useLocationStore = defineStore('location', () => {
  // 当前位置信息
  const currentLocation = ref<AddressInfoWithValidation | null>(null)
  // 当前服务区域验证信息
  const serviceAreaValidation = ref<ServiceAreaValidation | null>(null)
  // 当前显示的城市名称
  const displayCity = ref('上海')
  // 当前显示的地址
  const displayAddress = ref('上海')

  // 更新位置信息
  const updateLocation = (location: AddressInfoWithValidation) => {
    currentLocation.value = location
    displayCity.value = location.city
    displayAddress.value = location.formattedAddress || location.city
    
    // 更新服务区域验证信息
    if (location.serviceAreaValidation) {
      serviceAreaValidation.value = location.serviceAreaValidation
    }
  }

  // 更新服务区域验证信息
  const updateServiceAreaValidation = (validation: ServiceAreaValidation) => {
    serviceAreaValidation.value = validation
    displayCity.value = validation.cityName
  }

  // 更新显示地址
  const updateDisplayAddress = (address: string) => {
    displayAddress.value = address
  }

  // 获取服务状态信息
  const getServiceStatus = () => {
    if (!serviceAreaValidation.value) {
      return {
        text: '未知',
        color: 'text-gray-500',
        isActive: false
      }
    }

    const validation = serviceAreaValidation.value
    
    if (validation.isSupported && validation.status === 'active') {
      return {
        text: '已开通',
        color: 'text-green-600',
        isActive: true
      }
    } else if (validation.status === 'coming_soon') {
      return {
        text: '即将开通',
        color: 'text-orange-600',
        isActive: false
      }
    } else if (validation.status === 'closed') {
      return {
        text: '暂时关闭',
        color: 'text-red-600',
        isActive: false
      }
    } else {
      return {
        text: '暂未开通',
        color: 'text-gray-600',
        isActive: false
      }
    }
  }

  return {
    currentLocation,
    serviceAreaValidation,
    displayCity,
    displayAddress,
    updateLocation,
    updateServiceAreaValidation,
    updateDisplayAddress,
    getServiceStatus,
  }
})