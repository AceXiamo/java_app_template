import { host, request } from '@/utils/request'

export interface CustomerVisitLog {
  id?: number
  cvId?: number
  recordRemark?: string
  images?: string
  userId?: number
  nickname?: string
  createTime?: Date
  tenantId?: number
  customerName?: string
  customerPhone?: string
  company?: string
}

export interface ListQuery extends PageQuery {
  pageNum?: number
  pageSize?: number
  cvId?: number
}

export function getCustomerVisitLogList(params: ListQuery): Promise<BaseRes<PageData<CustomerVisitLog>>> {
  return request.get({
    url: `${host}/admin/customerVisitLog/list`,
    params,
  })
}

export function saveCustomerVisitLog(data: CustomerVisitLog): Promise<BaseRes<boolean>> {
  return request.post({
    url: `${host}/admin/customerVisitLog/save`,
    data,
  })
}

export function deleteCustomerVisitLog(id: number): Promise<BaseRes<boolean>> {
  return request.delete({
    url: `${host}/admin/customerVisitLog/delete/${id}`,
  })
}
