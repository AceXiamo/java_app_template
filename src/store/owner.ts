import { defineStore } from 'pinia'
import { getOwnerHomeData, type OwnerHomeData, type OwnerVehicleStats } from '@/api/owner-revenue'
import { useUserStore } from '@/store/user'

// 车主应用的导航
export type OwnerActiveMenu = 'home' | 'orders' | 'revenue' | 'settings'

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
  async function loadOwnerData() {
    try {
      loading.value = true
      const userStore = useUserStore()
      const ownerId = userStore.user?.userId
      
      if (!ownerId) {
        console.error('用户未登录或无车主ID')
        return
      }

      const response = await getOwnerHomeData(ownerId)
      
      if (response.code === 200 && response.data) {
        const data = response.data
        
        // 更新收益数据
        revenueData.value = data.revenueData
        
        // 更新车辆列表
        vehicles.value = data.vehicleList
        
        // 更新订单统计
        orderStatistics.value = data.orderStatistics
        
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
    }
  }

  // 刷新收益数据
  async function refreshRevenueData() {
    try {
      const userStore = useUserStore()
      const ownerId = userStore.user?.userId
      
      if (!ownerId) return
      
      await loadOwnerData()
    } catch (error) {
      console.error('刷新收益数据失败', error)
    }
  }

  return {
    active,
    ownerInfo,
    revenueData,
    vehicles,
    orderStatistics,
    loading,
    setActive,
    loadOwnerData,
    refreshRevenueData
  }
})