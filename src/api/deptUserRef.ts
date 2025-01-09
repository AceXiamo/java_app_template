import type { SysUser } from './user'
import { host, request } from '@/utils/request'

export interface DeptUserRef {
  duId?: number
  userId?: number
  nickname?: string
  tenantId?: number
  deptId?: number
  deptName?: string
  hasManage?: number
  createTime?: Date
}

export interface UserWithTenantDept extends SysUser {
  tenantDeptId?: number
  tenantDeptName?: string
}

export function getDeptUserRefList(params: PageQuery): Promise<BaseRes<PageData<DeptUserRef>>> {
  return request.get({
    url: `${host}/admin/deptUserRef/list`,
    params,
  })
}

export function listUserForTenantDept(params: { deptId: number }): Promise<BaseRes<UserWithTenantDept[]>> {
  return request.get({
    url: `${host}/admin/deptUserRef/listUserForTenantDept`,
    params,
  })
}

export function save(data: DeptUserRef): Promise<any> {
  return request.post({
    url: `${host}/admin/deptUserRef/save`,
    data,
  })
}

export function del(params: { id: number }): Promise<any> {
  return request.delete({
    url: `${host}/admin/deptUserRef/delete/${params.id}`,
  })
}
