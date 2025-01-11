import type { CustomerVisit } from './customerVisit'
import { host, request } from '@/utils/request'

export interface CalendarResVo {
  day?: string
  isThisMonth?: boolean
  visits?: Visits[]
  customerVisits?: CustomerVisit[]
  fullDay?: string
}

export interface Visits {
  id?: number
  tenantId?: number
  userId?: number
  userName?: string
  customerOpenId?: string
  customerName?: string
  customerPhone?: string
  visitDate?: string
  startDate?: Date
  endDate?: Date
  location?: string
  longitude?: string
  latitude?: string
  locationDesc?: string
  images?: string
  checkImages?: string
  visitType?: number
  visitTypeLabel?: string
  purpose?: string
  notes?: string
  // '状态（0: 计划中 1: 进行中 2: 已完成 3: 已取消）'
  status?: number
  createTime?: Date
  createBy?: number
  updateTime?: Date
  updateBy?: number
  outcomes?: VisitOutcomes
}

export const VisitsStatus = ['计划中', '进行中', '已完成', '已取消']

export interface VisitOutcomes {
  id?: number
  visitId?: number
  outcomeType?: number
  description?: string
  images?: string
  outcomeTypeName?: string
}

export function calendarData(params: { month: string }): Promise<BaseRes<CalendarResVo[]>> {
  return request.get({
    url: `${host}/app/visit/calendar`,
    params,
  })
}

export function getVisitsListByDay(params: { day: string }): Promise<BaseRes<Visits[]>> {
  return request.get({
    url: `${host}/app/visit/list`,
    params,
  })
}

export interface ListQuery extends PageQuery {
  searchValue?: string
}

export function getVisitsList(params: ListQuery): Promise<BaseRes<PageData<Visits>>> {
  return request.get({
    url: `${host}/admin/visits/list`,
    params,
  })
}

export function saveVisits(params: Visits): Promise<BaseRes<void>> {
  return request.post({
    url: `${host}/admin/visits/save`,
    data: params,
  })
}

export function deleteVisits(params: { id: number }): Promise<BaseRes<void>> {
  return request.post({
    url: `${host}/admin/visits/delete/${params.id}`,
  })
}

export function saveVisitOutcomes(data: VisitOutcomes): Promise<BaseRes<void>> {
  return request.post({
    url: `${host}/admin/visit-outcomes/save`,
    data,
  })
}
