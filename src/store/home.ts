import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getHomeBanners, getCurrentLocation } from '@/api/home'
import type { Banner } from '@/api/home'
import { useLocationStore } from '@/store/location'

export const useHomeStore = defineStore('home', () => {
  // 数据状态
  const banners = ref<Banner[]>([])
  const bannersLoaded = ref(false)
  const locationLoaded = ref(false)
  const loading = ref(false)

  // 获取轮播图数据
  const loadBanners = async (force = false) => {
    if (bannersLoaded.value && !force) {
      return
    }

    try {
      loading.value = true
      const response = await getHomeBanners()

      if (response.code === 200 && response.data && response.data.banners) {
        banners.value = response.data.banners
        bannersLoaded.value = true
      }
      else {
        throw new Error(`API返回错误: ${response.msg || '未知错误'}`)
      }
    }
    catch (error) {
      console.error('获取轮播图失败:', error)

      // 显示用户友好的错误提示
      uni.showToast({
        title: '轮播图加载失败，已使用默认数据',
        icon: 'none',
        duration: 2000,
      })

      // 设置默认轮播图
      banners.value = [
        {
          id: 1,
          title: '新用户首单5折',
          subtitle: '驾驭未来，选择电动',
          imageUrl:
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          linkType: 'page',
          linkUrl: '/pages/activity/newUser',
          isActive: true,
        },
        {
          id: 2,
          title: '月租8折优惠',
          subtitle: '长期租赁，更多优惠',
          imageUrl:
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          linkType: 'page',
          linkUrl: '/pages/monthly-rental',
          isActive: true,
        },
        {
          id: 3,
          title: '盲盒惊喜价',
          subtitle: '¥99起，神秘车型等你解锁',
          imageUrl:
            'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          linkType: 'page',
          linkUrl: '/pages/mystery-box',
          isActive: true,
        },
      ]
      bannersLoaded.value = true
    }
    finally {
      loading.value = false
    }
  }

  // 获取位置信息
  const loadLocation = async (force = false) => {
    if (locationLoaded.value && !force) {
      return
    }

    const locationStore = useLocationStore()

    try {
      const location = await uni.getLocation({
        type: 'wgs84',
      })

      const response = await getCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      })

      if (response.code === 200 && response.data) {
        const addressData = response.data.address
        const validationData = response.data.serviceAreaValidation

        if (addressData) {
          // 构造完整的地址信息对象
          const fullAddressInfo = {
            ...addressData,
            serviceAreaValidation: validationData,
          }

          // 更新位置存储
          locationStore.updateLocation(fullAddressInfo)
          locationLoaded.value = true
        }
      }
      else {
        throw new Error(`位置API返回错误: ${response.msg || '未知错误'}`)
      }
    }
    catch (error) {
      console.error('获取位置失败:', error)

      // 显示用户友好的错误提示
      uni.showToast({
        title: '定位失败，已使用默认位置',
        icon: 'none',
        duration: 2000,
      })

      // 设置默认位置
      locationStore.updateDisplayAddress('上海')
      locationLoaded.value = true
    }
  }

  // 重新加载首页数据
  const reloadHomeData = () => {
    bannersLoaded.value = false
    locationLoaded.value = false
    loadBanners(true)
    loadLocation(true)
  }

  // 初始化首页数据
  const initHomeData = () => {
    loadBanners()
    loadLocation()
  }

  return {
    // 数据
    banners,
    bannersLoaded,
    locationLoaded,
    loading,

    // 方法
    loadBanners,
    loadLocation,
    reloadHomeData,
    initHomeData,
  }
})