import type { DeptUserRef } from './deptUserRef'
import { host, request } from '@/utils/request'

export interface SysUser extends BaseEntity, PageQuery {
  userId?: number
  deptId?: number
  userName?: string
  nickName?: string
  email?: string
  phonenumber?: string
  sex?: string
  avatar?: string
  password?: string
  status?: string
  delFlag?: string
  loginIp?: string
  loginDate?: Date
  dept?: SysDept
  tenantId?: number
  tenantName?: string
  roles?: SysRole[]
  roleIds?: number[]
  postIds?: number[]
  roleId?: number
  deptUserRefs?: DeptUserRef[]
}

export interface SysDept extends BaseEntity {
  deptId?: number
  parentId?: number
  ancestors?: string
  deptName?: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: string
  delFlag?: string
  parentName?: string
  children?: SysDept[]
}

export interface SysRole extends BaseEntity {
  roleId?: number
  roleName?: string
  roleKey?: string
  roleSort?: number
  dataScope?: string
  menuCheckStrictly?: boolean
  deptCheckStrictly?: boolean
  status?: string
  delFlag?: string
  flag?: boolean
  menuIds?: number[]
  deptIds?: number[]
  permissions?: Set<string>
}

export interface SysPost extends BaseEntity {
  postId?: number
  postCode?: string
  postName?: string
  postSort?: number
  status?: string
  flag?: boolean
}

export function loginByPwd(data: {
  username: string
  password: string
}): Promise<{ code: number, msg: string, token: string }> {
  return request.post({
    url: `${host}/anotherLogin`,
    data,
  })
}

export interface InfoRes {
  code: number
  msg: string
  user: SysUser
  permissions: string[]
  roles: string[]
}

export function getInfo(): Promise<InfoRes> {
  return request.get({
    url: `${host}/getInfo`,
  })
}

export function getUserList(data: SysUser): Promise<BaseRowRes<SysUser>> {
  return request.get({
    url: `${host}/system/user/list`,
    data,
  })
}

export interface UserInfoRes {
  code: number
  msg: string
  data: SysUser
  roleIds: number[]
  postIds: number[]
  roles: SysRole[]
  posts: SysPost[]
}

export function getUserById(id: number): Promise<UserInfoRes> {
  return request.get({
    url: `${host}/system/user/${id}`,
  })
}

export function updateUser(data: SysUser): Promise<BaseRes<SysUser>> {
  return request.put({
    url: `${host}/system/user`,
    data,
  })
}

export function addUser(data: SysUser): Promise<BaseRes<SysUser>> {
  return request.post({
    url: `${host}/system/user`,
    data,
  })
}

export function getRoleList(params: { pageNum: number, pageSize: number, roleKey: string }): Promise<BaseRowRes<SysRole>> {
  return request.get({
    url: `${host}/system/role/list`,
    params,
  })
}

export function resetPwd(data: { userId: number, password: string }): Promise<BaseRes<SysUser>> {
  return request.put({
    url: `${host}/system/user/resetPwd`,
    data,
  })
}

export function deleteUser(id: number): Promise<BaseRes<SysUser>> {
  return request.delete({
    url: `${host}/system/user/${id}`,
  })
}
