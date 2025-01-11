import type { CustomerVisit } from './customerVisit'
import type { TenantDept } from './dept'
import { host, request } from '@/utils/request'

export function submitVisit(data: CustomerVisit) {
  return request.post({
    url: `${host}/app/customer/visit/commit`,
    data,
  })
}

export function listDept(params: { tenantId: number }): Promise<BaseRes<TenantDept[]>> {
  return request.get({
    url: `${host}/app/customer/visit/listDept`,
    params,
  })
}

export function listForCustomer(params: { openId: string }) {
  return request.get({
    url: `${host}/app/customer/visit/listForCustomer`,
    params,
  })
}

export function qrcode(params: { text: string }) {
  return request.post({
    url: `${host}/app/customer/visit/qrcode`,
    params,
  })
}
