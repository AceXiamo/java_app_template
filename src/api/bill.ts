import { host, request } from '@/utils/request'

export function listForMonth(params: { month: string }): Promise<ResponseData<BillMonthData>> {
  return request.post(`${host}/bill/listForMonth`, params)
}

export function todayData(): Promise<ResponseData<BillToDayData>> {
  return request.post(`${host}/bill/todayData`)
}

export function statistics(params: { date: string }): Promise<ResponseData<BillStatisticsData>> {
  return request.post(`${host}/bill/statistics`, params)
}

export function save(data: RecordingForm): Promise<ResponseData<BillRecord>> {
  return request.post(`${host}/bill/save`, null, data)
}

export function update(data: BillRecord): Promise<ResponseData<any>> {
  return request.post(`${host}/bill/update`, null, data)
}

export function del(params: { id: string }): Promise<ResponseData<any>> {
  return request.post(`${host}/bill/del`, params)
}
