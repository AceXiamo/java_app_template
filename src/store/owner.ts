import { defineStore } from 'pinia'

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

  // 收益数据
  const revenueData = ref({
    balance: 2458.60,
    revenue: {
      today: 128,
      thisWeek: 856,
      thisMonth: 3456,
      total: 12890
    }
  })

  // 车辆数据
  const vehicles = ref([
    {
      id: 1,
      name: '特斯拉 Model 3',
      licensePlate: '沪A·12345',
      image: '/static/vite.png',
      status: 'available',
      statusText: '可租用',
      pricePerDay: 299,
      todayOrders: 1,
      monthlyOrders: 12,
      operationType: 'owner'
    }
  ])

  // 订单统计
  const orderStatistics = ref({
    ongoing: 3,
    todayNew: 5,
    monthlyCompleted: 28
  })

  // 设置当前激活的菜单
  function setActive(menu: OwnerActiveMenu) {
    active.value = menu
  }

  // 加载数据方法
  function loadOwnerData() {
    console.log('加载车主数据')
  }

  return {
    active,
    ownerInfo,
    revenueData,
    vehicles,
    orderStatistics,
    setActive,
    loadOwnerData
  }
})