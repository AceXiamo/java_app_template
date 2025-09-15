import { defineStore } from 'pinia'
import type { OrderData, OrderListParams } from '@/api/order'
import {
  cancelOrder,
  contactOwner,
  getOrderDetail,
  getUserOrders,
  rebookOrder,
  renewOrder,
  reviewOrder,
  searchOrders,
} from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  // 订单列表数据
  const orderList = ref<OrderData[]>([])
  const orderListTotal = ref(0)
  const orderListQuery = ref<OrderListParams>({
    page: 1,
    size: 10,
    status: 'all',
  })
  const orderListStatus = ref<'hide' | 'loading' | 'nomore'>('hide')
  const statusCounts = ref({
    all: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  })

  // 当前激活的tab
  const activeTab = ref('all')

  // 加载订单列表
  const loadOrderList = async (reload = false) => {
    if (orderListStatus.value === 'nomore' && !reload)
      return

    try {
      orderListStatus.value = 'loading'
      const response = await getUserOrders(orderListQuery.value)

      orderListTotal.value = response.data.total
      statusCounts.value = response.data.statusCounts

      if (reload) {
        orderList.value = response.data.orders
      }
      else {
        orderList.value = [...orderList.value, ...response.data.orders]
      }

      // 判断是否还有更多数据（在更新数据后判断）
      if (orderList.value.length < orderListTotal.value) {
        orderListStatus.value = 'hide'
      }
      else {
        orderListStatus.value = 'nomore'
      }
    }
    catch (error) {
      console.error('获取订单列表失败:', error)
      orderListStatus.value = 'hide'
      throw error
    }
    console.log('orderListStatus', orderListStatus.value)
  }

  // 重新加载订单列表
  const reloadOrderList = () => {
    // 防止重复加载
    if (orderListStatus.value === 'loading') {
      return
    }
    orderListQuery.value.page = 1
    orderListStatus.value = 'loading'
    loadOrderList(true)
  }

  // 切换订单状态
  const switchOrderTab = (status: string) => {
    activeTab.value = status
    orderListQuery.value.status = status
    orderListQuery.value.page = 1
    reloadOrderList()
  }

  // 加载更多订单
  const loadMoreOrders = () => {
    if (orderListStatus.value !== 'hide')
      return
    orderListQuery.value.page! += 1
    loadOrderList()
  }

  // 搜索订单
  const searchOrderList = async (keyword: string) => {
    try {
      const response = await searchOrders(keyword)
      return response.data
    }
    catch (error) {
      console.error('搜索订单失败:', error)
      throw error
    }
  }

  // 获取订单详情
  const getOrderDetailById = async (orderId: number) => {
    try {
      const response = await getOrderDetail(orderId)
      return response.data
    }
    catch (error) {
      console.error('获取订单详情失败:', error)
      throw error
    }
  }

  // 续租订单
  const handleRenewOrder = async (orderId: number, extendDays: number, newEndTime: string) => {
    try {
      const response = await renewOrder(orderId, extendDays, newEndTime)
      return response.data
    }
    catch (error) {
      console.error('续租订单失败:', error)
      throw error
    }
  }

  // 联系车主
  const handleContactOwner = async (orderId: number, message: string) => {
    try {
      const response = await contactOwner(orderId, message)
      return response.data
    }
    catch (error) {
      console.error('联系车主失败:', error)
      throw error
    }
  }

  // 评价订单
  const handleReviewOrder = async (orderId: number, rating: number, comment: string, tags: string[], images?: string[], isAnonymous?: boolean) => {
    try {
      const response = await reviewOrder(orderId, rating, comment, tags, images, isAnonymous)
      return response.data
    }
    catch (error) {
      console.error('评价订单失败:', error)
      throw error
    }
  }

  // 再次预订
  const handleRebookOrder = async (orderId: number, newStartTime: string, newEndTime: string) => {
    try {
      const response = await rebookOrder(orderId, newStartTime, newEndTime)
      return response.data
    }
    catch (error) {
      console.error('再次预订失败:', error)
      throw error
    }
  }

  // 取消订单
  const handleCancelOrder = async (orderId: number, reason: string, description: string) => {
    try {
      const response = await cancelOrder(orderId, reason, description)
      // 取消成功后重新加载订单列表
      reloadOrderList()
      return response.data
    }
    catch (error) {
      console.error('取消订单失败:', error)
      throw error
    }
  }

  return {
    // 数据
    orderList,
    orderListTotal,
    orderListQuery,
    orderListStatus,
    statusCounts,
    activeTab,

    // 方法
    loadOrderList,
    reloadOrderList,
    switchOrderTab,
    loadMoreOrders,
    searchOrderList,
    getOrderDetailById,
    handleRenewOrder,
    handleContactOwner,
    handleReviewOrder,
    handleRebookOrder,
    handleCancelOrder,
  }
})
