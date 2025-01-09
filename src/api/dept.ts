import type { DeptUserRef } from './deptUserRef'
import { host, request } from '@/utils/request'

export interface TenantDept {
  id?: number
  deptName?: string
  tenantId?: number
  updateTime?: Date
  createTime?: Date
  deptUserRefs?: DeptUserRef[]
}

export function getDeptList(params: PageQuery): Promise<BaseRes<PageData<TenantDept>>> {
  return request.get({
    url: `${host}/admin/tenantDept/list`,
    params,
  })
}

export function options(): Promise<BaseRes<TenantDept[]>> {
  return request.get({
    url: `${host}/admin/tenantDept/options`,
  })
}

export function save(data: TenantDept): Promise<any> {
  return request.post({
    url: `${host}/admin/tenantDept/save`,
    data,
  })
}

export function del(params: { id: number }): Promise<any> {
  return request.delete({
    url: `${host}/admin/tenantDept/delete/${params.id}`,
  })
}
