import { host, request } from '@/utils/request'

export interface CustomerVisit {
  id?: number
  deptId?: number
  userId?: number
  nickname?: string
  customerId?: number
  customerName?: string
  customerCompany?: string
  visitDesc?: string
  visitBegin?: string
  visitEnd?: string
  visitPerson?: number
  cars?: string
  customerPhone?: string
  customerRemark?: string
  recordRemark?: string
  customerFiles?: string
  recordFiles?: string
  createTime?: Date
  updateTime?: Date
  recordStatus?: number
  openId?: string
  phonenumber?: string
}

export interface ListQuery extends PageQuery {
  deptId: number
  pageNum?: number
  pageSize?: number
  searchValue?: string
}

export function getCustomerVisitList(params: ListQuery): Promise<BaseRes<PageData<CustomerVisit>>> {
  return request.get({
    url: `${host}/admin/customer/visit/list`,
    params,
  })
}

export function saveCustomerVisit(data: CustomerVisit): Promise<BaseRes<void>> {
  return request.post({
    url: `${host}/admin/customer/visit/save`,
    data,
  })
}

export function getVisitQrcode() {
  return request.post({
    url: `${host}/admin/customer/visit/qrcode`,
  })
}

export function getCustomerVisit(params: { id: number }) {
  return request.get({
    url: `${host}/admin/customer/visit/${params.id}`,
  })
}

export function generateQrcode(params: { text: string }) {
  return request.post({
    url: `${host}/admin/customer/visit/qrcode`,
    data: params,
  })
}
