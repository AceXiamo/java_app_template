import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { getCustomerList } from '@/api/customer'
import type { Customer, ListQuery as CustomerListQuery } from '@/api/customer'
import type { CalendarResVo, Visits } from '@/api/visits'
import { calendarData, getVisitsListByDay } from '@/api/visits'

export const useMainStore = defineStore('main', () => {
  // 日程页
  const queryFormOfMonth = ref<{
    month: string
  }>({
    month: dayjs().format('YYYY-MM'),
  })
  const month = ref<CalendarResVo[]>([])
  const loadMonthData = (): Promise<string> => {
    return new Promise((resolve) => {
      calendarData(queryFormOfMonth.value).then((res) => {
        month.value = (res.data || []).map(item => ({
          ...item,
          fullDay: item.day,
          day: dayjs(item.day).format('DD'),
        }))
        resolve('')
      })
    })
  }
  const visitQueryForm = ref({
    day: dayjs().format('YYYY-MM-DD'),
  })
  const visits = ref<Visits[]>([])
  const loadVisitsData = (): Promise<string> => {
    return new Promise((resolve) => {
      getVisitsListByDay(visitQueryForm.value).then((res) => {
        visits.value = res.data
        resolve('')
      })
    })
  }

  // 客户页
  const queryFormOfCustomer = ref<CustomerListQuery>({
    pageNum: 1,
    pageSize: 10,
    searchValue: '',
  })
  const customerList = ref<Customer[]>([])
  const customerLoadStatus = ref<LoadPageDataStatus>('hide')
  const loadCustomerData = (): Promise<string> => {
    return new Promise((resolve) => {
      customerLoadStatus.value = 'loading'
      getCustomerList(queryFormOfCustomer.value).then((res) => {
        customerList.value = [
          ...(customerList.value || []),
          ...(res.data.records || []),
        ]
        if (res.data.records.length < (queryFormOfCustomer.value.pageSize || 10))
          customerLoadStatus.value = 'nomore'
        else
          customerLoadStatus.value = 'hide'
        resolve('')
      })
    })
  }
  const searchCustomerData = () => {
    queryFormOfCustomer.value.pageNum = 1
    customerLoadStatus.value = 'loading'
    getCustomerList(queryFormOfCustomer.value).then((res) => {
      customerList.value = (res.data.records || [])
      if (res.data.records.length < (queryFormOfCustomer.value.pageSize || 10))
        customerLoadStatus.value = 'nomore'
      else
        customerLoadStatus.value = 'hide'
    })
  }

  return {
    queryFormOfMonth,
    customerList,
    customerLoadStatus,
    queryFormOfCustomer,
    month,
    loadMonthData,
    loadCustomerData,
    searchCustomerData,
    visitQueryForm,
    visits,
    loadVisitsData,
  }
})
