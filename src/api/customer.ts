import { host, request } from '@/utils/request'

export interface Customer {
  id?: number
  tenantId?: number
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  notes?: string
  images?: string
  locationDesc?: string
  longitude?: string
  latitude?: string
  createTime?: Date
}

export interface ListQuery extends PageQuery {
  searchValue?: string
}

export function getCustomerList(params: ListQuery): Promise<BaseRes<PageData<Customer>>> {
  return request.get({
    url: `${host}/admin/customer/list`,
    params,
  })
}

export function saveCustomer(customer: Customer): Promise<BaseRes<Customer>> {
  return request.post({
    url: `${host}/admin/customer/save`,
    data: customer,
  })
}

export function deleteCustomer(id: number): Promise<BaseRes<Customer>> {
  return request.delete({
    url: `${host}/admin/customer/delete/${id}`,
  })
}
