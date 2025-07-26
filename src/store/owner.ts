import { defineStore } from 'pinia'
import { getOwnerHomeData, type OwnerHomeData, type OwnerVehicleStats } from '@/api/owner-revenue'
import { useUserStore } from '@/store/user'

// 车主应用的导航
export type OwnerActiveMenu = 'home' | 'orders' | 'revenue'

export const useOwnerStore = defineStore('owner', () => {
  const active = ref<OwnerActiveMenu>('home')

  // 车主基本信息
  const ownerInfo = ref({
    nickname: '张车主',
    phone: '139****5678',
    avatar: '/static/vite.png',
    isOwner: true,
    ownerStatus: 'verified',
    joinDate: '2024-03-15'
  })

  // 收益数据 - 从API获取
  const revenueData = ref({
    balance: 0,
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    }
  })

  // 车辆数据 - 从API获取
  const vehicles = ref<OwnerVehicleStats[]>([])

  // 订单统计 - 从API获取
  const orderStatistics = ref({
    ongoing: 0,
    todayNew: 0,
    monthlyCompleted: 0
  })

  // 加载状态
  const loading = ref(false)
  
  // 数据加载状态控制
  const isDataLoaded = ref(false)
  const isLoading = ref(false)
  const lastLoadTime = ref<number>(0)
  
  // 缓存时间（5分钟）
  const CACHE_DURATION = 5 * 60 * 1000

  // 设置当前激活的菜单
  function setActive(menu: OwnerActiveMenu) {
    active.value = menu
  }

  // 加载车主首页数据
  async function loadOwnerData(forceRefresh = false) {
    try {
      // 防重复调用检查
      if (isLoading.value) {
        console.log('数据正在加载中，跳过重复请求')
        return
      }

      // 缓存检查：如果数据已加载且在缓存期内，跳过请求
      const now = Date.now()
      if (!forceRefresh && isDataLoaded.value && (now - lastLoadTime.value) < CACHE_DURATION) {
        console.log('使用缓存数据，跳过API请求')
        return
      }

      isLoading.value = true
      loading.value = true

      console.log('开始加载车主数据...', { forceRefresh })
      const response = await getOwnerHomeData()
      
      if (response.code === 200 && response.data) {
        const data = response.data
        
        // 更新收益数据
        revenueData.value = data.revenueData
        
        // 更新车辆列表
        vehicles.value = data.vehicleList
        
        // 更新订单统计
        orderStatistics.value = data.orderStatistics
        
        // 更新加载状态
        isDataLoaded.value = true
        lastLoadTime.value = now
        
        console.log('车主数据加载成功', data)
      } else {
        console.error('加载车主数据失败', response.msg)
        uni.showToast({
          title: response.msg || '加载数据失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载车主数据异常', error)
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      loading.value = false
      isLoading.value = false
    }
  }

  // 刷新收益数据（强制刷新）
  async function refreshRevenueData() {
    try {
      // 强制刷新数据
      await loadOwnerData(true)
    } catch (error) {
      console.error('刷新收益数据失败', error)
    }
  }
  
  // 清除缓存
  function clearCache() {
    isDataLoaded.value = false
    lastLoadTime.value = 0
  }

  return {
    active,
    ownerInfo,
    revenueData,
    vehicles,
    orderStatistics,
    loading,
    isDataLoaded,
    setActive,
    loadOwnerData,
    refreshRevenueData,
    clearCache
  }
})